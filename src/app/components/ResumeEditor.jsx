'use client';

import { useState } from 'react';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Card from './ui/Card';

export default function ResumeEditor({ jobKeywords, onSubmit }) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      alert('자기소개서를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(resumeText);
    } catch (error) {
      console.error('Resume submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-800 mb-4">자기소개서 입력</h3>
      
      {jobKeywords && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">📌 추출된 핵심 키워드</h4>
          
          {jobKeywords.keywords && jobKeywords.keywords.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">키워드:</p>
              <div className="flex flex-wrap gap-2">
                {jobKeywords.keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {jobKeywords.skills && jobKeywords.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">필요 역량:</p>
              <div className="flex flex-wrap gap-2">
                {jobKeywords.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {jobKeywords.responsibilities && jobKeywords.responsibilities.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">주요 업무:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {jobKeywords.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Textarea
        label="자기소개서"
        name="resumeText"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="자기소개서 내용을 입력해주세요. 위의 키워드를 참고하여 작성하면 더 좋은 피드백을 받을 수 있습니다..."
        rows={15}
        required
      />

      <div className="text-sm text-gray-500 mb-4">
        현재 글자 수: {resumeText.length}자
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !resumeText.trim()}
        fullWidth
      >
        {loading ? '피드백 생성 중...' : '피드백 받기'}
      </Button>
    </Card>
  );
}

