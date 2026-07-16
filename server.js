import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js'; 
import { autenticar, somenteAdmin } from './middleware/auth.js';
import * as authController from './controllers/authController.js';
import * as avaliacaoController from './controllers/avaliacaoController.js';

const app = express();
app.use(cors()); // Permite cross plataform para utilizar o client e server em localhost
app.use(express.json()); // Permite leitura de JSON

dotenv.config(); // Carrega o .env

// Rota pública: criar novo usuário
app.post('/registrar', 
  authController.registrar);

// Rota pública: login e geração do token
app.post('/login', authController.login);

app.post('/avaliacao', (req, res, next) => {
    req.setTimeout(900000);
    if (req.socket) {
        req.socket.setTimeout(900000); // Garante que o canal TCP não feche por inatividade
    }
    next();
}, avaliacaoController.gerar);

// Rota protegida: acessível para qualquer usuário autenticado
app.get('/painel', autenticar, (req, res) => {
  res.send(`Olá, ${req.usuario.nome}. Seu cargo é: ${req.usuario.cargo}`);
});

// Sincroniza os modelos com o banco e inicia o servidor
db.sequelize.sync().then(() => {
const server =  app.listen(5000, () => console.log("Servidor rodando na porta 5000"));
server.requestTimeout = 900000; 
server.headersTimeout = 905000; 
})
.catch(err => console.log('Error: ' + err));
