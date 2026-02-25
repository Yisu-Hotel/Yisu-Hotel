const knowledgeBase = require('./knowledgeData');

const normalize = (value) => (value || '').toLowerCase();

const matchScore = (query, keywords) => {
  const text = normalize(query);
  return (keywords || []).reduce((score, keyword) => {
    if (!keyword) {
      return score;
    }
    return text.includes(normalize(keyword)) ? score + 1 : score;
  }, 0);
};

const buildContext = (items) => items
  .map((item) => `问题：${item.question}\n答案：${item.answer}`)
  .join('\n\n');

const searchKnowledgeBase = async (query, options = {}) => {
  const limit = Number.isInteger(options.limit) ? options.limit : 3;
  const scored = knowledgeBase
    .map((item) => ({
      ...item,
      score: matchScore(query, item.keywords)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) {
    return {
      context: '暂无直接匹配的知识库案例，请根据通用平台逻辑回答。',
      items: [],
      matches: []
    };
  }

  return {
    context: buildContext(scored),
    items: scored,
    matches: scored.map(({ id, question, answer, score }) => ({
      id,
      question,
      answer,
      score
    }))
  };
};

const getToolDefinition = () => ({
  type: 'function',
  function: {
    name: 'knowledge_base_search',
    description: '检索商户知识库，返回与问题相关的常见问题与答案。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '商户的提问或检索关键词'
        },
        limit: {
          type: 'integer',
          description: '返回的最大匹配数量',
          default: 3
        }
      },
      required: ['query']
    }
  }
});

const executeToolCall = async (argumentsJson = {}) => {
  const query = typeof argumentsJson.query === 'string' ? argumentsJson.query : '';
  const limit = Number.isInteger(argumentsJson.limit) ? argumentsJson.limit : 3;
  return searchKnowledgeBase(query, { limit });
};

module.exports = {
  searchKnowledgeBase,
  getToolDefinition,
  executeToolCall
};
