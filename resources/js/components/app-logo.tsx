import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <img
                src="/logo.png"
                alt="The Kelana Club"
                className="size-8 rounded-md object-cover shadow-sm border border-red-900/20"
            />
            <div className="grid flex-1 text-left">
                <span className="truncate text-sm font-bold leading-tight font-serif tracking-tight">
                    The Kelana Club
                </span>
                <span className="truncate text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                    Real Routes By Real Travelers
                </span>
            </div>
        </div>
    );
}
