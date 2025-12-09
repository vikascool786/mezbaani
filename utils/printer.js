const escpos = require('escpos');
escpos.Network = require('escpos-network');
const device = new escpos.Network('192.168.0.4'); // Replace with your printer's IP
const printer = new escpos.Printer(device);

const formatKOTLine = (qty, name) => {
  const maxLineWidth = 42; // For 80mm printer
  const qtyStr = String(qty).padStart(2, ' '); // e.g., " 2"
  const indent = '    '; // For lines after the first
  const words = name.split(' ');
  const lines = [];
  let currentLine = `${qtyStr}   `;

  for (const word of words) {
    if ((currentLine + word).length > maxLineWidth) {
      lines.push(currentLine.trim());
      currentLine = indent + word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
};



const printReceipt = async (order) => {
  return new Promise((resolve, reject) => {
    device.open((err) => {
      if (err) return reject(err);

      const divider = '-'.repeat(42);
      const now = new Date().toLocaleString();

      printer
        .encode('GB18030') // ✅ Fix Chinese characters
        .align('CT')
        .style('B')
        .text('Mezbaani Restaurant')
        .style('NORMAL')
        .text('123 Food Street, City')
        .text('+91-9876543210')
        .text(divider)
        .align('LT')
        .text(`Order ID : ${order.id}`)
        .text(`Table    : ${order.tableId}`)
        .text(`Date     : ${now}`)
        .text(divider)
        .text(`Item                     Qty   Price`)
        .text(divider);

      order.items.forEach(item => {
        const name = item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name;
        const qty = String(item.quantity).padStart(3);
        const price = `Rs.${(item.price * item.quantity).toFixed(2)}`.padStart(8);
        printer.text(`${name.padEnd(24)} ${qty} ${price}`);
      });

      printer
        .text(divider)
        .align('RT')
        .style('B')
        .text(`Subtotal: Rs.${order.total.toFixed(2)}`)
        .feed(2)
        .align('CT')
        .text('Thank You for Dining!')
        .text('Powered by Mezbaani POS')
        .cut()
        .close(resolve);
    });
  });
};

const printKOT = async (order) => {
  return new Promise((resolve, reject) => {
    device.open((err) => {
      if (err) return reject(err);

      const divider = '-'.repeat(42);
      const now = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      printer
        .encode('UTF-8')
        .align('CT')
        .style('B')
        .text('🧾 KOT - Mezbaani Kitchen')
        .style('NORMAL')
        .text(divider)
        .align('LT')
        .text(`Table: ${order.tableId}       Order: ${order.id}`)
        .text(`Time : ${now}`)
        .text(divider)
        .text(`Qty   Item`)
        .text(divider);

      order.items.forEach(item => {
        const lines = formatKOTLine(item.quantity, item.name);
        lines.forEach(line => printer.text(line));
      });


      printer
        .text(divider)
        .feed(2)
        .cut()
        .close(resolve);
    });
  });
};

module.exports = { printReceipt, printKOT };
