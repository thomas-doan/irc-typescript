import { exit } from "process";

const io = require("socket.io-client");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const socket = io("http://localhost:3000/main");

if (
  process.argv.length < 3 ||
  (process.argv[2] !== "--admin" && process.argv[2] !== "--user")
) {
  console.log("You must precise your Role:");
  console.log("--admin : all rights");
  console.log("--user : some rights");
  exit(0);
}

socket.on("connect", () => {
  welcom();
  console.log('\x1b[32m%s\x1b[0m', "Vous etes connecté");
  socket.emit("setRole", process.argv[2].slice(2));

  rl.on("line", (line: any) => {
    socket.emit("messageToServer", line);
  });
});

socket.on("response", (msg: string) => {
  console.log(msg);
});

socket.on("error", (msg: string) => {
  console.log('\x1b[31m%s\x1b[0m', msg);
});

socket.on("messageUserLogin", (msg: string) => {
  console.log('\x1b[32m%s\x1b[0m', msg);
});

socket.on("messageUserRegister", (msg: string) => {
  console.log('\x1b[32m%s\x1b[0m', msg);
});

socket.on("messagePrivate", (msg: string) => {
  console.log('\x1b[35m%s\x1b[0m', msg);
});

socket.on("messageUserLeftRoom", (msg: string) => {
  console.log('\x1b[31m%s\x1b[0m', msg);
});

socket.on("messageUserJoinRoom", (msg: string) => {
  console.log('\x1b[32m%s\x1b[0m', msg);
});

socket.on("messageToGroup", (msg: string) => {
  console.log('\x1b[36m%s\x1b[0m', msg);
});

socket.on("messageGeneral", (msg: string) => {
  console.log(msg);
});
socket.on("messageRoomCreated", (msg: string) => {
  console.log('\x1b[32m%s\x1b[0m', msg);
});
socket.on("messageRoomAlreadyExist", (msg: string) => {
  console.log('\x1b[32m%s\x1b[0m', msg);
});

socket.on("messageUserAlreadyConnected", (msg: string) => {
  console.log('\x1b[31m%s\x1b[0m', msg);
});

socket.on("messageListUsers", (msg: string[]) => {
  console.log("======= List users in room =====");
  msg.forEach((user) => {
    console.log(`||${user}||`);
  });
  console.log("========================");
});

socket.on("messageListAllUsers", (msg: string[]) => {
  console.log('\x1b[34m%s\x1b[0m', "==== List all users ====");
  msg.forEach((user) => {
    console.log('\x1b[34m%s\x1b[0m', `||${user}||`);
  });
  console.log('\x1b[34m%s\x1b[0m', "==========================");
});

socket.on("messageListRooms", (msg: string[]) => {
  console.log('\x1b[34m%s\x1b[0m', "======= List rooms =====");
  msg.forEach((room) => {
    console.log('\x1b[34m%s\x1b[0m', `||${room}||`);
  });
  console.log('\x1b[34m%s\x1b[0m', "========================");
});

socket.on("messageHistory", (msg: string[]) => {
  console.log("\x1b[35m%s\x1b[0m", "======= History message =====");
  msg.forEach((history: any) => {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `||${history.username} : ${history.message}`
    );
  });
  console.log("\x1b[35m%s\x1b[0m", "=============================");
});

socket.on("disconnect", () => {
  console.log('\x1b[31m%s\x1b[0m', "disconnected");
});


function welcom() {
  console.log('\x1b[32m%s\x1b[0m', `
               __.-/|
               \\\`o_O'
                =( )=  +-------+
                  U|   | myIRC |
        /\\\  /\\\   / |   +-------+
       ) /^\\\) ^\\\/ _)\\\     |
       )   /^\\\/   _) \\\    |
       )   _ /  / _)  \\\___|_
   /\\\  )/\\\/ ||  | )_)\\\___,|))
  <  >      |(,,) )__)    |
   ||      /    \\\)___)\\
   | \\____(______) )________(
    \\\______(_______;;;)__;;;)
  `);
}
