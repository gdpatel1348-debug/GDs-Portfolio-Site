import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, Copy, Github, Linkedin, MapPin, Sparkles, Send, Phone, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

// EmailJS config
const EMAILJS_SERVICE_ID = 'service_portfolio';
const EMAILJS_TEMPLATE_ID = 'template_c47eh1p';
const EMAILJS_PUBLIC_KEY = 'JZo2aXfcW4WM7DZSI';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const emailAddress = 'gdpatel1348@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          user_name: name,
          name: name,
          to_name: 'Ghanshyam',
          reply_to: email,
          user_email: email,
          email: email,
          message: message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      const status = err?.status ?? 'unknown';
      const text = err?.text ?? String(err);
      console.error('EmailJS error:', status, text, err);
      setError(`Send failed (${status}: ${text}). Email me directly at gdpatel1348@gmail.com`);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-[32px] p-6 sm:p-8 bg-[#121214] border border-[#D7E2EA]/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Ambient decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B600A8]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#7621B0]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B600A8]/20 flex items-center justify-center text-[#BBCCD7]">
                  <Sparkles className="w-4 h-4 text-[#BBCCD7]" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-white">Let&apos;s Build Together</h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#D7E2EA] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Email Box */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#18011F] via-[#B600A8] to-[#7621B0] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Email</p>
                  <p className="text-sm font-medium text-white select-all">{emailAddress}</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#BBCCD7] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#BBCCD7] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">Project Vision / Message</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your 3D project, web app, or collaboration idea..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#BBCCD7] transition-colors resize-none"
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={sent || sending}
                className="w-full py-3.5 rounded-full text-white font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(182,0,168,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                }}
              >
                {sent ? (
                  <>
                    <Check className="w-4 h-4" /> Message Sent!
                  </>
                ) : sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>

            {/* Social Links & Location */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#BBCCD7]" />
                <span>Ahmedabad, India (Available Worldwide)</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:+918866241512"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> +91 8866241512
                </a>
                <a
                  href="https://github.com/gdpatel1348-debug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ghanshyam-patel-a01766378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
