import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#181a1f] px-6 py-12 text-[#ff5a4f]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,90,79,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,90,79,0.3)_1px,transparent_1px)] [background-size:74px_74px]" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-1 w-40 -translate-y-1/2 rounded-full bg-[#ff5a4f]" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-1 w-44 rounded-full bg-[#ff5a4f]" />
      <div className="pointer-events-none absolute right-24 top-24 text-4xl">!</div>
      <div className="pointer-events-none absolute left-24 bottom-20 text-3xl">~</div>

      <section className="relative z-10 w-full max-w-4xl text-center">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="rounded-[28px] border-[14px] border-[#ff5a4f] bg-[#1b1d22] shadow-[0_0_40px_rgba(255,90,79,0.2)]">
            <div className="grid h-[320px] place-items-center font-mono text-[clamp(4rem,15vw,9rem)] font-black tracking-widest text-[#ff5a4f] [text-shadow:0_0_14px_rgba(255,90,79,0.35)]">
              404
            </div>
          </div>
          <div className="mx-auto h-4 w-24 rounded-b-xl bg-[#ff5a4f]" />
          <div className="mx-auto mt-3 h-5 w-56 rounded-lg bg-[#ff5a4f]" />
        </div>

        <p className="mt-10 text-lg font-medium text-[#ff8a82]">
          Oops! Page not found
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-md border border-[#ff5a4f] px-6 py-3 font-semibold text-[#ff5a4f] transition hover:bg-[#ff5a4f] hover:text-[#181a1f]"
        >
          Return to Home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
