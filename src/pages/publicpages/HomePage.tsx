import { Hero } from "../../components/homepages/Hero";
import { Services } from "../../components/homepages/Services";
import { Portfolio } from "../../components/homepages/Portfolio";
import { About } from "../../components/homepages/About";

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
export default HomePage;