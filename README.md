# Projeto 2 - MicroBlog com Express.js e MongoDB

Nome do projeto: **MicroBlog**  
Tema: **micro-blogging**

Este projeto foi desenvolvido a partir do Projeto 1, mantendo as classes `User`, `Post` e `Comment`, mas agora utilizando **Express.js**, **templates HBS**, **MongoDB** e **sessões** para autenticação de usuários.

## Requisitos atendidos

- Aplicação web com Express.js.
- Reaproveitamento das classes do Projeto 1 (`User`, `Post` e `Comment`).
- Rotas para usuários, postagens e comentários.
- Recebimento de parâmetros via **GET** e **POST**.
- Validação de campos obrigatórios.
- Exibição de mensagens de erro e sucesso.
- Rotina de login com `express-session`.
- Proteção de páginas internas para usuários autenticados.
- Uso de templates `.hbs` para a interface.
- Uso de arquivos estáticos na pasta `public`.

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js
- MongoDB Community Server
- MongoDB Shell, se desejar consultar o banco pelo terminal

O MongoDB deve estar rodando localmente na porta padrão:

```bash
mongodb://127.0.0.1:27017
```

O banco utilizado pelo projeto é:

```bash
microblog
```

## Como executar

1. Abra o terminal dentro da pasta do projeto.

2. Instale as dependências:

```bash
npm install
```

3. Execute o servidor:

```bash
npm start
```

4. Acesse no navegador:

```bash
http://localhost:3000
```

## Primeiro acesso

Ao abrir o sistema, você será direcionado para a tela de login.

Como o banco pode estar vazio, faça primeiro um cadastro em:

```bash
http://localhost:3000/users/new
```

Depois, use o e-mail e a senha cadastrados para entrar no sistema.

## Rotas principais da aplicação

### Login e sessão

| Método | Rota | Descrição |
|---|---|---|
| GET | `/login` | Exibe o formulário de login |
| POST | `/login` | Valida e cria a sessão do usuário |
| GET | `/logout` | Encerra a sessão |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| GET | `/users/new` | Exibe o formulário de cadastro |
| POST | `/users/create` | Cadastra novo usuário |
| GET | `/users` | Lista usuários cadastrados, exigindo login |

### Postagens

| Método | Rota | Descrição |
|---|---|---|
| GET | `/posts` | Lista postagens, exigindo login |
| GET | `/posts?busca=texto` | Busca postagens pelo conteúdo usando parâmetro GET |
| POST | `/posts/create` | Cria uma postagem usando parâmetro POST |
| POST | `/posts/delete/:id` | Exclui uma postagem do usuário logado |

### Comentários

| Método | Rota | Descrição |
|---|---|---|
| GET | `/posts/:id/comments` | Lista comentários de uma postagem |
| POST | `/comments/create` | Cria comentário em uma postagem |
| POST | `/comments/delete/:id` | Exclui comentário do usuário logado |

## Estrutura do projeto

```text
Projeto2-Backend-Microblog/
├── app.js
├── package.json
├── README.md
├── public/
│   └── style.css
├── views/
│   ├── cadastro.hbs
│   ├── comments.hbs
│   ├── erro.hbs
│   ├── login.hbs
│   ├── posts.hbs
│   └── users.hbs
└── src/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Comment.js
    │   ├── Post.js
    │   └── User.js
    └── utils/
        └── logger.js
```

## Observações importantes

- As dependências são instaladas com `npm install`.
- As senhas foram mantidas como texto simples porque o objetivo é seguir o conteúdo trabalhado no material de apoio, sem acrescentar bibliotecas extras não estudadas.
- O sistema impede acesso às páginas internas sem login.
- O sistema permite excluir apenas postagens e comentários pertencentes ao usuário logado.
