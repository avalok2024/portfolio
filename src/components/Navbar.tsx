import { Button } from "@/components/ui/button";

const Navbar = () => {
  const links = ["About Us", "Results", "Services", "Process", "AOx"];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-foreground">Av Alok</span>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
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
