import {
  CreditCard,
  Shield,
  Clock,
  Landmark,
  BadgeCheck,
  BarChart,
} from "lucide-react";

const features = [
  {
    icon: <CreditCard className="size-6 text-accent" />,
    title: "Quick Application",
    description:
      "Complete your loan application online in minutes with our secure and user-friendly platform.",
  },
  {
    icon: <Shield className="size-6 text-accent" />,
    title: "Secure Process",
    description:
      "Your information is protected with the latest encryption and security technologies.",
  },
  {
    icon: <Clock className="size-6 text-accent" />,
    title: "Fast Approval",
    description:
      "Receive loan decisions quickly, often within hours of submitting your application.",
  },
  {
    icon: <Landmark className="size-6 text-accent" />,
    title: "Multiple Loan Options",
    description:
      "Choose from various loan products tailored to meet your specific financial needs.",
  },
  {
    icon: <BadgeCheck className="size-6 text-accent" />,
    title: "Transparent Terms",
    description:
      "No hidden fees or surprises. We clearly communicate all loan terms upfront.",
  },
  {
    icon: <BarChart className="size-6 text-accent" />,
    title: "Flexible Repayment",
    description:
      "Customize your repayment schedule to align with your financial situation.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="badge bg-white/10 text-white mb-4">Why Choose Us</div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Designed with Your Financial Success in Mind
          </h2>
          <p className="mt-4 text-white/80">
            Our platform offers a comprehensive suite of features designed to
            make the loan process as simple and transparent as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors hover-lift"
            >
              <div className="p-3 bg-white/10 rounded-lg inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
