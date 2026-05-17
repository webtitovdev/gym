interface Point {
  x: number;
  y: number;
}

interface Props {
  data: Point[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniChart({
  data,
  width = 320,
  height = 120,
  color = '#10b981',
}: Props) {
  if (data.length === 0) {
    return <div class="text-zinc-600 text-sm py-4 text-center">Нет данных</div>;
  }

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);
  const yPad = (yMaxRaw - yMinRaw) * 0.15 || 1;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((d) => {
    const x = pad + ((d.x - xMin) / xRange) * innerW;
    const y = pad + (1 - (d.y - yMin) / yRange) * innerH;
    return { x, y, v: d.y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const area = `${path} L${points[points.length - 1].x.toFixed(1)},${height - pad} L${points[0].x.toFixed(1)},${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      class="w-full block"
      preserveAspectRatio="none"
    >
      <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="#27272a" strokeDasharray="2 2" strokeWidth="1" />
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#27272a" strokeWidth="1" />
      <text x={pad - 4} y={pad + 4} fill="#71717a" fontSize="10" textAnchor="end">{yMaxRaw}</text>
      <text x={pad - 4} y={height - pad + 4} fill="#71717a" fontSize="10" textAnchor="end">{yMinRaw}</text>

      <path d={area} fill={color} fillOpacity="0.1" />
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  );
}
