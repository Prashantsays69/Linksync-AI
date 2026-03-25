const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const model = 'gemini-2.0-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{
    parts: [{ text: "Write a short test sentence." }]
  }]
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(url, options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
