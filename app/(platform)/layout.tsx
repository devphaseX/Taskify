import { ClerkProvider } from '@clerk/nextjs';

const PlatformLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default PlatformLayoutPage;
