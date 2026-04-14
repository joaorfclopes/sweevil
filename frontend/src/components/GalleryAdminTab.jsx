import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  listGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
} from "../actions/galleryActions";
import {
  GALLERY_IMAGE_CREATE_RESET,
  GALLERY_IMAGE_UPDATE_RESET,
  GALLERY_IMAGE_DELETE_RESET,
} from "../constants/galleryConstants";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../actions/categoryActions";
import {
  CATEGORY_CREATE_RESET,
  CATEGORY_DELETE_RESET,
} from "../constants/categoryConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

// ─── Plain card (used in DragOverlay) ────────────────────────────────────────

function PlainCard({ item }) {
  return (
    <div className="gallery-image gallery-admin-card-wrapper">
      <div className="gallery-image-inner">
        <img src={item.image} alt={item.description || item.category} />
      </div>
    </div>
  );
}

// ─── Sortable card ────────────────────────────────────────────────────────────

function SortableCard({ item, onEdit, onDelete, isActive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isActive ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="gallery-image gallery-admin-card-wrapper"
    >
      <div className="gallery-image-inner">
        <img src={item.image} alt={item.description || item.category} />
      </div>
      {item.category && (
        <span className="gallery-admin-category-badge">{item.category}</span>
      )}
      <div className="gallery-admin-overlay">
        <div className="gallery-admin-overlay-actions">
          <Tooltip title="Edit">
            <IconButton size="small" className="gallery-admin-icon-btn" onClick={() => onEdit(item)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" className="gallery-admin-icon-btn gallery-admin-icon-btn--danger" onClick={() => onDelete(item)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Drag to reorder">
            <IconButton size="small" className="gallery-admin-icon-btn gallery-admin-drag-handle" {...attributes} {...listeners}>
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GalleryAdminTab() {
  const dispatch = useDispatch();

  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery = [], error } = galleryImageList;

  const galleryImageCreate = useSelector((state) => state.galleryImageCreate);
  const { loading: loadingCreate, success: successCreate, error: errorCreate } = galleryImageCreate;

  const galleryImageUpdate = useSelector((state) => state.galleryImageUpdate);
  const { loading: loadingUpdate, success: successUpdate, error: errorUpdate } = galleryImageUpdate;

  const galleryImageDelete = useSelector((state) => state.galleryImageDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = galleryImageDelete;

  const categoryListState = useSelector((state) => state.categoryList);
  const { categories = [] } = categoryListState;

  const categoryCreate = useSelector((state) => state.categoryCreate);
  const { loading: loadingCatCreate, success: successCatCreate, error: errorCatCreate } = categoryCreate;

  const categoryDeleteState = useSelector((state) => state.categoryDelete);
  const { success: successCatDelete } = categoryDeleteState;

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadingToS3, setUploadingToS3] = useState(false);
  const [uploadS3Error, setUploadS3Error] = useState("");
  const fileInputRef = useRef(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // Pending category (created via "add new" in dropdown)
  const [pendingCategory, setPendingCategory] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setItems(gallery);
  }, [gallery]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !uploadCategory) {
      setUploadCategory(categories[0].name);
    }
  }, [categories, uploadCategory]);

  // Fetch on mount and after gallery mutations
  useEffect(() => {
    if (successCreate) {
      dispatch({ type: GALLERY_IMAGE_CREATE_RESET });
      dispatch(listGalleryImages());
      setUploadOpen(false);
      resetUploadForm();
    } else if (successUpdate) {
      dispatch({ type: GALLERY_IMAGE_UPDATE_RESET });
      dispatch(listGalleryImages());
      setEditOpen(false);
    } else if (successDelete) {
      dispatch({ type: GALLERY_IMAGE_DELETE_RESET });
      dispatch(listGalleryImages());
    } else {
      dispatch(listGalleryImages());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, successCreate, successUpdate, successDelete]);

  // Fetch/refetch categories after mutations
  useEffect(() => {
    if (successCatCreate) {
      dispatch({ type: CATEGORY_CREATE_RESET });
      dispatch(listCategories());
      if (pendingCategory) {
        pendingCategory.setter(pendingCategory.name);
        setPendingCategory(null);
      }
    } else if (successCatDelete) {
      dispatch({ type: CATEGORY_DELETE_RESET });
      dispatch(listCategories());
    } else {
      dispatch(listCategories());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, successCatCreate, successCatDelete]);

  // ── Upload ──

  const resetUploadForm = () => {
    setUploadPreview("");
    setUploadFile(null);
    setUploadDescription("");
    setUploadCategory(categories[0]?.name || "");
    setUploadS3Error("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));
    setUploadFile(file);
    setUploadS3Error("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadCategory) return;
    setUploadingToS3(true);
    setUploadS3Error("");
    try {
      const formData = new FormData();
      formData.append("image", uploadFile);
      const { data } = await Axios.post("/api/uploads/s3?folder=gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch(createGalleryImage({ image: data.location, description: uploadDescription, category: uploadCategory }));
    } catch (err) {
      setUploadS3Error(err.response?.data?.message || err.message);
    } finally {
      setUploadingToS3(false);
    }
  };

  // ── Edit ──

  const openEdit = (item) => {
    setEditItem(item);
    setEditDescription(item.description || "");
    setEditCategory(item.category);
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editItem) return;
    dispatch(updateGalleryImage(editItem._id, { description: editDescription, category: editCategory }));
  };

  // ── Delete ──

  const handleDelete = (item) => {
    Swal.fire({
      title: "Delete this image?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteGalleryImage(item._id));
    });
  };

  // ── Category delete ──

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: `Delete "${cat.name}"?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteCategory(cat._id));
    });
  };

  // ── Drag and drop ──

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i._id === active.id);
        const newIndex = prev.findIndex((i) => i._id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        dispatch(reorderGalleryImages(reordered.map((item, idx) => ({ _id: item._id, order: idx }))));
        return reordered;
      });
    },
    [dispatch]
  );

  const activeItem = activeId ? items.find((i) => i._id === activeId) : null;

  // Merge DB categories with categories already used on existing images
  const availableCategories = [
    ...new Set([
      ...categories.map((c) => c.name),
      ...items.map((img) => img.category).filter(Boolean),
    ]),
  ].sort();

  // Which categories exist in the DB (have an _id to delete)
  const dbCategoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // Usage count per category across all images
  const categoryUsage = items.reduce((acc, img) => {
    if (img.category) acc[img.category] = (acc[img.category] || 0) + 1;
    return acc;
  }, {});

  const handleCategorySelectChange = (value, setter) => {
    if (value === "__add_new__") {
      const name = window.prompt("New category name:");
      if (name && name.trim()) {
        setPendingCategory({ name: name.trim(), setter });
        dispatch(createCategory(name.trim()));
      }
      return;
    }
    setter(value);
  };

  const categorySelect = (value, setter) => (
    <FormControl fullWidth margin="normal" size="small">
      <InputLabel>Category</InputLabel>
      <Select
        value={value}
        label="Category"
        onChange={(e) => handleCategorySelectChange(e.target.value, setter)}
      >
        {availableCategories.map((name) => {
          const dbCat = dbCategoryByName[name];
          const canDelete = dbCat && !categoryUsage[name];
          return (
            <MenuItem key={name} value={name} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              <span style={{ flex: 1 }}>{name}</span>
              {canDelete && (
                <IconButton
                  size="small"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteCategory(dbCat);
                  }}
                  sx={{ padding: "2px" }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </MenuItem>
          );
        })}
        <MenuItem value="__add_new__" sx={{ color: "#aaa", fontStyle: "italic" }}>
          + Add new category…
        </MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <div className="gallery-admin-table" style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        {(loadingDelete || loadingCreate || loadingUpdate || loadingCatCreate) && <LoadingBox />}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
        {errorCreate && <MessageBox variant="error">{errorCreate}</MessageBox>}
        {errorUpdate && <MessageBox variant="error">{errorUpdate}</MessageBox>}
        {errorCatCreate && <MessageBox variant="error">{errorCatCreate}</MessageBox>}

        <Toolbar>
          <Typography style={{ width: "100%" }} className="title" variant="h6" component="div">
            <b>Gallery</b>
          </Typography>
          <Tooltip title="Add image">
            <IconButton aria-label="add image" onClick={() => setUploadOpen(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>

        <div style={{ padding: "0 16px 16px" }}>
          {loading ? (
            <LoadingBox lineHeight="30vh" />
          ) : error ? (
            <MessageBox variant="error">{error}</MessageBox>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext items={items.map((i) => i._id)} strategy={rectSortingStrategy}>
                <div className="gallery-admin-masonry">
                  {items.map((item) => (
                    <SortableCard
                      key={item._id}
                      item={item}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      isActive={item._id === activeId}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeItem ? <PlainCard item={activeItem} /> : null}
              </DragOverlay>
            </DndContext>
          )}
          {!loading && !error && items.length === 0 && (
            <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
              No images yet. Click + to add one.
            </p>
          )}
        </div>
      </Paper>

      {/* ── Upload dialog ── */}
      <Dialog open={uploadOpen} onClose={() => { setUploadOpen(false); resetUploadForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Add Gallery Image</DialogTitle>
        <DialogContent>
          <div
            className="gallery-admin-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadPreview ? (
              <img src={uploadPreview} alt="preview" className="gallery-admin-preview" />
            ) : (
              <span>Click or drop an image here</span>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
          {uploadingToS3 && <LoadingBox width="30px" />}
          {uploadS3Error && <MessageBox variant="error">{uploadS3Error}</MessageBox>}
          <TextField
            label="Description"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />
          {categorySelect(uploadCategory, setUploadCategory)}

        </DialogContent>
        <DialogActions>
          <button className="secondary" onClick={() => { setUploadOpen(false); resetUploadForm(); }}>Cancel</button>
          <button className="primary" onClick={handleUploadSubmit} disabled={!uploadFile || uploadingToS3 || loadingCreate || !uploadCategory}>
            Add to Gallery
          </button>
        </DialogActions>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
          {editItem && (
            <img src={editItem.image} alt={editItem.description || editItem.category} className="gallery-admin-preview" style={{ marginBottom: 16 }} />
          )}
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />
          {categorySelect(editCategory, setEditCategory)}
        </DialogContent>
        <DialogActions>
          <button className="secondary" onClick={() => setEditOpen(false)}>Cancel</button>
          <button className="primary" onClick={handleEditSubmit} disabled={loadingUpdate}>Save</button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
