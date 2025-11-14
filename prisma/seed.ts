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

  // Helper functions
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

  // Create sales with controlled distribution for different confidence levels
  // Products are assigned different confidence levels based on sales volume

  const confidenceLevels = [
    {
      name: 'VERY_LOW',
      products: [products[9]], // Phone Screen Protector
      salesCount: 5, // 1-7 sales
      daysBack: 60,
      description: '❌ Very Low Confidence (5 sales)'
    },
    {
      name: 'LOW',
      products: [products[3], products[4]], // Cotton T-Shirt, Denim Jeans
      salesCount: 12, // 8-14 sales
      daysBack: 60,
      description: '⚠️ Low Confidence (12 sales)'
    },
    {
      name: 'MEDIUM',
      products: [products[0], products[6]], // Wireless Mouse, Green Tea
      salesCount: 22, // 15-29 sales
      daysBack: 60,
      description: '🟡 Medium Confidence (22 sales)'
    },
    {
      name: 'HIGH',
      products: [products[1], products[2]], // USB-C Cable, Bluetooth Headphones
      salesCount: 45, // 30-59 sales
      daysBack: 90,
      description: '🟢 High Confidence (45 sales)'
    },
    {
      name: 'VERY_HIGH',
      products: [products[5], products[7], products[8]], // Coffee Beans, LED Light Bulb, Garden Hose
      salesCount: 70, // 60+ sales
      daysBack: 90,
      description: '✅ Very High Confidence (70 sales)'
    }
  ];

  const createdSales = [];
  let saleNumber = 1;

  console.log('\n📊 Creating sales with different confidence levels:\n');

  for (const level of confidenceLevels) {
    console.log(`${level.description}`);

    for (const product of level.products) {
      // Create specified number of sales for this product
      for (let i = 0; i < level.salesCount; i++) {
        const status = getRandomElement(saleStatuses);
        const user = getRandomElement(users);
        const saleDate = getRandomDate(level.daysBack);
        const quantity = getRandomInt(1, 5);
        const unitPrice = product.sellingPrice || 0;
        const subtotal = Math.round(quantity * unitPrice * 100) / 100;
        const totalAmount = subtotal;

        const sale = await prisma.sale.create({
          data: {
            saleNumber: `SALE-2025-${String(saleNumber).padStart(4, '0')}`,
            userId: user.id,
            status,
            saleDate,
            totalAmount,
            saleItems: {
              create: [{
                productId: product.id,
                quantity,
                unitPrice,
                subtotal,
              }]
            },
          },
          include: {
            saleItems: true,
          },
        });

        createdSales.push(sale);
        saleNumber++;
      }

      console.log(`  - ${product.name}: ${level.salesCount} sales`);
    }
  }

  console.log(`\n✅ Created ${createdSales.length} total sales\n`);

  // Count sales by status
  const statusCounts = createdSales.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Sales by status:', statusCounts);

  // Note: Demand forecasts are now created by the ML prediction script (POST /api/predictions/sales/:userId)
  // The forecasts require userId and use ConfidenceLevel enum (VERY_LOW, LOW, MEDIUM, HIGH, VERY_HIGH)

  console.log('\n=== Seed completed successfully! ===');
  console.log('\nDefault credentials:');
  console.log('Admin - Email: admin@estokia.com, Password: admin123');
  console.log('Operator - Email: operator@estokia.com, Password: operator123');
  console.log('\nDatabase seeded with:');
  console.log('- 2 users (1 admin, 1 operator)');
  console.log('- 4 categories');
  console.log('- 10 products');
  console.log(`- ${createdSales.length} sales distributed across confidence levels`);
  console.log('\n📊 Sales Distribution for ML Confidence Testing:');
  console.log('  ❌ VERY_LOW (5 sales): Phone Screen Protector');
  console.log('  ⚠️  LOW (12 sales): Cotton T-Shirt, Denim Jeans');
  console.log('  🟡 MEDIUM (22 sales): Wireless Mouse, Green Tea');
  console.log('  🟢 HIGH (45 sales): USB-C Cable, Bluetooth Headphones');
  console.log('  ✅ VERY_HIGH (70 sales): Coffee Beans, LED Light Bulb, Garden Hose');
  console.log('\n💡 Run ML predictions: POST /api/predictions/sales/:userId');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
