import Sidebar
  from "./SideBar";

import MobileNavbar
  from "./MobileNavbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        min-h-screen
      "
    >
      <Sidebar />

      <div
        className="
          flex-1
          min-w-0
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
  );
}