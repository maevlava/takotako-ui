import { Fragment, useState, type ReactNode } from "react";
import "./App.css";
import { Sidebar, SidebarItem, SidebarSubItem } from "./components/common/Sidebar";
import {
    LayoutDashboard,
    Warehouse as WarehouseIcon,
    Cog,
    Calculator,
    Store,
    type LucideIcon,
} from "lucide-react";
import Dashboard from "./canvases/Dashboard";
import Warehouse from "./canvases/Warehouse";
import Hpp from "./canvases/Hpp";
import Accounting from "./canvases/Accounting";
import Outlet from "./canvases/Outlet";
import { seedOutlets } from "./data/outlets";

interface Tab {
    id: string;
    text: string;
    icon: LucideIcon;
    alert?: boolean;
    render: () => ReactNode;
}

function App() {
    const [activeId, setActiveId] = useState("hpp");
    const [activeOutletId, setActiveOutletId] = useState("all");

    const tabs: Tab[] = [
        { id: "dashboard", text: "Dashboard", icon: LayoutDashboard, alert: true, render: () => <Dashboard /> },
        { id: "warehouse", text: "Warehouse", icon: WarehouseIcon, render: () => <Warehouse /> },
        { id: "hpp", text: "HPP", icon: Cog, render: () => <Hpp /> },
        { id: "accounting", text: "Accounting", icon: Calculator, render: () => <Accounting /> },
        { id: "outlet", text: "Outlet", icon: Store, render: () => <Outlet outletId={activeOutletId} onSelect={setActiveOutletId} /> },
    ];

    const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
    const canvasKey = activeId === "outlet" ? `outlet:${activeOutletId}` : activeTab.id;

    return (
        <div className="h-screen flex bg-bg text-fg overflow-hidden">
            <Sidebar>
                {tabs.map((tab) => (
                    <Fragment key={tab.id}>
                        <SidebarItem
                            icon={<tab.icon size={20} />}
                            text={tab.text}
                            alert={tab.alert}
                            active={activeId === tab.id}
                            onClick={() => setActiveId(tab.id)}
                        />
                        {tab.id === "outlet" && activeId === "outlet" && (
                            <>
                                <SidebarSubItem
                                    text="Semua Outlet"
                                    active={activeOutletId === "all"}
                                    onClick={() => setActiveOutletId("all")}
                                />
                                {seedOutlets.map((outlet) => (
                                    <SidebarSubItem
                                        key={outlet.id}
                                        text={outlet.name}
                                        active={activeOutletId === outlet.id}
                                        onClick={() => setActiveOutletId(outlet.id)}
                                    />
                                ))}
                            </>
                        )}
                    </Fragment>
                ))}
            </Sidebar>
            <main className="flex-1 min-w-0 p-3">
                <div key={canvasKey} className="h-full rounded-2xl bg-surface border border-border overflow-auto p-6 animate-fade">
                    {activeTab.render()}
                </div>
            </main>
        </div>
    );
}

export default App;
