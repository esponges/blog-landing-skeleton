import React, { useState } from 'react';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="flex flex-col justify-center items-center w-8 h-8"
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
      >
        <span className={`block w-6 h-0.5 bg-blue mb-1 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue mb-1 transition-all ${open ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {open && (
        <ul className="absolute right-4 top-16 bg-primary rounded shadow-lg p-4 flex flex-col gap-4">
          <li><a href="/" className="hover:text-accent">Home</a></li>
          <li><a href="/blog" className="hover:text-accent">Blog</a></li>
          <li><a href="/about" className="hover:text-accent">About</a></li>
        </ul>
      )}
    </>
  );
}
