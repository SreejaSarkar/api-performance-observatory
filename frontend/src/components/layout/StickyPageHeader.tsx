import { ReactNode } from "react";

export default function StickyPageHeader({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div
            className="
                sticky
                top-1
                z-20
                -mx-4
                mb-8
                rounded-b-3xl
                bg-[#0f172a]
                px-4
                py-4
                shadow-[0_18px_40px_rgba(2,6,23,0.32)]
                md:-mx-8
                md:px-8
                md:py-6
            "
        >
            {children}
        </div>
    );
}