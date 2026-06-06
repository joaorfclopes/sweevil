import { scrollTop } from '../utils.js';

export default function ArrowUp() {
  return (
    <div className="arrow-up hide" onClick={scrollTop}>
      &#8593;
    </div>
  );
}
