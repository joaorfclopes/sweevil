import React from "react";
import $ from "jquery";
import CloseIcon from "@material-ui/icons/Close";

export default function MessageBox(props) {
  const hide = () => {
    $(".alert").hide();
  };
  return (
    <div className={`alert ${props.variant || "info"}`}>
      {props.children}{" "}
      {props.dismissible && (
        <div style={{ float: "right", cursor: "pointer" }} onClick={hide}>
          <CloseIcon />
        </div>
      )}
    </div>
  );
}
