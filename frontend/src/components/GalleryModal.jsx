import React from "react";
import { Dialog, Backdrop, Fade } from "@material-ui/core";
import { useSwipeable } from "react-swipeable";
import Placeholder from "./Placeholder";

export default function GalleryModal(props) {
  const next = () => {
    document.getElementById("carousel-control-next").click();
  };

  const previous = () => {
    document.getElementById("carousel-control-prev").click();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => previous(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className="gallery-modal"
      open={props.open}
      onClose={props.handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={props.open}>
        <div className="modal-images">
          <div
            id="modalImageCarousel"
            className="carousel slide"
            data-interval="false"
          >
            <div {...swipeHandlers} className="carousel-inner">
              {props.images.map((image, index) => (
                <div
                  key={index}
                  className={`carousel-item modal-image ${
                    image === props.images[props.imgIndex] && "active"
                  }`}
                >
                  <Placeholder>
                    <div
                      id={`${index}-modal-image`}
                      className="modal-image-inner"
                    >
                      <img src={image} alt="img" />
                    </div>
                  </Placeholder>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Fade>
      <div className="nav-buttons custom-font">
        <a
          id="carousel-control-prev"
          href="#modalImageCarousel"
          role="button"
          data-slide="prev"
        >
          Previous
        </a>{" "}
        /{" "}
        <a
          id="carousel-control-next"
          href="#modalImageCarousel"
          role="button"
          data-slide="next"
        >
          Next
        </a>
      </div>
    </Dialog>
  );
}
