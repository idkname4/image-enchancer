import ImageEnhanceClient from '@/components/image-enhance-client';
import Header from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ImageEnhanceClient />
      </main>
    </div>
  );
}
