import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question, userAnswer } = await request.json();

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const prompt = `As a technical interviewer, evaluate the following answer in Korean.

**Question**: ${question}

**Candidate's Answer**: ${userAnswer}

Provide feedback on clarity, technical accuracy, and relevance. Give a score from 1-10 and provide a concise feedback point in Korean.

Return a JSON object in this format:
{"score": 8, "feedback": "피드백 내용 in Korean"}

Provide ONLY the JSON object, no additional text.`;

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

    let evaluation;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample evaluation.');
      
      // 답변 길이에 따라 점수 조정
      const answerLength = userAnswer.length;
      let score = 5;
      if (answerLength > 100) score = 7;
      if (answerLength > 200) score = 8;
      if (userAnswer === '답변 없음' || userAnswer === '건너뜀') score = 0;

      evaluation = {
        score: score,
        feedback: userAnswer === '답변 없음' || userAnswer === '건너뜀' 
          ? '답변이 제공되지 않았습니다.' 
          : '전반적으로 좋은 답변입니다. 구체적인 사례를 더 추가하면 더욱 설득력있는 답변이 될 것 같습니다.'
      };
    } else {
      const llmResponse = await fetch(llmApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a professional technical interviewer. Always respond with valid JSON only in Korean.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!llmResponse.ok) {
        throw new Error('LLM API 호출 실패');
      }

      const llmData = await llmResponse.json();
      const content = llmData.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }
      
      evaluation = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Answer evaluation error:', error);
    return NextResponse.json(
      { error: '답변 평가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

