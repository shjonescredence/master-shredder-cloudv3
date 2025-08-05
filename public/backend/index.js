// Basic Express.js server setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
