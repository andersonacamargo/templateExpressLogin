const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Rota de registro de novo usuário
exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    // Cria e salva o usuário no banco
    const novoUsuario = await User.create({ nome, email, senha });

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: novoUsuario
    });
  } catch (err) {
     // Em caso de erro (ex: email duplicado), retorna erro 500
    res.status(400).json({
      erro: 'Erro ao criar usuário',
      detalhes: err.message
    });
  }
};

// Rota de login
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  // Busca usuário pelo e-mail
  const usuario = await User.findOne({ where: { email } });

  // Verifica se encontrou e compara senha
  if (!usuario || !senha)
    return res.status(401).json({ erro: 'Credenciais inválidas' });


  res.json({
    mensagem: 'Login bem-sucedido',
    nome: usuario.nome,
  });
};

exports.atividades = async (req, res) => {

  const atividade = await User.findAll();
   console.log(atividade[1].nome)
   res.status(200).json({
     atividades: [
   { email: atividade[0].email,
    nome: atividade[0].nome,
   },
   { email: atividade[1].email,
    nome: atividade[1].nome,
   }
  ]});
};
