const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const app = express();
app.use(cors()); // Permite cross plataform para utilizar o client e server em localhost
app.use(express.json()); // Permite leitura de JSON


const { autenticar, somenteAdmin } = require('./middleware/auth');
const {validate} = require('./middleware/validateUser');
const authController = require('./controllers/authController');
dotenv.config(); // Carrega o .env



// Rota pública: criar novo usuário


app.post('/registrar', 
  validate,
  authController.registrar);

// Rota pública: login e geração do token
app.post('/login', authController.login);

// Rota protegida: acessível para qualquer usuário autenticado
app.get('/painel', autenticar, (req, res) => {
  res.send(`Olá, ${req.usuario.nome}. Seu cargo é: ${req.usuario.cargo}`);
});

// Rota protegida: acessível apenas a admins
app.get('/admin', autenticar, somenteAdmin, (req, res) => {
  res.send("Bem-vindo à área administrativa da clínica.");
});

// Sincroniza os modelos com o banco e inicia o servidor
db.sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Servidor da clínica rodando na porta 5000"));
});
