import pdf from 'pdf-parse';
import mammoth from 'mammoth';

let zhipuClient = null;

function getZhipuClient() {
  if (!zhipuClient) {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey || apiKey === 'your_zhipu_api_key_here') {
      throw new Error('ZHIPU_API_KEY 未配置');
    }
    zhipuClient = { apiKey };
  }
  return zhipuClient;
}

export async function parseFile(file) {
  const buffer = file.buffer;
  const mimetype = file.mimetype;
  const originalname = file.originalname.toLowerCase();

  if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
    return parsePDF(buffer);
  }
  
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      originalname.endsWith('.docx')) {
    return parseDocx(buffer);
  }
  
  if (mimetype === 'application/msword' || originalname.endsWith('.doc')) {
    return parseDocx(buffer);
  }

  if (mimetype.startsWith('image/')) {
    return parseImage(buffer, mimetype);
  }

  return buffer.toString('utf-8');
}

async function parsePDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function parseImage(buffer, mimetype) {
  const base64Image = buffer.toString('base64');
  const imageUrl = `data:${mimetype};base64,${base64Image}`;
  
  const client = getZhipuClient();
  
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${client.apiKey}`
    },
    body: JSON.stringify({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            },
            {
              type: 'text',
              text: '请识别图片中的所有文字内容，直接输出识别结果，不要添加任何解释或说明。'
            }
          ]
        }
      ],
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`图片识别失败: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
