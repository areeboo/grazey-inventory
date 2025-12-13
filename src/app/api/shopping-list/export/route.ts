import { NextRequest, NextResponse } from 'next/server';
import type { ShoppingListItem } from '@/types/shopping-list';

// POST /api/shopping-list/export - Export shopping list to CSV or PDF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, format = 'csv' } = body as {
      items: ShoppingListItem[];
      format: 'csv' | 'pdf';
    };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid shopping list data' },
        { status: 400 }
      );
    }

    if (format === 'csv') {
      const csv = generateCSV(items);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="grazey-shopping-list-${formatDate()}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      // Generate HTML that can be printed as PDF
      const html = generatePrintableHTML(items);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="grazey-shopping-list-${formatDate()}.html"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use "csv" or "pdf"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error exporting shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to export shopping list', message: error.message },
      { status: 500 }
    );
  }
}

function formatDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function generateCSV(items: ShoppingListItem[]): string {
  const headers = ['Ingredient', 'Shopping Amount', 'Unit', 'Current Stock', 'Needed', 'Reason'];
  const rows = items.map((item) => [
    `"${item.ingredientName}"`,
    item.shoppingQuantity.toString(),
    item.unit,
    item.currentQuantity.toString(),
    item.neededQuantity.toString(),
    `"${formatReason(item.reason)}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function formatReason(reason: 'low_stock' | 'production_goal' | 'both'): string {
  switch (reason) {
    case 'low_stock':
      return 'Low Stock';
    case 'production_goal':
      return 'Production Goal';
    case 'both':
      return 'Low Stock + Production';
    default:
      return reason;
  }
}

function generatePrintableHTML(items: ShoppingListItem[]): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tableRows = items
    .map(
      (item) => `
      <tr>
        <td class="checkbox"><input type="checkbox" /></td>
        <td class="ingredient">${item.ingredientName}</td>
        <td class="amount">${item.shoppingQuantity} ${item.unit}</td>
        <td class="reason">${formatReason(item.reason)}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grazey Shopping List - ${date}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #e84c6f;
    }

    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #e84c6f;
      margin-bottom: 8px;
    }

    .date {
      color: #666;
      font-size: 14px;
    }

    .summary {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
      padding: 15px;
      background: #fef2f4;
      border-radius: 12px;
    }

    .summary-item {
      text-align: center;
    }

    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #e84c6f;
    }

    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th {
      background: #e84c6f;
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
    }

    th:first-child {
      border-radius: 8px 0 0 0;
      width: 40px;
    }

    th:last-child {
      border-radius: 0 8px 0 0;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }

    tr:hover {
      background: #fef2f4;
    }

    .checkbox {
      text-align: center;
    }

    .checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .ingredient {
      font-weight: 500;
    }

    .amount {
      font-weight: 600;
      color: #e84c6f;
    }

    .reason {
      font-size: 12px;
      color: #888;
    }

    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    @media print {
      body {
        padding: 20px;
      }

      .summary {
        background: none;
        border: 1px solid #e84c6f;
      }

      tr:hover {
        background: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🧀 Grazey Shopping List</div>
    <div class="date">${date}</div>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-value">${items.length}</div>
      <div class="summary-label">Total Items</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${items.filter((i) => i.reason === 'low_stock' || i.reason === 'both').length}</div>
      <div class="summary-label">Low Stock</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${items.filter((i) => i.reason === 'production_goal' || i.reason === 'both').length}</div>
      <div class="summary-label">For Production</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>✓</th>
        <th>Ingredient</th>
        <th>Amount</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    Generated by Grazey Inventory Tracker
  </div>

  <script>
    // Auto-print when opened
    // window.print();
  </script>
</body>
</html>
  `.trim();
}
