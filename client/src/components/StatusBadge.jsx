const statusConfig = {
  menunggu: { label: 'Menunggu', bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20', dot: 'bg-yellow-400' },
  diproses: { label: 'Diproses', bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20', dot: 'bg-blue-400' },
  disetujui: { label: 'Disetujui', bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
  ditolak: { label: 'Ditolak', bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20', dot: 'bg-red-400' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = statusConfig[status] || statusConfig.menunggu;
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-bold ${textSize} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
