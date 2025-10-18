'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

export default function ProfileForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    desiredJob: '',
    experience: '',
    certifications: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-8">프로필 로딩 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          프로필이 성공적으로 저장되었습니다!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="나이"
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="예: 25"
          required
        />

        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            성별 <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">선택하세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
      </div>

      <Input
        label="희망 직무"
        type="text"
        name="desiredJob"
        value={formData.desiredJob}
        onChange={handleChange}
        placeholder="예: 프론트엔드 개발자"
        required
      />

      <Textarea
        label="경력 및 경험"
        name="experience"
        value={formData.experience}
        onChange={handleChange}
        placeholder="관련 경력, 프로젝트 경험, 인턴십 등을 자유롭게 작성해주세요..."
        rows={6}
        required
      />

      <Textarea
        label="자격증 및 기술"
        name="certifications"
        value={formData.certifications}
        onChange={handleChange}
        placeholder="보유하신 자격증, 기술 스택, 어학 점수 등을 작성해주세요..."
        rows={4}
      />

      <Button
        type="submit"
        fullWidth
        disabled={loading}
      >
        {loading ? '저장 중...' : '프로필 저장'}
      </Button>
    </form>
  );
}

