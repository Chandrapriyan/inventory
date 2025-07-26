import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Printer, Trash2, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function Billing() {
  const [billItems, setBillItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState();
  const [quantity, setQuantity] = useState(1);
  const [gstRate, setGstRate] = useState(18); // 18% GST
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [sellingOrders, setSellingOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Default to Cash
  const [productSearch, setProductSearch] = useState("");
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    const newBillNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    setBillNumber(newBillNumber);
    setBillDate(new Date().toLocaleDateString('en-CA'));

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

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = products.find((p) => p.productId === selectedProductId);
    if (!product) return;

    const existingItemIndex = billItems.findIndex(
      (item) => item.product.productId === selectedProductId
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...billItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setBillItems(updatedItems);
    } else {
      setBillItems([...billItems, { product, quantity }]);
    }
    setSelectedProductId(undefined);
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setBillItems(billItems.filter(item => item.product.productId !== productId));
  };

  const totals = useMemo(() => {
    const subtotal = billItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const gstAmount = (subtotal * gstRate) / 100;
    const grandTotal = subtotal + gstAmount - discount;
    return { subtotal, gstAmount, grandTotal };
  }, [billItems, gstRate, discount]);

  const handleSaveAndPrint = async () => {
    if (billItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Bill',
        description: 'Please add at least one item to the bill.',
      });
      return;
    }
    setIsSaving(true);

    const billData = {
      customerId,
      customerName: customerName || "Valued Customer",
      billNumber,
      billDate,
      items: billItems.map(item => ({
        productId: item.product.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total: totals.grandTotal,
      paymentMethod,
    };

    try {
      const newBill = await apiRequest('/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });

      const newSellingOrder = {
          id: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: newBill.customerName,
          date: newBill.date,
          total: newBill.total,
          status: "Processing",
      };
      setSellingOrders(prevOrders => [newSellingOrder, ...prevOrders]);

      toast({
        title: 'Bill Saved',
        description: 'The bill has been successfully saved.',
      });
      window.dispatchEvent(new CustomEvent('data-updated'));
      window.print();
      setBillItems([]);
      setCustomerName('');
      setDiscount(0);
      setBillNumber(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      setBillDate(new Date().toLocaleDateString('en-CA'));

    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the bill. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1 space-y-8 no-print">
         <div>
            <h1 className="text-3xl font-headline font-semibold tracking-tight">
                Create Bill
            </h1>
            <p className="text-muted-foreground">
                Add products and customer details to generate an invoice.
            </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="product-search">Search Product</Label>
              <Input
                id="product-search"
                placeholder="Type to search..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(product =>
                      product.name.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .map((product) => (
                      <SelectItem key={product.productId} value={product.productId}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              />
            </div>
             <Button onClick={handleAddItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Customer & Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input id="customerId" placeholder="Enter customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" placeholder="Enter customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                    <Label htmlFor="gst" className="flex items-center gap-2">GST (%)</Label>
                    <Input id="gst" type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} className="w-24 h-8" />
                </div>
                 <div className="flex justify-between items-center">
                     <Label htmlFor="discount">Discount (₹)</Label>
                     <Input id="discount" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod">
                            <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-8">
        <div className="flex justify-between items-center no-print">
            <div>
                <h2 className="text-2xl font-headline font-semibold">Invoice Preview</h2>
                <p className="text-muted-foreground">This is how your bill will look.</p>
            </div>
            <Button onClick={handleSaveAndPrint} variant="outline" disabled={isSaving || billItems.length === 0}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                Save & Print Bill
            </Button>
        </div>
        <Card className="p-8" id="invoice-preview">
          <CardHeader className="p-0 mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Logo />
                        <h1 className="text-2xl font-headline font-bold text-primary">Invoicify</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">123 Market Street, Suite 450</p>
                    <p className="text-sm text-muted-foreground">Commerce City, CC 12345</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold">Invoice</h2>
                    <p className="text-sm text-muted-foreground">{billNumber}</p>
                    <p className="text-sm text-muted-foreground">Date: {billDate}</p>
                </div>
            </div>
             <Separator className="my-6"/>
             <div>
                <h3 className="font-semibold mb-1">Bill To:</h3>
                <p className="text-sm">{customerName || 'Valued Customer'}</p>
             </div>
          </CardHeader>
          <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-10 print-hide"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {billItems.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No items added yet.</TableCell></TableRow>}
                    {billItems.map(item => (
                        <TableRow key={item.product.productId}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">₹{item.product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                             <TableCell className="text-right print-hide">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item.product.productId)}>
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            {billItems.length > 0 && (
                <CardFooter className="flex flex-col items-end p-0 mt-8 space-y-4">
                    <Separator />
                    <div className="w-full max-w-xs space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">GST ({gstRate}%)</span>
                            <span className="font-medium">₹{totals.gstAmount.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="font-medium">-₹{discount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                            <span>Grand Total</span>
                            <span>₹{totals.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="text-center w-full pt-6">
                        <p className="text-sm font-semibold">Thank you for your purchase!</p>
                        <p className="text-xs text-muted-foreground">Please contact us if you have any questions.</p>
                    </div>
                </CardFooter>
            )}
        </Card>
        <style jsx="true" global="true">{`
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none;
            }
            #invoice-preview, #invoice-preview * {
              visibility: visible;
            }
            #invoice-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 0;
            }
            .print-hide {
                display: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 