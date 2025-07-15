import React from 'react';

interface HeaderProps {
  user?: { name: string } | null;
  title?: string;
}

export default function AdminHeader({ user, title }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{title || 'Admin'}</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-700">{user.name}</span>
        )}
        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm" onClick={() => alert('Logout coming soon!')}>Logout</button>
      </div>
    </div>
  );
}
