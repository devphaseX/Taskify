import { Footer } from '@/components/ui/footer';
import { Navbar } from './_components/navbar';

export default function MarketingLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-slate-100">
      <Navbar />
      <main className="pt-40 pb-20 bg-slate-100">{children}</main>
      <Footer />
    </div>
  );
}
