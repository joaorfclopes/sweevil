import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Emotion1 from '../assets/svg/home/emotion1.svg?react';
import Emotion2 from '../assets/svg/home/emotion2.svg?react';
import Emotion3 from '../assets/svg/home/emotion3.svg?react';
import Emotion4 from '../assets/svg/home/emotion4.svg?react';
import Home1 from '../assets/svg/home/home1.svg?react';
import Home2 from '../assets/svg/home/home2.svg?react';
import Home3 from '../assets/svg/home/home3.svg?react';
import Home4 from '../assets/svg/home/home4.svg?react';
import Lettering from '../assets/svg/home/lettering.svg?react';

const slides = [
  { Lg: Home1, Sm: Emotion1 },
  { Lg: Home2, Sm: Emotion2 },
  { Lg: Home3, Sm: Emotion3 },
  { Lg: Home4, Sm: Emotion4 },
];

export default function HomeScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 2000);
    return () => clearInterval(t);
  }, []);

  const { Lg, Sm } = slides[index];

  return (
    <section className="home" id="home">
      <div className="row center home-container">
        <div className="home-slider">
          <div style={{ position: 'relative' }}>
            {/* Invisible anchor that holds the layout height */}
            <div style={{ visibility: 'hidden', pointerEvents: 'none' }}>
              <div className="illustration">
                <div className="illustration-lg">
                  <Lg />
                </div>
                <div className="illustration-sm">
                  <Sm />
                  <Lettering />
                </div>
              </div>
            </div>
            <AnimatePresence>
              <motion.div
                key={index}
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="illustration">
                  <div className="illustration-lg">
                    <Lg />
                  </div>
                  <div className="illustration-sm">
                    <Sm />
                    <Lettering />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
