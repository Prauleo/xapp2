"use client";

import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultSize: { w: number; h: number };
}

export default function DashboardPage() {
  const [layouts, setLayouts] = useState({
    lg: [
      { i: "twitter-stats", x: 0, y: 0, w: 2, h: 2 },
      { i: "instagram-stats", x: 2, y: 0, w: 2, h: 2 },
      { i: "recent-content", x: 0, y: 2, w: 4, h: 2 },
      { i: "quick-create", x: 4, y: 0, w: 2, h: 4 },
    ],
  });

  const widgets: DashboardWidget[] = [
    {
      id: "twitter-stats",
      title: "Estadísticas de Twitter",
      content: (
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Cuentas conectadas</div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Contenido generado</div>
        </div>
      ),
      defaultSize: { w: 2, h: 2 },
    },
    {
      id: "instagram-stats",
      title: "Estadísticas de Instagram",
      content: (
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Cuentas conectadas</div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Contenido generado</div>
        </div>
      ),
      defaultSize: { w: 2, h: 2 },
    },
    {
      id: "recent-content",
      title: "Contenido Reciente",
      content: (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">No hay contenido reciente</div>
        </div>
      ),
      defaultSize: { w: 4, h: 2 },
    },
    {
      id: "quick-create",
      title: "Creación Rápida",
      content: (
        <div className="flex flex-col gap-4">
          <button className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            Nuevo Contenido para Twitter
          </button>
          <button className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            Nuevo Contenido para Instagram
          </button>
        </div>
      ),
      defaultSize: { w: 2, h: 4 },
    },
  ];

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 }}
          rowHeight={100}
          onLayoutChange={onLayoutChange}
          isDraggable
          isResizable
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 flex h-full flex-col">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">{widget.title}</h3>
                </div>
                <div className="flex-1">{widget.content}</div>
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
