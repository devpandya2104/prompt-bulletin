import Navbar      from "@/components/Navbar";
import Hero        from "@/components/Hero";
import Categories  from "@/components/Categories";
import Discover    from "@/components/Discover";
import Features    from "@/components/Features";
import Blog        from "@/components/Blog";
import About       from "@/components/About";
import FAQ         from "@/components/FAQ";
import SubmitCTA   from "@/components/SubmitCTA";
import Newsletter  from "@/components/Newsletter";
import Footer      from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Discover />
        <Features />
        <Blog />
        <About />
        <FAQ />
        <SubmitCTA />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
