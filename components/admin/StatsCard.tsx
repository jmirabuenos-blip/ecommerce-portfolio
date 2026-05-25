interface StatsCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}

export default function StatsCard({ title, value, sub, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
      <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-xl p-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}