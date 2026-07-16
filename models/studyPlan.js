export default (sequelize, DataTypes) => {
    const StudyPlan = sequelize.define('StudyPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  planDetails: {
    type: DataTypes.TEXT, // Cronograma de estudos estruturado
    allowNull: false,
  },
  diagnosticAssessment: {
    type: DataTypes.TEXT, // Quiz inicial (Diagnóstico)
    allowNull: false,
  },
  diagnosticResult: {
    type: DataTypes.TEXT, // Armazenará a nota, acertos e nível de partida
    allowNull: true,
  },
  progressAssessments: {
    type: DataTypes.TEXT, // Array de quizes intermediários por etapa
    allowNull: true,
    defaultValue: '[]'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
return StudyPlan;

}