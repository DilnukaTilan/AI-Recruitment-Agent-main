"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Users,
  Sparkles,
  BarChart2,
  Clock,
  Zap,
  Check,
  Search,
  FileText,
  ShieldCheck,
  Award,
  ChevronRight,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

export default function Home() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { user } = useUser();

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(error.message);
  };

  const handleStartRecruiting = () => {
    router.push("/register");
  };

  useEffect(() => {
    if (user) {
      if (user.role === "recruiter") {
        router.push("/recruiter/dashboard");
      } else if (user.role === "candidate") {
        router.push("/candidate/dashboard");
      }
    }
  }, [user, router]);

  const clientLogos = [
    { logo: "/client logos/Dialog.svg" },
    { logo: "/client logos/SLTMobitel.svg" },
    { logo: "/client logos/Pickme.svg" },
    { logo: "/client logos/HCL.svg" },
    { logo: "/client logos/99x.svg" },
  ];

  const testimonials = [
    {
      quote:
        "From intuitive front-end design to seamless backend integration, the site is a true showcase of full-stack excellence.",
      author: "Sarah",
      image: "/user photos/Sarah.jpg",
      role: "Full Stack Developer",
    },
    {
      quote:
        "Built with security at its core, the site ensures robust protection against vulnerabilities while maintaining smooth performance.",
      author: "Christina",
      image: "/user photos/Christina.jpg",
      role: "Information Security Analyst",
    },
    {
      quote:
        "The AI-driven insights have revolutionized how we evaluate candidates, saving us countless hours while improving the quality of our hires.",
      author: "Aryan",
      image: "/user photos/Aryan.jpg",
      role: "HR Manager",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      title: "AI Candidate Matching",
      description:
        "Advanced algorithms match candidates to your job requirements with unprecedented accuracy.",
      highlights: [
        "Skills analysis",
        "Culture fit scoring",
        "Experience matching",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      gradient: "from-violet-500 to-purple-500",
      title: "Automated Screening",
      description:
        "Eliminate manual resume reviews with intelligent parsing and scoring of applications.",
      highlights: [
        "Resume parsing",
        "Keyword analysis",
        "Experience validation",
      ],
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      gradient: "from-indigo-500 to-blue-500",
      title: "Analytics Dashboard",
      description:
        "Real-time insights into your hiring pipeline and candidate quality metrics.",
      highlights: [
        "Time-to-hire tracking",
        "Source effectiveness",
        "Diversity metrics",
      ],
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-500",
      title: "Bias Reduction",
      description:
        "Minimize unconscious bias in your hiring process with structured evaluations.",
      highlights: [
        "Blind screening",
        "Structured interviews",
        "Diversity insights",
      ],
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-500",
      title: "Candidate Engagement",
      description:
        "Automated messaging keeps candidates informed and engaged throughout the process.",
      highlights: [
        "Personalized emails",
        "Status updates",
        "Feedback collection",
      ],
    },
    {
      icon: <Award className="w-6 h-6" />,
      gradient: "from-rose-500 to-pink-500",
      title: "Employer Branding",
      description:
        "Showcase your company culture and values to attract top talent.",
      highlights: [
        "Custom career pages",
        "Team profiles",
        "Culture highlights",
      ],
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Define Your Needs",
      description:
        "Tell us about your open position and ideal candidate profile. Our AI learns your requirements instantly.",
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      color: "from-blue-600/20 to-cyan-600/20",
      border: "border-blue-500/30",
    },
    {
      number: "02",
      title: "Smart Candidate Matching",
      description:
        "Our algorithm analyzes thousands of profiles to find the best matches based on skills, experience, and culture fit.",
      icon: <Search className="w-6 h-6 text-violet-400" />,
      color: "from-violet-600/20 to-purple-600/20",
      border: "border-violet-500/30",
    },
    {
      number: "03",
      title: "Review & Interview",
      description:
        "Receive a curated shortlist of top candidates with AI-generated insights to guide your interviews.",
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-600/20 to-teal-600/20",
      border: "border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-150 h-150 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 rounded-full bg-indigo-600/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#050816]/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex justify-center gap-2 md:justify-start">
            <a
              href="http://localhost:3000/"
              className="transition-transform hover:scale-105"
            >
              <Image
                src={"/logo.png"}
                alt="logo"
                width={200}
                height={100}
                className="w-30"
              />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={handleStartRecruiting}
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI-Powered Recruitment Platform
            <span className="ml-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-2 py-0.5">
              New
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
          >
            Smarter Hiring,
            <br />
            <span className="bg-linear-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Transform your recruitment with intelligent matching, automated
            screening, and data-driven insights that deliver{" "}
            <span className="text-white font-medium">
              better candidates faster
            </span>
            .
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => router.push("/login")}
              className="group flex items-center gap-2 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              Start Recruiting
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex -space-x-2">
              {[
                "/user photos/Christina.jpg",
                "/user photos/Sarah.jpg",
                "/user photos/Aryan.jpg",
              ].map((src, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#050816] bg-gray-700 overflow-hidden"
                >
                  <Image
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#050816] bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                +k
              </div>
            </div>
            <span>
              Trusted by <span className="text-white font-medium">1000+</span>{" "}
              HR professionals
            </span>
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="ml-1 text-gray-400">4.9/5 rating</span>
            </span>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {[
              {
                value: "85%",
                label: "Reduction in time-to-hire",
                icon: <Clock className="w-5 h-5 text-blue-400" />,
                desc: "Fill positions faster than ever",
              },
              {
                value: "3.2x",
                label: "Better candidate matches",
                icon: <Check className="w-5 h-5 text-emerald-400" />,
                desc: "Higher quality via AI matching",
              },
              {
                value: "98%",
                label: "Accuracy rate",
                icon: <BarChart2 className="w-5 h-5 text-violet-400" />,
                desc: "Precision in candidate-job fit",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/3 backdrop-blur-sm p-8 hover:bg-white/6 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="text-5xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-gray-500 text-sm">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Process
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              How AIcruiter Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Our intelligent platform transforms your hiring process in three
              simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl border ${step.border} bg-linear-to-br ${step.color} p-8 backdrop-blur-sm overflow-hidden group hover:-translate-y-1 transition-transform`}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
                <div className="text-6xl font-black text-white/5 absolute top-4 right-6 select-none">
                  {step.number}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Powerful Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Everything you need to streamline your recruitment process
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-white/5 bg-white/3 hover:bg-white/7 p-7 transition-all hover:-translate-y-1 hover:border-white/10"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${feature.gradient} shrink-0`}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Testimonials
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Trusted by Teams Worldwide
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Join thousands of companies that have transformed their hiring
              with AIcruiter
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-linear-to-br from-blue-600/15 to-violet-600/15 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl font-bold mb-2">1000+</div>
                <p className="text-gray-400 text-sm mb-8">
                  Companies using AIcruiter to hire better candidates
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {clientLogos.map((client, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden"
                  >
                    <img
                      src={client.logo}
                      alt={`Client ${i + 1}`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="lg:col-span-2 relative min-h-55">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-2xl border border-white/5 bg-white/3 p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-200 text-lg leading-relaxed font-medium">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-gray-700">
                        {testimonials[currentTestimonial].image ? (
                          <Image
                            src={testimonials[currentTestimonial].image}
                            alt={testimonials[currentTestimonial].author}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                            {testimonials[currentTestimonial].author.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {testimonials[currentTestimonial].author}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {testimonials[currentTestimonial].role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentTestimonial(i)}
                          className={`rounded-full transition-all ${
                            i === currentTestimonial
                              ? "w-6 h-2 bg-blue-500"
                              : "w-2 h-2 bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-violet-700" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
              }}
            />
            <div className="relative px-10 py-16 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to hire smarter?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
                Join thousands of recruiters using AIcruiter to find the best
                talent in record time.
              </p>
              <button
                onClick={handleStartRecruiting}
                className="group inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-xl cursor-pointer"
              >
                Get Started Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex justify-center gap-2 md:justify-start">
            <a
              href="http://localhost:3000/"
              className="transition-transform hover:scale-105"
            >
              <Image
                src={"/logo.png"}
                alt="logo"
                width={200}
                height={100}
                className="w-30"
              />
            </a>
          </div>
          <p>© {new Date().getFullYear()} AIcruiter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
