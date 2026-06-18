const connectDB = require('../config/db');
const { logError } = require('../utils/logger');
const ObjectId = require('mongodb').ObjectId;

class User {
    static validarCampos(nome, email, senha) {
        if (!nome || nome.trim() === '') {
            throw new Error('O campo "nome" é obrigatório.');
        }

        if (!email || email.trim() === '') {
            throw new Error('O campo "email" é obrigatório.');
        }

        if (!senha || senha.trim() === '') {
            throw new Error('O campo "senha" é obrigatório.');
        }
    }

    static createUser(nome, email, senha) {
        return new Promise(function (resolve, reject) {
            try {
                User.validarCampos(nome, email, senha);

                connectDB().then(function (db) {
                    db.collection('users').findOne({ email: email.trim() }, function (err, user) {
                        if (err) {
                            logError('User.createUser - findOne', err);
                            reject(err);
                            return;
                        }

                        if (user) {
                            reject(new Error('Já existe um usuário com esse email.'));
                            return;
                        }

                        db.collection('users').insertOne({
                            nome: nome.trim(),
                            email: email.trim(),
                            senha: senha.trim(),
                            data_criacao: new Date()
                        }, function (err, result) {
                            if (err) {
                                logError('User.createUser - insertOne', err);
                                reject(err);
                                return;
                            }

                            resolve(result);
                        });
                    });
                }).catch(function (err) {
                    logError('User.createUser - connectDB', err);
                    reject(err);
                });

            } catch (err) {
                logError('User.createUser', err);
                reject(err);
            }
        });
    }

    static getUserByEmail(email) {
        return new Promise(function (resolve, reject) {
            try {
                if (!email || email.trim() === '') {
                    throw new Error('O campo "email" é obrigatório para a busca.');
                }

                connectDB().then(function (db) {
                    db.collection('users').findOne({ email: email.trim() }, function (err, user) {
                        if (err) {
                            logError('User.getUserByEmail', err);
                            reject(err);
                            return;
                        }

                        resolve(user);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('User.getUserByEmail', err);
                reject(err);
            }
        });
    }

    static getAllUsers() {
        return new Promise(function (resolve, reject) {
            connectDB().then(function (db) {
                db.collection('users').find({}).toArray(function (err, result) {
                    if (err) {
                        logError('User.getAllUsers', err);
                        reject(err);
                        return;
                    }

                    resolve(result);
                });
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    static deleteUser(id) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id || id.trim() === '') {
                    throw new Error('O campo "id" é obrigatório para a deleção.');
                }

                connectDB().then(function (db) {
                    db.collection('users').deleteOne({ _id: new ObjectId(id) }, function (err, result) {
                        if (err) {
                            logError('User.deleteUser', err);
                            reject(err);
                            return;
                        }

                        if (result.deletedCount === 0) {
                            reject(new Error('Nenhum usuário encontrado com esse id.'));
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('User.deleteUser', err);
                reject(err);
            }
        });
    }
}

module.exports = User;