const express = require('express');
const path = require('path');
const session = require('express-session');

const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const { logError } = require('./src/utils/logger');

const app = express();
const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'microblog_projeto2_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(function (req, res, next) {
    res.locals.usuario = req.session.usuario;
    next();
});

function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        res.redirect('/login?erro=Acesse sua conta para continuar.');
        return;
    }

    next();
}

function texto(valor) {
    if (valor === undefined || valor === null) {
        return '';
    }

    return String(valor).trim();
}

function formatarData(data) {
    if (!data) {
        return '';
    }

    return new Date(data).toLocaleString('pt-BR');
}

function prepararPost(post, usuarioLogado) {
    return {
        _id: post._id,
        id: post._id.toString(),
        id_usuario: post.id_usuario,
        autor: post.nome_usuario || post.id_usuario,
        conteudo: post.conteudo,
        dataFormatada: formatarData(post.data_criacao),
        pertenceUsuario: usuarioLogado && post.id_usuario === usuarioLogado.id
    };
}

function prepararComentario(comentario, usuarioLogado) {
    return {
        _id: comentario._id,
        id: comentario._id.toString(),
        id_post: comentario.id_post,
        id_usuario: comentario.id_usuario,
        autor: comentario.nome_usuario || comentario.id_usuario,
        conteudo: comentario.conteudo,
        dataFormatada: formatarData(comentario.data_criacao),
        pertenceUsuario: usuarioLogado && comentario.id_usuario === usuarioLogado.id
    };
}

function tratarErro(res, view, dados, contexto, err) {
    logError(contexto, err);
    res.status(400).render(view, Object.assign({}, dados, {
        erro: err.message
    }));
}

app.get('/', function (req, res) {
    if (req.session.usuario) {
        res.redirect('/posts');
        return;
    }

    res.redirect('/login');
});

app.get('/login', function (req, res) {
    res.render('login', {
        titulo: 'Entrar no MicroBlog',
        erro: req.query.erro,
        sucesso: req.query.sucesso
    });
});

app.post('/login', async function (req, res) {
    try {
        const email = texto(req.body.email);
        const senha = texto(req.body.senha);

        if (email === '') {
            throw new Error('O campo "email" é obrigatório.');
        }

        if (senha === '') {
            throw new Error('O campo "senha" é obrigatório.');
        }

        const user = await User.getUserByEmail(email);

        if (!user || user.senha !== senha) {
            throw new Error('E-mail ou senha inválidos.');
        }

        req.session.usuario = {
            id: user._id.toString(),
            nome: user.nome,
            email: user.email
        };

        res.redirect('/posts');
    } catch (err) {
        tratarErro(res, 'login', {
            titulo: 'Entrar no MicroBlog',
            email: req.body.email
        }, 'POST /login', err);
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/login?sucesso=Logout realizado com sucesso.');
    });
});

app.get('/users/new', function (req, res) {
    res.render('cadastro', {
        titulo: 'Criar conta'
    });
});

app.post('/users/create', async function (req, res) {
    try {
        const nome = texto(req.body.nome);
        const email = texto(req.body.email);
        const senha = texto(req.body.senha);

        await User.createUser(nome, email, senha);

        res.redirect('/login?sucesso=Conta criada com sucesso. Faça login para continuar.');
    } catch (err) {
        tratarErro(res, 'cadastro', {
            titulo: 'Criar conta',
            nome: req.body.nome,
            email: req.body.email
        }, 'POST /users/create', err);
    }
});

app.get('/users', exigirLogin, async function (req, res) {
    try {
        const users = await User.getAllUsers();
        const usuarios = users.map(function (user) {
            return {
                id: user._id.toString(),
                nome: user.nome,
                email: user.email,
                dataFormatada: formatarData(user.data_criacao)
            };
        });

        res.render('users', {
            titulo: 'Usuários cadastrados',
            usuarios: usuarios
        });
    } catch (err) {
        logError('GET /users', err);
        res.status(500).render('erro', {
            titulo: 'Erro',
            erro: 'Erro ao listar usuários.'
        });
    }
});

