"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useRequireProject() {
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    if (!apiKey) {
      toast.error("Please select a project first to proceed.", {
        id: "require-project",
      });
      router.replace("/projects");
    }
  }, [router]);
}
