'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from './components/AuthForm';
import Loading from './components/ui/Loading';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="로딩 중..." />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🚀 AI Job Prep
        </h1>
        <p className="text-xl text-gray-600">
          AI가 도와주는 스마트한 취업 준비
        </p>
      </div>

      <AuthForm onSuccess={() => router.push('/dashboard')} />

      <div className="mt-12 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-bold text-lg mb-2">자기소개서 첨삭</h3>
          <p className="text-gray-600 text-sm">AI가 당신의 자기소개서를 분석하고 개선점을 제안합니다</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🎤</div>
          <h3 className="font-bold text-lg mb-2">모의 면접</h3>
          <p className="text-gray-600 text-sm">실전 같은 AI 모의 면접으로 완벽하게 준비하세요</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-bold text-lg mb-2">피드백 관리</h3>
          <p className="text-gray-600 text-sm">모든 피드백을 한 곳에서 관리하고 성장하세요</p>
        </div>
      </div>
    </main>
  );
}

