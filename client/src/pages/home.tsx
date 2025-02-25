import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowRight, Building2, Clock, ChartBar, ArrowDownToLine } from "lucide-react";
import { motion, LazyMotion, domAnimation } from "framer-motion";

const features = [
  {
    icon: <Building2 className="h-6 w-6 text-blue-500" />,
    title: "Точна оценка",
    description: "Прецизен анализ на вашия имот, базиран на реални пазарни данни"
  },
  {
    icon: <Clock className="h-6 w-6 text-green-500" />,
    title: "Бърз процес",
    description: "Получете оценка на вашия имот само за няколко минути"
  },
  {
    icon: <ChartBar className="h-6 w-6 text-purple-500" />,
    title: "Пазарни тенденции",
    description: "Актуална информация за пазара на недвижими имоти"
  }
];

const steps = [
  {
    number: "01",
    title: "Въведете данни",
    description: "Попълнете основната информация за вашия имот"
  },
  {
    number: "02",
    title: "Качете снимки",
    description: "Добавете снимки и документи за по-точна оценка"
  },
  {
    number: "03",
    title: "Получете оценка",
    description: "Разгледайте детайлния анализ на стойността"
  }
];

export default function Home() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white">
        <main>
          {/* Hero Section */}
          <section className="relative pt-16 pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 -z-10" />
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Logo className="mx-auto mb-8" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#003366] mb-6">
                    Умна оценка на имоти
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Получете незабавна и точна оценка на вашия имот използвайки нашата
                    модерна платформа само в няколко прости стъпки.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/evaluation/step1">
                      <Button size="lg" className="bg-[#003366] hover:bg-[#002244] w-full sm:w-auto">
                        Оцени моя имот
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Научи повече
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Feature Blocks */}
            <div className="container mx-auto px-4 mt-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="p-3 bg-gray-50 rounded-lg w-fit mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#003366] mb-4">
                  Как работи?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Нашата платформа прави оценката на имоти лесна и достъпна за всички.
                  Следвайте тези прости стъпки:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="text-4xl font-bold text-blue-100 mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="bg-[#003366] rounded-2xl p-8 md:p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Готови ли сте да оцените вашия имот?
                  </h2>
                  <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Присъединете се към хилядите собственици, които вече използват нашата платформа
                    за бърза и точна оценка на техните имоти.
                  </p>
                  <Link href="/evaluation/step1">
                    <Button
                      size="lg"
                      className="bg-white text-[#003366] hover:bg-gray-100"
                    >
                      Започнете сега
                      <ArrowDownToLine className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-600">
              <p>© 2024 Homiq. Всички права запазени.</p>
            </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}