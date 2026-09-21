"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { hasSelectedProject } from "@/lib/selected-project";

export function useRequireProject() {
  const router = useRouter();
  const [hasProject, setHasProject] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const projectSelected = hasSelectedProject();

    setHasProject(projectSelected);
    setChecked(true);

    if (!projectSelected) {
      toast.error("Please select a project first to proceed.", {
        id: "require-project",
      });
      router.replace("/projects");
    }
  }, [router]);

  return checked && hasProject;
}
