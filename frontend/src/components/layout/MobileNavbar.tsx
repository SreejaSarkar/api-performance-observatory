"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function MobileNavbar() {
  const [
    open,
    setOpen,
  ] = useState(false);

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
          <NavLink
            href="/projects"
            icon={
              <FolderKanban size={18} />
            }
            label="Projects"
            close={() =>
              setOpen(false)
            }
          />

          <NavLink
            href="/dashboard"
            icon={
              <LayoutDashboard size={18} />
            }
            label="Dashboard"
            close={() =>
              setOpen(false)
            }
          />

          <NavLink
            href="/alerts"
            icon={
              <Bell size={18} />
            }
            label="Alerts"
            close={() =>
              setOpen(false)
            }
          />

          <NavLink
            href="/anomalies"
            icon={
              <TriangleAlert size={18} />
            }
            label="Anomalies"
            close={() =>
              setOpen(false)
            }
          />

          <NavLink
            href="/reports"
            icon={
              <FileText size={18} />
            }
            label="Reports"
            close={() =>
              setOpen(false)
            }
          />

          <NavLink
            href="/webhooks"
            icon={
              <Webhook size={18} />
            }
            label="Webhooks"
            close={() =>
              setOpen(false)
            }
          />
        </nav>
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  close,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  close: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      className="
        flex
        items-center
        gap-3

        p-3

        rounded-xl

        hover:bg-slate-800
      "
    >
      {icon}
      {label}
    </Link>
  );
}