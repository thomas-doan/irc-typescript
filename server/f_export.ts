import { Socket } from "socket.io";
import { db, i_room, io } from "./server";
import * as fs from "fs";


function exportAllMyUser(socket: Socket, data: any) {
  db.query(`SELECT message, username, date, user_id FROM chat`, (err: any, result: any) => {
    if (err) throw err;
    if (fs.existsSync('chat.txt')) {
      fs.unlinkSync('chat.txt');
    }
    fs.writeFile("chat.txt", "", (err: any) => {
      if (err) throw err;
      socket.emit('response', 'export done in chat.txt');
    });
    for (const i in result) {
      fs.appendFile("chat.txt", `${result[i].username} : ${result[i].message} (${result[i].date}) (user_id : ${result[i].user_id})\r`, (err) => {
        if (err) throw err;
      });
    }
  });
}

function exportUserDate(socket: Socket, data: any) {
  db.query(`SELECT message, username, date, user_id FROM chat WHERE date BETWEEN '${data[0]} ${data[1]}' AND '${data[2]} ${data[3]}'`, (err: any, result: any) => {
    if (err) throw err;
    if (fs.existsSync('chat.txt')) {
      fs.unlinkSync('chat.txt');
    }

    fs.writeFile("chat.txt", "", (err: any) => {
      if (err) throw err;
      socket.emit('response', 'export done in chat.txt');
    });

    for (const i in result) {
      fs.appendFile("chat.txt", `${result[i].username} : ${result[i].message} (${result[i].date}) (user_id : ${result[i].user_id})\r`, (err) => {
        if (err) throw err;
      });
    }
  });
}

function exportAllUser(socket: Socket, data: any) {
  db.query(`SELECT message, username, date, user_id FROM chat WHERE username = '${data[0]}'`, (err: any, result: any) => {
    if (err) throw err;
    if (fs.existsSync('chat.txt')) {
      fs.unlinkSync('chat.txt');
    }

    fs.writeFile("chat.txt", "", (err: any) => {
      if (err) throw err;
      socket.emit('response', 'export done in chat.txt');      
    });
    for (const i in result) {
      fs.appendFile("chat.txt", `${result[i].username} : ${result[i].message} (${result[i].date}) (user_id : ${result[i].user_id})\r`, (err) => {
        if (err) throw err;
      });
    }
  });
}

export function exportToFile(socket: Socket, data: any) {
  if (data.length === 4) {
    exportUserDate(socket, data);
  } else if (data.length === 1) {
    db.query(`SELECT role_id FROM users WHERE id_socket = '${socket.id}'`, (err: any, result: any) => {
      if (result[0].role_id !== 1) {
        socket.emit("error", "You don't have the permission");
        return 0;
      }
      exportAllUser(socket, data);
    });
  }
  else {
    exportAllMyUser(socket, data);
  }
}
