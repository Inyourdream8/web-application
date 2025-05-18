import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About LendWise
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Empowering your financial journey with transparent, accessible,
              and innovative lending solutions
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          {/* Mission Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Our Mission
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg mb-4">
                At LendWise, our mission is simple yet powerful: to empower
                individuals and small businesses with smarter, more accessible
                loan solutions that lead to real financial growth. We believe
                that lending should be clear, fair, and stress-free—not a maze
                of fine print or rigid approval processes. By blending
                innovative technology with a deep understanding of everyday
                financial challenges, we simplify borrowing so our customers can
                focus on what matters most: building their future with
                confidence.
              </p>
              <p className="text-lg">
                Whether you're growing a business or managing personal finances,
                we provide the tools and support to help you move forward with
                confidence.
              </p>
            </div>
          </section>

          {/* Story Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Our Story
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg mb-4">
                LendWise was born from a personal frustration with outdated,
                impersonal lending systems that too often left hardworking
                people behind. Our founders—finance professionals with
                backgrounds in banking, fintech, and entrepreneurship—witnessed
                how traditional institutions created barriers rather than
                bridges for borrowers. One founder recalls watching a small
                business owner friend nearly lose her startup due to rigid loan
                terms and a lack of support. That moment became a turning
                point—a call to reimagine lending from the ground up.
              </p>
              <p className="text-lg mb-4">
                With a shared vision, the LendWise team set out to build a
                lending platform grounded in empathy, speed, and transparency.
                No confusing jargon. No unnecessary delays. Just reliable,
                human-focused service powered by smart technology.
              </p>
              <p className="text-lg">
                Today, we've helped over 10,000 customers access more than 50
                million in funding—with approval rates 30% higher than industry
                averages.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Transparency First
                </h3>
                <p>
                  We explain every term in plain language so you know exactly
                  what you're getting.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Access for All
                </h3>
                <p>
                  We design our products to serve diverse needs, with flexible
                  options for every credit background and financial situation.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Innovation Driven
                </h3>
                <p>
                  Our smart algorithms match you with ideal loan options, while
                  continuous improvements keep us ahead of industry standards.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Security Guaranteed
                </h3>
                <p>
                  Bank-level encryption and strict data protocols ensure your
                  information stays private and protected.
                </p>
              </div>
            </div>
          </section>

          {/* Success Stories */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Success Stories
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold">Amina's Boutique</h3>
                    <p className="text-sm text-gray-600">Online Retail</p>
                  </div>
                </div>
                <p>
                  "LendWise's microloan helped me launch my online store when no
                  one else would take a chance on me. Six months later, I've
                  tripled my initial investment!"
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold">Marcos & Sons</h3>
                    <p className="text-sm text-gray-600">
                      Landscaping Business
                    </p>
                  </div>
                </div>
                <p>
                  "The working capital loan from LendWise allowed us to expand
                  into two new cities. Their flexible repayment terms matched
                  our seasonal cash flow perfectly."
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow With Us?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've found a better way to
              borrow
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn btn-primary group">
                Apply Now
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
