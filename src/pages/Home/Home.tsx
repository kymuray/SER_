import BenefitsSection from '../../components/home/BenefitsSection'
import HeroSection from '../../components/home/HeroSection'
import HowItWorksSection from '../../components/home/HowItWorksSection'
import Footer from '../../components/layout/Footer'
import Header from '../../components/layout/Header'
import './Home.css'

function Home() {
  return (
    <>
      <Header />
      <main className="home-main" id="conteudo-principal">
        <div className="hero-card">
          <HeroSection />
          <BenefitsSection />
        </div>
        <HowItWorksSection />
      </main>
      <Footer />
    </>
  )
}

export default Home
