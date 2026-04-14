import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
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
  updateCategory,
  reorderCategories,
  deleteCategory,
} from "../actions/categoryActions";
import {
  CATEGORY_CREATE_RESET,
  CATEGORY_UPDATE_RESET,
  CATEGORY_DELETE_RESET,
} from "../constants/categoryConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

// ─── Column layout helpers ────────────────────────────────────────────────────

function getColCount() {
  const w = window.innerWidth;
  if (w >= 992) return 4;
  if (w >= 768) return 3;
  if (w >= 576) return 2;
  return 1;
}

function useColCount() {
  const [colCount, setColCount] = useState(getColCount);
  useEffect(() => {
    const onResize = () => setColCount(getColCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return colCount;
}

// ─── Sortable category chip ───────────────────────────────────────────────────

function SortableCategoryChip({ id, name, dbCat, canDelete, isActive, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isActive ? 0 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: "flex", alignItems: "center", gap: 0,
        border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16,
        padding: "2px 4px 2px 6px", background: "#e0e0e0",
        fontSize: "0.8rem", fontFamily: "inherit", whiteSpace: "nowrap",
        cursor: dbCat ? "grab" : "default",
      }}
      {...(dbCat ? { ...attributes, ...listeners } : {})}
    >
      <span style={{ marginRight: 2, userSelect: "none" }}>{name}</span>
      {dbCat && (
        <Tooltip title="Rename">
          <IconButton size="small" sx={{ padding: "2px" }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title="Delete">
          <IconButton size="small" sx={{ padding: "2px" }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <DeleteIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

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

  const categoryUpdateState = useSelector((state) => state.categoryUpdate);
  const { success: successCatUpdate } = categoryUpdateState;

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

  // Gallery filter
  const [filterCategory, setFilterCategory] = useState("*");

  // Category management
  const [catItems, setCatItems] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const syncedRef = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor));
  const colCount = useColCount();

  // Filtered view (display-only; doesn't affect drag-reorder order)
  const displayItems = filterCategory === "*"
    ? items
    : items.filter((img) => img.category === filterCategory);

  // Round-robin distribute items across columns for stable visual order
  const adminColumns = useMemo(() => {
    return Array.from({ length: colCount }, (_, ci) => {
      const col = [];
      for (let i = ci; i < displayItems.length; i += colCount) col.push(displayItems[i]);
      return col;
    });
  }, [displayItems, colCount]);

  useEffect(() => {
    setItems(gallery);
  }, [gallery]);

  useEffect(() => {
    setCatItems(categories);
  }, [categories]);

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

  // Auto-sync image-derived categories into DB (runs once after both loads are ready)
  useEffect(() => {
    if (syncedRef.current || loading || gallery.length === 0) return;
    const dbNames = new Set(categories.map((c) => c.name));
    const missing = [...new Set(gallery.map((img) => img.category).filter(Boolean))].filter((n) => !dbNames.has(n));
    if (missing.length === 0) { syncedRef.current = true; return; }
    syncedRef.current = true;
    missing.forEach((name) => dispatch(createCategory(name)));
  }, [dispatch, loading, gallery, categories]);

  // Fetch/refetch categories after mutations
  useEffect(() => {
    if (successCatCreate) {
      dispatch({ type: CATEGORY_CREATE_RESET });
      setNewCategoryName("");
    } else if (successCatUpdate) {
      dispatch({ type: CATEGORY_UPDATE_RESET });
      setEditingCatId(null);
      dispatch(listGalleryImages());
    } else if (successCatDelete) {
      dispatch({ type: CATEGORY_DELETE_RESET });
    }
    dispatch(listCategories());
  }, [dispatch, successCatCreate, successCatUpdate, successCatDelete]);

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

  const handleCatDragEnd = useCallback(({ active, over }) => {
    setActiveCatId(null);
    if (!over || active.id === over.id) return;
    setCatItems((prev) => {
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      dispatch(reorderCategories(reordered.map((c, idx) => ({ _id: c._id, order: idx }))));
      return reordered;
    });
  }, [dispatch]);

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

  // catItems is the ordered DB list; merge with any image-derived names not yet in DB
  const dbCategoryByName = Object.fromEntries(catItems.map((c) => [c.name, c]));
  const dbCategoryNames = new Set(catItems.map((c) => c.name));
  const imageDerivedExtras = [...new Set(items.map((img) => img.category).filter(Boolean))]
    .filter((n) => !dbCategoryNames.has(n))
    .sort();
  // ordered: DB order first, then any image-derived stragglers
  const allCategoryNames = [...catItems.map((c) => c.name), ...imageDerivedExtras];

  // Usage count per category across all images
  const categoryUsage = items.reduce((acc, img) => {
    if (img.category) acc[img.category] = (acc[img.category] || 0) + 1;
    return acc;
  }, {});

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    dispatch(createCategory(name));
  };

  const categorySelect = (value, setter) => (
    <FormControl fullWidth margin="normal" size="small">
      <InputLabel>Category</InputLabel>
      <Select
        value={value}
        label="Category"
        onChange={(e) => setter(e.target.value)}
      >
        {allCategoryNames.map((name) => (
          <MenuItem key={name} value={name}>{name}</MenuItem>
        ))}
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
        {errorCatCreate && errorCatCreate !== "Category already exists" && <MessageBox variant="error">{errorCatCreate}</MessageBox>}

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

        <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" style={{ marginBottom: 8, color: "#555" }}>
            <b>Categories</b>
          </Typography>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveCatId(active.id)}
            onDragEnd={handleCatDragEnd}
            onDragCancel={() => setActiveCatId(null)}
          >
            <SortableContext items={catItems.map((c) => c._id)} strategy={rectSortingStrategy}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
                {allCategoryNames.map((name) => {
                  const dbCat = dbCategoryByName[name];
                  const canDelete = dbCat && !categoryUsage[name];
                  const isEditing = editingCatId === dbCat?._id;

                  if (isEditing) {
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #bbb", borderRadius: 16, padding: "2px 6px", background: "#e0e0e0" }}>
                        <input
                          autoFocus
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingCatName.trim()) dispatch(updateCategory(dbCat._id, editingCatName));
                            if (e.key === "Escape") setEditingCatId(null);
                          }}
                          style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.8rem", width: 100, fontFamily: "inherit" }}
                        />
                        <IconButton size="small" sx={{ padding: "2px" }} onClick={() => { if (editingCatName.trim()) dispatch(updateCategory(dbCat._id, editingCatName)); }}>
                          <EditIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ padding: "2px" }} onClick={() => setEditingCatId(null)}>
                          <DeleteIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </div>
                    );
                  }

                  return (
                    <SortableCategoryChip
                      key={name}
                      id={dbCat?._id || name}
                      name={name}
                      dbCat={dbCat}
                      canDelete={canDelete}
                      isActive={activeCatId === dbCat?._id}
                      onEdit={() => { setEditingCatId(dbCat._id); setEditingCatName(name); }}
                      onDelete={() => handleDeleteCategory(dbCat)}
                    />
                  );
                })}
                {allCategoryNames.length === 0 && (
                  <span style={{ color: "#aaa", fontSize: "0.85rem" }}>No categories yet.</span>
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeCatId ? (
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: "2px 10px", background: "#e0e0e0", fontSize: "0.8rem", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "grabbing" }}>
                  {catItems.find((c) => c._id === activeCatId)?.name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          <TextField
            size="small"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleAddCategory} disabled={!newCategoryName.trim() || loadingCatCreate}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            style={{ width: 240 }}
          />
        </div>

        {/* ── Category filter ── */}
        {allCategoryNames.length > 0 && (
          <div style={{ padding: "4px 16px 12px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#888", marginRight: 4, fontFamily: "inherit" }}>Filter:</span>
            {[{ label: "All", value: "*" }, ...allCategoryNames.map((n) => ({ label: n, value: n }))].map(({ label, value }) => (
              <div
                key={value}
                onClick={() => setFilterCategory(value)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16,
                  padding: "2px 10px", fontSize: "0.8rem", fontFamily: "inherit",
                  cursor: "pointer", userSelect: "none",
                  background: filterCategory === value ? "#555" : "#e0e0e0",
                  color: filterCategory === value ? "#fff" : "inherit",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

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
              <SortableContext items={displayItems.map((i) => i._id)} strategy={rectSortingStrategy}>
                <div className="gallery-admin-flex">
                  {adminColumns.map((col, ci) => (
                    <div key={ci} className="gallery-admin-col">
                      {col.map((item) => (
                        <SortableCard
                          key={item._id}
                          item={item}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          isActive={item._id === activeId}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeItem ? <PlainCard item={activeItem} /> : null}
              </DragOverlay>
            </DndContext>
          )}
          {!loading && !error && displayItems.length === 0 && (
            <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
              {filterCategory === "*" ? "No images yet. Click + to add one." : `No images in "${filterCategory}".`}
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
