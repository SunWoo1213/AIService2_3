'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Navbar from '../components/Navbar';
import HistoryList from '../components/HistoryList';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('resume');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) return;

      try {
        const feedbacksRef = collection(db, 'feedbacks');
        const q = query(
          feedbacksRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const feedbackList = [];
        querySnapshot.forEach((doc) => {
          feedbackList.push({ id: doc.id, ...doc.data() });
        });
        
        setFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        
        // orderBy 에러 발생 시 (인덱스 없음) orderBy 없이 다시 시도
        try {
          const feedbacksRef = collection(db, 'feedbacks');
          const q = query(
            feedbacksRef,
            where('userId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(q);
          const feedbackList = [];
          querySnapshot.forEach((doc) => {
            feedbackList.push({ id: doc.id, ...doc.data() });
          });
          
          // 클라이언트 측에서 정렬
          feedbackList.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setFeedbacks(feedbackList);
        } catch (innerError) {
          console.error('Error fetching feedbacks (fallback):', innerError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="로딩 중..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const resumeFeedbacks = feedbacks.filter(f => f.type === 'resume');
  const interviewFeedbacks = feedbacks.filter(f => f.type === 'interview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">히스토리</h1>
          <p className="text-gray-600">
            지금까지 받은 모든 피드백을 확인하고 복습하세요.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-2xl font-bold text-gray-800">{feedbacks.length}</h3>
            <p className="text-gray-600">총 활동</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-2xl font-bold text-gray-800">{resumeFeedbacks.length}</h3>
            <p className="text-gray-600">자기소개서 첨삭</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">🎤</div>
            <h3 className="text-2xl font-bold text-gray-800">{interviewFeedbacks.length}</h3>
            <p className="text-gray-600">모의 면접</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'resume'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              자기소개서 피드백 ({resumeFeedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'interview'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              모의 면접 피드백 ({interviewFeedbacks.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              아직 활동 내역이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              자기소개서 첨삭이나 모의 면접을 시작해보세요!
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/new-feedback')}>
                자기소개서 첨삭받기
              </Button>
              <Button variant="secondary" onClick={() => router.push('/interview')}>
                모의 면접 시작하기
              </Button>
            </div>
          </div>
        ) : (
          <HistoryList feedbacks={feedbacks} type={activeTab} />
        )}
      </main>
    </div>
  );
}

