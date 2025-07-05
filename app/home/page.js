'use client';

import { useEffect, useState } from "react";
import RecommendedBooks from "@/components/RecommendedBooks";
import SearchBooks from "@/components/SearchBooks";
import Loader from "@/components/Loader"; // Create this component (see below)

export default function HomePage() {
  const [loadingCount, setLoadingCount] = useState(2); // 2 components to wait for

  const handleComponentLoaded = () => {
    setLoadingCount((prev) => prev - 1);
  };

  return (
    <div className="p-4">
          <RecommendedBooks/>
          <SearchBooks  />
    </div>
  );
}
