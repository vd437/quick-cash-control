import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fakeDb } from "@/lib/fakeDb";
import { formatCurrency } from "@/lib/helpers";
import { Product } from "@/lib/types";
import { useToast } from "../hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  Filter,
} from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { useLang } from "../contexts/LangContext";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "inStock" | "outOfStock">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLang();

  // Product form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    lowStockAlert: 5,
    imageUrl: "/placeholder.svg",
  });

  // Load products
  const fetchProducts = useCallback(async () => {
    try {
      const data = await fakeDb.products.findAll();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل المنتجات",
        description: "فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.",
      });
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "quantity" || name === "lowStockAlert" ? Number(value) : value,
    });
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      lowStockAlert: product.lowStockAlert || 5,
      imageUrl: product.imageUrl,
    });
    setDialogOpen(true);
  };

  // Save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Construct product object
      const productData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      
      // Update or create product
      if (currentProduct) {
        await fakeDb.products.update(currentProduct.id, {
          ...productData,
          createdAt: currentProduct.createdAt,
        });
        
        toast({
          title: t("productUpdated"),
        });
      } else {
        await fakeDb.products.create({
          ...productData,
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: t("productAdded"),
        });
      }
      
      // Reset form and refresh products
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ المنتج",
        description: "فشل في حفظ المنتج. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      await fakeDb.products.remove(productId);
      
      toast({
        title: t("productDeleted"),
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المنتج",
        description: "فشل في حذف المنتج. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      lowStockAlert: 5,
      imageUrl: "/placeholder.svg",
    });
    setCurrentProduct(null);
  };

  // Open dialog for new product
  const handleAddNewProduct = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        imageUrl,
      });
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Apply search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    let matchesFilter = true;
    if (filter === "low") {
      matchesFilter = product.quantity <= product.lowStockAlert && product.quantity > 0;
    } else if (filter === "outOfStock") {
      matchesFilter = product.quantity <= 0;
    } else if (filter === "inStock") {
      matchesFilter = product.quantity > product.lowStockAlert;
    }
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading && products.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{t("products")}</h1>
          
          <Button onClick={handleAddNewProduct}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("addProduct")}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'}`}
            />
          </div>
          
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as "all" | "low" | "inStock" | "outOfStock")}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <SelectValue placeholder={t("filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allProducts")}</SelectItem>
              <SelectItem value="low">{t("lowStockOnly")}</SelectItem>
              <SelectItem value="inStock">{t("inStockOnly")}</SelectItem>
              <SelectItem value="outOfStock">{t("outOfStockOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  {product.quantity <= product.lowStockAlert && (
                    <div className="shrink-0">
                      {product.quantity <= 0 ? (
                        <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-md inline-flex items-center">
                          <AlertTriangle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {t("outOfStock")}
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded-md inline-flex items-center">
                          <AlertTriangle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {t("lowStock")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.quantity > 0
                      ? `${product.quantity} ${t("unitsLeft")}`
                      : t("outOfStock")}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Pencil className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t("edit")}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t("delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteProduct")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("confirmDelete")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">{t("noData")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "لم يتم العثور على منتجات تطابق البحث" : "لا توجد منتجات متاحة"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? t("editProduct") : t("addProduct")}
            </DialogTitle>
            <DialogDescription>
              {currentProduct
                ? "قم بتعديل تفاصيل المنتج أدناه"
                : "أضف تفاصيل المنتج الجديد أدناه"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("productName")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">{t("productPrice")}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">{t("productQuantity")}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lowStockAlert">{t("lowStockThreshold")}</Label>
                <Input
                  id="lowStockAlert"
                  name="lowStockAlert"
                  type="number"
                  min="1"
                  value={formData.lowStockAlert}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t("productDescription")}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">{t("productImage")}</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded border">
                  <img
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">
                {currentProduct ? t("save") : t("add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Products;
