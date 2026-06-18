const connectDB = require('../config/db');
const { logError } = require('../utils/logger');
const ObjectId = require('mongodb').ObjectId;

class Comment {
    static validarCampos(id_post, id_usuario, conteudo) {
        if (!id_post || id_post.trim() === '') {
            throw new Error('O campo "id_post" é obrigatório.');
        }

        if (!id_usuario || id_usuario.trim() === '') {
            throw new Error('O campo "id_usuario" é obrigatório.');
        }

        if (!conteudo || conteudo.trim() === '') {
            throw new Error('O campo "conteudo" é obrigatório.');
        }
    }

    static createComment(id_post, id_usuario, conteudo, nome_usuario) {
        return new Promise(function (resolve, reject) {
            try {
                Comment.validarCampos(id_post, id_usuario, conteudo);

                connectDB().then(function (db) {
                    db.collection('comments').insertOne({
                        id_post: id_post.trim(),
                        id_usuario: id_usuario.trim(),
                        nome_usuario: nome_usuario ? nome_usuario.trim() : '',
                        conteudo: conteudo.trim(),
                        data_criacao: new Date()
                    }, function (err, result) {
                        if (err) {
                            logError('Comment.createComment', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Comment.createComment', err);
                reject(err);
            }
        });
    }

    static getCommentById(id) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id || id.trim() === '') {
                    throw new Error('O campo "id" é obrigatório para a busca.');
                }

                connectDB().then(function (db) {
                    db.collection('comments').findOne({ _id: new ObjectId(id) }, function (err, result) {
                        if (err) {
                            logError('Comment.getCommentById', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Comment.getCommentById', err);
                reject(err);
            }
        });
    }

    static getCommentsByPost(id_post) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id_post || id_post.trim() === '') {
                    throw new Error('O campo "id_post" é obrigatório para a busca.');
                }

                connectDB().then(function (db) {
                    db.collection('comments').find({ id_post: id_post.trim() }).sort({ data_criacao: -1 }).toArray(function (err, result) {
                        if (err) {
                            logError('Comment.getCommentsByPost', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Comment.getCommentsByPost', err);
                reject(err);
            }
        });
    }

    static deleteComment(id) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id || id.trim() === '') {
                    throw new Error('O campo "id" é obrigatório para a deleção.');
                }

                connectDB().then(function (db) {
                    db.collection('comments').deleteOne({ _id: new ObjectId(id) }, function (err, result) {
                        if (err) {
                            logError('Comment.deleteComment', err);
                            reject(err);
                            return;
                        }

                        if (result.deletedCount === 0) {
                            reject(new Error('Nenhum comentário encontrado com esse id.'));
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Comment.deleteComment', err);
                reject(err);
            }
        });
    }
}

module.exports = Comment;
