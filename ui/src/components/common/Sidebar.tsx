import { ChevronFirst, ChevronLast } from "lucide-react"
import octopus from "../../assets/octoto.png"
import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarProps {
    children?: ReactNode
    icon?: ReactNode
    text?: string
    active?: boolean
    alert?: boolean
    onClick?: () => void
}

const SidebarContext = createContext<boolean>(false)

const Sidebar = ({ children }: SidebarProps) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <aside className={`h-full bg-bg transition-all duration-300 ${expanded ? "w-64" : "w-20"}`}>
            <nav className="h-full flex flex-col">
                <div className="px-3 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex h-16 items-center overflow-hidden">
                        <img src={octopus} alt="Octo octo"
                            className={`h-16 shrink-0 object-contain transition-all duration-300 ${expanded ? "w-16" : "w-0"}`} />
                        <h1 className={`text-fg whitespace-nowrap leading-none overflow-hidden transition-all duration-300 ${expanded ? "ml-5 max-w-32 opacity-100" : "ml-0 max-w-0 opacity-0"}`}>
                            Tako tako
                        </h1>
                    </div>
                    <button
                        onClick={() => { setExpanded(curr => !curr) }}
                        className={`size-8 shrink-0 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-surface transition-all duration-300 ${expanded ? "" : "mr-[18px]"}`}>
                        {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                    </button>
                </div>
                <SidebarContext.Provider value={expanded}>
                    <ul className="flex-1 px-3">{children}</ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    )
}

const SidebarItem = ({ icon, text, active, alert, onClick }: SidebarProps) => {
    const expanded = useContext(SidebarContext)

    return (
        <li onClick={onClick}
            className={`
            relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors text-muted
            before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-current before:opacity-0 before:transition-opacity
            hover:bg-surface-hover hover:text-lavender hover:before:opacity-100
            group
            ${active ? "bg-surface-hover text-green before:opacity-100" : ""}
            ${alert ? "text-red" : ""}
            `}>
            <span className="shrink-0">{icon}</span>
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${expanded ? "max-w-52 ml-3 opacity-100" : "max-w-0 ml-0 opacity-0"}`}>{text}</span>
            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded-full bg-red ${expanded ? "" : "top-2"}`} />
            )}

            {!expanded && (<div className={`
            absolute left-full z-50 rounded-md px-2 py-1 ml-6 text-sm
            bg-surface-hover text-fg border border-border shadow-lg whitespace-nowrap
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
            >
                {text}
            </div>
            )}
        </li>
    )

}

const SidebarSubItem = ({ text, active, onClick }: { text: string; active?: boolean; onClick?: () => void }) => {
    const expanded = useContext(SidebarContext)
    if (!expanded) return null

    return (
        <li
            onClick={onClick}
            className={`relative ml-6 my-0.5 flex cursor-pointer items-center gap-2 rounded-md py-1.5 pl-3 pr-3 text-sm transition-colors ${
                active ? "bg-surface text-lavender" : "text-muted hover:bg-surface hover:text-fg"
            }`}>
            <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span className="truncate">{text}</span>
        </li>
    )
}

export { Sidebar, SidebarItem, SidebarSubItem }
