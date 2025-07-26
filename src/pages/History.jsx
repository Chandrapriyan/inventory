import { useState, useEffect, useCallback } from "react";
import { HistoryTable } from "@/components/history/history-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AiOrganizer } from "@/components/history/ai-organizer";
import { exportReports } from "@/ai/flows/export-reports";
import { FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/history');
      setHistory(data);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transaction history.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
    window.addEventListener('data-updated', fetchHistory);
    return () => {
      window.removeEventListener('data-updated', fetchHistory);
    };
  }, [fetchHistory]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { csvData } = await exportReports({
        billData: bills,
        customerPreference: "date-wise",
      });

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "billing_report.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({
        title: "Success",
        description: "Your report has been downloaded.",
      })
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export report. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Transaction History
        </h1>
        <p className="text-muted-foreground">
          Review and manage all past transactions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All History</CardTitle>
              <CardDescription>
                A list of all bill and order actions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AiOrganizer />
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
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Type</th>
                  <th className="text-left">Reference</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">Details</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{h.type}</td>
                    <td>{h.refId}</td>
                    <td>{h.action}</td>
                    <td>{h.details}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 