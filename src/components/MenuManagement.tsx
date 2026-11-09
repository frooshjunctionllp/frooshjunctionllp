"use client";

import React, { useState } from "react";
import { Category, Product, ProductVariant } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  FolderPlus,
  Sparkles,
  GlassWater,
  Milk,
  Flame,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface MenuManagementProps {
  categories: Category[];
  products: Product[];
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  categories,
  products,
  onSaveCategory,
  onDeleteCategory,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");

  const [isSaving, setIsSaving] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const deleteItem = async (action: () => Promise<void>) => {
    if (isSaving) return;
    setMenuError("");
    setIsSaving(true);
    try { await action(); }
    catch (error) { setMenuError(error instanceof Error ? error.message : "Could not delete item."); }
    finally { setIsSaving(false); }
  };
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catColor, setCatColor] = useState("#F59E0B");

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodEmoji, setProdEmoji] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([
    { id: "var-1", name: "Regular 350ml", price: 90, isAvailable: true },
    { id: "var-2", name: "Large 500ml", price: 140, isAvailable: true },
  ]);
  const [productError, setProductError] = useState("");

  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDescription(cat.description);
      setCatIcon(cat.icon);
      setCatColor(cat.color);
    } else {
      setEditingCategory(null);
      setCatName("");
      setCatDescription("");
      setCatIcon("SHK");
      setCatColor("#FACC15");
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !catName.trim()) return;

    const newCategory: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName.trim(),
      slug: catName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: catDescription.trim(),
      icon: catIcon.trim() || "BEV",
      color: catColor,
    };

    setIsSaving(true);
    setMenuError("");
    try {
      await onSaveCategory(newCategory);
      setIsCategoryModalOpen(false);
    } catch (error) {
      setMenuError(error instanceof Error ? error.message : "Could not save category.");
    } finally { setIsSaving(false); }
  };

  const handleOpenProductModal = (prod?: Product) => {
    setProductError("");
    setImageFailed(false);
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdCategoryId(prod.categoryId);
      setProdDescription(prod.description);
      setProdEmoji(prod.emoji);
      setProdImageUrl(prod.imageUrl || "");
      setProdVariants(prod.variants.map((v) => ({ ...v })));
    } else {
      setEditingProduct(null);
      setProdName("");
      setProdCategoryId(categories[0]?.id || "");
      setProdDescription("");
      setProdEmoji("DRK");
      setProdImageUrl("");
      setProdVariants([
        { id: `var-${Date.now()}-1`, name: "Regular 350ml", price: 90, isAvailable: true },
        { id: `var-${Date.now()}-2`, name: "Large 500ml", price: 140, isAvailable: true },
      ]);
    }
    setIsProductModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setProdVariants([
      ...prodVariants,
      {
        id: `var-${Date.now()}`,
        name: "Jumbo 750ml",
        price: 190,
        isAvailable: true,
      },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    field: "name" | "price",
    value: string | number
  ) => {
    const updated = [...prodVariants];
    if (field === "name") {
      updated[index].name = String(value);
    } else {
      updated[index].price = Math.max(0, Number(value));
    }
    setProdVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    if (prodVariants.length <= 1) {
      setProductError("At least one size variant & price is required!");
      return;
    }
    setProdVariants(prodVariants.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    if (isSaving) return;
    if (!prodName.trim()) {
      setProductError("Please enter product name");
      return;
    }
    if (!prodCategoryId) {
      setProductError("Please select a category");
      return;
    }
    if (prodVariants.length === 0) {
      setProductError("Please configure at least one variant with price");
      return;
    }

    if (!categories.some((category) => category.id === prodCategoryId)) {
      setProductError("Please choose an existing category.");
      return;
    }
    if (prodVariants.some((variant) => !variant.name.trim() || !Number.isFinite(variant.price) || variant.price < 0)) {
      setProductError("Each size needs a name and a valid non-negative price.");
      return;
    }
    const newProd: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodName.trim(),
      categoryId: prodCategoryId,
      description: prodDescription.trim(),
      emoji: prodEmoji.trim() || "DRK",
      imageUrl: prodImageUrl.trim() || undefined,
      isAvailable: editingProduct ? editingProduct.isAvailable : true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      variants: prodVariants,
    };

    setIsSaving(true);
    try {
      await onSaveProduct(newProd);
      setSelectedCategoryTab(newProd.categoryId);
      setIsProductModalOpen(false);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Could not save product.");
    } finally { setIsSaving(false); }
  };

  const displayedProducts = products.filter((p) => {
    if (selectedCategoryTab === "all") return true;
    return p.categoryId === selectedCategoryTab;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-poppins">
      {menuError && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3">{menuError}</p>}
      {/* SECTION 1: CATEGORY MANAGER */}
      <div className="dashboard-panel space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-sm text-slate-900">
                Categories
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              A place for every drink on your menu.
            </p>
          </div>
          <button
            onClick={() => handleOpenCategoryModal()}
            className="pixel-btn-yellow px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer rounded-lg"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New category</span>
          </button>
        </div>

        <div className="menu-categories">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="menu-category-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="menu-category-symbol" aria-hidden="true">
                      {cat.icon === "GlassWater" ? <GlassWater size={21} /> : cat.icon === "Milk" ? <Milk size={21} /> : cat.icon === "Sparkles" ? <Sparkles size={21} /> : cat.icon === "Flame" ? <Flame size={21} /> : <span>{cat.icon.slice(0, 3) || cat.name.slice(0, 1)}</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isSaving}
                        onClick={() => void deleteItem(() => onDeleteCategory(cat.id))}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-slate-800">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-600 font-medium">
                  <span>Items: {count}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PRODUCTS & 1:1 IMAGES */}
      <div className="dashboard-panel space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900">
                The drink collection
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {products.length} drinks across {categories.length} categories. Keep your favourites fresh.
            </p>
          </div>
          <button
            onClick={() => handleOpenProductModal()}
            className="pixel-btn-red px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add drink</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategoryTab === "all"
                ? "bg-yellow-400 text-amber-950 border-yellow-400 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryTab(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategoryTab === c.id
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {c.name} ({products.filter((p) => p.categoryId === c.id).length})
            </button>
          ))}
        </div>

        {/* Product Cards Grid with 1:1 Images */}
        <div className="menu-product-grid">
          {displayedProducts.map((prod) => {
            const cat = categories.find((c) => c.id === prod.categoryId);
            return (
              <div
                key={prod.id}
                className="menu-product-card flex flex-col justify-between transition-all"
              >
                <div>
                  {/* 1:1 Aspect Ratio Image */}
                  <div className="menu-product-image w-full bg-slate-50 overflow-hidden relative flex items-center justify-center">
                    {prod.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="absolute inset-0 block w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-6xl">{prod.emoji}</span>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/95 text-red-600 px-2 py-0.5 rounded shadow-xs border border-slate-100">
                      {cat?.name || "Drink"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900">
                      {prod.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenProductModal(prod)}
                        className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Edit Drink"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isSaving}
                        onClick={() => void deleteItem(() => onDeleteProduct(prod.id))}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete Drink"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                {/* Variants List */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">
                    Pricing & Variants (INR):
                  </span>
                  <div className="space-y-1">
                    {prod.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center text-xs bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100"
                      >
                        <span className="text-slate-700 font-medium">{v.name}</span>
                        <span className="text-red-600 font-bold text-sm">
                          ₹{v.price.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              {menuError && <p role="alert" className="text-xs text-red-700">{menuError}</p>}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category Name* (e.g. Juices, Shakes)
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Shakes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category Tag / Short Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    placeholder="e.g. SHK"
                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-center uppercase"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    {["SHK", "JCE", "SMTH", "SPEC"].map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setCatIcon(tag)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-bold cursor-pointer text-[10px]"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Juices and shakes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 pixel-btn-white rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="pixel-btn-yellow rounded-lg px-5 py-2 text-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT WITH 1:1 CLOUDINARY IMAGE */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-red-600">
                {editingProduct ? "Edit Drink & Image" : "Add New Drink to Menu"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {productError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{productError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Mango Tango Punch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={prodEmoji}
                    onChange={(e) => setProdEmoji(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-lg text-center"
                  />
                </div>
              </div>

              {/* CLOUDINARY IMAGE FIELD (1:1 Ratio) */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    <span>Drink image URL</span>
                  </label>
                  <span className="text-[10px] font-bold bg-yellow-400 text-amber-950 px-2 py-0.5 rounded-full">
                    Image preview
                  </span>
                </div>

                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => { setProdImageUrl(e.target.value); setImageFailed(false); }}
                  placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500">
                  Use a clear product photo. Images crop to fill the drink card.
                </p>

                {/* Instant 1:1 Preview */}
                {prodImageUrl && (
                  <div className="mt-2 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="relative w-16 h-16 aspect-square bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={prodImageUrl}
                        src={prodImageUrl}
                        alt="Preview"
                        className="absolute inset-0 block w-full h-full object-cover"
                        onError={() => setImageFailed(true)}
                        onLoad={() => setImageFailed(false)}
                      />
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold">
                      {imageFailed ? "Image could not be loaded. Check the URL." : "Image preview"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category*
                </label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Fresh crushed mint, Alphonso mango pulp, squeezed lime..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* VARIANTS IN INR */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-red-600">
                    Variants & Pricing (INR - ₹)*
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded px-2.5 py-1 cursor-pointer hover:bg-slate-100"
                  >
                    + Add Size
                  </button>
                </div>

                <div className="space-y-2">
                  {prodVariants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-7">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) =>
                            handleUpdateVariant(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Regular 350ml"
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                        />
                      </div>
                      <div className="col-span-3 relative">
                        <span className="absolute left-2 top-1 text-xs text-slate-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="5"
                          min="0"
                          value={v.price}
                          onChange={(e) =>
                            handleUpdateVariant(idx, "price", e.target.value)
                          }
                          placeholder="120"
                          className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 text-xs text-red-600 font-bold text-right"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Remove variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 pixel-btn-white rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="pixel-btn-red rounded-lg px-5 py-2 text-xs cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
