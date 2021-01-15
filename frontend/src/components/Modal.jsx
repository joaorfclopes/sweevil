import React from "react";
import { Dialog, Backdrop, Fade } from "@material-ui/core";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { isMobile } from "../utils";

export default function Modal(props) {
  return (
    <>
      {props.noMobile && !isMobile() && (
        <Dialog
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className="modal"
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
                className="carousel"
                data-interval="false"
              >
                <div className="carousel-inner">
                  {props.images.map((image) => (
                    <div
                      key={image}
                      className={`carousel-item ${
                        image === props.images[props.imgIndex] && "active"
                      }`}
                    >
                      <LazyLoadImage
                        src={image}
                        className="d-block w-100"
                        alt="img"
                        effect="blur"
                      />
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
      )}
    </>
  );
}
