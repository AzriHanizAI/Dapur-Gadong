export const STORE = {
  name: 'Dapur Gadong',
  tagline: 'Home-cooked Bruneian favourites',
  location: 'Bandar Seri Begawan & Gadong',
  whatsappNumber: '6737131995',
  bankAccounts: {
    bibd_quickpay: {
      label: 'BIBD QuickPay',
      accountName: 'Dapur Gadong Sdn Bhd',
      accountNumber: '0010-15-2233445',
    },
    baiduri_qr: {
      label: 'Baiduri QR',
      accountName: 'Dapur Gadong Sdn Bhd',
      accountNumber: '6104-8899-0012',
    },
  },
};

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'signature', label: 'Signature Dishes' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'desserts', label: 'Desserts' },
] as const;

export const DELIVERY_ZONES = [
  { id: 'gadong', label: 'Gadong / Kiulap / Beribi', fee: 3.0 },
  { id: 'bsb', label: 'Bandar Seri Begawan / Kianggeh', fee: 4.0 },
  { id: 'jerudong', label: 'Jerudong / Sengkurong', fee: 5.0 },
  { id: 'tutong_kb', label: 'Tutong / Kuala Belait', fee: 8.0 },
];
