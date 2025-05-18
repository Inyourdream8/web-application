import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

type NavLinkProps = {
  to: string;
  label: string;
  active: boolean;
};

const NavLink = ({ to, label, active }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:text-accent ${
        active
          ? "text-accent font-semibold"
          : "text-foreground/80 hover:text-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-accent rounded-full" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/90 backdrop-blur-sm shadow-sm"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-primary font-heading font-bold text-2xl">
            LendWise
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={link.label}
              active={location.pathname === link.to}
            />
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-md text-primary hover:text-accent transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="btn btn-primary text-sm font-medium rounded-full flex items-center gap-1"
          >
            Get Started <ChevronRight className="size-4" />
          </Link>
        </div>

        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="size-6 text-primary" />
          ) : (
            <Menu className="size-6 text-primary" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-accordion-down">
          <div className="container mx-auto py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2 text-base ${
                  location.pathname === link.to
                    ? "text-accent font-semibold"
                    : "text-foreground/80"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 space-y-3 border-t border-gray-100">
              <Link
                to="/login"
                className="block px-4 py-2 text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="block mx-4 text-center py-2 bg-accent text-white font-medium rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
