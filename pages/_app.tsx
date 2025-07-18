import React from 'react';
import type { AppProps } from 'next/app';
import AuthProvider from '../components/AuthProvider';
import './globals.css';
import '@fontsource/inter/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
} 