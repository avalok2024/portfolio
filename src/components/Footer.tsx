const Footer = () => {
  return (
    <footer className="border-t border-border/50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <span className="text-lg font-bold text-foreground">Av Alok</span>
          <p className="mt-1 text-xs text-muted-foreground">© 2025 Conversion. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          {["Privacy Policy", "Terms of Service", "License", "Contact"].map((link) => (
            <a key={link} href="#" className="text-xs text-muted-foreground hover:text-foreground">
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {["X", "In", "Ig"].map((icon) => (
            <span key={icon} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs text-muted-foreground hover:text-foreground">
              {icon}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
