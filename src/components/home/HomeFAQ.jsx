import React, { useState } from "react";
import { Brain, Stethoscope, Pill, Activity, ShieldCheck, ChevronDown } from "lucide-react";

export const HomeFAQ = ({ t }) => {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: t?.faq?.q1 || "Which brain diseases and conditions does Smriti Saathi address?",
      a: t?.faq?.a1 || "Smriti Saathi is designed for all brain-related conditions treatable through targeted digital therapy and precision medication: Alzheimer's Disease & Dementia, Post-Stroke Hemiparesis & Aphasia, Parkinson's Disease, Mild Cognitive Impairment (MCI), Traumatic Brain Injury (TBI), and Age-Related Cognitive Decline.",
      icon: <Brain className="w-5 h-5 text-[#0D7377]" />
    },
    {
      q: t?.faq?.q2 || "How do targeted therapies and medication work together?",
      a: t?.faq?.a2 || "Therapies stimulate neuroplasticity to rebuild synaptic connections and motor coordination, while timely medication stabilizes neurotransmitters and controls disease progression. Smriti Saathi unifies both into a single seamless routine with physician oversight.",
      icon: <Pill className="w-5 h-5 text-[#0D7377]" />
    },
    {
      q: t?.faq?.q3 || "How does the Doctor Neo4j CDS enhance clinical safety?",
      a: t?.faq?.a3 || "Our Neo4j MedGraph Knowledge Graph analyzes patient scan reports, active medications, and contraindications. It screens for hazardous drug-drug interactions and recommends tailored, evidence-based therapy protocols.",
      icon: <Stethoscope className="w-5 h-5 text-[#0D7377]" />
    },
    {
      q: t?.faq?.q4 || "Can stroke and Parkinson's patients exercise safely at home?",
      a: t?.faq?.a4 || "Yes! All exercises include step-by-step voice guidance, adjustable motor speed, bilateral cross-body prompts, and 100% offline edge mode, ensuring safe daily rehabilitation without screen friction.",
      icon: <Activity className="w-5 h-5 text-[#0D7377]" />
    },
    {
      q: t?.faq?.q5 || "Can neurologists and family members track recovery trends?",
      a: t?.faq?.a5 || "Yes. The Caregiver and Doctor Dashboards track longitudinal motor accuracy, reaction times, medication adherence, and provide automated clinical alerts for any regression.",
      icon: <ShieldCheck className="w-5 h-5 text-[#0D7377]" />
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section faq-section py-12 sm:py-16" id="faq">
      <div className="container">
        <div className="section-header text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="faq-badge">{t?.faq?.badge || "FAQ & Clinical Knowledge Base"}</span>
          <h2 className="section__title text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t?.faq?.title || "Frequently Asked Questions"}
          </h2>
          <p className="section__sub text-slate-600 text-sm sm:text-base mt-2">
            {t?.faq?.sub || "Learn how Smriti Saathi treats and manages brain diseases through targeted therapies and precision medication."}
          </p>
        </div>

        <div className="faq-accordion-wrapper max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isActive = activeFaq === index;
            return (
              <div
                key={index}
                className={`faq-item ${isActive ? "faq-item--active" : ""}`}
              >
                <div className="faq-question cursor-pointer" onClick={() => toggleFaq(index)}>
                  <div className="faq-q-left flex items-center gap-3">
                    <span className="faq-icon-q">{faq.icon}</span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{faq.q}</h3>
                  </div>
                  <span className="faq-toggle-arrow">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </span>
                </div>
                <div className="faq-answer">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
