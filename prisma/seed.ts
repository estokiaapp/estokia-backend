import { PrismaClient, UserType, SaleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operator123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@estokia.com',
      password: adminPassword,
      type: UserType.ADMIN,
      active: true,
    },
  });

  const operator = await prisma.user.create({
    data: {
      name: 'Operator User',
      email: 'operator@estokia.com',
      password: operatorPassword,
      type: UserType.OPERATOR,
      active: true,
    },
  });

  console.log('Created users:', { admin: admin.email, operator: operator.email });

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      description: 'Apparel and fashion items',
    },
  });

  const food = await prisma.category.create({
    data: {
      name: 'Food & Beverages',
      description: 'Food products and drinks',
    },
  });

  const home = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
    },
  });

  console.log('Created categories');

  // Create products
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        sku: 'ELEC-001',
        categoryId: electronics.id,
        costPrice: 15.0,
        sellingPrice: 29.99,
        currentStock: 150,
        minimumStock: 20,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: 'Ergonomic wireless mouse with USB receiver',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Cable',
        sku: 'ELEC-002',
        categoryId: electronics.id,
        costPrice: 5.0,
        sellingPrice: 12.99,
        currentStock: 300,
        minimumStock: 50,
        alertThresholdDays: 10,
        unitOfMeasure: 'UN',
        description: '1m USB-C charging cable',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Headphones',
        sku: 'ELEC-003',
        categoryId: electronics.id,
        costPrice: 35.0,
        sellingPrice: 79.99,
        currentStock: 45,
        minimumStock: 10,
        alertThresholdDays: 14,
        unitOfMeasure: 'UN',
        description: 'Over-ear noise cancelling headphones',
        active: true,
      },
    }),
    // Clothing
    prisma.product.create({
      data: {
        name: 'Cotton T-Shirt',
        sku: 'CLO-001',
        categoryId: clothing.id,
        costPrice: 8.0,
        sellingPrice: 19.99,
        currentStock: 200,
        minimumStock: 30,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: '100% cotton basic t-shirt',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jeans',
        sku: 'CLO-002',
        categoryId: clothing.id,
        costPrice: 25.0,
        sellingPrice: 59.99,
        currentStock: 80,
        minimumStock: 15,
        alertThresholdDays: 14,
        unitOfMeasure: 'UN',
        description: 'Classic fit denim jeans',
        active: true,
      },
    }),
    // Food & Beverages
    prisma.product.create({
      data: {
        name: 'Organic Coffee Beans',
        sku: 'FOOD-001',
        categoryId: food.id,
        costPrice: 10.0,
        sellingPrice: 24.99,
        currentStock: 120,
        minimumStock: 25,
        alertThresholdDays: 5,
        unitOfMeasure: 'KG',
        description: 'Premium arabica coffee beans',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Green Tea',
        sku: 'FOOD-002',
        categoryId: food.id,
        costPrice: 6.0,
        sellingPrice: 14.99,
        currentStock: 90,
        minimumStock: 20,
        alertThresholdDays: 7,
        unitOfMeasure: 'BOX',
        description: 'Organic green tea - 20 bags',
        active: true,
      },
    }),
    // Home & Garden
    prisma.product.create({
      data: {
        name: 'LED Light Bulb',
        sku: 'HOME-001',
        categoryId: home.id,
        costPrice: 4.0,
        sellingPrice: 9.99,
        currentStock: 250,
        minimumStock: 40,
        alertThresholdDays: 10,
        unitOfMeasure: 'UN',
        description: 'Energy efficient LED bulb 10W',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Garden Hose',
        sku: 'HOME-002',
        categoryId: home.id,
        costPrice: 15.0,
        sellingPrice: 34.99,
        currentStock: 30,
        minimumStock: 8,
        alertThresholdDays: 14,
        unitOfMeasure: 'UN',
        description: '15m expandable garden hose',
        active: true,
      },
    }),
    // Low stock product for testing alerts
    prisma.product.create({
      data: {
        name: 'Phone Screen Protector',
        sku: 'ELEC-004',
        categoryId: electronics.id,
        costPrice: 3.0,
        sellingPrice: 9.99,
        currentStock: 12,
        minimumStock: 20,
        alertThresholdDays: 5,
        unitOfMeasure: 'UN',
        description: 'Tempered glass screen protector',
        active: true,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Helper function to generate random sales
  const saleStatuses = [SaleStatus.PENDING, SaleStatus.COMPLETED, SaleStatus.CANCELLED];
  const users = [admin, operator];

  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomDate(daysBack: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(getRandomInt(8, 20), getRandomInt(0, 59), getRandomInt(0, 59));
    return date;
  }

  // Create 100 sales with random data
  const salesCount = 100;
  const createdSales = [];

  for (let i = 1; i <= salesCount; i++) {
    const status = getRandomElement(saleStatuses);
    const user = getRandomElement(users);
    const saleDate = getRandomDate(90); // Random date within last 90 days
    const itemCount = getRandomInt(1, 5); // 1 to 5 items per sale

    // Select random products for this sale
    const saleProducts = [];
    const usedProductIds = new Set();

    for (let j = 0; j < itemCount; j++) {
      let product;
      do {
        product = getRandomElement(products);
      } while (usedProductIds.has(product.id));

      usedProductIds.add(product.id);

      const quantity = getRandomInt(1, 10);
      const unitPrice = product.sellingPrice || 0;
      const subtotal = quantity * unitPrice;

      saleProducts.push({
        productId: product.id,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    const totalAmount = saleProducts.reduce((sum, item) => sum + item.subtotal, 0);

    const sale = await prisma.sale.create({
      data: {
        saleNumber: `SALE-2025-${String(i).padStart(4, '0')}`,
        userId: user.id,
        status,
        saleDate,
        totalAmount,
        saleItems: {
          create: saleProducts,
        },
      },
      include: {
        saleItems: true,
      },
    });

    createdSales.push(sale);

    // Log progress every 20 sales
    if (i % 20 === 0) {
      console.log(`Created ${i}/${salesCount} sales...`);
    }
  }

  console.log(`Created ${createdSales.length} sales with ${createdSales.reduce((sum, sale) => sum + sale.saleItems.length, 0)} total items`);

  // Count sales by status
  const statusCounts = createdSales.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Sales by status:', statusCounts);

  // Create demand forecasts
  await Promise.all([
    prisma.demandForecast.create({
      data: {
        productId: products[0].id, // Wireless Mouse
        daysToStockout: 45,
        averageDailyDemand: 3.5,
        confidenceLevel: 0.85,
        historicalData: JSON.stringify([
          { date: '2025-01-01', quantity: 3 },
          { date: '2025-01-02', quantity: 4 },
          { date: '2025-01-03', quantity: 3 },
        ]),
        calculationDate: new Date(),
      },
    }),
    prisma.demandForecast.create({
      data: {
        productId: products[1].id, // USB-C Cable
        daysToStockout: 60,
        averageDailyDemand: 5.0,
        confidenceLevel: 0.90,
        historicalData: JSON.stringify([
          { date: '2025-01-01', quantity: 5 },
          { date: '2025-01-02', quantity: 6 },
          { date: '2025-01-03', quantity: 4 },
        ]),
        calculationDate: new Date(),
      },
    }),
    prisma.demandForecast.create({
      data: {
        productId: products[9].id, // Screen Protector (low stock)
        daysToStockout: 3,
        averageDailyDemand: 4.0,
        confidenceLevel: 0.75,
        historicalData: JSON.stringify([
          { date: '2025-01-01', quantity: 3 },
          { date: '2025-01-02', quantity: 5 },
          { date: '2025-01-03', quantity: 4 },
        ]),
        calculationDate: new Date(),
      },
    }),
    prisma.demandForecast.create({
      data: {
        productId: products[5].id, // Coffee Beans
        daysToStockout: 20,
        averageDailyDemand: 6.0,
        confidenceLevel: 0.88,
        historicalData: JSON.stringify([
          { date: '2025-01-01', quantity: 6 },
          { date: '2025-01-02', quantity: 7 },
          { date: '2025-01-03', quantity: 5 },
        ]),
        calculationDate: new Date(),
      },
    }),
  ]);

  console.log('Created demand forecasts');

  console.log('\n=== Seed completed successfully! ===');
  console.log('\nDefault credentials:');
  console.log('Admin - Email: admin@estokia.com, Password: admin123');
  console.log('Operator - Email: operator@estokia.com, Password: operator123');
  console.log('\nDatabase seeded with:');
  console.log('- 2 users (1 admin, 1 operator)');
  console.log('- 4 categories');
  console.log('- 10 products');
  console.log(`- ${createdSales.length} sales with multiple items`);
  console.log('- 4 demand forecasts');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
