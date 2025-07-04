'use client';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}