import { db, i_room } from "./server";

export function register(socket: any, data: string[]) {
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (err: any, result: any) => {
      if (!result[0]) {
        if (!data[0] || !data[1]) {
          socket.emit("messageUserRegister", "bad argument !");
          return 0;
        }
        db.query(
          `SELECT * FROM users WHERE login = '${data[0]}'`,
          (err: any, result: any) => {
            if (err) throw err;
            if (result.length > 0) {
              socket.emit("messageUserRegister", "User already exist !");
            } else {
              db.query(
                `INSERT INTO users (id_socket, login, password, is_connected) VALUES ('${socket.id}', '${data[0]}', '${data[1]}', 1);`,
                (err: any) => {
                  if (err) throw err;
                  db.query(
                    `UPDATE users SET is_connected = 1 WHERE login = '${data[0]}'`,
                    (err: any) => {
                      if (err) throw err;
                    }
                  );
                  db.query(
                    `SELECT * FROM users WHERE login = '${data[0]}'`,
                    (err: any, result: any) => {
                      socket.emit(
                        "messageUserRegister",
                        "Vous êtes connecté !"
                      );
                      socket.join("main");

                      socket
                        .to("main")
                        .emit(
                          "messageUserJoinRoom",
                          `user ${result[0].login} joined room :  main`
                        );
                    }
                  );

                  //joinGroupe(socket, 'room');
                }
              );
            }
          }
        );
      } else {
        socket.emit(
          "messageUserAlreadyConnected",
          "Vous etes déjà connecté, veuillez deco/reco !"
        );
      }
    }
  );
}

export function login(socket: any, data: string[], currentRoomOfUser: i_room) {
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (err: any, result: any) => {
      if (!result[0]) {
        if (!data[0] || !data[1]) {
          socket.emit("messageUserLogin", "bad argument !");
          return 0;
        }
        db.query(
          `SELECT * FROM users WHERE login = '${data[0]}' AND password = '${data[1]}'`,
          (err: any, result: any) => {
            if (err) throw err;

            if (result.length > 0 && result[0].is_connected === 0) {
              socket.join(currentRoomOfUser.room);
              db.query(
                `UPDATE users SET is_connected = 1, id_socket = '${socket.id}'WHERE login = '${data[0]}'`,
                (err: any) => {
                  if (err) throw err;
                }
              );
              socket.emit("messageUserLogin", "Vous êtes connecté !");
              socket
                .to("main")
                .emit(
                  "messageUserJoinRoom",
                  `user ${result[0].login} joined room : Main`
                );
            } else if (result.length > 0 && result[0].is_connected === 1) {
              socket.emit("messageUserLogin", "user already connected !");
            } else {
              socket.emit(
                "messageUserLogin",
                "Login ou mot de passe incorrect !"
              );
            }
          }
        );
      } else {
        socket.emit(
          "messageUserAlreadyConnected",
          "Vous etes déjà connecté, veuillez deco/reco !"
        );
      }
    }
  );
}
