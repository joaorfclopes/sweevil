import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, listAdminProducts, reorderProducts } from '../actions/productActions';
import {
  createProductCategory,
  deleteProductCategory,
  listProductCategories,
  updateProductCategory,
} from '../actions/productCategoryActions';
import {
  PRODUCT_CATEGORY_CREATE_RESET,
  PRODUCT_CATEGORY_DELETE_RESET,
  PRODUCT_CATEGORY_UPDATE_RESET,
} from '../constants/productCategoryConstants';
import { PRODUCT_DELETE_RESET, PRODUCT_REORDER_RESET } from '../constants/productConstants';
import { formatDateDay } from '../utils';
import { downloadCSV, getComparator, isNewRow } from '../utils/adminTableUtils';
import Swal from '../utils/swal';
import LoadingOverlay from './LoadingOverlay';
import MessageBox from './MessageBox';

function ConditionalDndContext({
  active,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  children,
}) {
  if (!active) return <>{children}</>;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  );
}

function SortableRow({ id, children, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell padding="none" sx={{ width: 36, cursor: 'grab' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#aaa',
          }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      </TableCell>
      {children}
    </TableRow>
  );
}

export default function ProductsTable() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productAdminList = useSelector((state) => state.productAdminList);
  const { loading, products, error, total = 0 } = productAdminList;
  const productDelete = useSelector((state) => state.productDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = productDelete;
  const productReorder = useSelector((state) => state.productReorder);
  const { loading: loadingReorder, success: successReorder, error: errorReorder } = productReorder;

  const { categories = [] } = useSelector((state) => state.productCategoryList);
  const {
    loading: loadingCatCreate,
    success: successCatCreate,
    error: errorCatCreate,
  } = useSelector((state) => state.productCategoryCreate);
  const {
    loading: loadingCatUpdate,
    success: successCatUpdate,
    error: errorCatUpdate,
  } = useSelector((state) => state.productCategoryUpdate);
  const {
    loading: loadingCatDelete,
    success: successCatDelete,
    error: errorCatDelete,
  } = useSelector((state) => state.productCategoryDelete);

  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIsClothing, setNewCatIsClothing] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  const [localErrorCatCreate, setLocalErrorCatCreate] = useState(null);
  const [errorCatCreateKey, setErrorCatCreateKey] = useState(0);
  const [localErrorCatUpdate, setLocalErrorCatUpdate] = useState(null);
  const [errorCatUpdateKey, setErrorCatUpdateKey] = useState(0);
  const [localErrorCatDelete, setLocalErrorCatDelete] = useState(null);
  const [errorCatDeleteKey, setErrorCatDeleteKey] = useState(0);

  const [reorderMode, setReorderMode] = useState(false);
  const [localProducts, setLocalProducts] = useState(null);
  const [reorderInitLoading, setReorderInitLoading] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const prevLoadingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id || !localProducts) return;
    const oldIndex = localProducts.findIndex((p) => p._id === active.id);
    const newIndex = localProducts.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const list = [...localProducts];
    const [moved] = list.splice(oldIndex, 1);
    list.splice(newIndex, 0, moved);
    const updatedOrders = list.map((p, i) => ({ ...p, sortOrder: i }));
    setLocalProducts(updatedOrders);
    dispatch(reorderProducts(updatedOrders.map((p) => ({ _id: p._id, sortOrder: p.sortOrder }))));
  };
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [orderBy, setOrderBy] = useState('sortOrder');
  const [selected, setSelected] = useState(new Set());

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(col);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    if (reorderMode) return localProducts ?? [...(products ?? [])];
    if (orderBy === 'sortOrder') return [...(products ?? [])];
    return [...(products ?? [])].sort(getComparator(sortDir, orderBy));
  }, [localProducts, products, sortDir, orderBy, reorderMode]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [debouncedSearch]);

  const visibleIds = filtered.map((r) => r._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        visibleIds.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...visibleIds]));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const handleBulkDelete = () => {
    Swal.fire({
      title: t('admin.deleteProductsBulkTitle', { count: selected.size }),
      showCancelButton: true,
      confirmButtonText: t('admin.deleteOrdersBtn'),
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteProduct(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportCSV = () => {
    const headers = [
      t('admin.colProduct'),
      `${t('admin.colPrice')} (€)`,
      t('admin.colCategory'),
      t('admin.colStock'),
      t('admin.colVisible'),
      t('admin.colUpdated'),
    ];
    const rows = filtered.map((p) => {
      const stock = p.isClothing
        ? ['xs', 's', 'm', 'l', 'xl', 'xxl'].reduce((sum, k) => sum + (p.countInStock?.[k] ?? 0), 0)
        : (p.countInStock?.stock ?? 0);
      return [
        p.name,
        p.price?.toFixed(2),
        p.category,
        stock,
        p.visible ? t('common.yes') : t('common.no'),
        formatDateDay(p.updatedAt),
      ];
    });
    downloadCSV(headers, rows, 'products-export.csv');
  };

  const getStock = (p) =>
    p.isClothing
      ? ['xs', 's', 'm', 'l', 'xl', 'xxl'].reduce((sum, k) => sum + (p.countInStock?.[k] ?? 0), 0)
      : (p.countInStock?.stock ?? 0);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    if (reorderMode && wasLoading && !loading && products) {
      setLocalProducts([...products]);
      setReorderInitLoading(false);
    }
  }, [reorderMode, loading, products]);

  useEffect(() => {
    if (successDelete) dispatch({ type: PRODUCT_DELETE_RESET });
    if (reorderMode) {
      dispatch(listAdminProducts({ all: true }));
    } else {
      dispatch(listAdminProducts({ page: page + 1, limit: rowsPerPage, search: debouncedSearch }));
    }
  }, [dispatch, successDelete, reorderMode, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    if (successReorder) dispatch({ type: PRODUCT_REORDER_RESET });
  }, [dispatch, successReorder]);

  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  useEffect(() => {
    if (errorCatCreate) {
      setLocalErrorCatCreate(errorCatCreate);
      setErrorCatCreateKey((k) => k + 1);
    }
  }, [errorCatCreate]);
  useEffect(() => {
    if (errorCatUpdate) {
      setLocalErrorCatUpdate(errorCatUpdate);
      setErrorCatUpdateKey((k) => k + 1);
    }
  }, [errorCatUpdate]);
  useEffect(() => {
    if (errorCatDelete) {
      setLocalErrorCatDelete(errorCatDelete);
      setErrorCatDeleteKey((k) => k + 1);
    }
  }, [errorCatDelete]);

  useEffect(() => {
    if (successCatCreate) {
      dispatch({ type: PRODUCT_CATEGORY_CREATE_RESET });
      setNewCatName('');
      setNewCatIsClothing(false);
      dispatch(listProductCategories());
    }
    if (successCatUpdate) {
      dispatch({ type: PRODUCT_CATEGORY_UPDATE_RESET });
      setEditingCatId(null);
      dispatch(listProductCategories());
    }
    if (successCatDelete) {
      dispatch({ type: PRODUCT_CATEGORY_DELETE_RESET });
      dispatch(listProductCategories());
    }
  }, [dispatch, successCatCreate, successCatUpdate, successCatDelete]);

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    dispatch(createProductCategory(name, newCatIsClothing));
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: t('admin.deleteProductTitle', { name: `"${cat.name}"` }),
      showCancelButton: true,
      confirmButtonText: t('admin.deleteProductBtn'),
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteProductCategory(cat._id));
    });
  };

  const handleEditCatSave = (cat) => {
    const name = editingCatName.trim();
    if (!name) return;
    dispatch(updateProductCategory(cat._id, name, cat.isClothing));
  };

  const deleteHandler = (product) => {
    Swal.fire({
      title: t('admin.deleteProductTitle', { name: product.name }),
      showCancelButton: true,
      confirmButtonText: t('admin.deleteProductBtn'),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(product.slug));
        const counter =
          Math.min(rowsPerPage, (products && products.length) - page * rowsPerPage) - 1;
        if (counter === 0 && page !== 0) {
          setPage(page - 1);
        }
        Swal.fire(t('admin.deleteProductSuccess'), '', 'success');
      }
    });
  };

  const createHandler = () => {
    navigate('/admin/product/new/edit');
  };

  const handleToggleReorderMode = () => {
    if (!reorderMode) {
      setLocalProducts(null);
      setReorderInitLoading(true);
      prevLoadingRef.current = false;
    } else {
      setLocalProducts(null);
      setReorderInitLoading(false);
    }
    setReorderMode((prev) => !prev);
    setSelected(new Set());
  };

  return (
    <div className="products-table" style={{ marginBottom: '50px' }}>
      <LoadingOverlay
        loading={
          loadingDelete ||
          loadingCatCreate ||
          loadingCatUpdate ||
          loadingCatDelete ||
          loadingReorder
        }
      >
        <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
          {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
          {errorReorder && <MessageBox variant="error">{errorReorder}</MessageBox>}
          <>
            {/* Toolbar */}
            <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1, gap: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setOpen((v) => !v)}
              >
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  <b>{t('admin.productsTitle', { count: total })}</b>
                </Typography>
                <IconButton tabIndex={-1}>
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              {open && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {selected.size > 0 && (
                    <button className="dangerous-outline" onClick={handleBulkDelete}>
                      {t('admin.deleteSelected', { count: selected.size })}
                    </button>
                  )}
                  <TextField
                    size="small"
                    placeholder={t('admin.searchProducts')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} />
                        ),
                      },
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Tooltip title={t('admin.exportProductsCsv')}>
                    <IconButton onClick={handleExportCSV}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={reorderMode ? t('admin.exitReorderMode') : t('admin.reorderProducts')}
                  >
                    <span>
                      <IconButton
                        onClick={handleToggleReorderMode}
                        disabled={!reorderMode && search.trim().length > 0}
                        color={reorderMode ? 'primary' : 'default'}
                      >
                        <SwapVertIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('admin.addProduct')}>
                    <IconButton aria-label="create" onClick={createHandler}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Toolbar>

            <Collapse in={open}>
              <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" style={{ color: '#555', marginBottom: 8 }}>
                  <b>{t('admin.categories')}</b>
                </Typography>
                {localErrorCatCreate && (
                  <MessageBox key={errorCatCreateKey} variant="error" autoDismiss={3000}>
                    {localErrorCatCreate}
                  </MessageBox>
                )}
                {localErrorCatUpdate && (
                  <MessageBox key={errorCatUpdateKey} variant="error" autoDismiss={3000}>
                    {localErrorCatUpdate}
                  </MessageBox>
                )}
                {localErrorCatDelete && (
                  <MessageBox key={errorCatDeleteKey} variant="error" autoDismiss={3000}>
                    {localErrorCatDelete}
                  </MessageBox>
                )}
                {[
                  {
                    label: t('admin.categoryClothing'),
                    items: categories.filter((c) => c.isClothing),
                  },
                  {
                    label: t('admin.categoryOther'),
                    items: categories.filter((c) => !c.isClothing),
                  },
                ].map(({ label, items }) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <Typography variant="caption" style={{ color: '#888' }}>
                      {label}
                    </Typography>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 4,
                        alignItems: 'center',
                      }}
                    >
                      {items.map((cat) => {
                        const isEditing = editingCatId === cat._id;
                        if (isEditing) {
                          return (
                            <div
                              key={cat._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0,
                                border: '1px solid #bbb',
                                borderRadius: 16,
                                padding: '2px 6px',
                                background: '#e0e0e0',
                              }}
                            >
                              <input
                                autoFocus
                                value={editingCatName}
                                size={Math.max(8, editingCatName.length + 2)}
                                onChange={(e) => setEditingCatName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditCatSave(cat);
                                  if (e.key === 'Escape') setEditingCatId(null);
                                }}
                                style={{
                                  border: 'none',
                                  outline: 'none',
                                  background: 'transparent',
                                  fontSize: '0.8rem',
                                  fontFamily: 'inherit',
                                }}
                              />
                              <Tooltip title={t('admin.save')}>
                                <IconButton
                                  size="small"
                                  sx={{ padding: '2px' }}
                                  onClick={() => handleEditCatSave(cat)}
                                  disabled={!editingCatName.trim() || loadingCatUpdate}
                                >
                                  <EditIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('admin.cancel')}>
                                <IconButton
                                  size="small"
                                  sx={{ padding: '2px' }}
                                  onClick={() => setEditingCatId(null)}
                                >
                                  <CloseIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={cat._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid rgba(0,0,0,0.12)',
                              borderRadius: 16,
                              padding: '2px 4px 2px 10px',
                              background: '#e0e0e0',
                              fontSize: '0.8rem',
                              fontFamily: 'inherit',
                            }}
                          >
                            <span style={{ userSelect: 'none' }}>{cat.name}</span>
                            <Tooltip title={t('admin.editProduct')}>
                              <IconButton
                                size="small"
                                sx={{ padding: '2px' }}
                                onClick={() => {
                                  setEditingCatId(cat._id);
                                  setEditingCatName(cat.name);
                                }}
                              >
                                <EditIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('admin.deleteProduct')}>
                              <IconButton
                                size="small"
                                sx={{ padding: '2px' }}
                                onClick={() => handleDeleteCategory(cat)}
                              >
                                <DeleteIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        );
                      })}
                      {items.length === 0 && (
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                          {t('admin.noCategories')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <TextField
                    size="small"
                    placeholder={t('admin.newCategoryPlaceholder')}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleAddCategory}
                              disabled={!newCatName.trim() || loadingCatCreate}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    style={{ width: 220 }}
                  />
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newCatIsClothing}
                      onChange={(e) => setNewCatIsClothing(e.target.checked)}
                    />
                    {t('admin.clothingStockLabel')}
                  </label>
                </div>
              </div>

              {error && <MessageBox variant="error">{error}</MessageBox>}
              {/* Table — DndContext wraps outside TableContainer to avoid div-in-tbody */}
              <ConditionalDndContext
                active={reorderMode}
                sensors={sensors}
                onDragStart={({ active }) => setActiveDragId(active.id)}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveDragId(null)}
              >
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table className="table" stickyHeader aria-label="products table">
                    <TableHead>
                      <TableRow>
                        {reorderMode && <TableCell />}
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={allSelected}
                            indeterminate={selected.size > 0 && !allSelected}
                            onChange={toggleSelectAll}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <b>{t('admin.colImage')}</b>
                        </TableCell>
                        {[
                          { id: 'name', label: t('admin.colProduct') },
                          { id: 'price', label: t('admin.colPrice') },
                          { id: 'category', label: t('admin.colCategory') },
                          { id: 'countInStock.stock', label: t('admin.colStock') },
                          { id: 'visible', label: t('admin.colVisible') },
                          { id: 'updatedAt', label: t('admin.colUpdated') },
                        ].map(({ id, label }) => (
                          <TableCell key={id} align="center">
                            {reorderMode ? (
                              <b>{label}</b>
                            ) : (
                              <TableSortLabel
                                active={orderBy === id}
                                direction={orderBy === id ? sortDir : 'asc'}
                                onClick={() => handleSort(id)}
                              >
                                <b>{label}</b>
                              </TableSortLabel>
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          <b>{t('admin.actions')}</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading || reorderInitLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} sx={{ height: 56 }}>
                            {Array.from({ length: reorderMode ? 10 : 9 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton animation="wave" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={reorderMode ? 10 : 9}
                            align="center"
                            sx={{ py: 4, color: '#888' }}
                          >
                            {t('admin.noProductsFound')}
                          </TableCell>
                        </TableRow>
                      ) : reorderMode ? (
                        <SortableContext
                          items={filtered.map((p) => p._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {filtered.map((product) => (
                            <SortableRow
                              key={product._id}
                              id={product._id}
                              isDragging={activeDragId === product._id}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selected.has(product._id)}
                                  onChange={() => toggleSelect(product._id)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {(() => {
                                  let safeSrc = null;
                                  try {
                                    const u = new URL(product.images?.[0]);
                                    if (u.protocol === 'https:') safeSrc = u.href;
                                  } catch {}
                                  return safeSrc ? (
                                    <img
                                      src={safeSrc}
                                      alt={product.name}
                                      loading="lazy"
                                      style={{
                                        width: 40,
                                        height: 40,
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 40,
                                        height: 40,
                                        background: '#e0e0e0',
                                        borderRadius: 4,
                                        display: 'inline-block',
                                      }}
                                    />
                                  );
                                })()}
                              </TableCell>
                              <TableCell align="center">{product.name}</TableCell>
                              <TableCell align="center">{product.price?.toFixed(2)}€</TableCell>
                              <TableCell align="center">{product.category}</TableCell>
                              <TableCell align="center">{getStock(product)}</TableCell>
                              <TableCell align="center">
                                {product.visible ? t('common.yes') : t('common.no')}
                              </TableCell>
                              <TableCell align="center">
                                {formatDateDay(product.updatedAt)}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title={t('admin.editProduct')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/admin/product/${product.slug}/edit`)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('admin.deleteProduct')}>
                                  <IconButton size="small" onClick={() => deleteHandler(product)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </SortableRow>
                          ))}
                        </SortableContext>
                      ) : (
                        filtered.map((product) => (
                          <TableRow
                            key={product._id}
                            sx={
                              isNewRow(product) ? { backgroundColor: 'rgba(34,139,34,0.08)' } : {}
                            }
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selected.has(product._id)}
                                onChange={() => toggleSelect(product._id)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {(() => {
                                let safeSrc = null;
                                try {
                                  const u = new URL(product.images?.[0]);
                                  if (u.protocol === 'https:') safeSrc = u.href;
                                } catch {}
                                return safeSrc ? (
                                  <img
                                    src={safeSrc}
                                    alt={product.name}
                                    loading="lazy"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      objectFit: 'cover',
                                      borderRadius: 4,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 40,
                                      height: 40,
                                      background: '#e0e0e0',
                                      borderRadius: 4,
                                      display: 'inline-block',
                                    }}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell align="center">{product.name}</TableCell>
                            <TableCell align="center">{product.price?.toFixed(2)}€</TableCell>
                            <TableCell align="center">{product.category}</TableCell>
                            <TableCell align="center">{getStock(product)}</TableCell>
                            <TableCell align="center">
                              {product.visible ? t('common.yes') : t('common.no')}
                            </TableCell>
                            <TableCell align="center">{formatDateDay(product.updatedAt)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title={t('admin.editProduct')}>
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/product/${product.slug}/edit`)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('admin.deleteProduct')}>
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
                {reorderMode && (
                  <DragOverlay>
                    {activeDragId
                      ? (() => {
                          const p = filtered.find((x) => x._id === activeDragId);
                          return p ? (
                            <Box
                              sx={{
                                background: '#f0f0f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                borderRadius: 1,
                                px: 2,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <DragIndicatorIcon fontSize="small" sx={{ color: '#aaa' }} />
                              <Typography variant="body2">{p.name}</Typography>
                            </Box>
                          ) : null;
                        })()
                      : null}
                  </DragOverlay>
                )}
                {!reorderMode && (
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => {
                      setPage(p);
                      setSelected(new Set());
                    }}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                      setSelected(new Set());
                    }}
                  />
                )}
              </ConditionalDndContext>
            </Collapse>
          </>
        </Paper>
      </LoadingOverlay>
    </div>
  );
}
