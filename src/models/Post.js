const connectDB = require('../config/db');
const { logError } = require('../utils/logger');
const ObjectId = require('mongodb').ObjectId;

class Post {
    static validarCampos(id_usuario, conteudo) {
        if (!id_usuario || id_usuario.trim() === '') {
            throw new Error('O campo "id_usuario" é obrigatório.');
        }

        if (!conteudo || conteudo.trim() === '') {
            throw new Error('O campo "conteudo" é obrigatório.');
        }
    }

    static createPost(id_usuario, conteudo, nome_usuario) {
        return new Promise(function (resolve, reject) {
            try {
                Post.validarCampos(id_usuario, conteudo);

                connectDB().then(function (db) {
                    db.collection('posts').insertOne({
                        id_usuario: id_usuario.trim(),
                        nome_usuario: nome_usuario ? nome_usuario.trim() : '',
                        conteudo: conteudo.trim(),
                        data_criacao: new Date()
                    }, function (err, result) {
                        if (err) {
                            logError('Post.createPost', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Post.createPost', err);
                reject(err);
            }
        });
    }

    static getPostById(id_post) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id_post || id_post.trim() === '') {
                    throw new Error('O campo "id_post" é obrigatório para a busca.');
                }

                connectDB().then(function (db) {
                    db.collection('posts').findOne({ _id: new ObjectId(id_post) }, function (err, result) {
                        if (err) {
                            logError('Post.getPostById', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Post.getPostById', err);
                reject(err);
            }
        });
    }

    static getPostsByUser(id_usuario) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id_usuario || id_usuario.trim() === '') {
                    throw new Error('O campo "id_usuario" é obrigatório para a busca.');
                }

                connectDB().then(function (db) {
                    db.collection('posts').find({ id_usuario: id_usuario.trim() }).sort({ data_criacao: -1 }).toArray(function (err, result) {
                        if (err) {
                            logError('Post.getPostsByUser', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Post.getPostsByUser', err);
                reject(err);
            }
        });
    }

    static getAllPosts() {
        return new Promise(function (resolve, reject) {
            connectDB().then(function (db) {
                db.collection('posts').find({}).sort({ data_criacao: -1 }).toArray(function (err, result) {
                    if (err) {
                        logError('Post.getAllPosts', err);
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

    static searchPosts(busca) {
        return new Promise(function (resolve, reject) {
            try {
                if (!busca || busca.trim() === '') {
                    Post.getAllPosts().then(resolve).catch(reject);
                    return;
                }

                const filtro = {
                    conteudo: {
                        $regex: busca.trim(),
                        $options: 'i'
                    }
                };

                connectDB().then(function (db) {
                    db.collection('posts').find(filtro).sort({ data_criacao: -1 }).toArray(function (err, result) {
                        if (err) {
                            logError('Post.searchPosts', err);
                            reject(err);
                            return;
                        }

                        resolve(result);
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Post.searchPosts', err);
                reject(err);
            }
        });
    }

    static deletePost(id_post) {
        return new Promise(function (resolve, reject) {
            try {
                if (!id_post || id_post.trim() === '') {
                    throw new Error('O campo "id_post" é obrigatório para a deleção.');
                }

                connectDB().then(function (db) {
                    db.collection('comments').deleteMany({ id_post: id_post.trim() }, function (err) {
                        if (err) {
                            logError('Post.deletePost - delete comments', err);
                            reject(err);
                            return;
                        }

                        db.collection('posts').deleteOne({ _id: new ObjectId(id_post) }, function (err, result) {
                            if (err) {
                                logError('Post.deletePost', err);
                                reject(err);
                                return;
                            }

                            if (result.deletedCount === 0) {
                                reject(new Error('Nenhuma postagem encontrada com esse id.'));
                                return;
                            }

                            resolve(result);
                        });
                    });
                }).catch(function (err) {
                    reject(err);
                });

            } catch (err) {
                logError('Post.deletePost', err);
                reject(err);
            }
        });
    }
}

module.exports = Post;
