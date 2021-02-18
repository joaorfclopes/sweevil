import React from "react";
import Video from "../components/Video";
import video from "../assets/video/video.mp4";

export default function AboutScreen(props) {
  return (
    <section className="about" id="about">
      <div className="row about-container">
        <Video
          videoSrc={video}
          poster={window.location.origin + "/sweevil.jpg"}
          subtitle="produced by João Santana"
        />
        <div className="text">
          <h1 className="title">Who's Sweevil?</h1>
          <p>
            Sílvia Peralta is a multi-disciplinary artist from Portugal born in
            1992.
          </p>

          <p>
            In 2013 after finishing a BfA in Design studies in Porto she started
            tattooing independently.
          </p>
          <p>
            As a tattoo artist she specialized in blackwork developing her own
            designs in a wide range of styles. Peralta has guested in severall
            tattooshops including “Covil Tattoo” São Paulo (Brasil), “Eclipse
            Tattoo” (Barcelona), “The Bonfire Tattoo” Madrid (Spain), “Chill Or
            Die” Paris (France), as well as others in Germany, Switzerland and
            Portugal.
          </p>
          <p>
            Currently she’s working as graphic designer, tattoo artist and
            painter.
          </p>
          <p>
            Sweevil signature comes up from bounding sweet and evil,
            representing her work mainly based on the concept of duality and
            opposites, their equilibrium and interpretation of freedom. Her work
            is an invitation to embrace life observing both parts of every coin
            free from judgments.
          </p>
        </div>
        <Video
          videoSrc={video}
          poster={window.location.origin + "/sweevil.jpg"}
          subtitle="produced by João Santana"
          mobile
        />
      </div>
    </section>
  );
}
