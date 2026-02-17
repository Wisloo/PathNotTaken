import Link from "next/link";

export default function Footer() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/explore" },
        { label: "Career Explorer", href: "/explore" },
        { label: "Browse Careers", href: "/careers" },
        { label: "FAQ", href: "/about#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      {/* Subtle gradient glow */}
      <div className="absolute top-0 left-1/3 w-96 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-64 h-24 bg-teal-500/5 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: Brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span className="text-white font-extrabold text-sm">PN</span>
              </div>
              <span className="text-[17px] font-extrabold tracking-tight">
                Path<span className="text-emerald-400">NotTaken</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Discover non-obvious career paths powered by your unique combination of skills and interests.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-xs uppercase text-gray-500 mb-4 tracking-widest">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PathNotTaken. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {["twitter", "github", "linkedin"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-9 h-9 rounded-xl bg-gray-800/60 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-gray-500"
                aria-label={social}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  {social === "twitter" && (
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  )}
                  {social === "github" && (
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  )}
                  {social === "linkedin" && (
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  )}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
