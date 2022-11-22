import { exit } from "node:process";
import { Socket } from "socket.io";
import { register, login } from "./f_connexion";
import {
  displayAllUsers,
  displayUsers,
  displayHistory,
  displayAllRooms,
  displayCommandOfList,
} from "./f_display";

import { killUser, resetPassword } from "./f_admin";

import {
  messagePrivate,
  messageToRoom,
  messageToDB,
  joinGroupe,
} from "./f_message";

import { exportToFile } from "./f_export";

const app = require("express")();
const server = require("http").Server(app);
export const io = require("socket.io")(server);
const main = io.of("/main");
const readline = require("readline");
const mysql = require("mysql");
const util = require("util");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

server.listen(3000);

export let role: string;

export interface i_room {
  room: string;
}

export const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  //port: "7777",
  password: "",
  database: "irc",
});

function ReceiveMessageToClient(socket: Socket, currentRoomOfUser: i_room) {
  let goToRoom: any = null;

  socket.on("messageToServer", async (msg: any) => {
    let data: string[] = msg.toString().split(" ");
    const query = util.promisify(db.query).bind(db);

    switch (data[0]) {
      case "--l":
        displayCommandOfList(socket);
        return;
      case "--login":
        login(socket, data.slice(1), currentRoomOfUser);
        return;
      case "--register":
        register(socket, data.slice(1));
        return;
      case "--quit":
        socket.disconnect();
        return;
      default:
        const rows = await query(
          `SELECT * FROM users WHERE id_socket = '${socket.id}'`
        );
        if (!rows[0]) {
          socket.emit("error", "login or register before other instruction");
          return 0;
        }
    }
    switch (data[0]) {
      case "--mp":
        messagePrivate(socket, data.slice(1));
        const mp: string = "oui";
        messageToDB(socket, data, currentRoomOfUser, mp);
        break;
      case "--resetPassword":
        resetPassword(socket, data.slice(1));
        break;
      case "--kill":
        killUser(socket, data.slice(1));
        break;
      case "--join":
        goToRoom = data[1];
        joinGroupe(socket, goToRoom, currentRoomOfUser);
        break;
      case "--listUsers":
        displayUsers(socket, currentRoomOfUser);
        break;
      case "--listAllUsers":
        displayAllUsers(socket);
        break;
      case "--listRooms":
        displayAllRooms(socket);
        break;

      case "--history":
        displayHistory(socket);
        break;

      case "--export":
        exportToFile(socket, data.slice(1));
        break;

      case "--quit":
        socket.disconnect();
        break;
      default:
        messageToRoom(socket, data, currentRoomOfUser);
        const mp_off: string = "non";
        messageToDB(socket, data, currentRoomOfUser, mp_off);
    }
  });
}

db.connect((err: any) => {
  if (err) throw err;
  //------------------- Reinit of is connected to users -------------------//
  db.query(`UPDATE users SET is_connected = 0`);
  //------------------- END Reinit of is connected to users -------------------//
  console.log("Connected to MySQL");
  main.on("connect", (socket: any) => {
    let currentRoomOfUser: i_room = {
      room: "",
    };
    currentRoomOfUser.room = "main";
    socket.on("setRole", (data: string) => {
      role = data;
    });
    ReceiveMessageToClient(socket, currentRoomOfUser);
    socket.on("disconnect", (_reason: any) => {
      db.query(
        `UPDATE users SET is_connected = 0 WHERE id_socket = '${socket.id}'`,
        (err: any) => {
          if (err) throw err;
        }
      );
      console.log("user disconnected");
    });
  });
});
