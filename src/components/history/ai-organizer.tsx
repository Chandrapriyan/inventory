;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizeBillingHistory } from "@/ai/flows/billing-history-organizer";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export function AiOrganizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState("");
  const [preference, setPreference] = useState("date-wise");
  const [organizedHistory, setOrganizedHistory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!billingHistory) return;
    setIsLoading(true);
    setOrganizedHistory("");
    try {
      const result = await organizeBillingHistory({
        billingHistory,
        customerPreference: preference,
      });
      setOrganizedHistory(result.organizedBillingHistory);
    } catch (error) {
      console.error("Error organizing billing history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to organize billing history. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Wand2 className="mr-2 h-4 w-4" />
        AI Bill Organizer
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Bill Organizer</DialogTitle>
            <DialogDescription>
              Paste your billing history and let AI organize it for you based on
              your preference.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="history-input">Billing History</Label>
              <Textarea
                id="history-input"
                placeholder="Paste your unstructured billing data here..."
                rows={8}
                value={billingHistory}
                onChange={(e) => setBillingHistory(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preference">Organize By</Label>
              <Select value={preference} onValueChange={setPreference}>
                <SelectTrigger id="preference" className="w-[180px]">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-wise">Date-wise</SelectItem>
                  <SelectItem value="customer-wise">Customer-wise</SelectItem>
                  <SelectItem value="product-wise">Product-wise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {organizedHistory && (
              <div className="grid gap-2">
                <Label htmlFor="organized-output">Organized History</Label>
                <Textarea
                    id="organized-output"
                    readOnly
                    value={organizedHistory}
                    rows={8}
                    className="bg-muted"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Organize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
