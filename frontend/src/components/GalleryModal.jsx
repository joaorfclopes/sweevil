import React from "react";
import { Dialog, Backdrop, Fade } from "@material-ui/core";

export default function GalleryModal(props) {
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
        <div className="modal-image">
          <img src={props.image} alt="img" />
        </div>
      </Fade>
    </Dialog>
  );
}
