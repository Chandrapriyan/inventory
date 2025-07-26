export type Bill = {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const history: Bill[] = [
    { id: 'INV-2024001', customerName: 'John Doe', date: '2024-07-20', total: 16000.00, status: 'Paid' },
    { id: 'INV-2024002', customerName: 'Jane Smith', date: '2024-07-19', total: 37000.00, status: 'Paid' },
    { id: 'INV-2024003', customerName: 'Alpha Corp', date: '2024-07-19', total: 70000.00, status: 'Pending' },
    { id: 'INV-2024004', customerName: 'Beta Inc', date: '2024-07-18', total: 12000.00, status: 'Paid' },
    { id: 'INV-2024005', customerName: 'Gamma LLC', date: '2024-07-17', total: 34000.00, status: 'Overdue' },
    { id: 'INV-2024006', customerName: 'John Doe', date: '2024-07-15', total: 2900.00, status: 'Paid' },
    { id: 'INV-2024007', customerName: 'Delta Co', date: '2024-07-14', total: 83000.00, status: 'Paid' },
    { id: 'INV-2024008', customerName: 'Jane Smith', date: '2024-07-12', total: 6200.00, status: 'Paid' },
];
