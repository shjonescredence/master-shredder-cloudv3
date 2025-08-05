@echo off
echo 🚀 Deploying Master Shredder...

echo 📦 Building Docker image...
docker-compose build

echo 🔄 Starting containers...
docker-compose up -d

echo ✅ Deployment complete!
echo 📱 Master Shredder is available at: http://localhost:8000
echo 📊 Check status: docker-compose logs -f credo-assistant

pause