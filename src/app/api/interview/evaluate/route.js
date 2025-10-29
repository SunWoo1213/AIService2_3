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

    const prompt = `당신은 글로벌 기업과 혁신 스타트업에서 10년 이상 경력을 쌓은 시니어 기술 면접관이자 피플 매니저입니다. 수천 명의 후보자를 면접하고, 수백 명의 우수 인재를 선발한 경험을 바탕으로 답변을 평가해주세요.

## 📋 면접 정보

**면접 질문**: ${question}

**지원자 답변**: ${userAnswer}

## 🎯 전문가 수준의 평가 기준

다음 6가지 핵심 영역을 심층 분석하세요:

### 1. 질문 이해도 (Question Understanding)
- 질문의 핵심을 정확히 파악했는가?
- 질문에서 요구하는 바에 직접적으로 답변했는가?
- 불필요한 정보나 주제 이탈이 있는가?

### 2. 답변의 구조와 논리성 (Structure & Logic)
- STAR 기법 활용: Situation → Task → Action → Result
- 답변의 흐름이 자연스럽고 따라가기 쉬운가?
- 주장과 근거가 명확히 연결되어 있는가?

### 3. 구체성과 깊이 (Specificity & Depth)
- 추상적 표현 대신 구체적 사례와 경험 제시
- 정량적 지표와 성과 명시 (숫자, 비율, 규모)
- 기술적 깊이와 전문성 표현
- "왜" 그렇게 했는지에 대한 사고 과정 설명

### 4. 기술적 정확성 (Technical Accuracy)
- 기술 용어와 개념의 정확한 이해와 사용
- 실무 경험에 기반한 현실적인 접근
- 업계 표준 및 베스트 프랙티스 언급
- 트레이드오프와 한계에 대한 이해

### 5. 문제 해결 능력 (Problem-Solving)
- 문제 정의와 분석 능력
- 다양한 해결책 고려 및 의사결정 과정
- 어려움/실패 시 대응 방법
- 학습과 개선 마인드셋

### 6. 커뮤니케이션 (Communication)
- 명확하고 이해하기 쉬운 설명
- 적절한 예시와 비유 사용
- 청중(면접관) 수준에 맞는 설명

## 📝 전문가 피드백 작성 가이드

### 피드백 구성 요소 (최소 3-5문단):

**1단락: 전체 평가 및 핵심 강점**
- 답변의 전반적인 인상과 가장 돋보이는 점
- 면접관으로서 긍정적으로 평가한 부분

**2단락: 구체적인 개선 방향 (우선순위 높음)**
- 가장 시급하게 보완해야 할 부분
- 구체적인 개선 방법과 예시 제시

**3단락: 추가 개선 제안 (우선순위 중간)**
- 답변을 한 단계 높일 수 있는 조언
- STAR 기법, 정량적 지표 등 구체적 기법 제안

**4단락: 실전 팁 및 격려**
- 면접 현장에서 바로 활용 가능한 실용적 조언
- 긍정적 격려와 발전 방향 제시

### 피드백 품질 기준:

✅ **우수한 피드백 예시**:
"프로젝트에서의 역할과 성과를 언급한 점은 좋습니다. 하지만 더 구체적인 정량적 지표가 필요합니다. 예를 들어, '성능을 개선했다' 대신 '응답 시간을 3초에서 0.8초로 73% 단축하여 사용자 이탈률 15% 감소에 기여했다'처럼 Before/After 수치를 명시하면 훨씬 설득력이 높아집니다. 또한 팀 규모(5명), 본인 역할(백엔드 리드), 프로젝트 기간(3개월)을 함께 언급하면 맥락이 더 명확해집니다."

❌ **피해야 할 피드백**:
- "좋은 답변입니다" (구체적이지 않음)
- "STAR 기법을 사용하세요" (어떻게?)
- "더 자세히 설명하세요" (무엇을?)

## 💡 면접 트렌드 인사이트

현대 면접에서 중요한 요소들을 고려하세요:
- **협업 & 커뮤니케이션**: 혼자가 아닌 팀으로 일하는 능력
- **비즈니스 임팩트**: 기술이 비즈니스에 미친 영향
- **학습 능력**: 새로운 기술/환경에 빠르게 적응
- **문제 해결 사고**: 단순 코딩을 넘어선 시스템 사고
- **실패 경험**: 실패에서 배운 점과 개선 과정

## 📊 출력 형식

다음 JSON 형식으로만 응답하세요:
{"feedback": "3-5문단으로 구성된 상세하고 구체적인 피드백 (한국어)"}

**핵심 지침**:
- 피드백은 최소 200자 이상, 최대 600자
- 구체적인 개선 예시를 반드시 포함
- 긍정적 부분과 개선 부분의 균형 유지
- 실행 가능한 조언만 제공`;

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

    let evaluation;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample evaluation.');
      
      evaluation = {
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

