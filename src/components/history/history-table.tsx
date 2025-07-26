import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Bill } from "@/data/history";

interface HistoryTableProps {
  bills: Bill[];
}

const getBadgeVariant = (status: Bill["status"]) => {
  switch (status) {
    case "Paid":
      return "default";
    case "Pending":
      return "secondary";
    case "Overdue":
      return "destructive";
    default:
      return "outline";
  }
};

export function HistoryTable({ bills }: HistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => (
          <TableRow key={bill.id}>
            <TableCell className="font-medium">{bill.id}</TableCell>
            <TableCell>{bill.customerName}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(bill.status)}>{bill.status}</Badge>
            </TableCell>
            <TableCell>{bill.date}</TableCell>
            <TableCell className="text-right">₹{bill.total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
