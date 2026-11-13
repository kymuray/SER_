
import BenefitsSection from '../../components/home/BenefitsSection'
import HeroSection from '../../components/home/HeroSection'
import HowItWorksSection from '../../components/home/HowItWorksSection'
import './Home.css'

function Home() {
  return (
    <main className="home-main" id="conteudo-principal">
      <div className="hero-card">
        <HeroSection />
        <BenefitsSection />
      </div>

      <HowItWorksSection />
    </main>
  )
}

export default Home
