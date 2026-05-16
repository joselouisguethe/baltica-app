import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Header } from '@/components/layout/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type FaqSection = {
  title: string;
  faqs: { question: string; answer: string }[];
};

const sections: Record<string, FaqSection[]> = {
  'es-LATAM': [
    {
      title: 'Logística y Accesos',
      faqs: [
        {
          question: '¿Cómo accedo a la aplicación?',
          answer: 'Accedes a videos, audios y materiales directamente desde la app. Tu experiencia es fluida y sin interrupciones. Todo en un solo lugar.',
        },
        {
          question: '¿Necesito descargar algo?',
          answer: 'No, todo funciona en tu navegador. No necesitas instalar ninguna aplicación.',
        },
        {
          question: '¿Puedo usar la app sin internet?',
          answer: 'Por ahora necesitas conexión a internet. En el futuro podríamos agregar modo offline.',
        },
        {
          question: '¿Desde qué dispositivos puedo acceder?',
          answer: 'El contenido está optimizado para que lo puedas ver desde cualquier dispositivo: celular, tablet u computadora. Todo funciona de forma automática para ti.',
        },
      ],
    },
    {
      title: 'Contenido y Reproducción',
      faqs: [
        {
          question: '¿Los videos se van a trabar?',
          answer: 'Los videos están optimizados. Si tu conexión es lenta, se ajustarán automáticamente para que puedas verlos sin interrupciones.',
        },
        {
          question: '¿Puedo repetir el contenido?',
          answer: 'Sí. Puedes repetir los videos, audios y materiales las veces que quieras durante tu período de acceso.',
        },
        {
          question: '¿Mi progreso queda guardado?',
          answer: 'Sí. Guardamos tu progreso automáticamente para que puedas retomar donde lo dejaste en cualquier momento.',
        },
      ],
    },
    {
      title: 'Seguridad y Privacidad',
      faqs: [
        {
          question: '¿Mis datos están seguros?',
          answer: 'Tu progreso y datos personales se guardan de forma segura. Nunca compartimos tu información con terceros.',
        },
        {
          question: '¿Qué información almacenan?',
          answer: 'Solo guardamos lo necesario para tu experiencia: tu correo, progreso en el reto y respuestas a las encuestas. Nunca almacenamos datos de pago.',
        },
      ],
    },
  ],
  'es-ES': [
    {
      title: 'Logística y Accesos',
      faqs: [
        {
          question: '¿Cómo accedo a la aplicación?',
          answer: 'Accedes a vídeos, audios y materiales directamente desde la app. Tu experiencia es fluida y sin interrupciones. Todo en un solo lugar.',
        },
        {
          question: '¿Necesito descargar algo?',
          answer: 'No, todo funciona en tu navegador. No necesitas instalar ninguna aplicación.',
        },
        {
          question: '¿Puedo usar la app sin internet?',
          answer: 'Por ahora necesitas conexión a internet. En el futuro podríamos agregar modo offline.',
        },
        {
          question: '¿Desde qué dispositivos puedo acceder?',
          answer: 'El contenido está optimizado para que lo puedas ver desde cualquier dispositivo: móvil, tablet u ordenador. Todo funciona de forma automática para ti.',
        },
      ],
    },
    {
      title: 'Contenido y Reproducción',
      faqs: [
        {
          question: '¿Los vídeos se van a trabar?',
          answer: 'Los vídeos están optimizados. Si tu conexión es lenta, se ajustarán automáticamente para que puedas verlos sin interrupciones.',
        },
        {
          question: '¿Puedo repetir el contenido?',
          answer: 'Sí. Puedes repetir los vídeos, audios y materiales las veces que quieras durante tu período de acceso.',
        },
        {
          question: '¿Mi progreso queda guardado?',
          answer: 'Sí. Guardamos tu progreso automáticamente para que puedas retomar donde lo dejaste en cualquier momento.',
        },
      ],
    },
    {
      title: 'Seguridad y Privacidad',
      faqs: [
        {
          question: '¿Mis datos están seguros?',
          answer: 'Tu progreso y datos personales se guardan de forma segura. Nunca compartimos tu información con terceros.',
        },
        {
          question: '¿Qué información almacenáis?',
          answer: 'Solo guardamos lo necesario para tu experiencia: tu correo, progreso en el reto y respuestas a las encuestas. Nunca almacenamos datos de pago.',
        },
      ],
    },
  ],
  en: [
    {
      title: 'Logistics & Access',
      faqs: [
        {
          question: 'How do I access the app?',
          answer: 'You access videos, audios, and materials directly from the app. Your experience is smooth and uninterrupted. Everything in one place.',
        },
        {
          question: 'Do I need to download anything?',
          answer: 'No, everything works in your browser. You don\'t need to install any application.',
        },
        {
          question: 'Can I use the app without internet?',
          answer: 'For now you need an internet connection. In the future we may add offline mode.',
        },
        {
          question: 'What devices can I use?',
          answer: 'The content is optimized so you can enjoy it from any device: phone, tablet, or computer. Everything works automatically for you.',
        },
      ],
    },
    {
      title: 'Content & Playback',
      faqs: [
        {
          question: 'Will the videos buffer?',
          answer: 'Videos are optimized. If your connection is slow, they will adjust automatically so you can watch without interruptions.',
        },
        {
          question: 'Can I repeat the content?',
          answer: 'Yes. You can repeat videos, audios, and materials as many times as you want during your access period.',
        },
        {
          question: 'Is my progress saved?',
          answer: 'Yes. We automatically save your progress so you can pick up where you left off at any time.',
        },
      ],
    },
    {
      title: 'Security & Privacy',
      faqs: [
        {
          question: 'Is my data secure?',
          answer: 'Your progress and personal data are stored securely. We never share your information with third parties.',
        },
        {
          question: 'What information do you store?',
          answer: 'We only store what\'s necessary for your experience: your email, challenge progress, and survey responses. We never store payment data.',
        },
      ],
    },
  ],
};

export default function HowItWorksPage() {
  const { t, locale } = useApp();
  usePageTitle('Cómo Funciona');
  const currentSections = sections[locale] || sections.en;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {t('howItWorks.title')}
          </h1>
        </motion.div>

        {/* Sections - Collapsible */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {currentSections.map((section, sectionIndex) => (
              <AccordionItem
                key={sectionIndex}
                value={`section-${sectionIndex}`}
                className="bg-card rounded-xl border shadow-card px-4"
              >
                <AccordionTrigger className="text-left hover:no-underline gap-3">
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                      {sectionIndex + 1}
                    </span>
                    <span className="font-semibold text-foreground text-base md:text-lg">
                      {section.title}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-2 pt-2">
                    {section.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`section-${sectionIndex}-faq-${faqIndex}`}
                        className="bg-muted/50 rounded-lg border-0 px-3"
                      >
                        <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line text-sm">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>
      </main>
    </div>
  );
}
