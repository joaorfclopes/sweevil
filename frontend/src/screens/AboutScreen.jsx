import axios from 'axios';
import { useEffect, useState } from 'react';
import Video from '../components/Video';
const VIDEO_WEBM = '/video/video.webm';

export default function AboutScreen(props) {
  const [about, setAbout] = useState({ title: "Who's Sweevil?", body: '' });

  useEffect(() => {
    axios
      .get('/api/about')
      .then((res) => setAbout(res.data))
      .catch(() => {});
  }, []);

  const paragraphs = about.body ? about.body.split(/\n\n+/).filter(Boolean) : [];

  return (
    <section className="about" id="about">
      <div className="row about-container">
        <Video
          webmSrc={VIDEO_WEBM}
          poster={window.location.origin + '/sweevil.avif'}
          subtitle="produced by João Santana"
        />
        <div className="text">
          <h1 className="title">{about.title}</h1>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Video
          webmSrc={VIDEO_WEBM}
          poster={window.location.origin + '/sweevil.avif'}
          subtitle="produced by João Santana"
          mobile
        />
      </div>
    </section>
  );
}
