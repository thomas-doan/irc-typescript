import { Socket } from "socket.io";
import { db, i_room } from "./server";

function insertCategory(socket: Socket, data: any) {
  db.query(
    `SELECT * FROM category WHERE name_category = '${data}'`,
    (err: any, result: any) => {
      if (err) throw err;
      if (result.length > 0) {
        socket.emit(
          "messageRoomAlreadyExist",
          `
you enter the existing ${data} room.`
        );
      } else {
        db.query(
          `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
          (err: any, result: any) => {
            db.query(
              `INSERT INTO category (name_category, user_id) VALUES ('${data}', '${result[0].id}');`,
              (err: any) => {
                if (err) throw err;
                socket.emit(
                  "messageRoomCreated",
                  `
you created and enter in ${data} room.`
                );
                console.log("category created");
              }
            );
          }
        );
      }
    }
  );
}

export function messagePrivate(socket: Socket, data: any) {
  db.query(
    `SELECT * FROM users WHERE login = '${data[0]}'`,
    (err: any, result: any) => {
      if (err) throw err;

      if (result.length === 0) {
        socket.emit("messagePrivate", "The user doesn't exist");
        return 0;
      }
      db.query(
        `SELECT login FROM users WHERE id_socket = '${socket.id}'`,
        (_err: any, login: any) => {
          socket
            .to(result[0].id_socket)
            .emit(
              "messagePrivate",
              `[MP ${login[0].login}]: ${data.slice(1).join(" ")}`
            );
        }
      );
    }
  );
}

export function messageToRoom(
  socket: Socket,
  data: any,
  currentRoomOfUser: i_room
) {
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (_err: any, result: any) => {
      socket
        .to(currentRoomOfUser.room)
        .emit(
          "messageToGroup",
          `User ${result[0].login} ecrit dans room ${
            currentRoomOfUser.room
          } :\n ${data.join(" ")}`
        );
    }
  );
}

export function messageToDB(
  socket: Socket,
  data: any,
  currentRoomOfUser: i_room,
  pm: string
) {
  if (pm === "non") {
    let dataUserId: any;
    let dataUserCategory: any;
    db.query(
      `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
      (_err: any, result: any) => {
        dataUserId = result;

        db.query(
          `SELECT * FROM category WHERE name_category ='${currentRoomOfUser.room}'`,
          (_err: any, result: any) => {
            dataUserCategory = result;
            db.query(
              `
        INSERT INTO chat (message, date, user_id, category_id, username) VALUES(
          '${data.join(" ")}', NOW(), '${dataUserId[0].id}',
          '${dataUserCategory[0].id}', '${dataUserId[0].login}')
        `
            );
          }
        );
      }
    );
  }
  if (pm === "oui") {
    let dataUserId: any;
    let dataUserCategory: any;
    db.query(
      `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
      (_err: any, result: any) => {
        dataUserId = result;

        db.query(
          `SELECT * FROM category WHERE name_category ='${currentRoomOfUser.room}'`,
          (_err: any, result: any) => {
            dataUserCategory = result;
            db.query(
              `
        INSERT INTO chat (message, date, user_id, category_id, username) VALUES(
          '${data.join(" ")}', NOW(), '${dataUserId[0].id}',
          '2', '${dataUserId[0].login}')
        `
            );
          }
        );
      }
    );
  }
}

export function joinGroupe(
  socket: Socket,
  goToRoom: any,
  currentRoomOfUser: i_room
) {
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (_err: any, result: any) => {
      socket
        .to(currentRoomOfUser.room)
        .emit(
          "messageUserLeftRoom",
          `user ${result[0].login} left room : ${currentRoomOfUser.room}`
        );
    }
  );
  insertCategory(socket, goToRoom);
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (_err: any, result: any) => {
      socket.leave(currentRoomOfUser.room);
      socket.join(goToRoom);

      socket
        .to(goToRoom)
        .emit(
          "messageUserJoinRoom",
          `user ${result[0].login} joined room :  ${goToRoom}`
        );

      //----------------- switch State of data current Room of user -----------------//
      currentRoomOfUser.room = goToRoom;
    }
  );
}
