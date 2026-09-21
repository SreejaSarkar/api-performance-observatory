"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Menu,
  X,
  LayoutDashboard,
  FolderKanban,
  Bell,
  TriangleAlert,
  FileText,
  Webhook,
} from "lucide-react";
import {
  useAuthSession,
} from "@/components/auth/AuthSessionProvider";
import { logout }
  from "@/lib/auth-api";
import {
  clearSelectedProject,
  useSelectedProject,
} from "@/lib/selected-project";
import toast from "react-hot-toast";

const navItems = [
  {
    href: "/projects",
    label: "Projects",
    icon: <FolderKanban size={18} />,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: <Bell size={18} />,
  },
  {
    href: "/anomalies",
    label: "Anomalies",
    icon: <TriangleAlert size={18} />,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: <FileText size={18} />,
  },
  {
    href: "/webhooks",
    label: "Webhooks",
    icon: <Webhook size={18} />,
  },
];

export default function MobileNavbar() {
  const pathname = usePathname();
  const {
    isAuthenticated,
    loading,
    user,
  } = useAuthSession();
  const selectedProject = useSelectedProject();
  const [
    open,
    setOpen,
  ] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      clearSelectedProject();
      setOpen(false);

      toast.success(
        "Signed out",
      );

      window.location.assign(
        "/auth/login",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to sign out",
      );
    }
  }

  return (
    <>
      {/* Top Bar */}

      <div
        className="
          md:hidden

          sticky
          top-0
          z-50

          bg-slate-900
          border-b
          border-slate-800

          px-4
          py-3

          flex
          items-center
          justify-between
        "
      >
        <h1
          className="
            text-lg
            font-bold
          "
        >
          🚀 API Observatory
        </h1>

        <button
          onClick={() =>
            setOpen(!open)
          }
        >
          {open ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {/* Overlay */}

      {open && (
        <div
          className="
            md:hidden

            fixed
            inset-0

            bg-black/50

            z-40
          "
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      {/* Drawer */}

      <aside
        className={`
          md:hidden

          fixed
          top-0
          left-0

          h-full
          w-72

          bg-slate-900

          border-r
          border-slate-800

          z-50

          transition-transform
          duration-300

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div
          className="
            p-6
            border-b
            border-slate-800
          "
        >
          <h1
            className="
              text-xl
              font-bold
            "
          >
            🚀 API Observatory
          </h1>

          <p
            className="
              text-slate-400
              text-sm
              mt-1
            "
          >
            Monitor. Detect. Resolve.
          </p>
        </div>

        <nav
          className="
            p-4
            flex
            flex-col
            gap-2
          "
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              disabled={loading || !isAuthenticated}
              requiresProject={
                item.href !== "/projects"
              }
              hasProject={Boolean(
                selectedProject,
              )}
              active={
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                )
              }
              close={() =>
                setOpen(false)
              }
            />
          ))}
        </nav>

        <div
          className="
            mx-4
            mb-4
            rounded-2xl
            border
            border-slate-800
            bg-slate-950/60
            px-4
            py-3
            text-sm
            text-slate-400
            space-y-3
          "
        >
          {loading ? (
            <p>
              Checking session...
            </p>
          ) : isAuthenticated ? (
            <>
              <p>
                Signed in as {user?.name}. You can sign out here without switching pages.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-2.5
                  text-left
                  font-medium
                  text-slate-100
                  transition
                  hover:border-slate-500
                  hover:bg-slate-800
                "
              >
                Sign out
              </button>
            </>
          ) : (
            <p>
              Sign in to open dashboard sections.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  disabled,
  requiresProject,
  hasProject,
  active,
  close,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
  requiresProject: boolean;
  hasProject: boolean;
  active: boolean;
  close: () => void;
}) {
  const projectBlocked =
    !disabled &&
    requiresProject &&
    !hasProject;

  const className = `
    flex
    items-center
    gap-3

    p-3

    rounded-xl

    ${
      disabled || projectBlocked
        ? "cursor-not-allowed text-slate-500"
        : active
          ? "bg-slate-800 text-white"
          : "hover:bg-slate-800 text-slate-100"
    }
  `;

  if (disabled || projectBlocked) {
    return (
      <button
        type="button"
        aria-disabled="true"
        className={className}
        onClick={() => {
          if (projectBlocked) {
            toast.error(
              "Please select a project first to proceed.",
              {
                id: "require-project",
              },
            );
            close();
          }
        }}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={close}
      className={className}
    >
      {icon}
      {label}
    </Link>
  );
}