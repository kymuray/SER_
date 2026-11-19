
import BenefitsSection from '../../components/home/BenefitsSection'
import HeroSection from '../../components/home/HeroSection'
import './Home.css'

function Home() {
  return (
    <main className="home-main" id="conteudo-principal">
      <div className="hero-card">
        <HeroSection />
        <BenefitsSection />
      </div>

     
    </main>
  )
}

export default Home
