import db from '../models/index.js'; // Import the main db object
import { GoogleGenAI, Type } from '@google/genai';
import javascriptMock from '../mocks/mockJSBack.json' with { type: 'json' };
import typescriptMock from '../mocks/mockTSBack.json' with { type: 'json' };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const { StudyPlan } = db; // Destructure User from the default export db object

// Reutilização do schema de questões para manter o padrão do quiz
const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questoes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          enunciado: { type: Type.STRING },
          alternativas: { type: Type.ARRAY, items: { type: Type.STRING } },
          respostaCorreta: { type: Type.STRING },
          explicacao: { type: Type.STRING, description: "Justificativa didática." }
        },
        required: ["id", "enunciado", "alternativas", "respostaCorreta", "explicacao"]
      }
    }
  },
  required: ["questoes"]
};

// 1. INICIAR PLANO COM AVALIAÇÃO DIAGNÓSTICA
export const startPlanWithDiagnostic = async (req, res) => {
  try {
    const { subject, notes } = req.body;
    let aiOutput={};
    if (process.env.USE_MOCK === 'true' && subject.toLowerCase() === 'javascript') {
      console.log('⚡ Utilizando dados mockados de Inteligência Artificial para Javascript.');
      aiOutput = javascriptMock;
    } 
    else if (process.env.USE_MOCK === 'true' && subject.toLowerCase() === 'typescript') {
      console.log('⚡ Utilizando dados mockados de Inteligência Artificial para Javascript.');
      aiOutput = typescriptMock;
    }else {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        targetSubject: { type: Type.STRING },
        studyPlan: {
          type: Type.OBJECT,
          properties: {
            cronograma: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  etapa: { type: Type.STRING, description: "Ex: 'Etapa 1'" },
                  titulo: { type: Type.STRING },
                  conteudos: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tempoEstimado: { type: Type.STRING }
                },
                required: ["etapa", "titulo", "conteudos", "tempoEstimado"]
              }
            }
          },
          required: ["cronograma"]
        },
        diagnosticAssessment: quizSchema
      },
      required: ["targetSubject", "studyPlan", "diagnosticAssessment"]
    };

    const promptText = `
      Você é um avaliador pedagógico profissional. 
      Crie um plano de estudos progressivo para o assunto: "${subject}".
      Além disso, gere uma Avaliação Diagnóstica com 5 questões de múltipla escolha. 
      Este teste servirá para medir o conhecimento prévio do aluno antes de iniciar os estudos, cobrindo conceitos base do tema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4,
      },
   
    });
    aiOutput = JSON.parse(response.text);

  }

    const newRecord = await StudyPlan.create({
      subject: aiOutput.targetSubject,
      planDetails: JSON.stringify(aiOutput.studyPlan),
      diagnosticAssessment: JSON.stringify(aiOutput.diagnosticAssessment),
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao criar plano diagnóstico.' });
  }
};

export const getSavedPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.findAll();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
};


// 2. GERAR AVALIAÇÃO DE PROGRESSO CONFORME O PLANO
export const generateProgressAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { etapaAtual } = req.body; // Ex: "Etapa 1" ou "Módulo 1"

    // Busca o plano existente no banco
    const planRecord = await StudyPlan.findByPk(id);
    if (!planRecord) return res.status(404).json({ error: 'Plano de estudos não encontrado' });

    const promptText = `
      Com base no seguinte plano de estudos estruturado:
      ${planRecord.planDetails}

      Gere uma AVALIAÇÃO DE PROGRESSO focada estritamente no conteúdo programado para a etapa: "${etapaAtual}".
      A avaliação deve conter 3 questões de múltipla escolha com nível de dificuldade moderado a avançado para validar se o aluno realmente absorveu o conteúdo desta etapa específica.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema, // Reutiliza estrutura padrão de quiz
        temperature: 0.5,
      },
    });

    const newAssessment = JSON.parse(response.text);

    // Recupera o histórico de avaliações de progresso e adiciona a nova
    const currentProgressAssessments = JSON.parse(planRecord.progressAssessments || '[]');
    
    const assessmentEntry = {
      etapa: etapaAtual,
      generatedAt: new Date(),
      quiz: newAssessment
    };
    
    currentProgressAssessments.push(assessmentEntry);

    // Atualiza o banco de dados
    planRecord.progressAssessments = JSON.stringify(currentProgressAssessments);
    await planRecord.save();

    res.status(200).json({ 
      success: true, 
      message: `Avaliação de progresso da ${etapaAtual} gerada.`,
      data: assessmentEntry 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao gerar avaliação de progresso.' });
  }
};

