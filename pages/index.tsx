import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, BoltIcon, UserGroupIcon, DocumentTextIcon, CreditCardIcon, Cog6ToothIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] text-white font-sans flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full relative">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent">Leadflowgenius</span>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-[#ff5f8f] transition">Solutions</a>
          <a href="#testimonials" className="hover:text-[#ff5f8f] transition">Testimonials</a>
          <a href="#who" className="hover:text-[#ff5f8f] transition">Who is it for?</a>
          <a href="#cta" className="hover:text-[#ff5f8f] transition">Get Started</a>
        </nav>
        <div className="hidden md:flex gap-3 items-center">
          <Link href="/auth/login" className="border border-white/30 text-white/80 px-6 py-2 rounded-full font-semibold hover:bg-white/10 transition">Login</Link>
          <Link href="#cta" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition">Get Started</Link>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen(v => !v)}
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f] shadow-2xl z-50 animate-fade-in">
            <nav className="flex flex-col gap-2 px-8 py-6 text-base font-medium">
              <a href="#features" className="py-2 hover:text-[#ff5f8f] transition" onClick={() => setMobileNavOpen(false)}>Solutions</a>
              <a href="#testimonials" className="py-2 hover:text-[#ff5f8f] transition" onClick={() => setMobileNavOpen(false)}>Testimonials</a>
              <a href="#who" className="py-2 hover:text-[#ff5f8f] transition" onClick={() => setMobileNavOpen(false)}>Who is it for?</a>
              <a href="#cta" className="py-2 hover:text-[#ff5f8f] transition" onClick={() => setMobileNavOpen(false)}>Get Started</a>
              <hr className="my-2 border-white/10" />
              <Link href="/auth/login" className="border border-white/30 text-white/80 px-6 py-2 rounded-full font-semibold hover:bg-white/10 transition mb-2" onClick={() => setMobileNavOpen(false)}>Login</Link>
              <Link href="#cta" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition" onClick={() => setMobileNavOpen(false)}>Get Started</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 md:px-0">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] bg-clip-text text-transparent drop-shadow-lg">
          All-in-One Sales & Client Management Platform<br />for Modern Entrepreneurs
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-8">
          Tired of juggling five different tools just to run your business?<br />
          <span className="text-white">Leadflowgenius</span> gives you everything you need — from capturing leads to sending invoices — in one powerful, easy-to-use platform.
        </p>
        <Link href="#cta" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition">Create your free account</Link>
        <div className="mt-12 w-full max-w-4xl mx-auto backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col items-start gap-2 w-full md:w-1/2">
            <span className="text-xs uppercase tracking-widest text-white/60">Modern CRM Example</span>
            <span className="text-lg font-semibold text-white">Panze web design & development</span>
            <span className="text-white/70 text-sm">Design Phase: Mockup, Review, Asset Delivery</span>
            <div className="flex gap-2 mt-2">
              <AvatarPlaceholder />
              <AvatarPlaceholder />
              <AvatarPlaceholder />
              <span className="text-xs text-white/60 ml-2">+2 more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <span className="text-xs text-white/60">Share your task</span>
            <div className="flex gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">Simon</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">Mark</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">Tariro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto w-full py-20 px-4 grid md:grid-cols-3 gap-10">
        <FeatureCard icon={<BoltIcon className="h-8 w-8 text-[#ff5f8f]" />} title="Lead Funnels & Pages" desc="Create high-converting sales funnels and landing pages in minutes. No coding, no headaches — just beautiful, fast pages that turn traffic into leads." />
        <FeatureCard icon={<UserGroupIcon className="h-8 w-8 text-[#6a5cff]" />} title="CRM Dashboard" desc="Track your leads, deals, and customer data all in one place. Built-in pipeline views, notes, contact tags, and follow-up automations make it easy to stay on top of every opportunity." />
        <FeatureCard icon={<CreditCardIcon className="h-8 w-8 text-[#ff5f8f]" />} title="Invoice & Payment Links" desc="Generate professional invoices, payment links, and receipts with your business logo. Get paid via manual or digital methods. No more chasing payments." />
        <FeatureCard icon={<DocumentTextIcon className="h-8 w-8 text-[#6a5cff]" />} title="Client Portal" desc="Give clients a personal dashboard where they can view invoices, receipts, and project status. You look professional, and they stay informed." />
        <FeatureCard icon={<BriefcaseIcon className="h-8 w-8 text-[#ff5f8f]" />} title="Services & Product Library" desc="Store your offer details once and reuse them for invoices, proposals, and pages. Save time and keep your brand consistent." />
        <FeatureCard icon={<Cog6ToothIcon className="h-8 w-8 text-[#6a5cff]" />} title="Smart Automations" desc="Send follow-up reminders, overdue notifications, or thank-you receipts automatically. Set it and forget it." />
        <FeatureCard icon={<CheckCircleIcon className="h-8 w-8 text-[#ff5f8f]" />} title="Custom Business Profile" desc="Showcase your brand with a full business profile — logo, contact info, services — reflected on all your documents and communications." />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-5xl mx-auto w-full py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Why Businesses Love Leadflowgenius</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <TestimonialCard name="Tariro M." role="Marketing Consultant" color="from-[#ff5f8f] to-[#6a5cff]" text="I closed more deals in one week using Leadflowgenius than I did in the entire last month. It’s like having a sales assistant working 24/7." />
          <TestimonialCard name="Mike G." role="Web Designer" color="from-[#6a5cff] to-[#ff5f8f]" text="The CRM and payment tools are game-changers for my freelance business. Everything feels seamless and professional now." />
        </div>
      </section>

      {/* Who is it for */}
      <section id="who" className="max-w-4xl mx-auto w-full py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Who Is It For?</h2>
        <ul className="grid md:grid-cols-2 gap-6 text-lg text-white/90">
          <li>• Solo entrepreneurs who want a professional, automated system</li>
          <li>• Agencies tired of using 10 different tools</li>
          <li>• Freelancers looking to manage leads, clients, and payments</li>
          <li>• Coaches, consultants, service providers, and digital product sellers</li>
        </ul>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1333] via-[#2d1a4d] to-[#ff5f8f]">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">Get Started Today</h2>
        <p className="text-lg text-white/80 mb-8 text-center max-w-xl">
          Stop the chaos. Start closing more deals and managing your business like a pro.<br />
          With Leadflowgenius, you’re not just getting another tool — you’re getting your time back, your professionalism up, and your sales system dialed in.
        </p>
        <Link href="#" className="bg-gradient-to-r from-[#ff5f8f] to-[#6a5cff] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition">Create your free account now</Link>
        <div className="text-xs text-white/60 mt-4">No credit card required. Cancel anytime.</div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-white/60 text-sm mt-auto">
        <div className="mb-2">&copy; {new Date().getFullYear()} Leadflowgenius. All rights reserved.</div>
        <div className="flex justify-center gap-4 text-xs">
          <a href="#features" className="hover:text-[#ff5f8f]">Features</a>
          <a href="#testimonials" className="hover:text-[#ff5f8f]">Testimonials</a>
          <a href="#who" className="hover:text-[#ff5f8f]">Who is it for?</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl flex flex-col gap-4 border border-white/10 hover:scale-[1.03] transition">
      <div>{icon}</div>
      <h3 className="font-bold text-lg tracking-tight">{title}</h3>
      <p className="text-white/80 text-sm">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, color, text }: { name: string; role: string; color: string; text: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex flex-col gap-3 border border-white/10">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xl font-bold`}>{name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-white/60">{role}</div>
        </div>
      </div>
      <p className="italic mt-2 text-white/90">“{text}”</p>
    </div>
  );
}

function AvatarPlaceholder() {
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff5f8f] to-[#6a5cff] flex items-center justify-center text-xs font-bold border-2 border-white/20">
      <span>👤</span>
    </div>
  );
} 