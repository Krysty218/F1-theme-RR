const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const http = require("http");
const fs = require("fs");
const index = fs.readFileSync("index.html");

const port = new SerialPort({
  path: "COM7",   // Path to the serial port
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

var app = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(index);
});

var io = require("socket.io")(app);

let reactionTimeStarted = false;

io.on("connection", function (socket) {
  console.log("Node is listening to port");

  // Listen for the start_reaction_time event from the client
  socket.on("start_reaction_time", function (randomButton) {
    if (!reactionTimeStarted) { // Only start once
      console.log(`Start signal received. Random Button: ${randomButton}`);
      port.write(`start:${randomButton}\n`); // Send the selected button pin to Arduino
      reactionTimeStarted = true;
    }
  });

  // Listen for the reaction time from Arduino and send it to the client
  parser.on("data", function (data) {
    console.log("Received data from Arduino: " + data);

    if (data.startsWith("reaction_time:")) {
      let reactionTime = data.split(":")[1];
      io.emit("reaction_time", reactionTime); // Emit reaction time to the client
      reactionTimeStarted = false; // Reset for the next round
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
