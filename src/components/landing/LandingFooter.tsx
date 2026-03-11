import { FOOTER_LINKS } from "@/constants/landing";
import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-white/10 py-12 text-gray-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo/logo-icon.svg"
            alt="BB Charge"
            width={32}
            height={32}
          />
          <span className="font-semibold text-white">BB Charge</span>
        </div>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="flex flex-col items-center md:items-start">
              <h4 className="mb-3 font-semibold text-white">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 transition hover:text-[rgb(112,66,248)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        © BB Charge {new Date().getFullYear()}. All rights reserved.
      </div>
    </footer>
  );
}
