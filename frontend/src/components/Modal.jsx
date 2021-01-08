import React from "react";
import { Dialog, Backdrop, Fade } from "@material-ui/core";
import LazyImage from "./LazyImage";
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
            <LazyImage src={props.img} alt="img" />
          </Fade>
        </Dialog>
      )}
    </>
  );
}
