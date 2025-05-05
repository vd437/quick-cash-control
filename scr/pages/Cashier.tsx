
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatCurrency, printReceipt, generateReceiptHtml } from "@/lib/helpers";
import { fakeDb } from "@/lib/fakeDb";
import { Product, Sale } from "@/lib/types";
import { useToast } from "../hooks/use-toast";
import {
  CheckCircle2,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

const Cashier = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);

  const { toast } = useToast();

  // Fetch products
  const fetchProducts = async () => {
    try {
      const data = await fakeDb.products.findAll();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error loading products",
        description: "Failed to load products. Please try again.",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate total based on selected product and quantity
  const calculateTotal = () => {
    if (!selectedProductId) return 0;
    const product = products.find((p) => p.id === parseInt(selectedProductId));
    return product ? product.price * quantity : 0;
  };

  const total = calculateTotal();

  // Get selected product details
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === parseInt(selectedProductId))
    : null;

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (selectedProduct && value > 0 && value <= selectedProduct.quantity) {
      setQuantity(value);
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a product.",
      });
      return;
    }

    if (quantity <= 0 || quantity > selectedProduct.quantity) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${selectedProduct.quantity}.`,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create sale record
      const newSale = await fakeDb.sales.create({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        totalPrice: total,
        date: new Date().toISOString()
      });
      
      setCurrentSale(newSale);
      setShowSuccessDialog(true);
      
      // Reset form
      setSelectedProductId("");
      setQuantity(1);
      
      // Refresh products to get updated quantities
      await fetchProducts();
      
      toast({
        title: "Sale completed",
        description: `Successfully sold ${quantity} ${
          quantity === 1 ? "unit" : "units"
        } of ${selectedProduct.name}.`,
      });
    } catch (error) {
      console.error("Error processing sale:", error);
      toast({
        variant: "destructive",
        title: "Sale failed",
        description:
          "Failed to process the sale. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle printing receipt
  const handlePrintReceipt = () => {
    if (!currentSale) return;
    
    const receiptHtml = generateReceiptHtml(currentSale);
    printReceipt(receiptHtml);
  };

  if (isLoading && products.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cashier</h1>
        <p className="text-muted-foreground mt-1">
          Select a product and enter the quantity to make a sale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Selection Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">New Sale</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Product Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                          disabled={product.quantity === 0}
                        >
                          <div className="flex justify-between w-full">
                            <span>
                              {product.name}
                              {product.quantity <= product.lowStockAlert && (
                                <span className="text-amber-500 ml-2 text-xs">
                                  (Low Stock)
                                </span>
                              )}
                            </span>
                            <span className="text-muted-foreground">
                              {product.quantity > 0
                                ? `${product.quantity} in stock`
                                : "Out of stock"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Input with +/- buttons */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || !selectedProductId}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                      className="mx-2 text-center"
                      disabled={!selectedProductId}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        !selectedProduct ||
                        quantity >= selectedProduct.quantity
                      }
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct.quantity} units available
                    </p>
                  )}
                </div>

                {/* Selected Product Details */}
                {selectedProduct && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md">
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{selectedProduct.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatCurrency(selectedProduct.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProductId("");
                    setQuantity(1);
                  }}
                  disabled={!selectedProductId}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <Button
                  onClick={handleCheckout}
                  disabled={!selectedProductId || quantity <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Complete Sale
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">Sale Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">
                    {selectedProduct ? selectedProduct.name : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{selectedProductId ? quantity : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span>
                    {selectedProduct
                      ? formatCurrency(selectedProduct.price)
                      : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-success" />
              Sale Completed Successfully
            </DialogTitle>
            <DialogDescription>
              The sale has been processed and inventory updated.
            </DialogDescription>
          </DialogHeader>
          
          {currentSale && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span>{currentSale.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{currentSale.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">
                  {formatCurrency(currentSale.totalPrice)}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="w-full flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
              >
                Close
              </Button>
              <Button onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cashier;
