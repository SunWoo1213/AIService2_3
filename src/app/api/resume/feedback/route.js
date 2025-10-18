import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { jobKeywords, resumeText, userProfile, userId } = await request.json();

    if (!resumeText || !userId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // LLM API 호출
    const prompt = `You are a professional career coach providing feedback on a user's resume. 

Based on the following information:

**Job Keywords**: ${JSON.stringify(jobKeywords)}

**User's Profile**: ${JSON.stringify(userProfile)}

**User's Resume**: 
${resumeText}

Perform a detailed analysis in Korean. Check for alignment with the job posting, grammar, context, and clarity. 

Provide the feedback in a JSON format with two main keys:
1. "score": an overall score out of 100
2. "feedback_details": an array of objects, where each object has:
   - "original_sentence": a sentence from the resume that needs improvement
   - "suggested_improvement": your suggested improvement
   - "reason": explanation in Korean for why this change is needed

Provide ONLY the JSON object, no additional text.`;

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

    let feedbackResult;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample feedback.');
      feedbackResult = {
        score: 75,
        feedback_details: [
          {
            original_sentence: "저는 열정적인 개발자입니다.",
            suggested_improvement: "저는 3년간의 실무 경험을 바탕으로 사용자 중심의 웹 애플리케이션을 개발해온 프론트엔드 개발자입니다.",
            reason: "구체적인 경력과 전문 분야를 명시하면 더 강력한 인상을 줄 수 있습니다."
          },
          {
            original_sentence: "팀워크가 좋습니다.",
            suggested_improvement: "애자일 방법론을 활용한 5인 규모의 개발팀에서 협업하며 프로젝트를 성공적으로 완수한 경험이 있습니다.",
            reason: "추상적인 표현보다 구체적인 사례를 제시하는 것이 효과적입니다."
          }
        ]
      };
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
              content: 'You are a professional career coach. Always respond with valid JSON only in Korean.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
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
      
      feedbackResult = JSON.parse(jsonMatch[0]);
    }

    // Firestore에 저장
    const feedbackDoc = await addDoc(collection(db, 'feedbacks'), {
      userId,
      type: 'resume',
      jobKeywords,
      resumeText,
      userProfile,
      feedback: feedbackResult,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      id: feedbackDoc.id,
      feedback: feedbackResult
    });

  } catch (error) {
    console.error('Resume feedback error:', error);
    return NextResponse.json(
      { error: '피드백 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

