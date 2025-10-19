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
    const prompt = `당신은 10년 이상 경력의 전문 커리어 코치이자 채용 담당자입니다. 지원자의 자기소개서/이력서를 채용 공고에 맞춰 면밀히 분석하고 구체적인 개선 방안을 제시해주세요.

## 📋 분석 자료

**채용 공고 주요 키워드 및 요구사항**:
${JSON.stringify(jobKeywords, null, 2)}

**지원자 프로필**:
${JSON.stringify(userProfile, null, 2)}

**지원자의 자기소개서/이력서 내용**:
${resumeText}

## 🎯 분석 기준

다음 5가지 관점에서 철저히 분석해주세요:

1. **직무 적합성** (30점): 채용 공고의 키워드, 필수 역량, 우대사항이 얼마나 잘 반영되어 있는가?
2. **구체성 및 정량화** (25점): 추상적 표현 대신 구체적 수치, 성과, 기간이 명시되어 있는가?
3. **문법 및 표현** (20점): 맞춤법, 띄어쓰기, 문장 구조가 올바른가? 전문적인 표현을 사용하는가?
4. **논리성 및 구조** (15점): 내용의 흐름이 자연스럽고 논리적인가? STAR 기법이 적용되었는가?
5. **차별화 및 임팩트** (10점): 다른 지원자와 구별되는 독특한 경험이나 강점이 있는가?

## 📝 피드백 작성 지침

각 피드백 항목은 반드시 다음을 포함해야 합니다:
- **원문**: 실제 이력서에서 발췌한 문장 (정확히 인용)
- **개선안**: 구체적이고 즉시 적용 가능한 수정 문장
- **이유**: 왜 이렇게 수정해야 하는지 명확한 근거 제시
- **카테고리**: [직무적합성/구체성/문법/논리성/차별화] 중 하나

## 💡 개선 예시

❌ 나쁜 피드백: "더 구체적으로 작성하세요"
✅ 좋은 피드백: "프로젝트 규모(팀원 수, 기간, 예산), 본인의 역할, 정량적 성과(매출 증가율, 사용자 수 증가 등)를 명시하면 설득력이 높아집니다"

## 📊 출력 형식

다음 JSON 형식으로만 응답하세요 (추가 설명 없이):

{
  "score": 85,
  "score_breakdown": {
    "job_fit": 26,
    "specificity": 20,
    "grammar": 18,
    "logic": 12,
    "differentiation": 9
  },
  "summary": "전체적으로 우수한 자기소개서입니다. 기술 스택과 프로젝트 경험이 잘 드러나지만, 정량적 성과를 더 보완하면 완성도가 높아질 것입니다.",
  "strengths": [
    "채용 공고의 핵심 키워드(React, TypeScript)가 적절히 포함됨",
    "프로젝트 경험이 구체적으로 서술됨"
  ],
  "weaknesses": [
    "성과를 나타내는 정량적 지표(수치, 증가율 등)가 부족함",
    "직무 관련 경험과 무관한 내용이 일부 포함됨"
  ],
  "feedback_details": [
    {
      "category": "구체성",
      "original_sentence": "팀 프로젝트를 성공적으로 완수했습니다.",
      "suggested_improvement": "5명 규모의 개발팀에서 프론트엔드 리드로 6개월간 근무하며, 사용자 만족도를 35% 향상시킨 웹 서비스를 출시했습니다.",
      "reason": "추상적인 '성공적 완수' 표현 대신, 팀 규모(5명), 역할(프론트엔드 리드), 기간(6개월), 정량적 성과(만족도 35% 향상)를 명시하여 구체성과 신뢰도를 높일 수 있습니다.",
      "priority": "high"
    },
    {
      "category": "직무적합성",
      "original_sentence": "다양한 프로그래밍 언어를 다룰 수 있습니다.",
      "suggested_improvement": "채용 공고의 필수 요구사항인 React와 TypeScript를 활용하여 3개의 상용 서비스를 개발한 경험이 있습니다.",
      "reason": "채용 공고에서 요구하는 구체적인 기술 스택(React, TypeScript)을 직접 언급하고, 실무 경험을 명시하여 직무 적합성을 강조할 수 있습니다.",
      "priority": "high"
    },
    {
      "category": "문법",
      "original_sentence": "빠르게변화하는 환경에 적응할수있습니다.",
      "suggested_improvement": "빠르게 변화하는 환경에 적응할 수 있습니다.",
      "reason": "띄어쓰기 오류를 수정했습니다. '빠르게 변화하는', '적응할 수 있습니다'로 올바르게 띄어 써야 합니다.",
      "priority": "medium"
    }
  ]
}

**중요**: 
- 최소 5개 이상, 최대 10개의 구체적인 개선 사항을 제시하세요
- 각 피드백은 즉시 적용 가능한 실용적인 조언이어야 합니다
- 모든 내용은 한국어로 작성하세요
- priority는 "high", "medium", "low" 중 하나를 선택하세요`;

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

    let feedbackResult;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample feedback.');
      feedbackResult = {
        score: 75,
        score_breakdown: {
          job_fit: 22,
          specificity: 18,
          grammar: 16,
          logic: 12,
          differentiation: 7
        },
        summary: "전반적으로 양호한 자기소개서입니다. 기본적인 경험은 잘 표현되어 있으나, 정량적 성과와 직무 관련 키워드를 보강하면 경쟁력이 더욱 높아질 것입니다.",
        strengths: [
          "문장 구조가 명확하고 읽기 쉽게 작성됨",
          "프로젝트 경험이 포함되어 있음"
        ],
        weaknesses: [
          "채용 공고의 핵심 키워드가 충분히 반영되지 않음",
          "성과를 나타내는 구체적인 수치가 부족함",
          "추상적인 표현이 다수 포함됨"
        ],
        feedback_details: [
          {
            category: "구체성",
            original_sentence: "저는 열정적인 개발자입니다.",
            suggested_improvement: "저는 3년간 React와 TypeScript를 활용하여 10개 이상의 웹 애플리케이션을 개발한 프론트엔드 개발자입니다.",
            reason: "'열정적인'은 추상적인 표현입니다. 구체적인 경력 기간(3년), 기술 스택(React, TypeScript), 프로젝트 수(10개 이상)를 명시하면 설득력이 높아집니다.",
            priority: "high"
          },
          {
            category: "직무적합성",
            original_sentence: "팀워크가 좋습니다.",
            suggested_improvement: "애자일 스크럼 방법론을 활용한 5인 규모의 개발팀에서 프론트엔드 리드로 6개월간 협업하며, 프로젝트 일정을 2주 앞당겨 출시한 경험이 있습니다.",
            reason: "추상적인 '팀워크가 좋다' 대신, 방법론(애자일 스크럼), 팀 규모(5인), 역할(리드), 기간(6개월), 정량적 성과(2주 단축)를 명시하여 구체성을 높였습니다.",
            priority: "high"
          },
          {
            category: "직무적합성",
            original_sentence: "다양한 기술을 학습했습니다.",
            suggested_improvement: "채용 공고에서 요구하는 React, Next.js, TypeScript를 실무에 활용하여 사용자 경험을 개선한 프로젝트를 수행했습니다.",
            reason: "채용 공고의 핵심 기술 스택을 직접 언급하고, 단순 학습이 아닌 실무 활용 경험을 강조하면 직무 적합성이 더욱 부각됩니다.",
            priority: "high"
          },
          {
            category: "구체성",
            original_sentence: "성능 최적화를 수행했습니다.",
            suggested_improvement: "웹팩 번들 사이즈를 40% 축소하고 초기 로딩 속도를 3.2초에서 1.1초로 개선하여 사용자 이탈률을 25% 감소시켰습니다.",
            reason: "구체적인 수치(번들 40% 축소, 로딩 시간 3.2초→1.1초, 이탈률 25% 감소)를 제시하면 실제 기여도와 임팩트를 명확히 전달할 수 있습니다.",
            priority: "high"
          },
          {
            category: "문법",
            original_sentence: "빠르게변화하는 기술트렌드를 따라갑니다.",
            suggested_improvement: "빠르게 변화하는 기술 트렌드를 따라갑니다.",
            reason: "띄어쓰기 오류를 수정했습니다. '빠르게 변화하는', '기술 트렌드'로 올바르게 띄어 써야 합니다.",
            priority: "medium"
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
        model: 'gpt-4o',
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

