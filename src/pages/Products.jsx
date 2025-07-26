import { useState, useEffect, useCallback } from "react";
import { ProductTable } from "@/components/products/product-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUp, Loader2 } from "lucide-react";
import { exportProducts } from "@/ai/flows/export-products";
import { useToast } from "@/hooks/use-toast";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/products');
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    window.addEventListener('data-updated', fetchProducts);
    return () => {
        window.removeEventListener('data-updated', fetchProducts);
    };
  }, [fetchProducts]);

  const handleAddProduct = async (newProduct) => {
    try {
        await apiRequest('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        window.dispatchEvent(new Event('data-updated'));
        toast({
            title: "Product Added",
            description: `${newProduct.name} has been successfully added to your catalog.`,
        });
    } catch (error) {
        console.error("Error adding product:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add product. Please try again.",
        });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { csvData } = await exportProducts({
        productData: products,
      });

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "product_catalog.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({
        title: "Success",
        description: "Your product catalog has been downloaded.",
      })
    } catch (error) {
      console.error("Error exporting products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export products. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Product Catalog
        </h1>
        <p className="text-muted-foreground">
          Manage your products and inventory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                A list of all products in your store.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Export
                </Button>
                <AddProductDialog onAddProduct={handleAddProduct} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ProductTable products={products} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 