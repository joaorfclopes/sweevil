import AboutScreen from './AboutScreen';
import GalleryScreen from './GalleryScreen';
import HomeScreen from './HomeScreen';

export default function MainScreen(props) {
  return (
    <section className="main">
      <HomeScreen />
      <AboutScreen />
      <GalleryScreen />
    </section>
  );
}
