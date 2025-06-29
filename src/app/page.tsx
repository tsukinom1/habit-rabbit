import Hero from '@/components/home/Hero'
import HabitTimeline from '@/components/home/HabitTimeline'
import AppShowcase from '@/components/home/AppShowcase'
import AboutCTA from '@/components/ui/AboutCTA'

export default function Home() {
  return (
    <div>
      
      <Hero />
      <HabitTimeline />

      {/* CTA для перехода на страницу О нас */}


      <AppShowcase />

      {/* Floating CTA button */}
      <AboutCTA variant="floating" />
    </div>
  )
}
