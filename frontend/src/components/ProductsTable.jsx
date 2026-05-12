import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteProduct,
  listProducts,
} from "../actions/productActions";
import {
  listProductCategories,
  createProductCategory,
  deleteProductCategory,
} from "../actions/productCategoryActions";
import {
  PRODUCT_DELETE_RESET,
} from "../constants/productConstants";
import {
  PRODUCT_CATEGORY_CREATE_RESET,
  PRODUCT_CATEGORY_DELETE_RESET,
} from "../constants/productCategoryConstants";
import { downloadCSV, getComparator, isNewRow, normalize } from '../utils/adminTableUtils';
import { formatDateDay } from '../utils';
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

export default function ProductsTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;
  const productDelete = useSelector((state) => state.productDelete);
  const {
    loading: loadingDelete,
    success: successDelete,
    error: errorDelete,
  } = productDelete;

  const { categories = [] } = useSelector((state) => state.productCategoryList);
  const { loading: loadingCatCreate, success: successCatCreate, error: errorCatCreate } = useSelector((state) => state.productCategoryCreate);
  const { loading: loadingCatDelete, success: successCatDelete, error: errorCatDelete } = useSelector((state) => state.productCategoryDelete);

  const [open, setOpen] = useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIsClothing, setNewCatIsClothing] = useState(false);

  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState(new Set());

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setOrderBy(col); setSortDir('asc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let arr = products ?? [];
    if (search) {
      const q = normalize(search);
      arr = arr.filter(
        (p) =>
          normalize(p.name ?? '').includes(q) ||
          normalize(p.category ?? '').includes(q)
      );
    }
    return [...arr].sort(getComparator(sortDir, orderBy));
  }, [products, search, sortDir, orderBy]);

  useEffect(() => { setPage(0); setSelected(new Set()); }, [search]);

  const visibleRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const visibleIds = visibleRows.map((r) => r._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); visibleIds.forEach((id) => n.delete(id)); return n; });
    } else {
      setSelected((prev) => new Set([...prev, ...visibleIds]));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBulkDelete = () => {
    Swal.fire({
      title: `Delete ${selected.size} products?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteProduct(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Price (€)', 'Category', 'Stock', 'Visible', 'Updated'];
    const rows = filtered.map((p) => {
      const stock = p.isClothing
        ? ['xs', 's', 'm', 'l', 'xl', 'xxl'].reduce((sum, k) => sum + (p.countInStock?.[k] ?? 0), 0)
        : (p.countInStock?.stock ?? 0);
      return [p.name, p.price?.toFixed(2), p.category, stock, p.visible ? 'Yes' : 'No', formatDateDay(p.updatedAt)];
    });
    downloadCSV(headers, rows, 'products-export.csv');
  };

  const getStock = (p) =>
    p.isClothing
      ? ['xs', 's', 'm', 'l', 'xl', 'xxl'].reduce((sum, k) => sum + (p.countInStock?.[k] ?? 0), 0)
      : (p.countInStock?.stock ?? 0);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
    }
    dispatch(listProducts());
  }, [dispatch, successDelete]);

  useEffect(() => {
    if (successCatCreate) {
      dispatch({ type: PRODUCT_CATEGORY_CREATE_RESET });
      setNewCatName("");
      setNewCatIsClothing(false);
    }
    if (successCatDelete) {
      dispatch({ type: PRODUCT_CATEGORY_DELETE_RESET });
    }
    dispatch(listProductCategories());
  }, [dispatch, successCatCreate, successCatDelete]);

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    dispatch(createProductCategory(name, newCatIsClothing));
  };

  const handleDeleteCategory = (cat) => {
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

  const deleteHandler = (product) => {
    Swal.fire({
      title: `Delete ${product.name}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(product._id));
        const counter =
          Math.min(
            rowsPerPage,
            (products && products.length) - page * rowsPerPage
          ) - 1;
        if (counter === 0 && page !== 0) {
          setPage(page - 1);
        }
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  const createHandler = () => {
    navigate("/admin/product/new/edit");
  };

  return (
    <div className="products-table" style={{ marginBottom: '50px' }}>
      <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
        {loadingDelete && <LoadingBox />}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
        {loading ? (
          <LoadingBox lineHeight="60vh" />
        ) : error ? (
          <MessageBox variant="error">{error}</MessageBox>
        ) : (
          <>
            {/* Toolbar */}
            <Toolbar sx={{ gap: 1, flexWrap: 'wrap', py: 1 }}>
              <Typography style={{ flexGrow: 1 }} variant="h6">
                <b>Products ({filtered.length})</b>
              </Typography>
              {selected.size > 0 && (
                <button className="dangerous-outline" onClick={handleBulkDelete}>
                  Delete {selected.size} selected
                </button>
              )}
              <TextField
                size="small"
                placeholder="Search name, category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} /> }}
                style={{ width: 220 }}
              />
              <Tooltip title="Export CSV">
                <IconButton onClick={handleExportCSV}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Create Product">
                <IconButton aria-label="create" onClick={createHandler}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={open ? "Collapse" : "Expand"}>
                <IconButton onClick={() => setOpen((v) => !v)}>
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Tooltip>
            </Toolbar>

            <Collapse in={open}>
            <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #e0e0e0" }}>
              <Typography variant="subtitle2" style={{ color: "#555", marginBottom: 8 }}>
                <b>Categories</b>
              </Typography>
              {(loadingCatCreate || loadingCatDelete) && <LoadingBox />}
              {errorCatCreate && <MessageBox variant="error">{errorCatCreate}</MessageBox>}
              {errorCatDelete && <MessageBox variant="error">{errorCatDelete}</MessageBox>}
              {[{ label: "Clothing", items: categories.filter((c) => c.isClothing) }, { label: "Other", items: categories.filter((c) => !c.isClothing) }].map(({ label, items }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Typography variant="caption" style={{ color: "#888" }}>{label}</Typography>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {items.map((cat) => (
                      <div key={cat._id} style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: "2px 4px 2px 10px", background: "#e0e0e0", fontSize: "0.8rem", fontFamily: "inherit" }}>
                        <span style={{ userSelect: "none" }}>{cat.name}</span>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ padding: "2px" }} onClick={() => handleDeleteCategory(cat)}>
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    ))}
                    {items.length === 0 && <span style={{ color: "#aaa", fontSize: "0.85rem" }}>None</span>}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleAddCategory} disabled={!newCatName.trim() || loadingCatCreate}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  style={{ width: 220 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={newCatIsClothing} onChange={(e) => setNewCatIsClothing(e.target.checked)} />
                  Size-based stock (clothing)
                </label>
              </div>
            </div>

            {/* Table */}
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table className="table" stickyHeader aria-label="products table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={allSelected} indeterminate={selected.size > 0 && !allSelected} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell align="center"><b>Image</b></TableCell>
                    {[
                      { id: 'name', label: 'Name' },
                      { id: 'price', label: 'Price' },
                      { id: 'category', label: 'Category' },
                      { id: 'countInStock.stock', label: 'Stock' },
                      { id: 'visible', label: 'Visible' },
                      { id: 'updatedAt', label: 'Updated' },
                    ].map(({ id, label }) => (
                      <TableCell key={id} align="center">
                        <TableSortLabel
                          active={orderBy === id}
                          direction={orderBy === id ? sortDir : 'asc'}
                          onClick={() => handleSort(id)}
                        >
                          <b>{label}</b>
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell align="right"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#888' }}>
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((product) => (
                      <TableRow key={product._id} sx={isNewRow(product) ? { backgroundColor: 'rgba(34,139,34,0.08)' } : {}}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.has(product._id)} onChange={() => toggleSelect(product._id)} />
                        </TableCell>
                        <TableCell align="center">
                          {(() => {
                            let safeSrc = null;
                            try { const u = new URL(product.images?.[0]); if (u.protocol === "https:") safeSrc = u.href; } catch {}
                            return safeSrc ? (
                              <img
                                src={safeSrc}
                                alt={product.name}
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <div style={{ width: 40, height: 40, background: '#e0e0e0', borderRadius: 4, display: 'inline-block' }} />
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">{product.name}</TableCell>
                        <TableCell align="center">{product.price?.toFixed(2)}€</TableCell>
                        <TableCell align="center">{product.category}</TableCell>
                        <TableCell align="center">{getStock(product)}</TableCell>
                        <TableCell align="center">{product.visible ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="center">{formatDateDay(product.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => navigate(`/admin/product/${product._id}/edit`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => deleteHandler(product)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => { setPage(p); setSelected(new Set()); }}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setSelected(new Set()); }}
            />
            </Collapse>
          </>
        )}
      </Paper>
    </div>
  );
}
