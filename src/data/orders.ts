export type SellingOrder = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
};

export type PurchaseOrder = {
  id: string;
  vendor: string;
  date: string;
  total: number;
  status: 'Pending' | 'Received' | 'Cancelled';
};

export const sellingOrders: SellingOrder[] = [
  {
    id: "SO-001",
    customer: "Customer X",
    date: "2024-07-21",
    total: 25000,
    status: "Shipped",
  },
  {
    id: "SO-002",
    customer: "Customer Y",
    date: "2024-07-20",
    total: 100000,
    status: "Processing",
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-001",
    vendor: "Supplier A",
    date: "2024-07-21",
    total: 125000,
    status: "Received",
  },
  {
    id: "PO-002",
    vendor: "Supplier B",
    date: "2024-07-20",
    total: 20000,
    status: "Pending",
  },
];
