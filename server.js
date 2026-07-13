// Atividade: criar rotas de vagas e post, deixei o exemplo do painel para lembrar que post deve ser com usuario autenticado com JWT
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js'; 
import { autenticar, somenteAdmin } from './middleware/auth.js';
import * as authController from './controllers/authController.js';
const app = express();
app.use(cors()); // Permite cross plataform para utilizar o client e server em localhost
app.use(express.json()); // Permite leitura de JSON

dotenv.config(); // Carrega o .env

// Rota pública: criar novo usuário
app.post('/registrar', 
  authController.registrar);

// Rota pública: login e geração do token
app.post('/login', authController.login);

// Rota protegida: acessível para qualquer usuário autenticado
app.get('/painel', autenticar, (req, res) => {
  res.send(`Olá, ${req.usuario.nome}. Seu cargo é: ${req.usuario.cargo}`);
});

// Sincroniza os modelos com o banco e inicia o servidor
db.sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Servidor da clínica rodando na porta 5000"));
})
.catch(err => console.log('Error: ' + err));
