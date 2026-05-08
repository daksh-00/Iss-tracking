import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

export function NewsCard({ article }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <img
        src={article.urlToImage || 'https://placehold.co/800x420?text=No+Image'}
        alt={article.title}
        className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="space-y-2 p-5">
        <h3 className="max-h-12 overflow-hidden text-base font-semibold leading-snug">{article.title}</h3>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
          {article.source?.name || 'Unknown Source'} • {article.author || 'Unknown Author'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-300">{new Date(article.publishedAt || Date.now()).toLocaleString()}</p>
        <p className="max-h-16 overflow-hidden text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {article.description || 'No description available.'}
        </p>
        <a
          href={article.url || '#'}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Read more
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.article>
  )
}