export const submitDiagnostic = async (req, res) => {
  try {
    const { id } = req.params;
    const { respostasUsuario } = req.body; 
    // Formato esperado das respostas: { "1": "B", "2": "C", "3": "A", "4": "C", "5": "B" }

    if (!respostasUsuario) {
      return res.status(400).json({ error: 'O objeto de respostasUsuario é obrigatório.' });
    }

    const planRecord = await StudyPlan.findByPk(id);
    if (!planRecord) {
      return res.status(404).json({ error: 'Plano de estudos não encontrado.' });
    }

    // Se já respondeu ao diagnóstico, opcionalmente você pode travar ou permitir refazer
    if (planRecord.diagnosticResult) {
      return res.status(400).json({ error: 'A avaliação diagnóstica para este plano já foi respondida.' });
    }

    const assessment = JSON.parse(planRecord.diagnosticAssessment);
    const questoes = assessment.questoes;

    let acertos = 0;
    const totalQuestoes = questoes.length;
    const relatorioCorrecao = [];

    // Corrige questão por questão
    questoes.forEach(questao => {
      const respostaEnviada = respostasUsuario[questao.id];
      const correta = respostaEnviada === questao.respostaCorreta;

      if (correta) acertos++;

      relatorioCorrecao.push({
        idQuestao: questao.id,
        enunciado: questao.enunciado,
        respostaEnviada: respostaEnviada || "Não respondida",
        respostaCorreta: questao.respostaCorreta,
        correta,
        explicacao: questao.explicacao
      });
    });

    const percentualAcertos = (acertos / totalQuestoes) * 100;

    // Classificação Pedagógica Adaptativa
    let nivelPartida = 'Iniciante';
    let recomendacaoAdicional = '';

    if (percentualAcertos >= 80) {
      nivelPartida = 'Avançado';
      recomendacaoAdicional = 'Excelente desempenho! Você já possui uma base sólida. Se desejar, use as Etapas 1 e 2 apenas como revisão rápida e foque seus esforços nas etapas finais e projetos práticos.';
    } else if (percentualAcertos >= 50) {
      nivelPartida = 'Intermediário';
      recomendacaoAdicional = 'Bom desempenho. Você conhece os conceitos fundamentais, mas precisa consolidar a aplicação prática. Siga o cronograma proposto normalmente.';
    } else {
      nivelPartida = 'Iniciante';
      recomendacaoAdicional = 'Nível inicial detectado. Recomendamos que você dedique tempo extra à Etapa 1 do cronograma para sedimentar os conceitos de base antes de prosseguir.';
    }

    const resultadoFinal = {
      respondidoEm: new Date(),
      pontuacao: `${acertos}/${totalQuestoes}`,
      percentualAcertos: `${percentualAcertos.toFixed(1)}%`,
      nivelPartida,
      recomendacaoAdicional,
      detalhes: relatorioCorrecao
    };

    // Salva o resultado no banco de dados
    planRecord.diagnosticResult = JSON.stringify(resultadoFinal);
    await planRecord.save();

    res.status(200).json({
      success: true,
      message: 'Avaliação Diagnóstica processada e salva com sucesso!',
      data: resultadoFinal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao processar a avaliação diagnóstica.' });
  }
};
