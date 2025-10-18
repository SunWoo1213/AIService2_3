'use client';

import Card from './ui/Card';

export default function FeedbackDisplay({ feedback }) {
  if (!feedback) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <Card className={`${getScoreBgColor(feedback.score)} border-2`}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">전체 점수</h3>
          <div className={`text-6xl font-bold ${getScoreColor(feedback.score)}`}>
            {feedback.score}
            <span className="text-3xl">/100</span>
          </div>
          <p className="mt-4 text-gray-600">
            {feedback.score >= 80 && '훌륭합니다! 아주 잘 작성된 자기소개서입니다.'}
            {feedback.score >= 60 && feedback.score < 80 && '좋습니다! 몇 가지 개선하면 더 좋아질 것 같습니다.'}
            {feedback.score < 60 && '개선이 필요합니다. 아래 피드백을 참고해주세요.'}
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">상세 피드백</h3>
        
        {feedback.feedback_details && feedback.feedback_details.length > 0 ? (
          <div className="space-y-6">
            {feedback.feedback_details.map((item, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded mb-2">
                    원문 #{index + 1}
                  </span>
                  <p className="text-gray-700 italic">
                    &ldquo;{item.original_sentence}&rdquo;
                  </p>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded mb-2">
                    개선 제안
                  </span>
                  <p className="text-gray-800 font-medium">
                    {item.suggested_improvement}
                  </p>
                </div>
                
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded mb-2">
                    이유
                  </span>
                  <p className="text-gray-600 text-sm">
                    {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">특별한 개선 사항이 없습니다. 잘 작성되었습니다!</p>
        )}
      </Card>
    </div>
  );
}

