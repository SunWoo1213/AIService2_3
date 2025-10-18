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

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // 브라우저 음성 인식 지원 확인
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setTimeLeft(questions[currentQuestionIndex].time_limit);
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, timeLeft]);

  const startRecording = () => {
    if (!browserSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

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
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    await evaluateAnswer();
  };

  const evaluateAnswer = async () => {
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
        score: evaluation.score,
        feedback: evaluation.feedback
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      // 다음 질문으로 이동 또는 완료
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
        setTimeLeft(questions[currentQuestionIndex + 1].time_limit);
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
    const newResult = {
      question: questions[currentQuestionIndex].question,
      userAnswer: '건너뜀',
      score: 0,
      feedback: '답변을 건너뛰었습니다.'
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setTimeLeft(questions[currentQuestionIndex + 1].time_limit);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Timer */}
        <div className="mb-6 text-center">
          <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-primary-600'}`}>
            {timeLeft}
          </div>
          <p className="text-gray-600 mt-2">초 남음</p>
        </div>

        {/* Answer display */}
        {!browserSupported && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <p className="font-medium">음성 인식이 지원되지 않습니다.</p>
            <p className="text-sm mt-1">Chrome 브라우저를 사용하거나 아래에 직접 답변을 입력하세요.</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRecording ? '🎤 녹음 중...' : '답변'}
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isRecording}
            className="input-field resize-none"
            rows={6}
            placeholder="음성 인식을 시작하거나 직접 입력하세요..."
          />
        </div>

        {/* Controls */}
        <div className="flex space-x-4">
          {!isRecording ? (
            <>
              <Button
                onClick={startRecording}
                fullWidth
                disabled={timeLeft === 0}
              >
                🎤 답변 시작
              </Button>
              <Button
                onClick={handleSkip}
                variant="secondary"
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
      </Card>

      {/* Previous results */}
      {results.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">이전 답변 결과</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">질문 {index + 1}</span>
                  <span className="text-lg font-bold text-primary-600">{result.score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

