import jwt from 'jsonwebtoken';

// Verifica se o token foi enviado e é válido
export const autenticar = (req, res, next) => {
  // Safe check in case authorization header is completely missing
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

  const token = authHeader.split(" ")[1]; // Espera "Bearer <token>"
  if (!token) return res.status(401).json({ erro: "Token não fornecido" });

  try {
    // Decodifica e armazena dados do usuário no request
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next(); // Continua para a rota
  } catch {
    res.status(403).json({ erro: "Token inválido" });
  }
};

// Verifica se o usuário é admin
export const somenteAdmin = (req, res, next) => {
  if (req.usuario?.cargo !== 'admin') {
    return res.status(403).json({ erro: 'Apenas administradores têm acesso' });
  }
  next(); // Continua se for admin
};
