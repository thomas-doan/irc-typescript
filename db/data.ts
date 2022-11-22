import { exit } from "node:process";

const app = require('express')();
const serveur = require('http').createServer(app);
const io = require('socket.io')(serveur);
const mysql = require('mysql');
const prompts = require('prompt-sync')();

interface User {
    id: number;
    login: string;
    password: string;
    is_connected: number;
    category_id: number;

}

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irc',
});

// function coreDatabase() {
// }

db.connect((err: any) => {
    if (err) throw err;
    console.log('Connected to MySQL');
    main();
});

function main() {

    welcom();
    // login();
    // register();
}

function welcom() {
    console.log("\x1b[32m");
    console.log("\t\tBienvenue sur le chat !\n");
    console.log("Pour commencer à chatter, connectez-vous :");
    console.log("--login <login> <password>");
    console.log("Ou créez un compte avec :");
    console.log("--register <login> <password>");
    console.log("Attention ! les espaces sont les delimiteurs des arguments !");
    console.log("\x1b[0m");
}

function login(socket: any, tab: string[]) {
    //let tab: string[] = ["admin", "admin"];

    if (!tab[0] || !tab[1]) {
        console.log("bad argument !");
        return 0;
    }
    console.log(tab[0]);
    console.log(tab[1]);
    db.query(`SELECT * FROM users WHERE login = '${tab[0]}' AND password = '${tab[1]}'`, (err: any, result: any) => {
        if (err) throw err;
        if (result.length > 0) {
            console.log('Vous êtes connecté !');
            console.log(result);
        } else {
            console.log('Login ou mot de passe incorrect !');
        }
    });
    console.log("passss");
}

function register(socket: any, tab: string[]) {
    //let tab: string[] = ["azerty", "guest"];
    
    if (!tab[0] || !tab[1]) {
        console.log("bad argument !");
        return 0;
    }
    console.log(tab[0]);
    console.log(tab[1]);
    db.query(`SELECT * FROM users WHERE login = '${tab[0]}'`, (err: any, result: any) => {
        if (err) throw err;
        if (result.length > 0) {
            console.log('User already exist !');
        } else {
            db.query(`INSERT INTO users (login, password, is_connected) VALUES ('${tab[0]}', '${tab[1]}', 1);`, (err: any, result: any) => {
                if (err) throw err;
                console.log(result);
                console.log("pass");
            });        
        }
    });
}