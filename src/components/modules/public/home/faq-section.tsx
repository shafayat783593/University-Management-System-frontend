"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle, PhoneCall, Mail } from "lucide-react";
import { Reveal } from "./reveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  { question: "How do I apply for admission?", answer: "Click 'Apply as Student' or head to /register. Fill in your basic information, verify your email with the 6-digit OTP, choose your program from the department list, and submit your previous SSC and HSC academic information. Once submitted, your admission profile is ready immediately for course enrollment." },
  { question: "How can I pay my semester & tuition fees?", answer: "Pay all tuition and semester fees via our integrated bKash payment gateway. Go to 'Fees & Payments' in your student portal, review your pending invoice, click 'Pay with bKash', and authenticate securely. The transaction status updates automatically with an instant digital receipt." },
  { question: "Where can I view my exam marks, results and transcript?", answer: "All exam marks and semester GPA/CGPA results live under 'My Results' in your student dashboard. Review individual subject marks, download an official printable PDF transcript, or click 'Email me a copy' to receive it in your inbox." },
  { question: "How does real-time course enrollment work?", answer: "During the open enrollment window, browse available course sections for the active semester. The system checks prerequisites dynamically and shows live seat capacities (e.g. 28/35) so you can pick sections without waiting in line." },
  { question: "Can I download an official digital student ID card?", answer: "Yes. Once enrolled, visit the 'Digital ID Card' section in your student dashboard to generate and download an official high-resolution PDF identity card with your unique student ID and department details." },
  { question: "How can instructors join the faculty?", answer: "Click 'Join as Instructor', submit your academic qualifications and upload your resume. After verification and admin approval, your login credentials are emailed to you automatically." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="border-t border-border/80 bg-muted/20 py-20">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" />
            <span>Help & Support</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-balance">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Answers about admissions, bKash fee payments, exam results, transcripts, and faculty onboarding.
          </p>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen ? "border-primary/50 bg-card shadow-sm" : "border-border/80 bg-card/60 hover:border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      Q{index + 1}
                    </span>
                    <span className="text-sm font-bold text-foreground sm:text-base">{faq.question}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground ${isOpen ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-border/40"
                    >
                      <p className="px-5 pb-5 pt-3 pl-[4.25rem] text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:p-8">
          <div>
            <h4 className="text-base font-bold text-foreground">Still have questions about admissions or fees?</h4>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Our admission officers and technical support desk are available Sunday to Thursday.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <a
              href="tel:+8801700000000"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              <PhoneCall className="size-3.5 text-primary" />
              +880 1700-000000
            </a>
            <a
              href="mailto:support@northfield.edu.bd"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              <Mail className="size-3.5" />
              Email Desk
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
