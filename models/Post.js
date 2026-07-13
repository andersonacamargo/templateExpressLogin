export default (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID' // Mapeia para a coluna 'ID' em maiúsculo se necessário, ou pode remover para usar padrão
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      texto: {
        type: DataTypes.TEXT, // Usado TEXT em vez de STRING pois posts podem ser longos
        allowNull: false
      },
      curtidas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
        
// A logica de curtidas para um sistema real não é assim, 
// criei assim para facilitar a avaliação na parte de bloqueio de curtidas usem isso para facilitar sua vida
// se True não deve deixar curtir novamente
      minhaCurtida: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'userID'
      }
    }, {
      tableName: 'posts', // Define o nome da tabela no banco de dados
      timestamps: true    // Cria automaticamente as colunas 'createdAt' e 'updatedAt'
    });
  
    return Post;
  };