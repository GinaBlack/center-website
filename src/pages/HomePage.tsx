import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Portfolio } from "../components/Portfolio";
import { About } from "../components/About";

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <About />
    </>
  );
}
