import { db } from "./server";
import { io } from "./server";

export function resetPassword(socket: any, data: string[]) {
  if (!data[0] || !data[1]) {
    socket.emit("error", "bad argument !");
    return 0;
  }
  db.query(
    `SELECT role_id FROM users WHERE id_socket = '${socket.id}'`,
    (err: any, result: any) => {
      if (err) throw err;
      if (result[0].role_id !== 1) {
        socket.emit("error", "You don't have the permission");
        return 0;
      }
      db.query(
        `UPDATE users SET password = '${data[1]}' WHERE login = '${data[0]}'`,
        (err: any, result: any) => {
          if (err) throw err;
          if (result.changedRows === 0) {
            socket.emit("response", "The login doesn't exist");
            return 0;
          }
          socket.emit("response", "You have edit the password");
        }
      );
    }
  );
}

export function killUser(socket: any, data: string[]) {
  if (!data[0]) {
    socket.emit("error", "bad argument !");
    return 0;
  }
  db.query(`SELECT role_id FROM users WHERE id_socket = '${socket.id}'`,
    (err: any, result: any) => {
      if (err) throw err;
      if (result[0].role_id !== 1) {
        socket.emit("error", "You don't have the permission");
        return 0;
      }
      db.query(`SELECT id_socket, is_connected FROM users WHERE login = '${data[0]}'`,
      (err: any, result: any) => {
        if (err) throw err;
        if (result.length === 0) {
          socket.emit("error", "The user doesn't exist");
          return 0;
        }
        if (result[0].is_connected == 1) {
          io.sockets.connected[result[0].id_socket].disconnect();
          socket.emit("response", "The user has been disconnect");
        } else {
          socket.emit("error", "The user isn't connected");
        }
      });  
    }); 
}