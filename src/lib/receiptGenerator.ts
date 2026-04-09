import type { BookingWithProperty } from '../types/database';

export function generateReceipt(booking: BookingWithProperty): void {
  const checkInDate = new Date(booking.check_in).toLocaleDateString();
  const checkOutDate = new Date(booking.check_out).toLocaleDateString();
  const bookingDate = new Date(booking.created_at).toLocaleDateString();

  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const subtotal = booking.property.price_per_night * nights;
  const serviceFee = subtotal * 0.1;

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Receipt - ${booking.booking_reference}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #f97316;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            display: inline-block;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #f97316, #ec4899);
            border-radius: 12px;
            color: white;
            font-size: 32px;
            font-weight: bold;
            line-height: 60px;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #111;
            margin: 10px 0;
          }
          .receipt-title {
            font-size: 20px;
            color: #666;
            margin: 5px 0;
          }
          .section {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #111;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #555;
          }
          .value {
            color: #333;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 20px;
            font-weight: bold;
            color: #111;
            border-top: 2px solid #333;
            margin-top: 10px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-confirmed {
            background: #dcfce7;
            color: #166534;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">H</div>
          <div class="company-name">House Rental Marketplace</div>
          <div class="receipt-title">Booking Receipt</div>
        </div>

        <div class="section">
          <div class="section-title">Booking Information</div>
          <div class="info-row">
            <span class="label">Booking Reference:</span>
            <span class="value"><strong>${booking.booking_reference}</strong></span>
          </div>
          <div class="info-row">
            <span class="label">Booking Date:</span>
            <span class="value">${bookingDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
              <span class="status-badge status-${booking.status}">${booking.status}</span>
            </span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Property Details</div>
          <div class="info-row">
            <span class="label">Property:</span>
            <span class="value">${booking.property.title}</span>
          </div>
          <div class="info-row">
            <span class="label">Location:</span>
            <span class="value">${booking.property.location}</span>
          </div>
          <div class="info-row">
            <span class="label">Check-in:</span>
            <span class="value">${checkInDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Check-out:</span>
            <span class="value">${checkOutDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Nights:</span>
            <span class="value">${nights}</span>
          </div>
          <div class="info-row">
            <span class="label">Guests:</span>
            <span class="value">${booking.guests}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="info-row">
            <span class="label">₹${booking.property.price_per_night} × ${nights} nights:</span>
            <span class="value">₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label">Service Fee (10%):</span>
            <span class="value">₹${serviceFee.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Total Amount:</span>
            <span>₹${booking.total_price.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for booking with House Rental Marketplace!</p>
          <p>For questions or support, please contact us.</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
