import Up from '../assets/svg/up-arrow.svg?react';
import { scrollTop } from '../utils.js';

export default function ArrowUp() {
  return (
    <div className="arrow-up hide" onClick={scrollTop}>
      <Up />
    </div>
  );
}
