'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { IoEye, IoEyeOff } from "react-icons/io5";

import InputField from '@/components/ui/InputField';
import GeneralButton from '@/components/ui/GeneralButton';
import MessageBox from '@/components/ui/MessageBox';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const router = useRouter();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      router.replace('/')
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        setLoginError((err as any).response?.data?.error);
      } else {
        setLoginError('エラーが発生しました');
      }
    }
  };

  const handleGoToRegister = () => {
    router.push('/auth/register');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-4">
        <h2 className="text-2xl font-bold">ログイン</h2>
        <form onSubmit={handleLogin} className="space-y-2 w-full">
          <InputField
            value={identifier}
            onChange={(e)=>setIdentifier(e.target.value)}
            placeholder="ユーザーIDまたはメールアドレスを入力"
          />
          <div className="relative w-full">
            <span
              className="absolute inset-y-0 right-2 flex items-center px-1 cursor-pointer text-textcolor/80"
              onClick={togglePasswordVisibility}
              role="button"
              aria-label={isPasswordVisible ? "パスワードを非表示" : "パスワードを表示"}
            >
              {isPasswordVisible ? <IoEye /> : <IoEyeOff />}
            </span>
            <InputField
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />
          </div>
          
          <div className="flex justify-between items-center mt-2.5">
            <button
              type="button"
              onClick={handleGoToRegister}
              className="text-sm text-indigo-500 underline hover:text-indigo-700"
            >
              アカウント作成
            </button>
            <GeneralButton type="submit" onClick={()=>{}}>ログイン</GeneralButton>
          </div>
        </form>
        {loginError && <MessageBox type="error" message={loginError} />}
      </div>
    </div>
  );
}