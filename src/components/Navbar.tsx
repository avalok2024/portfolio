import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navLinks = [
    { label: "About Us", href: "/about" },
    { label: "Results", href: "/results" },
    { label: "Services", href: "/services" },
    { label: "Process", href: "/process" },
    { label: "FAQs", href: "/faqs" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link to="/">
          <span className="text-xl font-bold text-foreground">
            Av Alok
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Button className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
          Book a call
        </Button>

      </div>
    </nav>
  );
};

export default Navbar;