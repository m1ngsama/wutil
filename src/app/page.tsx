import HomeClient from '@/components/home/HomeClient';
import StructuredData from '@/components/StructuredData';
import { getHomeStructuredData } from '@/lib/structured-data';

export default function Home() {
  return (
    <>
      <StructuredData data={getHomeStructuredData()} />
      <HomeClient />
    </>
  );
}
