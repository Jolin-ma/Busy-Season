'use client';
import { useState, FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <a
          href="/"
          className="block text-center text-xs tracking-[0.3em] text-stone-400 uppercase mb-10 hover:text-stone-600 transition-colors"
        >
          Legacy Link Studio
        </a>

        <h1
          className="text-center mb-2"
          style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: '#2c2824' }}
        >
          Get in Touch
        </h1>
        <p className="text-center text-sm tracking-wide text-stone-400 mb-10">
          We&apos;d love to hear from you.
        </p>

        {status === 'success' ? (
          <div className="text-center py-12">
            <p
              className="text-lg mb-2"
              style={{ fontFamily: 'var(--font-playfair)', color: '#2c2824' }}
            >
              Thank you, {name || 'friend'}.
            </p>
            <p className="text-sm text-stone-400 tracking-wide">
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-[0.15em] text-stone-500 uppercase mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-stone-200 bg-white rounded px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] text-stone-500 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-200 bg-white rounded px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] text-stone-500 uppercase mb-2">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-stone-200 bg-white rounded px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                placeholder="How can we help you?"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-500 tracking-wide">
                Something went wrong. Please try again or email us directly at{' '}
                <a href="mailto:info@legacylinkstudio.com" className="underline">
                  info@legacylinkstudio.com
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-stone-800 text-stone-50 text-xs tracking-[0.2em] uppercase py-4 rounded hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-stone-300 tracking-wide mt-10">
          info@legacylinkstudio.com
        </p>
      </div>
    </div>
  );
}
