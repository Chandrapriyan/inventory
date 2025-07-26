import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";

export default function Orders() {
  const [sellingOrders, setSellingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    orderId: '',
    customerId: '',
    customerName: '',
    date: '',
    status: '',
    total: '',
  });
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedOrder, setExtractedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/orders');
      setSellingOrders(data.sellingOrders);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handleDataUpdate = () => {
      fetchOrders();
    };
    fetchOrders();
    window.addEventListener('data-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('data-updated', handleDataUpdate);
    };
  }, [fetchOrders]);

  useEffect(() => {
    // Fetch products for product search/selection
    const fetchProducts = async () => {
      try {
        const data = await apiRequest('/products');
        setProducts(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch products.",
        });
      }
    };
    fetchProducts();
  }, [toast]);

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      const data = await apiRequest('/purchase-orders');
      setPurchaseOrders(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch purchase orders.",
      });
    }
  }, [toast]);
  useEffect(() => { fetchPurchaseOrders(); }, [fetchPurchaseOrders]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image (JPEG, PNG) or PDF file.",
      });
      return;
    }

    setIsScanning(true);
    setShowScanDialog(true);

    try {
      const formData = new FormData();
      formData.append('bill', file);

      const response = await fetch('/api/scan-bill', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to scan bill');
      }

      const data = await response.json();
      setScannedData(data);
      
      toast({
        title: "Bill scanned successfully",
        description: "Purchase order data has been extracted.",
      });

    } catch (error) {
      console.error('Error scanning bill:', error);
      toast({
        variant: "destructive",
        title: "Scanning failed",
        description: "Failed to extract data from the bill. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveScannedOrder = async () => {
    if (!scannedData) return;

    // Store each item as a separate order
    if (scannedData.items && Array.isArray(scannedData.items)) {
      setSellingOrders((prev) => [
        ...scannedData.items.map((item, idx) => {
          // Sanitize item name for ID
          const safeItemName = (item.name || 'Item').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
          return {
            id: `${safeItemName}-${Date.now()}-${idx+1}`,
            vendor: item.vendor || scannedData.supplier || '',
            date: new Date().toISOString().slice(0, 10),
            status: 'Scanned',
            total: parseFloat(item.price) * parseInt(item.quantity),
            imageUrl: scannedData.imageUrl || '',
            itemName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          };
        }),
        ...prev,
      ]);
      toast({
        title: 'Purchase orders saved',
        description: 'Each item has been saved as a separate purchase order.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'No items found',
        description: 'No items were extracted from the bill.',
      });
    }
    setScannedData(null);
    setShowScanDialog(false);
  };

  const handleAddOrderItem = () => {
    if (!selectedProductId || orderQuantity <= 0) return;
    const product = products.find((p) => p.productId === selectedProductId);
    if (!product) return;
    const existingIndex = orderItems.findIndex(item => item.productId === selectedProductId);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += orderQuantity;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: orderQuantity,
      }]);
    }
    setSelectedProductId("");
    setOrderQuantity(1);
  };
  const handleRemoveOrderItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  // Handle input changes for the new order form
  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };
  // Handle image upload for the new order form
  const handleNewOrderImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewOrder((prev) => ({ ...prev, image: file, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };
  // Handle form submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.orderId || !newOrder.customerId || !newOrder.customerName || !newOrder.date || !newOrder.status || orderItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all fields and add at least one product.',
      });
      return;
    }
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderPayload = {
      orderId: newOrder.orderId,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
        date: newOrder.date,
        status: newOrder.status,
      items: orderItems,
      total,
    };
    try {
      await apiRequest('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
    setShowCreateDialog(false);
      setNewOrder({ orderId: '', customerId: '', customerName: '', date: '', status: '', total: '' });
      setOrderItems([]);
      toast({ title: 'Order added', description: 'Order added successfully.' });
      fetchOrders();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add order. Please try again.',
      });
    }
  };

  const handlePurchaseOrderUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('bill', file);
      const response = await apiRequest('/purchase-orders/upload', {
        method: 'POST',
        body: formData,
      });
      setExtractedOrder(response);
      fetchPurchaseOrders();
      toast({ title: 'Purchase order extracted and saved.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to extract purchase order.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Orders
        </h1>
        <p className="text-muted-foreground">
          Manage your purchase and selling orders.
        </p>
      </div>
      <Tabs defaultValue="selling">
        <div className="flex justify-between items-center">
            <TabsList>
                <TabsTrigger value="selling">Selling Orders</TabsTrigger>
                <TabsTrigger value="purchase">Purchase Orders</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Scan Bill
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Scan Purchase Order Bill</DialogTitle>
                    <DialogDescription>
                      Upload an image or PDF of a purchase order bill to extract data automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bill-upload">Upload Bill</Label>
                      <Input
                        id="bill-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={isScanning}
                      />
                    </div>
                    
                    {isScanning && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning bill and extracting data...
                      </div>
                    )}

                    {scannedData && (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Extracted Data</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Supplier:</strong> {scannedData.supplier}</div>
                            <div><strong>Total Amount:</strong> ₹{scannedData.totalAmount}</div>
                            <div><strong>Items:</strong></div>
                            <ul className="list-disc list-inside ml-4">
                              {scannedData.items.map((item, index) => (
                                <li key={index}>
                                  {item.name} - Qty: {item.quantity} - ₹{item.price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveScannedOrder} className="flex-1">
                            Save Purchase Order
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setScannedData(null);
                              setShowScanDialog(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => setShowCreateDialog(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Order
              </Button>
            </div>
        </div>
        <TabsContent value="selling">
          <Card>
            <CardHeader>
              <CardTitle>Selling Orders</CardTitle>
              <CardDescription>
                A list of all selling orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
             ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellingOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No selling orders yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {sellingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell className="text-right">
                        ₹{order.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Upload a bill image to extract and save purchase order details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="purchase-bill-upload">Upload Bill Image</Label>
                <Input
                  id="purchase-bill-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePurchaseOrderUpload}
                  disabled={isUploading}
                />
                {isUploading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
              </div>
              {extractedOrder && (
                <div className="mb-6 border rounded p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">Extracted Purchase Order</h4>
                  <div className="mb-2">Customer: {extractedOrder.customerName} ({extractedOrder.contact})</div>
                  <div className="mb-2">Payment Mode: {extractedOrder.paymentMode}</div>
                  <div className="mb-2">Subtotal: ₹{extractedOrder.subtotal}</div>
                  <div className="mb-2">GST: ₹{extractedOrder.gst}</div>
                  <div className="mb-2">Total Amount: ₹{extractedOrder.totalAmount}</div>
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Unit Price (₹)</th>
                        <th>Total Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedOrder.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.no}</td>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice}</td>
                          <td>{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <h4 className="font-semibold mb-2">All Purchase Orders</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Products</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No purchase orders yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {purchaseOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.contact}</TableCell>
                      <TableCell>{order.paymentMode}</TableCell>
                      <TableCell>₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <ul>
                          {order.products.map((item, idx) => (
                            <li key={idx}>{item.name} (x{item.quantity})</li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>Enter details for the new purchase order.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateOrder}>
            <div>
              <Label htmlFor="order-id">Order ID</Label>
              <Input id="order-id" name="orderId" value={newOrder.orderId} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="customer-id">Customer ID</Label>
              <Input id="customer-id" name="customerId" value={newOrder.customerId} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input id="customer-name" name="customerName" value={newOrder.customerName} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={newOrder.date} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" value={newOrder.status} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input id="total" name="total" type="number" value={newOrder.total} onChange={handleNewOrderChange} required />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleNewOrderImage} />
              {newOrder.imageUrl && (
                <img src={newOrder.imageUrl} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-search">Add Product</Label>
              <div className="flex gap-2">
                <Input
                  id="product-search"
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => handleAddOrderItem()}>Add</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Selected Products:</h4>
                {orderItems.length === 0 && (
                  <p>No products selected yet.</p>
                )}
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span>{item.name} (Qty: {item.quantity})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOrderItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">Add Order</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 