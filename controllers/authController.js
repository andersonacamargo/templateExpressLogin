
import db from '../models/index.js'; // Import the main db object
import jwt from 'jsonwebtoken';

const { User } = db; // Destructure User from the default export db object

// Rota de registro de novo usuário
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    // Cria e salva o usuário no banco
    const novoUsuario = await User.create({ nome, email, senha });

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: novoUsuario
    });
  } catch (err) {
    // Em caso de erro (ex: email duplicado), retorna erro 400
    res.status(400).json({
      erro: 'Erro ao criar usuário',
      detalhes: err.message
    });
  }
};

// Rota de login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca usuário pelo e-mail
    const usuario = await User.findOne({ where: { email } });

    // Verifica se encontrou e compara senha
    if (!usuario || senha != usuario.senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Cria token JWT com ID e nome
    const token = jwt.sign({
      id: usuario.id,
      nome: usuario.nome,
    }, process.env.JWT_SECRET);

    // Retorna mensagem de sucesso e o token
    res.json({
      mensagem: 'Login bem-sucedido',
      token
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};