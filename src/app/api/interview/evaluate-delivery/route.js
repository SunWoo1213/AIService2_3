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
        const llmPrompt = `당신은 전문 면접 코치입니다. 사용자의 답변을 내용(Content)과 전달력(Delivery) 두 가지 관점에서 분석해주세요.

**질문:** "${question}"

**답변 전사본:** "${whisperTranscript}"

**전달력 메트릭:**
- 말 속도: ${wpm} WPM (이상적 범위: 130-160 WPM)
- 필러 단어(어, 음, 그 등): ${fillerCount}회

다음 JSON 형식으로 한국어로 피드백을 제공해주세요:

{
  "contentFeedback": {
    "advice": "답변 내용에 대한 구체적인 피드백 (STAR 기법 사용 여부, 관련성, 논리성 등)"
  },
  "deliveryFeedback": {
    "wpm": ${wpm},
    "wpmAdvice": "말 속도에 대한 구체적인 조언",
    "fillerCount": ${fillerCount},
    "fillerAdvice": "필러 단어 사용에 대한 구체적인 조언"
  }
}

**중요:**
1. 모든 조언은 구체적이고 실행 가능해야 함
2. 긍정적인 부분과 개선할 부분을 모두 언급
3. 전달력 피드백은 제공된 메트릭을 기반으로 작성
4. 점수 없이 피드백만 제공`;

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

