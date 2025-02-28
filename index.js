const { networkInterfaces, hostname } = require('os');
const port = 3000;
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { PvRecorder } = require("@picovoice/pvrecorder-node");
const { WaveFile } = require("wavefile");
const fs = require("fs");

const nets = networkInterfaces();
const hostnames = ["localhost", "*"];
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      hostnames.push(net.address);
    }
  }
}

server.listen(port, () => {
  console.log(`listening on:`);
  hostnames.forEach(hostname => {
    console.log(`- http://${hostname}:${port}`);
  })
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/parler', function (req, res) {
  res.sendFile(__dirname + '/parler.html');
});
app.get('/ecrire', function (req, res) {
  res.sendFile(__dirname + '/ecrire.html');
});
app.get('/lire', function (req, res) {
  res.sendFile(__dirname + '/lire.html');
});

let readSocket;
io.on('connection', (socket) => {
  socket.on('start', () => {
    isInterrupted = false;
    record();
  });

  socket.on('stop', () => {
    isInterrupted = true;
  });

  socket.on('save', (data) => {
    saveText(data);
    if (readSocket) {
      readSocket.emit('new', `<b>${data.author}</b> : ${data.text}`)
    }
  })

  socket.on('read', (data) => {
    readSocket = socket;
    sendAllText(readSocket);
  });
});

const outputTextDir = "texts";

async function sendAllText() {
  fs.readdir(outputTextDir, (err, files) => {
    files.forEach((file) => {
      fs.readFile(`${outputTextDir}/${file}`, 'utf8', (err, data) =>{
        readSocket.emit('new', data);
      });
    });
  });
}

async function saveText({text, author}) {
  fs.readdir(outputTextDir, (err, files) => {
    fs.writeFileSync(`${outputTextDir}/${files.length}-${author}.txt`, `<b>${author}</b> : ${text}`); 
  });
}

let isInterrupted = false;
const outputWavDir = "records";

async function record() {
  const wav = new WaveFile();
  const frames = [];
  const frameLength = 512;
  const recorder = new PvRecorder(frameLength, 0);
  let outputWavFile;
  console.log(`Using PvRecorder version: ${recorder.version}`);
  recorder.start();
  console.log(`Using device: ${recorder.getSelectedDevice()}`);

  fs.readdir(outputWavDir, (err, files) => {
    outputWavFile = `${outputWavDir}/record-${files.length}.wav`;
  });

  while (!isInterrupted) {
    const frame = await recorder.read();
    if (outputWavFile) {
      frames.push(frame);
    }
  }

  if (outputWavFile) {
    const audioData = new Int16Array(recorder.frameLength * frames.length);
    for (let i = 0; i < frames.length; i++) {
      audioData.set(frames[i], i * recorder.frameLength);
    }

    wav.fromScratch(1, recorder.sampleRate, '16', audioData);
    fs.writeFileSync(outputWavFile, wav.toBuffer());
  }

  console.log("Stopping...");
  recorder.release();
}

