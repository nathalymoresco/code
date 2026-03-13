import { AdminSidebar } from './admin-sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-sand-50 p-6 lg:p-8">{children}</main>
    </div>
  );
}
