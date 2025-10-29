import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const question = formData.get('question');
    const transcript = formData.get('transcript'); // SpeechRecognition으로 얻은 텍스트

    if (!audioFile || !question) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1';

    let analysisResult;

    if (!llmApiKey) {
      // LLM API가 설정되지 않은 경우 샘플 응답
      console.warn('LLM_API_KEY not set. Returning sample delivery analysis.');
      
      // 간단한 WPM 계산 (transcript 기반)
      const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
      const estimatedDuration = Math.max(10, wordCount / 2.5); // 대략 150 WPM 가정
      const wpm = Math.round((wordCount / estimatedDuration) * 60);

      // 필러 단어 카운트 (한국어 최적화)
      const fillerWords = ['어', '음', '그', '저기', '이제', '뭐', '그러니까', '아', '네'];
      let fillerCount = 0;
      if (transcript) {
        // 한국어는 단어 경계(\b)가 제대로 작동하지 않으므로 공백이나 문장 부호 기준으로 매칭
        const textWithSpaces = ' ' + transcript + ' ';
        fillerWords.forEach(word => {
          // 각 필러 단어를 독립적으로 찾기 (공백, 문장부호, 시작/끝 기준)
          const regex = new RegExp(`[\\s,\\.\\?!]${word}[\\s,\\.\\?!]`, 'gi');
          const matches = textWithSpaces.match(regex);
          if (matches) {
            fillerCount += matches.length;
            console.log(`필러 단어 "${word}" 발견: ${matches.length}회`);
          }
        });
        console.log('총 필러 단어 수:', fillerCount);
      }

      analysisResult = {
        contentFeedback: {
          advice: '전반적으로 좋은 답변입니다. 구체적인 예시를 더 추가하면 더욱 설득력있는 답변이 될 것입니다.'
        },
        deliveryFeedback: {
          wpm: wpm,
          wpmAdvice: wpm >= 130 && wpm <= 160 
            ? '말의 속도가 적절합니다. 듣기 편안한 속도로 답변하셨습니다.'
            : wpm < 130
            ? '말의 속도가 다소 느립니다. 조금 더 자신감 있게 말씀하시면 좋겠습니다.'
            : '말의 속도가 다소 빠릅니다. 조금 더 천천히 말하면 면접관이 이해하기 쉬울 것입니다.',
          fillerCount: fillerCount,
          fillerAdvice: fillerCount <= 2
            ? '불필요한 필러 단어 사용이 적어 매우 좋습니다.'
            : fillerCount <= 5
            ? `'어', '음' 같은 필러 단어가 ${fillerCount}회 사용되었습니다. 조금 줄이면 더욱 전문적으로 들립니다.`
            : `필러 단어가 ${fillerCount}회 사용되어 다소 많습니다. 답변 전에 잠시 생각하는 시간을 가지면 줄일 수 있습니다.`
        }
      };
    } else {
      try {
        // Step 1: Whisper API로 오디오 전사 (더 정확한 분석)
        const transcriptionResponse = await fetch(`${llmApiUrl}/audio/transcriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${llmApiKey}`,
          },
          body: (() => {
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'verbose_json');
            formData.append('language', 'ko');
            return formData;
          })()
        });

        if (!transcriptionResponse.ok) {
          throw new Error('Whisper API 호출 실패');
        }

        const transcriptionData = await transcriptionResponse.json();
        const whisperTranscript = transcriptionData.text || transcript;
        const durationInSeconds = transcriptionData.duration || 30; // 폴백 값

        // Step 2: 전달력 메트릭 계산
        const wordCount = whisperTranscript.split(/\s+/).filter(Boolean).length;
        const wpm = Math.round((wordCount / durationInSeconds) * 60);

        // 필러 단어 분석 (한국어 최적화)
        const fillerWords = ['어', '음', '그', '저기', '이제', '뭐', '그러니까', '아', '네'];
        let fillerCount = 0;
        if (whisperTranscript) {
          // 한국어는 단어 경계(\b)가 제대로 작동하지 않으므로 공백이나 문장 부호 기준으로 매칭
          const textWithSpaces = ' ' + whisperTranscript + ' ';
          fillerWords.forEach(word => {
            // 각 필러 단어를 독립적으로 찾기 (공백, 문장부호, 시작/끝 기준)
            const regex = new RegExp(`[\\s,\\.\\?!]${word}[\\s,\\.\\?!]`, 'gi');
            const matches = textWithSpaces.match(regex);
            if (matches) {
              fillerCount += matches.length;
              console.log(`필러 단어 "${word}" 발견: ${matches.length}회`);
            }
          });
          console.log('총 필러 단어 수:', fillerCount);
        }

        // Step 3: LLM을 사용한 종합 피드백
        const llmPrompt = `당신은 커뮤니케이션 전문가이자 프레젠테이션 코치로서 10년 이상 임원 스피치 코칭과 면접 트레이닝을 담당해온 전문가입니다. 답변의 내용과 전달 방식을 모두 고려하여 심층 분석해주세요.

## 📋 분석 자료

**면접 질문**: "${question}"

**답변 전사본**: "${whisperTranscript}"

**측정된 전달력 지표**:
- 말 속도: ${wpm} WPM
  * 이상적 범위: 130-160 WPM
  * 너무 빠름(>180): 조급해 보이거나 긴장한 인상
  * 적정(130-160): 자신감 있고 명확한 전달
  * 너무 느림(<110): 준비 부족이나 자신감 결여로 보일 수 있음
  
- 필러 단어 사용: ${fillerCount}회
  * 우수(0-2회): 매우 준비된 답변, 전문적 인상
  * 양호(3-5회): 자연스러운 수준, 크게 문제없음
  * 개선 필요(6-10회): 긴장감이 드러남, 연습 필요
  * 심각(11회 이상): 답변 준비 부족, 자신감 결여

## 🎯 종합 평가 영역

### 1. 답변 내용 분석 (Content Analysis)
다음 관점에서 평가하세요:
- **STAR 구조**: Situation-Task-Action-Result 적용 여부
- **구체성**: 정량적 지표, 구체적 사례, 기간/규모 명시
- **관련성**: 질문의 핵심을 정확히 파악하고 답변했는가
- **논리성**: 답변의 흐름과 인과관계의 명확성
- **깊이**: 표면적 설명을 넘어선 통찰과 사고 과정
- **비즈니스 임팩트**: 기술/행동이 조직에 미친 영향

### 2. 전달력 분석 (Delivery Analysis)
다음 관점에서 평가하세요:
- **말 속도**: 측정된 ${wpm} WPM의 적절성
- **명료성**: 핵심 메시지의 전달력
- **자신감**: 언어 선택과 표현의 확신성
- **필러 단어**: ${fillerCount}회 사용의 영향도
- **구조화**: 청자가 따라가기 쉬운 전달 순서

## 📝 전문가 피드백 작성 가이드

### contentFeedback.advice (답변 내용 피드백)
**3-4문단으로 구성** (최소 250자):

**1단락**: 전체 평가 및 강점
- 답변에서 가장 인상적인 부분
- 잘 구성된 요소 (STAR, 구체성 등)

**2단락**: 핵심 개선 사항
- 가장 중요한 개선점 1-2개
- 구체적인 개선 예시 제시

**3단락**: 추가 개선 제안
- 답변을 한 단계 높일 수 있는 조언
- 정량적 지표 추가, 비즈니스 임팩트 강조 등

**4단락**: 실전 적용 팁
- 면접 현장에서 바로 활용 가능한 조언

### wpmAdvice (말 속도 피드백)
**2-3문장으로 구성** (최소 80자):
- 현재 ${wpm} WPM에 대한 구체적 평가
- 이상적 범위(130-160)와의 비교
- 구체적 개선 방법 (예: 문장 사이 짧은 호흡, 핵심 단어 강조 등)

### fillerAdvice (필러 단어 피드백)
**2-3문장으로 구성** (최소 80자):
- ${fillerCount}회 사용에 대한 구체적 평가
- 면접관에게 미치는 인상 설명
- 실전 개선 팁 (예: 짧은 침묵 활용, 답변 전 3초 생각, 연습 방법 등)

## 💡 커뮤니케이션 전문가 인사이트

다음 요소를 피드백에 반영하세요:

**효과적인 면접 답변의 특징**:
- 첫 문장에서 결론 또는 핵심 메시지 제시
- 구체적 숫자와 데이터로 신뢰도 향상
- 짧고 명확한 문장 사용
- 적절한 포즈(pause)로 강조점 부각
- "저는 생각합니다" 대신 "~입니다" (확신 있는 표현)

**피해야 할 요소**:
- 과도한 겸손 또는 자기비하
- 모호한 표현 ("아마도", "~것 같습니다")
- 질문과 무관한 장황한 배경 설명
- 성과를 구체화하지 않은 추상적 표현

## 📊 출력 형식

다음 JSON 형식으로만 응답하세요:

{
  "contentFeedback": {
    "advice": "3-4문단으로 구성된 상세한 내용 피드백 (250자 이상)"
  },
  "deliveryFeedback": {
    "wpm": ${wpm},
    "wpmAdvice": "말 속도에 대한 구체적이고 실행 가능한 조언 (80자 이상)",
    "fillerCount": ${fillerCount},
    "fillerAdvice": "필러 단어 개선을 위한 구체적인 실전 팁 (80자 이상)"
  }
}

**핵심 지침**:
- 모든 피드백은 구체적인 예시와 함께 제공
- 긍정적 부분 인정 후 개선 방향 제시 (칭찬 샌드위치)
- 즉시 실행 가능한 조언만 포함
- 전문 용어 사용 시 쉬운 설명 병기`;

        const llmResponse = await fetch(`${llmApiUrl}/chat/completions`, {
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
                content: 'You are a professional interview coach. Always respond with valid JSON only in Korean.'
              },
              {
                role: 'user',
                content: llmPrompt
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!llmResponse.ok) {
          throw new Error('LLM API 호출 실패');
        }

        const llmData = await llmResponse.json();
        const content = llmData.choices[0].message.content;
        analysisResult = JSON.parse(content);

      } catch (error) {
        console.error('Whisper/LLM API 오류:', error);
        // 폴백: 기본 메트릭만 계산
        const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
        const estimatedDuration = Math.max(10, wordCount / 2.5);
        const wpm = Math.round((wordCount / estimatedDuration) * 60);

        // 필러 단어 카운트 (한국어 최적화)
        const fillerWords = ['어', '음', '그', '저기', '이제', '뭐', '그러니까', '아', '네'];
        let fillerCount = 0;
        if (transcript) {
          const textWithSpaces = ' ' + transcript + ' ';
          fillerWords.forEach(word => {
            const regex = new RegExp(`[\\s,\\.\\?!]${word}[\\s,\\.\\?!]`, 'gi');
            const matches = textWithSpaces.match(regex);
            if (matches) {
              fillerCount += matches.length;
            }
          });
        }

        analysisResult = {
          contentFeedback: {
            advice: '답변 내용이 질문과 관련이 있습니다. 더 구체적인 예시를 추가하면 좋겠습니다.'
          },
          deliveryFeedback: {
            wpm: wpm,
            wpmAdvice: '말하기 속도를 분석했습니다.',
            fillerCount: fillerCount,
            fillerAdvice: '필러 단어 사용을 줄이도록 노력해보세요.'
          }
        };
      }
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Delivery evaluation error:', error);
    return NextResponse.json(
      { error: '전달력 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

