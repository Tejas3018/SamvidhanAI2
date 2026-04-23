import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Chat() {
  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)] bg-gradient-to-br from-background via-muted/10 to-background">
        <ChatInterface />
      </div>
    </Layout>
  );
}
