import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-16 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-heading font-bold text-2xl text-white">
                LendWise
              </span>
            </Link>
            <p className="text-white/80 mb-4">
              Innovative lending solutions designed to meet your financial needs
              with simplicity and transparency.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-accent transition-colors"
              >
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Apply for a Loan
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Loan Calculator
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="size-5 text-accent mt-0.5" />
                <span className="text-white/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="size-5 text-accent mt-0.5" />
                <span className="text-white/80">support@lendwise.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="size-5 text-accent mt-0.5" />
                <span className="text-white/80">
                  123 Financial District
                  <br />
                  Suite 100
                  <br />
                  San Francisco, CA 94111
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center sm:text-left">
          <div className="sm:flex sm:justify-between sm:items-center">
            <p className="text-white/60 text-sm">
              © {currentYear} LendWise. All rights reserved.
            </p>
            <div className="mt-4 sm:mt-0">
              <ul className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
