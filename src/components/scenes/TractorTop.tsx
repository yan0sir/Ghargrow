/** Top-down tractor + implement, facing +x (so MotionPath autoRotate points it along the track). */
export function TractorTop({ implement = true }: { implement?: boolean }) {
  return (
    <g>
      {implement && (
        <g>
          <rect x={-78} y={-34} width={10} height={68} fill="#c2412d" />
          <rect x={-70} y={-3} width={14} height={6} fill="#3a3a33" />
          {[-28, -14, 0, 14, 28].map((y) => (
            <circle key={y} cx={-73} cy={y} r={3.2} fill="#7b2a1d" />
          ))}
        </g>
      )}
      {/* rear wheels */}
      <rect x={-46} y={-31} width={26} height={11} rx={2} fill="#1e1e1a" />
      <rect x={-46} y={20} width={26} height={11} rx={2} fill="#1e1e1a" />
      {/* front wheels */}
      <rect x={14} y={-24} width={17} height={8} rx={2} fill="#1e1e1a" />
      <rect x={14} y={16} width={17} height={8} rx={2} fill="#1e1e1a" />
      {/* body */}
      <rect x={-48} y={-18} width={84} height={36} rx={5} fill="#b9cf2c" />
      <rect x={-6} y={-14} width={44} height={28} rx={6} fill="#a6bb22" />
      {/* cab roof */}
      <rect x={-44} y={-20} width={36} height={40} rx={3} fill="#f4f4ee" />
      <rect x={-40} y={-16} width={28} height={32} rx={2} fill="#dfe4d6" />
      {/* exhaust / lights */}
      <circle cx={4} cy={-9} r={2.4} fill="#3a3a33" />
      <rect x={36} y={-12} width={3} height={6} fill="#fff6c7" />
      <rect x={36} y={6} width={3} height={6} fill="#fff6c7" />
    </g>
  );
}
