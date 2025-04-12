
import FuzzingCard from '@/components/FuzzingCard';
import NmapCard from '@/components/NmapCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <NmapCard />
        <FuzzingCard />
      </div>
    </SidebarProvider>
  );
}

