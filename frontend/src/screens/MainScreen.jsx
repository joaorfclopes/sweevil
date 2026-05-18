import { motion } from 'framer-motion';
import AboutScreen from './AboutScreen';
import GalleryScreen from './GalleryScreen';
import HomeScreen from './HomeScreen';

export default function MainScreen(props) {
  return (
    <motion.section
      className="main"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <HomeScreen />
      <AboutScreen />
      <GalleryScreen />
    </motion.section>
  );
}
