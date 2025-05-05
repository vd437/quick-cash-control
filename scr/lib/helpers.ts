
// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString);
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate a date range for the past N days
export const getDateRangeForPastDays = (days: number): { from: Date; to: Date } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  // Set time to start and end of day
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  
  return { from, to };
};

// Get dates for today, this week, and this month
export const getDateRanges = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Week: Sunday to Saturday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return {
    today: {
      from: startOfToday,
      to: now
    },
    week: {
      from: startOfWeek,
      to: now
    },
    month: {
      from: startOfMonth,
      to: now
    }
  };
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Generate CSV data
export const generateCsv = (data: any[], headers: string[]): string => {
  // Create header row
  let csvContent = headers.join(',') + '\r\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header] ?? '';
      // Escape quotes and wrap in quotes if needed
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    });
    csvContent += row.join(',') + '\r\n';
  });
  
  return csvContent;
};

// Download data as a file
export const downloadFile = (data: string, filename: string, type: string): void => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate a simple print receipt
export const generateReceiptHtml = (sale: {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}): string => {
  const formattedDate = formatDate(sale.date, 'long');
  
  return `
    <html>
      <head>
        <title>Receipt #${sale.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
          }
          .receipt {
            width: 300px;
            margin: 0 auto;
          }
          .header, .footer {
            text-align: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-row {
            font-weight: bold;
            margin-top: 10px;
            text-align: right;
          }
          .info-row {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">Quick Cash Control</div>
            <div>123 Business Ave.</div>
            <div>contact@quickcashcontrol.com</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info-row">Receipt #: ${sale.id}</div>
          <div class="info-row">Date: ${formattedDate}</div>
          
          <div class="divider"></div>
          
          <div class="item-row">
            <div style="flex: 3;">${sale.productName}</div>
            <div style="flex: 1; text-align: right;">${sale.quantity}x</div>
            <div style="flex: 1; text-align: right;">${formatCurrency(sale.unitPrice)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="total-row">
            Total: ${formatCurrency(sale.totalPrice)}
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            Thank you for your business!
          </div>
        </div>
      </body>
    </html>
  `;
};

// Print receipt
export const printReceipt = (receiptHtml: string): void => {
  const printWindow = window.open('', 'PRINT', 'height=600,width=800');
  
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    alert('Please allow popups to print receipts');
  }
};

// Get percentage change between two numbers
export const getPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
