import Sidebar
  from "./SideBar";

import MobileNavbar
  from "./MobileNavbar";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import AuthSessionWatcher from "@/components/auth/AuthSessionWatcher";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <div
        className="
          flex
          h-screen
          overflow-hidden
        "
      >
        <AuthSessionWatcher />

        <Sidebar />

        <div
          className="
            flex-1
            min-w-0
            min-h-0
            flex
            flex-col
          "
        >
          <MobileNavbar />

          <main
            className="
              flex-1
              overflow-x-hidden
              overflow-y-auto
            "
          >
            {children}
          </main>
        </div>
      </div>
    </AuthSessionProvider>
  );
}