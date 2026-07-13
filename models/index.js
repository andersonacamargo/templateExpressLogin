import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import createUserModel from './User.js'; // Import the model factory function
import createPostModel from './Post.js'; // Import the model factory function

dotenv.config(); // Carrega variáveis do .env

// Cria conexão com o PostgreSQL usando Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

// Exporta a instância do banco e os modelos
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Inicializa o modelo passando a instância do sequelize
db.User = createUserModel(sequelize, Sequelize);
db.Post = createPostModel(sequelize, Sequelize); 

// Define o relacionamento (FK)
db.Post.belongsTo(db.User, { foreignKey: 'userID', as: 'autor' });
db.User.hasMany(db.Post, { foreignKey: 'userID', as: 'posts' });

export default db;
