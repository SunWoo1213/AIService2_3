import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { jobKeywords, resumeText } = await request.json();

    if (!jobKeywords || !resumeText) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const prompt = `You are an interviewer for a technical role. Based on the following information:

**Job Posting**: ${JSON.stringify(jobKeywords)}

**Candidate's Resume**: ${resumeText}

Generate 5 interview questions focused on their major and technical skills. For each question, specify a time limit.
- 3 questions should be long-answer (60 seconds)
- 2 questions should be short-answer (20 seconds)

Return a JSON array in this format:
[{"question": "질문 내용 (in Korean)", "time_limit": 60}, ...]

Provide ONLY the JSON array, no additional text. Questions should be in Korean.`;

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

    let questions;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample questions.');
      questions = [
        {
          question: "본인의 강점과 약점을 말씀해주세요.",
          time_limit: 60
        },
        {
          question: "이 직무에 지원하게 된 동기는 무엇인가요?",
          time_limit: 60
        },
        {
          question: "팀 프로젝트에서 갈등이 발생했을 때 어떻게 해결하셨나요?",
          time_limit: 60
        },
        {
          question: "가장 자신있는 기술 스택은 무엇인가요?",
          time_limit: 20
        },
        {
          question: "5년 후 본인의 모습을 그려보신다면?",
          time_limit: 20
        }
      ];
    } else {
      const llmResponse = await fetch(llmApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional interviewer. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!llmResponse.ok) {
        throw new Error('LLM API 호출 실패');
      }

      const llmData = await llmResponse.json();
      const content = llmData.choices[0].message.content;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }
      
      questions = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: '질문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

