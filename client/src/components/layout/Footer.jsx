import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, Mail, Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/5">
      {/* Gradient top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold font-[family-name:var(--font-family-heading)] gradient-text">
                SkillSphere
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              A premium learning platform where knowledge meets innovation. Learn without limits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Browse Courses' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Get Started' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@skillsphere.dev"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  <Mail size={14} />
                  hello@skillsphere.dev
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  <Github size={14} />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} SkillSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Built with</span>
            <span className="text-red-400">♥</span>
            <span>for learners everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
