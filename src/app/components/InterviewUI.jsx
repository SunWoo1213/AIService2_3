'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

export default function InterviewUI({ questions, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false); // 타이머 실행 상태

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  // 오디오 녹음을 위한 새로운 refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  // TTS 기능: 질문을 음성으로 읽어주는 함수
  const speakQuestion = (text, autoStartTimer = false) => {
    // 기존 음성 재생이 있다면 중지
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // 새로운 음성 합성 생성
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // 약간 느리게 (선택 사항)
    utterance.pitch = 1.0;

    // 사용 가능한 한국어 음성이 있다면 선택
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.includes('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    // TTS가 끝나면 자동으로 타이머 시작 (핸즈프리 모드)
    if (autoStartTimer) {
      utterance.onend = () => {
        console.log('TTS 완료, 타이머 시작...');
        setIsTimerRunning(true);
      };
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // 브라우저 음성 인식 지원 확인
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupported(false);
      }

      // TTS를 위해 음성 목록 로드
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }
  }, []);

  // 질문 변경 시: 타이머 리셋 및 TTS 시작
  useEffect(() => {
    if (questions && questions.length > 0 && typeof window !== 'undefined' && window.speechSynthesis) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.question) {
        // 타이머 리셋
        setIsTimerRunning(false);
        setTimeLeft(currentQuestion.time_limit);
        setAnswer(''); // 답변 초기화
        
        // 약간의 딜레이를 주어 자연스럽게 재생
        const timer = setTimeout(() => {
          speakQuestion(currentQuestion.question, true); // autoStartTimer = true
        }, 500);

        return () => {
          clearTimeout(timer);
          // 컴포넌트 언마운트 또는 질문 변경 시 음성 중지
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
        };
      }
    }
  }, [currentQuestionIndex, questions]);

  // 타이머 카운트다운 로직 (isTimerRunning이 true일 때만 실행)
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 시간 종료 시 녹음 중지 (녹음 중이었다면)
            if (isRecording) {
              handleStopRecording();
            }
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isTimerRunning, timeLeft, isRecording]);

  // 오디오 녹음 시작 (MediaRecorder + SpeechRecognition 동시 실행)
  const startRecording = async () => {
    if (!browserSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    try {
      // 1. 오디오 스트림 가져오기 (MediaRecorder용)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // MediaRecorder 설정
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      // 오디오 청크 초기화
      audioChunksRef.current = [];

      // 데이터 수신 시 청크에 추가
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 중지 시 오디오 분석 전송
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioForAnalysis(audioBlob);
      };

      // 녹음 시작
      mediaRecorderRef.current.start();

      // 2. SpeechRecognition도 시작 (실시간 텍스트 변환용)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // 음성이 감지되지 않아도 계속 진행
          return;
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
      
      // 타이머가 아직 시작되지 않았다면 시작
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      alert('마이크에 접근할 수 없습니다. 브라우저 설정에서 마이크 권한을 확인해주세요.');
    }
  };

  const handleStopRecording = async () => {
    // 1. SpeechRecognition 중지
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // 2. MediaRecorder 중지 (onstop 이벤트에서 오디오 전송됨)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // 3. 오디오 스트림 정리
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 참고: 오디오 분석은 mediaRecorder의 onstop에서 처리되며,
    // 분석이 완료되면 다음 질문으로 자동 이동됩니다
    setIsProcessing(true);
  };

  // 오디오 파일을 서버로 전송하여 전달력 분석
  const sendAudioForAnalysis = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'interview_answer.webm');
      formData.append('question', questions[currentQuestionIndex].question);
      formData.append('transcript', answer || '답변 없음'); // 실시간 텍스트도 함께 전송

      const response = await fetch('/api/interview/evaluate-delivery', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('오디오 분석 실패');
      }

      const analysisResult = await response.json();

      // 결과 저장
      const newResult = {
        question: questions[currentQuestionIndex].question,
        userAnswer: answer || '답변 없음',
        contentScore: analysisResult.contentFeedback?.score || 0,
        contentAdvice: analysisResult.contentFeedback?.advice || '',
        deliveryMetrics: analysisResult.deliveryFeedback || {},
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      // 다음 질문으로 이동 또는 완료
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // 모든 질문 완료
        if (onComplete) {
          onComplete(updatedResults);
        }
      }
    } catch (error) {
      console.error('오디오 분석 오류:', error);
      alert('음성 전달력 분석 중 오류가 발생했습니다. 기본 평가로 진행합니다.');
      
      // 폴백: 기본 평가 실행
      await evaluateAnswerFallback();
    } finally {
      setIsProcessing(false);
    }
  };

  // 폴백: 기본 텍스트 평가 (오디오 분석 실패 시)
  const evaluateAnswerFallback = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questions[currentQuestionIndex].question,
          userAnswer: answer || '답변 없음'
        }),
      });

      if (!response.ok) {
        throw new Error('평가 요청 실패');
      }

      const evaluation = await response.json();
      
      const newResult = {
        question: questions[currentQuestionIndex].question,
        userAnswer: answer || '답변 없음',
        contentScore: evaluation.score,
        contentAdvice: evaluation.feedback,
        deliveryMetrics: null, // 오디오 분석 없음
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      // 다음 질문으로 이동 또는 완료
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // timeLeft와 answer는 useEffect에서 자동으로 리셋됨
      } else {
        // 모든 질문 완료
        if (onComplete) {
          onComplete(updatedResults);
        }
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('답변 평가 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    // TTS 중지
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // 오디오 녹음 정리
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    const newResult = {
      question: questions[currentQuestionIndex].question,
      userAnswer: '건너뜀',
      contentScore: 0,
      contentAdvice: '답변을 건너뛰었습니다.',
      deliveryMetrics: null,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // timeLeft, answer, isTimerRunning은 useEffect에서 자동으로 리셋됨
    } else {
      if (onComplete) {
        onComplete(updatedResults);
      }
    }
  };

  if (!questions || questions.length === 0) {
    return <div>질문을 불러오는 중...</div>;
  }

  if (isProcessing) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4">🤔</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">답변을 평가하는 중...</h3>
        <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>진행률</span>
          <span>{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
            질문 {currentQuestionIndex + 1}
          </span>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex-1">
              {currentQuestion.question}
            </h2>
            <button
              onClick={() => speakQuestion(currentQuestion.question, false)}
              className="flex-shrink-0 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="질문 다시 듣기"
              aria-label="질문 음성으로 다시 듣기"
            >
              <span className="text-2xl">🔊</span>
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6 text-center">
          {!isTimerRunning && timeLeft > 0 ? (
            <div className="mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                <span className="animate-pulse mr-2">🎧</span>
                <span className="font-medium">질문을 듣고 있습니다...</span>
              </div>
            </div>
          ) : null}
          <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-primary-600'}`}>
            {timeLeft}
          </div>
          <p className="text-gray-600 mt-2">
            {isTimerRunning ? '답변 가능 - 초 남음' : '초 남음'}
          </p>
        </div>

        {/* Answer display */}
        {!browserSupported && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            <p className="font-medium">⚠️ 음성 인식이 지원되지 않습니다.</p>
            <p className="text-sm mt-1">Chrome 브라우저를 사용해주세요. 이 브라우저에서는 모의 면접을 진행할 수 없습니다.</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRecording ? '🎤 녹음 중...' : '답변 (음성 인식)'}
          </label>
          <textarea
            value={answer}
            readOnly
            className="input-field resize-none bg-gray-50 cursor-not-allowed"
            rows={6}
            placeholder="🎤 '답변 시작' 버튼을 눌러 음성으로 답변하세요..."
          />
        </div>

        {/* Controls */}
        <div className="flex space-x-4">
          {!isRecording ? (
            <>
              <Button
                onClick={startRecording}
                fullWidth
                disabled={!isTimerRunning || timeLeft === 0}
              >
                🎤 답변 시작
              </Button>
              <Button
                onClick={handleSkip}
                variant="secondary"
                disabled={!isTimerRunning}
              >
                건너뛰기
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStopRecording}
              variant="danger"
              fullWidth
            >
              ⏹️ 답변 종료
            </Button>
          )}
        </div>
        
        {!isTimerRunning && timeLeft > 0 && (
          <p className="text-sm text-gray-500 text-center mt-3">
            💡 질문이 끝나면 자동으로 답변 가능합니다
          </p>
        )}
      </Card>

      {/* Previous results */}
      {results.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">이전 답변 결과</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">질문 {index + 1}</span>
                  <span className="text-xl font-bold text-primary-600">{result.contentScore}/10</span>
                </div>
                
                {/* 전달력 메트릭 표시 */}
                {result.deliveryMetrics && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🎙️ 전달력 분석</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {result.deliveryMetrics.wpm && (
                        <div className="bg-white p-2 rounded">
                          <span className="text-gray-600">말 속도:</span>
                          <span className="ml-1 font-medium">{result.deliveryMetrics.wpm} WPM</span>
                        </div>
                      )}
                      {result.deliveryMetrics.fillerCount !== undefined && (
                        <div className="bg-white p-2 rounded">
                          <span className="text-gray-600">필러 단어:</span>
                          <span className="ml-1 font-medium">{result.deliveryMetrics.fillerCount}회</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

