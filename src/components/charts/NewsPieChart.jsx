import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e']

export function NewsPieChart({ articles }) {
  const grouped = Object.values(
    (articles || []).reduce((acc, article) => {
      const source = article.source?.name || 'Unknown'
      acc[source] = acc[source] || { name: source, value: 0 }
      acc[source].value += 1
      return acc
    }, {}),
  )
  const data = grouped.length > 0 ? grouped : [{ name: 'No data', value: 1 }]

  return (
    <div className="panel p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Media Analytics</h3>
      <p className="mb-4 text-lg font-semibold">News Distribution by Source</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={42} paddingAngle={3} label>
              {data.map((item, idx) => (
                <Cell key={item.name} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
