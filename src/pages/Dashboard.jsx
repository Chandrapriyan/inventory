import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, Users, Activity, AlertCircle } from "lucide-react";
import { HistoryTable } from "@/components/history/history-table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [billsData, productsData] = await Promise.all([
        apiRequest('/bills'),
        apiRequest('/products')
      ]);
      setBills(billsData);
      setProducts(productsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    window.addEventListener('data-updated', fetchData);
    return () => {
      window.removeEventListener('data-updated', fetchData);
    };
  }, [fetchData]);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const todaysRevenue = bills
    .filter(bill => bill.date === todayStr)
    .reduce((sum, bill) => sum + bill.total, 0);

  const weeklySalesCount = bills
    .filter(bill => new Date(bill.date) >= oneWeekAgo)
    .length;

  const lowStockProductsCount = products.filter(p => p.stock < 50).length;

  const recentBills = bills.slice(0, 5);

  const DashboardSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardContent></Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          A quick overview of your business.
        </p>
      </div>

      {isLoading ? <DashboardSkeleton /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{todaysRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Revenue for {today.toLocaleDateString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{weeklySalesCount}</div>
              <p className="text-xs text-muted-foreground">Transactions in the last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Feature coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Low in Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {lowStockProductsCount > 0 ? (
                <>
                  <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    {lowStockProductsCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Items need restocking</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{lowStockProductsCount}</div>
                  <p className="text-xs text-muted-foreground">All products well-stocked</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>A list of the most recent bills.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
           ) : (
            <HistoryTable bills={recentBills} />
           )}
        </CardContent>
      </Card>
    </div>
  );
} 