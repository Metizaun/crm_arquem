import { Card } from "@/components/ui/card";
import { FunnelStep } from "@/lib/utils/metrics";
import { useState, useMemo, useRef, useLayoutEffect } from "react";

interface FunnelChartProps {
  data: FunnelStep[];
  title: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipAbove, setTooltipAbove] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);

  // 1) total real: soma de TODOS os leads (mesmo os que não serão exibidos)
  const totalLeads = useMemo(() => data.reduce((s, it) => s + (it?.value || 0), 0) || 1, [data]);

  // 2) Filtrar etapas que queremos esconder do gráfico
  const HIDE_STEPS = ["Perdido", "Remarketing"];
  const validSteps = useMemo(
    () => data.filter((s) => !HIDE_STEPS.includes(s.name) && typeof s.value === "number" && s.value > 0),
    [data]
  );

  if (!validSteps.length) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">{title}</h3>
        <div className="py-8 text-center text-sm text-muted-foreground">Sem dados para exibir</div>
      </Card>
    );
  }

  // layout & geometry
  const svgWidth = 880;
  const gap = 10;
  const baseStepHeight = 72;
  const svgHeight = validSteps.length * baseStepHeight + (validSteps.length - 1) * gap;
  const maxWidth = svgWidth * 0.85;
  const centerX = svgWidth / 2;
  const maxValue = Math.max(...validSteps.map((s) => s.value), 1);

  // memoiza trapezoids (identidade estável)
  const trapezoids = useMemo(() => {
    return validSteps.map((step, index) => {
      const currentWidthPercent = step.value / maxValue;
      const currentWidth = maxWidth * currentWidthPercent;

      const nextValueRaw = validSteps[index + 1]?.value;
      const nextValue = typeof nextValueRaw === "number" ? nextValueRaw : Math.max(step.value * 0.5, 1);
      const nextWidthPercent = nextValue / maxValue;
      const nextWidth = maxWidth * nextWidthPercent;

      const stepHeight = baseStepHeight;
      const y = index * (stepHeight + gap);

      const points = [
        [centerX - currentWidth / 2, y],
        [centerX + currentWidth / 2, y],
        [centerX + nextWidth / 2, y + stepHeight],
        [centerX - nextWidth / 2, y + stepHeight],
      ];

      // % baseado no total real (soma de todos os leads)
      const percentOfTotal = ((step.value / totalLeads) * 100).toFixed(1);

      return {
        ...step,
        points,
        y,
        currentWidth,
        percentOfTotal,
        index,
        stepHeight,
        centerX,
      };
    });
  }, [validSteps, maxWidth, maxValue, totalLeads]);

  const getStepColor = (index: number, total: number) => {
    const hues = [205, 203, 200, 197, 194, 192];
    const sats = [70, 72, 68, 65, 60, 58];
    const lights = [26, 23, 20, 18, 16, 13];
    if (index === total - 1) return `hsl(192, 60%, 10%)`;
    const i = Math.min(index, hues.length - 1);
    return `hsl(${hues[i]}, ${sats[i]}%, ${lights[i]}%)`;
  };

  // tooltip sizing aproximado (px)
  const TOOLTIP_W = 220;
  const TOOLTIP_H = 72;
  const MARGIN = 8;

  // calcula posição do tooltip (somente quando hoveredIndex muda)
  useLayoutEffect(() => {
    if (hoveredIndex === null) {
      prevPosRef.current = null;
      setTooltipPos(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = rect.width / svgWidth;
    const scaleY = rect.height / svgHeight;
    const trap = trapezoids[hoveredIndex];
    if (!trap) {
      prevPosRef.current = null;
      setTooltipPos(null);
      return;
    }

    let px = trap.centerX * scaleX;
    const pyCenter = (trap.y + trap.stepHeight / 2) * scaleY;

    // decidir acima/abaixo:
    // - prefer acima se couber
    // - se o passo for "Atendimento", forçar abaixo (pedido seu)
    const canPlaceAbove = pyCenter - TOOLTIP_H - MARGIN > 0;
    const canPlaceBelow = pyCenter + TOOLTIP_H + MARGIN < rect.height;
    let placeAbove = canPlaceAbove || !canPlaceBelow;

    // Forçar abaixo quando o passo for "Atendimento"
    if (trap.name === "Atendimento") placeAbove = false;

    // calc topPx (âncora do tooltip)
    let topPx = placeAbove ? pyCenter - (trap.stepHeight * scaleY) / 2 - MARGIN : pyCenter + (trap.stepHeight * scaleY) / 2 + MARGIN;

    // clamp X e Y para dentro do container
    const minX = MARGIN + TOOLTIP_W / 2;
    const maxX = rect.width - MARGIN - TOOLTIP_W / 2;
    px = Math.max(minX, Math.min(maxX, px));

    const minY = MARGIN + TOOLTIP_H / 2;
    const maxY = rect.height - MARGIN - TOOLTIP_H / 2;
    topPx = Math.max(minY, Math.min(maxY, topPx));

    const prev = prevPosRef.current;
    const changed =
      !prev ||
      Math.abs(prev.x - px) > 0.5 ||
      Math.abs(prev.y - topPx) > 0.5 ||
      tooltipAbove !== placeAbove;

    if (changed) {
      prevPosRef.current = { x: px, y: topPx };
      setTooltipPos({ x: px, y: topPx });
      setTooltipAbove(placeAbove);
    }
  }, [hoveredIndex, trapezoids, svgHeight, svgWidth, tooltipAbove]);

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4">{title}</h3>

      <div ref={containerRef} className="w-full overflow-x-auto relative" style={{ minHeight: 320 }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto" style={{ minHeight: 320 }}>
          <defs>
            <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "hsl(205, 60%, 20%)" }} />
              <stop offset="60%" style={{ stopColor: "hsl(205, 65%, 14%)" }} />
              <stop offset="100%" style={{ stopColor: "hsl(195, 50%, 12%)" }} />
            </linearGradient>

            {trapezoids.map((_, i) => (
              <linearGradient key={`g-${i}`} id={`stepGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: getStepColor(i, trapezoids.length) }} />
                <stop offset="100%" style={{ stopColor: getStepColor(Math.min(i + 1, trapezoids.length - 1), trapezoids.length) }} />
              </linearGradient>
            ))}
          </defs>

          {trapezoids.map((trap) => (
            <g key={trap.name}>
              <polygon
                points={trap.points.map((p) => p.join(",")).join(" ")}
                fill={`url(#stepGradient${trap.index})`}
                stroke="hsl(var(--background))"
                strokeWidth="3"
                style={{
                  transition: "opacity .12s linear, transform .12s ease",
                  opacity: hoveredIndex === null || hoveredIndex === trap.index ? 1 : 0.6,
                  transform: hoveredIndex === trap.index ? "scale(1.01)" : "scale(1)",
                  transformOrigin: "center",
                }}
                onMouseEnter={() => setHoveredIndex(trap.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              <text
                x={centerX}
                y={trap.y + trap.stepHeight / 2 - 10}
                textAnchor="middle"
                className="fill-white font-semibold"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)", fontSize: "clamp(14px, 2vw, 18px)" }}
              >
                {trap.name}
              </text>

              <text
                x={centerX}
                y={trap.y + trap.stepHeight / 2 + 12}
                textAnchor="middle"
                className="fill-white font-bold"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)", fontSize: "clamp(16px, 2.2vw, 22px)" }}
              >
                {trap.value}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip absoluto adaptativo */}
        {hoveredIndex !== null && tooltipPos && (
          <div
            style={{
              position: "absolute",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: tooltipAbove ? "translate(-50%, -120%)" : "translate(-50%, 8%)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: TOOLTIP_W,
                minHeight: TOOLTIP_H,
                background: "hsl(var(--card))",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 10px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 700 }}>{trapezoids[hoveredIndex].name}</div>
              <div style={{ marginTop: 6, color: "hsl(var(--muted-foreground))" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>{trapezoids[hoveredIndex].value}</span>{" "}
                — {trapezoids[hoveredIndex].percentOfTotal}% do total
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
