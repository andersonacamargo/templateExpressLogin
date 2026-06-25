
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Users', {
    nome: DataTypes.STRING, // Nome do usuário
    email: { 
      type: DataTypes.STRING,
      unique: true // Garante que o e-mail não se repita
    },
    senha: DataTypes.STRING, // Senha que será criptografada
  });


  return User;
};
