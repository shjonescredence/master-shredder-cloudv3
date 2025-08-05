from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI  # ✅ Correct SDK import
import os
from dotenv import load_dotenv
import PyPDF2
from docx import Document
import json
import uvicorn
from pathlib import Path

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Master Shredder")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="public"), name="static")


class MasterShredderAssistant:
    def __init__(self):
        self.system_prompt = """You are Master Shredder, an expert federal capture manager assistant following Shipley methodology. 
        You help with RFP analysis, compliance checking, teaming strategy, and proposal development.
        Always provide specific, actionable advice with clear next steps.
        Format your responses with clear headings and bullet points for easy reading.
        Be thorough and comprehensive in your analysis."""

    def get_openai_client(self, api_key=None):
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            raise HTTPException(status_code=400, detail="No OpenAI API key provided")
        return OpenAI(api_key=key)

    def analyze_document(self, content: str, api_key: str, doc_type: str = "RFP"):
        prompt = f"""Analyze this {doc_type} document and provide:

        ## ALL REQUIREMENTS
        Extract and list EVERY requirement from this document. Include:
        - Technical requirements
        - Performance requirements  
        - Functional requirements
        - Compliance requirements
        - Delivery requirements
        - Personnel/staffing requirements
        - Security requirements
        - Any other specified requirements
        Number each requirement clearly (1, 2, 3, etc.)

        ## IMPORTANT DEADLINES  
        List all important dates and deadlines including:
        - Proposal submission deadline
        - Question submission deadline
        - Site visits or demonstrations
        - Contract start/end dates
        - Milestone dates
        - Any other time-sensitive requirements

        ## EVALUATION CRITERIA
        Explain in detail how proposals will be scored including:
        - Evaluation factors and their weights
        - Scoring methodology
        - Pass/fail criteria
        - Technical vs cost evaluation approach

        ## COMPLIANCE CHECKLIST
        Create a comprehensive checklist of what must be included in the response:
        - Required sections and formats
        - Mandatory attachments
        - Page limits and formatting requirements
        - Submission requirements (copies, format, etc.)
        - Required certifications or statements

        ## RISK FACTORS
        Identify potential issues including:
        - Unclear or conflicting requirements
        - Aggressive timelines
        - Technical challenges
        - Compliance risks
        - Competitive risks

        Document content (first 4000 characters):
        {content[:4000]}

        Be thorough and comprehensive in your analysis. Don't miss any requirements, no matter how small."""

        try:
            client = self.get_openai_client(api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error analyzing document: {str(e)}"

    def chat_response(self, message: str, api_key: str, context: str = ""):
        prompt = f"""Context from previous analysis: {context}

        User question: {message}

        Provide helpful, specific advice for federal capture management.
        Use clear formatting with headings and bullet points.
        Be comprehensive and thorough in your response."""

        try:
            client = self.get_openai_client(api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.4
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"I'm having trouble processing that request: {str(e)}"


# Initialize assistant
assistant = MasterShredderAssistant()


@app.get("/")
async def root():
    return RedirectResponse(url="/setup")


@app.get("/setup", response_class=HTMLResponse)
async def setup_page():
    try:
        with open("setup.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse("<h1>Setup page not found</h1>")


@app.get("/app", response_class=HTMLResponse)
async def main_app():
    try:
        with open("public/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse("<h1>Error: index.html not found in public folder</h1>")


@app.post("/upload")
async def upload_document(file: UploadFile = File(...), api_key: str = Form(...)):
    try:
        if not file.filename.endswith(('.pdf', '.docx')):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"

        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        text_content = ""

        if file.filename.endswith('.pdf'):
            try:
                with open(file_path, 'rb') as pdf_file:
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    for page in pdf_reader.pages:
                        text_content += page.extract_text() or ""
            except Exception as e:
                return {"error": f"Could not read PDF: {str(e)}", "success": False}

        elif file.filename.endswith('.docx'):
            try:
                doc = Document(file_path)
                for paragraph in doc.paragraphs:
                    text_content += paragraph.text + "\n"
            except Exception as e:
                return {"error": f"Could not read DOCX: {str(e)}", "success": False}

        if not text_content.strip():
            return {"error": "No text could be extracted from the document", "success": False}

        analysis = assistant.analyze_document(text_content, api_key, "RFP")

        return {
            "filename": file.filename,
            "analysis": analysis,
            "success": True,
            "text_length": len(text_content)
        }

    except Exception as e:
        return {"error": f"Upload failed: {str(e)}", "success": False}


@app.post("/chat")
async def chat(message: str = Form(...), api_key: str = Form(...), context: str = Form(default="")):
    try:
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        response = assistant.chat_response(message, api_key, context)
        return {"response": response, "success": True}
    except Exception as e:
        return {"error": f"Chat error: {str(e)}", "success": False}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Master Shredder is running!"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Master Shredder...")
    print(f"📱 Setup at: http://localhost:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port)
