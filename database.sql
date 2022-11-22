CREATE DATABASE IF NOT EXISTS irc;
USE irc;
CREATE TABLE IF NOT EXISTS role (id INT AUTO_INCREMENT PRIMARY KEY, role VARCHAR(255), timestamp TIMESTAMP);
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, id_socket VARCHAR(255) NULL,login VARCHAR(255), password VARCHAR(255), is_connected INT, role_id INT, FOREIGN KEY (role_id) REFERENCES role(id), timestamp TIMESTAMP);
CREATE TABLE IF NOT EXISTS category (id INT AUTO_INCREMENT PRIMARY KEY, name_category VARCHAR(255), user_id INT, FOREIGN KEY (user_id) REFERENCES users(id), timestamp TIMESTAMP);
CREATE TABLE IF NOT EXISTS chat (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255), date DATETIME, user_id INT, category_id INT, username VARCHAR(255), timestamp TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (category_id) REFERENCES category(id));

INSERT INTO role (role) VALUES ("admin"), ("user");
INSERT INTO users (login, password, is_connected, role_id) VALUES ("admin", "admin", 0, 1);
INSERT INTO category (name_category, user_id) VALUES ("main", 1);
INSERT INTO category (name_category, user_id) VALUES ("private", 1);
INSERT INTO chat (message, date, user_id, category_id, username) VALUES ("Hello world", NOW(), 1, 1, "admin");
INSERT INTO chat (message, date, user_id, category_id, username) VALUES ("BONJOUR", NOW(), 1, 1, "admin");
