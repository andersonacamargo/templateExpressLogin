import express from 'express';
import { 
  startPlanWithDiagnostic, 
  generateProgressAssessment, 
  getSavedPlans,
  submitDiagnostic
} from '../controllers/studyController.js';

const router = express.Router();

// Cria o plano e injeta o quiz de nivelamento inicial
router.post('/plans/diagnostic', startPlanWithDiagnostic);

// Cria um quiz dinâmico focado em uma etapa específica do plano atual
router.post('/plans/:id/progress', generateProgressAssessment);

router.post('/plans/:id/diagnostic/submit', submitDiagnostic);

router.get('/plans', getSavedPlans);

export default router;
