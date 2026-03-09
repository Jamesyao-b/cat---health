if (!process.env.ZHIPU_API_KEY || process.env.ZHIPU_API_KEY === 'your_zhipu_api_key_here') {
  console.warn('⚠️  警告: ZHIPU_API_KEY 未配置，请在 server/.env 文件中设置你的智谱 API Key');
}

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function callZhipuAPI(messages, options = {}) {
  const apiKey = process.env.ZHIPU_API_KEY || 'placeholder';
  
  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model || 'glm-4-flash',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`智谱API调用失败: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateQuestion(params) {
  const { resume, jd, questionIndex, previousQA, questionType } = params;
  
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildQuestionPrompt(params);
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
  
  return callZhipuAPI(messages, {
    model: 'glm-4-flash',
    temperature: 0.7,
    max_tokens: 500
  });
}

export async function polishAnswer(question, userAnswer) {
  const prompt = `你现在是我的资深产品经理 Mentor，擅长用结构化框架把面试者的表达打磨成可直接背诵的逐字稿。

1. 你所根据的内容:
1) 面试问题: ${question}
2) 我的原始回答: ${userAnswer}

2. 你的任务是:
- 输出润色后的答案，必须是可直接用于真实面试的口吻: 简洁、自治、信息密度高
- 答案 ≤ 500 字，不要扩写成"文章"，要像我在现场回答
- 必须使用清晰框架:
  1) 简历题: STAR或SCQA: 情境→任务→行动→结果; 或 情境→冲突→问题→答案
  2) 业务题: 问题-原因-方案-权衡-指标-风险兜底
  3) 行业题: 趋势-影响-应对; 或 观点-论据-总结
- 严格基于我提供的信息进行润色与重组:
- 不要编造数据/结论/项目背景
- 如缺关键细节，用【待补:xxx】占位，且只补最关键的1-2个点

请直接输出润色后的答案，不要有任何额外说明。`;

  const messages = [{ role: 'user', content: prompt }];
  
  return callZhipuAPI(messages, {
    model: 'glm-4-flash',
    temperature: 0.5,
    max_tokens: 800
  });
}

function buildSystemPrompt() {
  return `你是一位经验丰富的面试官，专门进行产品经理岗位的面试。你的提问风格:
- 每次只问1题
- 不评价不建议，只追问
- 问题要具体犀利，像真实面试
- 发现模糊/跳跃/偏执行就指出并追问
- 追问到信息充分或确认缺口

面试分为三个阶段:
A. 简历深挖（6题）：从面试者简历里最核心的 1-2 段经历下手(项目/实习/作品)，连续深挖。
B. 业务题（2题）：从JD的核心领域、核心指标、典型场景里拆题，考面试者是否"对这个岗位真的懂"。
C. 宏观行业题（2题）：结合面试者简历做过的行业 + JD的行业，问面试者对行业趋势、竞争格局、AI/新技术的判断。

注意: JD缺失时不问业务题，改为行业题或通用产品基本功题补足总数。`;
}

function buildQuestionPrompt(params) {
  const { resume, jd, questionIndex, previousQA, questionType } = params;
  
  let prompt = `面试者简历:
${resume}

`;
  
  if (jd) {
    prompt += `岗位描述JD:
${jd}

`;
  } else {
    prompt += `岗位描述JD: 未提供

`;
  }
  
  prompt += `已进行的问答:
${previousQA.length > 0 ? previousQA.map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n\n') : '无'}

`;
  
  prompt += `当前是第 ${questionIndex + 1} 题，共10题。

`;
  
  if (questionIndex < 6) {
    prompt += `当前阶段: 简历深挖（第${questionIndex + 1}题）
请基于简历中最核心的经历进行深挖提问。参考问题风格:
- 在{项目/经历}中，你做过最有成就感的一件事是什么?请详细描述一下。
- 在{项目/经历}中，主要的牵引指标是什么?你是如何定义和计算的?
- 讲一次你在{项目/经历}中遇到困难的经历，当时是如何解决的?
- 你如何证明你的数据分析能力很强?结合{项目}举一个具体案例。
- 你怎么定义{项目}做得好还是不好?基于什么判断?`;
  } else if (questionIndex < 8) {
    if (jd) {
      prompt += `当前阶段: 业务题（第${questionIndex - 5}题）
请基于JD的核心领域、核心指标、典型场景提问。参考问题风格:
- 你平时常用/最喜欢的产品是哪些?其中哪个功能让你觉得最惊艳?
- 给你一个目标:要提升我们产品的核心指标，你会从哪几个方向入手?`;
    } else {
      prompt += `当前阶段: 通用产品基本功题（JD未提供，改为通用题）
请提问通用产品基本功相关问题。参考问题风格:
- 你平时常用/最喜欢的产品是哪些?其中哪个功能让你觉得最惊艳?
- 你如何判断一个需求做得好不好?`;
    }
  } else {
    prompt += `当前阶段: 宏观行业题（第${questionIndex - 7}题）
请结合简历经历和JD行业提问行业趋势、竞争格局、AI/新技术相关问题。参考问题风格:
- 你觉得这个行业未来的发展趋势是什么?
- 你觉得市面上做的最好的AI垂类产品是什么?为什么?
- 说一个你最近觉得最有意思的产品。`;
  }

  prompt += `

请直接输出你的问题，不要有任何额外说明。`;

  return prompt;
}
