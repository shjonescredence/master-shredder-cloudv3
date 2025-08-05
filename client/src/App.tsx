/* App container and layout */
.app-container {
  display: flex;
  justify-content: center;     /* center children horizontally */
  align-items: center;         /* center children vertically */
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Centered layout for columns */
.centered-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  gap: 20px;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
}

/* Panel style for all columns */
.panel {
  background-color: #1f1f1f;
  border-radius: 12px;
  padding: 16px;
  flex: 1 1 0;
  max-width: 360px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  overflow-y: auto;
  color: #fff;
}

/* Chat container */
.chat-container {
  /* Remove flex: 1, let .panel handle sizing */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
  padding: 0;
  background: none;
  scroll-behavior: smooth;
}

/* Input area */
.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: #232323;
  border-top: 1px solid #333;
  gap: 10px;
  width: 100%;
}

/* Welcome message - already centered well, just ensure it's constrained */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px auto;
  max-width: 500px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}
