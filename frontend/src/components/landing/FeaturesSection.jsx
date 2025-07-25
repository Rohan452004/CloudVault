import React from "react";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "Easy Uploads",
    desc: "Upload files with a single click and access them anywhere, anytime."
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "Secure Storage",
    desc: "Your data is encrypted and protected with industry-leading security."
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "Reliable Access",
    desc: "Access your files 24/7 from any device, anywhere in the world."
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
    ),
    title: "Fast Performance",
    desc: "Experience lightning-fast uploads and downloads every time."
  }
];

const FeaturesSection = () => (
  <section className="max-w-5xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700 mb-8 sm:mb-10">Why CloudVault?</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      {features.map((f, i) => (
        <div key={i} className="bg-white/80 rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col items-center gap-4 border border-blue-100 hover:scale-105 hover:shadow-xl transition-transform duration-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">{f.icon}</div>
          <h3 className="text-base sm:text-lg font-semibold text-blue-700 text-center">{f.title}</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection; 