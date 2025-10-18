'use client';

import { useRouter } from 'next/navigation';
import Card from './ui/Card';

export default function HistoryList({ feedbacks, type }) {
  const router = useRouter();

  const filteredFeedbacks = feedbacks.filter(f => f.type === type);

  if (filteredFeedbacks.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">
            {type === 'resume' ? '📝' : '🎤'}
          </div>
          <p className="text-gray-600">
            {type === 'resume' 
              ? '아직 자기소개서 피드백이 없습니다.' 
              : '아직 모의 면접 기록이 없습니다.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFeedbacks.map((feedback) => (
        <Card 
          key={feedback.id} 
          hover 
          onClick={() => router.push(`/feedback/${feedback.id}`)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">
                  {type === 'resume' ? '📄' : '🎤'}
                </span>
                <div>
                  <p className="text-gray-600 text-sm">
                    {new Date(feedback.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {type === 'resume' && (
                <div>
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                      점수: {feedback.feedback?.score || 'N/A'}/100
                    </span>
                  </div>
                  {feedback.resumeText && (
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {feedback.resumeText.substring(0, 150)}...
                    </p>
                  )}
                </div>
              )}

              {type === 'interview' && (
                <div>
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      총 {feedback.interviewResults?.length || 0}개 질문
                    </span>
                  </div>
                  {feedback.interviewResults && feedback.interviewResults.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-600 text-sm font-medium mb-1">평균 점수:</p>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(feedback.interviewResults.reduce((acc, r) => acc + r.score, 0) / feedback.interviewResults.length / 10) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-700 font-semibold">
                          {(feedback.interviewResults.reduce((acc, r) => acc + r.score, 0) / feedback.interviewResults.length).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {feedback.jobKeywords && (
                <div className="mt-3">
                  <p className="text-gray-600 text-xs mb-2">관련 키워드:</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.jobKeywords.skills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {feedback.jobKeywords.skills?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{feedback.jobKeywords.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

