'use client'

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import ThreadCard from "@/components/features/ThreadCard";
import InputField from "@/components/ui/InputField";
import GeneralButton from "@/components/ui/GeneralButton";

import { Movie } from '@/types/movie';
import { Thread } from '@/types/thread';

interface MoviePageProps {
  params: Promise<{
    movieId: number;
  }>
}

interface ThreadFormData {
  title: string;
  description: string
};

export default function MoviePage({ params }: MoviePageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const { movieId } = use(params);

  const [threads, setThreads] = useState<Thread[]>([]);

  const [showThreadForm, setShowThreadForm] = useState(false);
  const [newThread, setNewThread] = useState<ThreadFormData>({
    title: '',
    description: ''
  });
  const [createThreadError, setCreateThreadError] = useState<string | null>(null);
  const [createThreadMessage, setCreateThreadMessage] = useState<string | null>(null);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${movieId}`);
      setMovie(response.data);
      setThreads(response.data.threads);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('映画取得時にエラーが発生しました', (err as any).response?.data?.error || err);
      } else {
        console.error('映画取得時にエラーが発生しました', err);
      }
    }
  }

  const resetThreadForm = () => {
    setNewThread({
      title: '',
      description: ''
    });
    setCreateThreadError(null);
    setShowThreadForm(false);
  }

  const handleCreateThread = async () => {
    try {
      const response = await api.post(`/movies/${movieId}/threads`, newThread);
      setThreads([response.data, ...threads]);
      setCreateThreadMessage('スレッドが作成されました');
      resetThreadForm();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('スレッド作成時にエラーが発生しました', (err as any).response?.data?.error || err);
        setCreateThreadError((err as any).response?.data?.error || 'スレッドの作成に失敗しました');
      } else {
        console.error('スレッド作成時にエラーが発生しました', err);
        setCreateThreadError('スレッドの作成に失敗しました');
      }
    }
  }

  useEffect(() => {
    fetchMovie();
  }, []);
  
  return (
    <div className="space-y-5 w-full">
      {movie && (
        <div className="flex flex-col items-center gap-4 py-2">
          <h2 className="text-4xl font-bold">{movie.title}</h2>
          <p className="">
            {movie.releaseDate && format(new Date(movie.releaseDate), 'yyyy年MM月dd日', { locale: ja })}公開 / 監督：{movie.director}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {!showThreadForm && (
          <GeneralButton onClick={() => {
            setShowThreadForm(true);
            setCreateThreadMessage(null);
          }}>+ スレッドを追加</GeneralButton>
        )}
        {createThreadMessage && (
          <div className="rounded-sm bg-green-100 p-4">
            <p className="text-textcolor/80">{createThreadMessage}</p>
          </div>
        )}
        {showThreadForm && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateThread();
          }} className="
            bg-gray-50 rounded-md border-1 border-gray-200 w-2/3 p-5 space-y-3
          ">
            <h3 className="text-xl font-bold text-textcolor/90">新しいスレッドを作成</h3>
            <div className="flex flex-col items-start space-y-3 mb-4">
              <InputField
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                placeholder="タイトル"
              />
              <InputField
                value={newThread.description}
                onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                placeholder="概要"
              />
            </div>
            <div className="flex justify-between items-center">
              <GeneralButton type="button" onClick={resetThreadForm}>キャンセル</GeneralButton>
              <GeneralButton type="submit">作成</GeneralButton>
            </div>
            {createThreadError && (
              <div className="rounded-sm bg-red-100 p-4">
                <p className="text-textcolor/80">{createThreadError}</p>
              </div>
            )}
          </form>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold py-1">スレッド一覧</h3>
        {threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            movieId={movieId}
            threadId={thread.id}
            title={thread.title}
            author={thread.creator?.username || '不明'}
            summary={thread.description}
          />
        ))}
      </div>
    </div>
  )
}