app.get('/posts', exigirLogin, async function (req, res) {
    try {
        const busca = texto(req.query.busca);
        const posts = busca === '' ? await Post.getAllPosts() : await Post.searchPosts(busca);
        const postsFormatados = posts.map(function (post) {
            return prepararPost(post, req.session.usuario);
        });

        res.render('posts', {
            titulo: 'Postagens',
            posts: postsFormatados,
            busca: busca,
            sucesso: req.query.sucesso,
            erro: req.query.erro
        });
    } catch (err) {
        logError('GET /posts', err);
        res.status(500).render('erro', {
            titulo: 'Erro',
            erro: 'Erro ao carregar as postagens.'
        });
    }
});

app.post('/posts/create', exigirLogin, async function (req, res) {
    try {
        const conteudo = texto(req.body.conteudo);

        await Post.createPost(
            req.session.usuario.id,
            conteudo,
            req.session.usuario.nome
        );

        res.redirect('/posts?sucesso=Postagem criada com sucesso.');
    } catch (err) {
        res.redirect('/posts?erro=' + encodeURIComponent(err.message));
    }
});

app.post('/posts/delete/:id', exigirLogin, async function (req, res) {
    try {
        const post = await Post.getPostById(req.params.id);

        if (!post) {
            throw new Error('Postagem não encontrada.');
        }

        if (post.id_usuario !== req.session.usuario.id) {
            throw new Error('Você só pode excluir suas próprias postagens.');
        }

        await Post.deletePost(req.params.id);

        res.redirect('/posts?sucesso=Postagem excluída com sucesso.');
    } catch (err) {
        res.redirect('/posts?erro=' + encodeURIComponent(err.message));
    }
});

app.get('/posts/:id/comments', exigirLogin, async function (req, res) {
    try {
        const post = await Post.getPostById(req.params.id);

        if (!post) {
            throw new Error('Postagem não encontrada.');
        }

        const comments = await Comment.getCommentsByPost(req.params.id);
        const comentarios = comments.map(function (comment) {
            return prepararComentario(comment, req.session.usuario);
        });

        res.render('comments', {
            titulo: 'Comentários',
            post: prepararPost(post, req.session.usuario),
            comentarios: comentarios,
            sucesso: req.query.sucesso,
            erro: req.query.erro
        });
    } catch (err) {
        logError('GET /posts/:id/comments', err);
        res.status(400).render('erro', {
            titulo: 'Erro',
            erro: err.message
        });
    }
});

app.post('/comments/create', exigirLogin, async function (req, res) {
    const idPost = texto(req.body.id_post);

    try {
        const conteudo = texto(req.body.conteudo);

        await Comment.createComment(
            idPost,
            req.session.usuario.id,
            conteudo,
            req.session.usuario.nome
        );

        res.redirect('/posts/' + idPost + '/comments?sucesso=Comentário criado com sucesso.');
    } catch (err) {
        res.redirect('/posts/' + idPost + '/comments?erro=' + encodeURIComponent(err.message));
    }
});

app.post('/comments/delete/:id', exigirLogin, async function (req, res) {
    const idPost = texto(req.body.id_post);

    try {
        const comment = await Comment.getCommentById(req.params.id);

        if (!comment) {
            throw new Error('Comentário não encontrado.');
        }

        if (comment.id_usuario !== req.session.usuario.id) {
            throw new Error('Você só pode excluir seus próprios comentários.');
        }

        await Comment.deleteComment(req.params.id);

        res.redirect('/posts/' + idPost + '/comments?sucesso=Comentário excluído com sucesso.');
    } catch (err) {
        res.redirect('/posts/' + idPost + '/comments?erro=' + encodeURIComponent(err.message));
    }
});

app.use(function (req, res) {
    res.status(404).render('erro', {
        titulo: 'Página não encontrada',
        erro: 'Rota não encontrada.'
    });
});

app.listen(PORT, function () {
    console.log('Servidor rodando em http://localhost:' + PORT);
});
