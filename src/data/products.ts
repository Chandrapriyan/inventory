export type Product = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
};

export const products: Product[] = [
  { id: 'PROD001', productId: 'PROD001', name: 'Premium Wireless Mouse', price: 6200.00, stock: 120 },
  { id: 'PROD002', productId: 'PROD002', name: 'Mechanical Keyboard', price: 10000.00, stock: 80 },
  { id: 'PROD003', productId: 'PROD003', name: '4K Ultra HD Monitor', price: 37500.00, stock: 50 },
  { id: 'PROD004', productId: 'PROD004', name: 'Bluetooth Speaker', price: 8300.00, stock: 200 },
  { id: 'PROD005', productId: 'PROD005', name: 'Webcam with Ring Light', price: 5400.00, stock: 95 },
  { id: 'PROD006', productId: 'PROD006', name: 'Ergonomic Office Chair', price: 29000.00, stock: 30 },
  { id: 'PROD007', productId: 'PROD007', name: 'USB-C Hub', price: 3750.00, stock: 150 },
  { id: 'PROD008', productId: 'PROD008', name: 'Laptop Stand', price: 2900.00, stock: 180 },
];
