// src/ai/flows/export-reports.ts

/**
 * @fileOverview A billing report export AI agent.
 *
 * - exportReports - A function that handles the billing report export process.
 * - ExportReportsInput - The input type for the exportReports function.
 * - ExportReportsOutput - The return type for the exportReports function.
 */

import {z} from 'zod';

const ExportReportsInputSchema = z.object({
  billData: z.array(z.any()).describe('The billing data to export.'),
  customerPreference: z.string().describe('The customer preference for organizing the report (date-wise, customer-wise, product-wise).'),
});
export type ExportReportsInput = z.infer<typeof ExportReportsInputSchema>;

const ExportReportsOutputSchema = z.object({
  csvData: z.string().describe('The CSV data for the exported report.'),
});
export type ExportReportsOutput = z.infer<typeof ExportReportsOutputSchema>;

export async function exportReports(input: ExportReportsInput): Promise<ExportReportsOutput> {
  // Mock implementation for browser compatibility
  const { billData } = input;
  
  // Create CSV headers
  const headers = ['Bill ID', 'Customer', 'Date', 'Total', 'Status'];
  
  // Convert bill data to CSV format
  const csvRows = billData.map((bill: any) => [
    bill.id || bill.billNumber || 'N/A',
    bill.customerName || bill.customer || 'N/A',
    bill.date || 'N/A',
    bill.total || '0',
    bill.status || 'Completed'
  ]);
  
  // Combine headers and data
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');
  
  return {
    csvData: csvContent
  };
}
