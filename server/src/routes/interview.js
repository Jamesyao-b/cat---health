import express from 'express';
import { generateQuestion, polishAnswer } from '../services/llm.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const sessions = new Map();

router.post('/start', async (req, res) => {
  try {
    const { resume, jd } = req.body;
    
    if (!resume) {
      return res.status(400).json({ error: 'Resume is required' });
    }
    
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      resume,
      jd: jd || null,
      qaHistory: [],
      currentQuestion: 0
    });
    
    const question = await generateQuestion({
      resume,
      jd: jd || null,
      questionIndex: 0,
      previousQA: [],
      questionType: 'resume'
    });
    
    const session = sessions.get(sessionId);
    session.currentQuestion = 1;
    session.currentQuestionText = question;
    
    res.json({
      sessionId,
      question,
      questionNumber: 1,
      totalQuestions: 10
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    
    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'SessionId and answer are required' });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.qaHistory.push({
      question: session.currentQuestionText,
      answer
    });
    
    if (session.currentQuestion >= 10) {
      res.json({
        completed: true,
        message: '面试已完成，请调用 /polish 接口获取润色后的答案'
      });
      return;
    }
    
    const questionIndex = session.currentQuestion;
    const questionType = getQuestionType(questionIndex, !!session.jd);
    
    const question = await generateQuestion({
      resume: session.resume,
      jd: session.jd,
      questionIndex,
      previousQA: session.qaHistory,
      questionType
    });
    
    session.currentQuestion++;
    session.currentQuestionText = question;
    
    res.json({
      question,
      questionNumber: session.currentQuestion,
      totalQuestions: 10,
      completed: false
    });
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

router.post('/polish', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const polishedQA = [];
    
    for (const qa of session.qaHistory) {
      const polished = await polishAnswer(qa.question, qa.answer);
      polishedQA.push({
        question: qa.question,
        originalAnswer: qa.answer,
        polishedAnswer: polished
      });
    }
    
    res.json({
      qaList: polishedQA,
      totalQuestions: polishedQA.length
    });
  } catch (error) {
    console.error('Polish error:', error);
    res.status(500).json({ error: 'Failed to polish answers' });
  }
});

router.get('/session/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    currentQuestion: session.currentQuestion,
    totalQuestions: 10,
    qaHistory: session.qaHistory
  });
});

function getQuestionType(index, hasJD) {
  if (index < 6) return 'resume';
  if (index < 8) return hasJD ? 'business' : 'general';
  return 'industry';
}

export default router;
