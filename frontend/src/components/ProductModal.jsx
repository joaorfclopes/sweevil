import React from "react";
import { Dialog, Backdrop, Fade } from "@material-ui/core";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Placeholder from "./Placeholder";

export default function ProductModal(props) {
  const imageLoaded = (id) => {
    $(`#${id}-modal-image`).addClass("show");
  };

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className="product-modal"
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
            <div className="carousel-inner">
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
                      <LazyLoadImage
                        src={image}
                        alt="img"
                        afterLoad={() => imageLoaded(index)}
                      />
                    </div>
                  </Placeholder>
                </div>
              ))}
            </div>
            <a
              className="carousel-control-prev"
              href="#modalImageCarousel"
              role="button"
              data-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
            </a>
            <a
              className="carousel-control-next"
              href="#modalImageCarousel"
              role="button"
              data-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
            </a>
          </div>
        </div>
      </Fade>
    </Dialog>
  );
}
