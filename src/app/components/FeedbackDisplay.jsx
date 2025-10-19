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

  const getCategoryColor = (category) => {
    const colors = {
      '직무적합성': 'bg-blue-100 text-blue-800',
      '구체성': 'bg-purple-100 text-purple-800',
      '문법': 'bg-green-100 text-green-800',
      '논리성': 'bg-yellow-100 text-yellow-800',
      '차별화': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': { text: '높음', color: 'bg-red-100 text-red-800 border-red-300' },
      'medium': { text: '중간', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'low': { text: '낮음', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div className="space-y-6">
      {/* 전체 점수 카드 */}
      <Card className={`${getScoreBgColor(feedback.score)} border-2`}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">전체 점수</h3>
          <div className={`text-6xl font-bold ${getScoreColor(feedback.score)}`}>
            {feedback.score}
            <span className="text-3xl">/100</span>
          </div>
          
          {/* 요약 */}
          {feedback.summary && (
            <p className="mt-4 text-gray-700 text-lg font-medium px-4">
              {feedback.summary}
            </p>
          )}
        </div>

        {/* 세부 점수 분석 */}
        {feedback.score_breakdown && (
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">세부 평가 항목</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{feedback.score_breakdown.job_fit}</div>
                <div className="text-xs text-gray-600 mt-1">직무 적합성</div>
                <div className="text-xs text-gray-500">(30점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{feedback.score_breakdown.specificity}</div>
                <div className="text-xs text-gray-600 mt-1">구체성</div>
                <div className="text-xs text-gray-500">(25점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{feedback.score_breakdown.grammar}</div>
                <div className="text-xs text-gray-600 mt-1">문법/표현</div>
                <div className="text-xs text-gray-500">(20점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{feedback.score_breakdown.logic}</div>
                <div className="text-xs text-gray-600 mt-1">논리성</div>
                <div className="text-xs text-gray-500">(15점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{feedback.score_breakdown.differentiation}</div>
                <div className="text-xs text-gray-600 mt-1">차별화</div>
                <div className="text-xs text-gray-500">(10점)</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 강점과 약점 */}
      {(feedback.strengths || feedback.weaknesses) && (
        <div className="grid md:grid-cols-2 gap-6">
          {feedback.strengths && feedback.strengths.length > 0 && (
            <Card className="bg-green-50 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">✅</span> 강점
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <Card className="bg-orange-50 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⚠️</span> 개선 필요
              </h3>
              <ul className="space-y-2">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* 상세 피드백 */}
      <Card>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-2">📝</span> 상세 개선 제안
        </h3>
        
        {feedback.feedback_details && feedback.feedback_details.length > 0 ? (
          <div className="space-y-6">
            {feedback.feedback_details.map((item, index) => {
              const priorityBadge = getPriorityBadge(item.priority);
              return (
                <div key={index} className="border-l-4 border-primary-500 pl-6 py-4 bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors">
                  {/* 카테고리와 우선순위 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    {item.priority && (
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${priorityBadge.color}`}>
                        우선순위: {priorityBadge.text}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">#{index + 1}</span>
                  </div>
                  
                  {/* 원문 */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-red-600 mr-2">❌</span>
                      <span className="text-sm font-semibold text-gray-700">원문</span>
                    </div>
                    <p className="text-gray-700 italic bg-white p-3 rounded border-l-4 border-red-300">
                      &ldquo;{item.original_sentence}&rdquo;
                    </p>
                  </div>
                  
                  {/* 개선안 */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-sm font-semibold text-gray-700">개선 제안</span>
                    </div>
                    <p className="text-gray-800 font-medium bg-white p-3 rounded border-l-4 border-green-400">
                      {item.suggested_improvement}
                    </p>
                  </div>
                  
                  {/* 이유 */}
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600 mr-2">💡</span>
                      <span className="text-sm font-semibold text-gray-700">개선 이유</span>
                    </div>
                    <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded">
                      {item.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-gray-600 text-lg">특별한 개선 사항이 없습니다. 잘 작성되었습니다!</p>
          </div>
        )}
      </Card>
    </div>
  );
}

