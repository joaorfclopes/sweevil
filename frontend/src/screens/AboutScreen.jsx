import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Video from '../components/Video';
const VIDEO_WEBM = '/video/video.webm';

export default function AboutScreen(props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [about, setAbout] = useState({
    en: { title: "Who's Sweevil?", body: '' },
    pt: { title: 'Quem é Sweevil?', body: '' },
  });

  useEffect(() => {
    axios
      .get('/api/about')
      .then((res) => setAbout(res.data))
      .catch(() => {});
  }, []);

  const current = about[lang] || about.en || {};
  const paragraphs = current.body ? current.body.split(/\n\n+/).filter(Boolean) : [];

  return (
    <section className="about" id="about">
      <div className="row about-container">
        <Video
          webmSrc={VIDEO_WEBM}
          poster={window.location.origin + '/sweevil.avif'}
          subtitle={t('about.videoSubtitle')}
        />
        <div className="text">
          <h1 className="title">{current.title}</h1>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Video
          webmSrc={VIDEO_WEBM}
          poster={window.location.origin + '/sweevil.avif'}
          subtitle={t('about.videoSubtitle')}
          mobile
        />
      </div>
    </section>
  );
}
