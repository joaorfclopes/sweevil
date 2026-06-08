import { useState } from 'react';
import AboutScreen from './AboutScreen';
import GalleryScreen from './GalleryScreen';
import HomeScreen from './HomeScreen';

export default function MainScreen(props) {
  const [aboutLoaded, setAboutLoaded] = useState(false);
  return (
    <section className="main">
      <HomeScreen />
      <AboutScreen onAboutLoaded={() => setAboutLoaded(true)} />
      <GalleryScreen aboutLoaded={aboutLoaded} />
    </section>
  );
}
