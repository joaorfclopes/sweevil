import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import {
  listProductCategories,
  createProductCategory,
  deleteProductCategory,
} from "../actions/productCategoryActions";
import {
  PRODUCT_CATEGORY_CREATE_RESET,
  PRODUCT_CATEGORY_DELETE_RESET,
} from "../constants/productCategoryConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

export default function ProductCategoriesAdminTab() {
  const dispatch = useDispatch();

  const { categories = [], loading } = useSelector((state) => state.productCategoryList);
  const { loading: loadingCreate, success: successCreate, error: errorCreate } = useSelector((state) => state.productCategoryCreate);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = useSelector((state) => state.productCategoryDelete);

  const [newName, setNewName] = useState("");
  const [newIsClothing, setNewIsClothing] = useState(false);

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: PRODUCT_CATEGORY_CREATE_RESET });
      setNewName("");
      setNewIsClothing(false);
    }
    if (successDelete) {
      dispatch({ type: PRODUCT_CATEGORY_DELETE_RESET });
    }
    dispatch(listProductCategories());
  }, [dispatch, successCreate, successDelete]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    dispatch(createProductCategory(name, newIsClothing));
  };

  const handleDelete = (cat) => {
    Swal.fire({
      title: `Delete "${cat.name}"?`,
      text: "Products using this category will keep their current value.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteProductCategory(cat._id));
    });
  };

  const clothing = categories.filter((c) => c.isClothing);
  const other = categories.filter((c) => !c.isClothing);

  return (
    <div style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        {(loadingCreate || loadingDelete) && <LoadingBox />}
        {errorCreate && <MessageBox variant="error">{errorCreate}</MessageBox>}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}

        <Toolbar>
          <Typography style={{ width: "100%" }} className="title" variant="h6" component="div">
            <b>Product Categories</b>
          </Typography>
        </Toolbar>

        <div style={{ padding: "0 16px 24px" }}>
          {loading ? (
            <LoadingBox />
          ) : (
            <>
              {[{ label: "Clothing (size-based stock)", items: clothing }, { label: "Other", items: other }].map(({ label, items }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <Typography variant="subtitle2" style={{ color: "#555", marginBottom: 8 }}>
                    <b>{label}</b>
                  </Typography>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {items.map((cat) => (
                      <div
                        key={cat._id}
                        style={{
                          display: "flex", alignItems: "center", gap: 0,
                          border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16,
                          padding: "2px 4px 2px 10px", background: "#e0e0e0",
                          fontSize: "0.8rem", fontFamily: "inherit",
                        }}
                      >
                        <span style={{ userSelect: "none" }}>{cat.name}</span>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            sx={{ padding: "2px" }}
                            onClick={() => handleDelete(cat)}
                          >
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <span style={{ color: "#aaa", fontSize: "0.85rem" }}>None</span>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="New category name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleAdd} disabled={!newName.trim() || loadingCreate}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  style={{ width: 240 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={newIsClothing}
                    onChange={(e) => setNewIsClothing(e.target.checked)}
                  />
                  Size-based stock (clothing)
                </label>
              </div>
            </>
          )}
        </div>
      </Paper>
    </div>
  );
}
