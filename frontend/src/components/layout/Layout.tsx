import React from 'react';
import { ResponsiveNavigation } from './ResponsiveNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation />
      <main className="lg:ml-64 pt-16 lg:pt-0">{children}</main>
    </div>
  );
};

export default Layout;
