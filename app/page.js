// app/page.js
'use client';

import QCAnalyzer from '../components/QCAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <QCAnalyzer />
      </div>
    </main>
  );
}
