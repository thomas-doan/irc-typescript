import { Socket } from "socket.io";
import { db, i_room, io } from "./server";

export async function displayAllUsers(socket: Socket) {
  const users: string[] = [];

  db.query('SELECT login FROM users WHERE is_connected = 1', (err: any, result: any) => {
    result.map((item: any) => {users.push(item.login);});
    socket.emit("messageListAllUsers", users);
  });
}

export async function displayUsers(socket: Socket, currentRoomOfUser: i_room) {
  let ids = await io.of("/main").in(currentRoomOfUser.room).allSockets();
  const users: string[] = [];
  ids = Array.from(ids);

  db.query('SELECT login, id_socket FROM users WHERE is_connected = 1', (err: any, result: any) => {
    result.map((item: any) => {
      if (ids.includes(item.id_socket)) 
        users.push(item.login);
    });
    socket.emit("messageListAllUsers", users);
  });
}

export async function displayHistory(socket: Socket) {
  db.query(`SELECT role_id FROM users WHERE id_socket = '${socket.id}'`,
  (err: any, result: any) => {
    if (err) throw err;
    if (result[0].role_id !== 1) {
      socket.emit("error", "You don't have the permission");
      return 0;
    }
    db.query(`SELECT message, username FROM chat`, (err: any, result: any) => {
      if (err) throw err;
      socket.emit("messageHistory", result);
    });  
  });
}

export async function displayAllRooms(socket: Socket) {
  const ids = await io.of("/main").allSockets();
  const users = Array.from(ids);
  const rooms = await io.of("/main").adapter.rooms;

  let roomsArray: string[] = [];
  let usersArray: string[] = [];

  const room = rooms.forEach((_value: any, key: any) => {
    roomsArray.push(key);
  });
  const user = users.forEach((user: any) => {
    usersArray.push(user);
  });

  const inter = roomsArray.filter((el: any) => {
    return !usersArray.includes(el);
  });

  socket.emit("messageListRooms", inter);
}

export function displayCommandOfList(socket: Socket) {
  db.query(
    `SELECT * FROM users WHERE id_socket = '${socket.id}'`,
    (err: any, result: any) => {
      if (result[0].role_id == 1) {
        socket.emit(
          "messageGeneral",
          "--resetPassword <user> <password> (reset password of user)\n--kill <user> (disconnect the connected user)\n--join (join room)\n--listUsers (list of users in room)\n--listAllUsers (list of all users in rooms)\n--listRooms (list all rooms)\n--history (display all messages from users)\n--export (export messages of users)\n--quit (left the program)"
        );
      } else {
        socket.emit(
          "messageGeneral",
          "--join (join room)\n--listUsers (list of users in room)\n--listAllUsers (list of all users in rooms)\n--listRooms (list all rooms)\n--export (export your messages)\n--quit (left the program)"
        );
      }
    }
  );
}
