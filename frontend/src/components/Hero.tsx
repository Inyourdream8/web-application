import { ArrowRight, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  // Optional: State for controlled component
  const [loan_term, setLoanTerm] = useState("24 months");

  const benefits = [
    "Quick approval process",
    "Competitive interest rates",
    "Flexible repayment terms",
  ];

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Simple. Transparent. Fast.
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-tight">
              Financial Solutions <br />
              <span className="text-accent">Made Simple</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/80">
              Access the funds you need with a streamlined application process,
              competitive rates, and exceptional service.
            </p>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="text-accent size-5" />
                  <span className="text-sm md:text-base text-foreground/80">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/register" className="btn btn-primary group">
                Apply Now
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative slide-in">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/20 rounded-full filter blur-2xl opacity-70 animate-float animation-delay-1000"></div>

            <div className="relative bg-white rounded-2xl p-8 shadow-soft backdrop-blur-sm border border-gray-200 hover-lift">
              <div className="absolute -top-4 -right-4 bg-accent/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-accent/20 shadow-sm">
                <span className="text-xs font-semibold text-accent">
                  4% Customer Rating
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-4 text-primary">
                Quick Loan Calculator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Loan Amount
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-3 text-gray-500">
                      ₱
                    </span>
                    <input
                      type="number"
                      className="input-field pl-7"
                      placeholder="100,000.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Loan Term (months)
                  </label>
                  {/* Fixed: Added defaultValue */}
                  <select
                    className="input-field"
                    defaultValue="24 months"
                    // For controlled component, replace defaultValue with value:
                    // value={loan_term}
                    // onChange={(e) => setLoanTerm(e.target.value)}
                  >
                    <option>6 months</option>
                    <option>12 months</option>
                    <option>24 months</option>
                    <option>36 months</option>
                    <option>48 months</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button className="w-full btn btn-primary">
                    Calculate Rate
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  This is just an estimate. Your actual rate may vary based on
                  your application.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
