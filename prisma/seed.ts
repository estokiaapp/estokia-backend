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
  const peripherals = await prisma.category.create({
    data: {
      name: 'Periféricos',
      description: 'Periféricos para computador e gaming',
    },
  });

  const hardware = await prisma.category.create({
    data: {
      name: 'Hardware de PC',
      description: 'Componentes e hardware para computadores',
    },
  });

  const videogames = await prisma.category.create({
    data: {
      name: 'Videogames',
      description: 'Consoles e jogos',
    },
  });

  const apple = await prisma.category.create({
    data: {
      name: 'Apple',
      description: 'Produtos Apple - MacBooks, iPhones, iPads',
    },
  });

  console.log('Created categories');

  // Create products
  const products = await Promise.all([
    // Periféricos
    prisma.product.create({
      data: {
        name: 'Mouse Gamer RGB',
        sku: 'PER-001',
        categoryId: peripherals.id,
        costPrice: 45.0,
        sellingPrice: 89.99,
        currentStock: 150,
        minimumStock: 20,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: 'Mouse gamer RGB 12000 DPI com 7 botões programáveis',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Teclado Mecânico RGB',
        sku: 'PER-002',
        categoryId: peripherals.id,
        costPrice: 120.0,
        sellingPrice: 249.99,
        currentStock: 80,
        minimumStock: 15,
        alertThresholdDays: 10,
        unitOfMeasure: 'UN',
        description: 'Teclado mecânico RGB switch azul ABNT2',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fone Bluetooth Premium',
        sku: 'PER-003',
        categoryId: peripherals.id,
        costPrice: 150.0,
        sellingPrice: 299.99,
        currentStock: 45,
        minimumStock: 10,
        alertThresholdDays: 14,
        unitOfMeasure: 'UN',
        description: 'Fone de ouvido Bluetooth com cancelamento de ruído',
        active: true,
      },
    }),
    // Hardware de PC
    prisma.product.create({
      data: {
        name: 'SSD 480GB SATA',
        sku: 'HW-001',
        categoryId: hardware.id,
        costPrice: 130.0,
        sellingPrice: 259.99,
        currentStock: 200,
        minimumStock: 30,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: 'SSD 480GB SATA III 6Gb/s leitura 550MB/s',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Memória RAM 16GB DDR4',
        sku: 'HW-002',
        categoryId: hardware.id,
        costPrice: 180.0,
        sellingPrice: 349.99,
        currentStock: 120,
        minimumStock: 25,
        alertThresholdDays: 14,
        unitOfMeasure: 'UN',
        description: 'Memória RAM 16GB DDR4 3200MHz para desktop',
        active: true,
      },
    }),
    // Videogames
    prisma.product.create({
      data: {
        name: 'PlayStation 5',
        sku: 'GAME-001',
        categoryId: videogames.id,
        costPrice: 2800.0,
        sellingPrice: 4199.99,
        currentStock: 25,
        minimumStock: 5,
        alertThresholdDays: 5,
        unitOfMeasure: 'UN',
        description: 'Console PlayStation 5 com leitor de disco',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Xbox Series X',
        sku: 'GAME-002',
        categoryId: videogames.id,
        costPrice: 2600.0,
        sellingPrice: 3999.99,
        currentStock: 30,
        minimumStock: 8,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: 'Console Xbox Series X 1TB',
        active: true,
      },
    }),
    // Apple
    prisma.product.create({
      data: {
        name: 'MacBook Pro M3',
        sku: 'APPLE-001',
        categoryId: apple.id,
        costPrice: 9500.0,
        sellingPrice: 14999.99,
        currentStock: 15,
        minimumStock: 3,
        alertThresholdDays: 10,
        unitOfMeasure: 'UN',
        description: 'MacBook Pro 14" M3 16GB 512GB Space Gray',
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        sku: 'APPLE-002',
        categoryId: apple.id,
        costPrice: 5200.0,
        sellingPrice: 7999.99,
        currentStock: 40,
        minimumStock: 10,
        alertThresholdDays: 7,
        unitOfMeasure: 'UN',
        description: 'iPhone 15 Pro 256GB Titânio Natural',
        active: true,
      },
    }),
    // Low stock product for testing alerts
    prisma.product.create({
      data: {
        name: 'Película de Vidro',
        sku: 'ACESS-001',
        categoryId: peripherals.id,
        costPrice: 8.0,
        sellingPrice: 19.99,
        currentStock: 12,
        minimumStock: 20,
        alertThresholdDays: 5,
        unitOfMeasure: 'UN',
        description: 'Película de vidro temperado para smartphones',
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
  // Products are assigned different confidence levels based on UNIQUE SALE DATES (not total sales)

  const confidenceLevels = [
    {
      name: 'VERY_LOW',
      products: [products[9]], // Película de Vidro
      uniqueDays: 5, // 1-7 unique days
      salesPerDay: 1, // Sparse sales
      daysBack: 60,
      description: '❌ Very Low Confidence (5 unique dates)'
    },
    {
      name: 'LOW',
      products: [products[1], products[2]], // Teclado Mecânico RGB, Fone Bluetooth Premium
      uniqueDays: 10, // 8-14 unique days
      salesPerDay: 1,
      daysBack: 60,
      description: '⚠️ Low Confidence (10 unique dates)'
    },
    {
      name: 'MEDIUM',
      products: [products[0], products[3]], // Mouse Gamer RGB, SSD 480GB SATA
      uniqueDays: 20, // 15-29 unique days
      salesPerDay: 1,
      daysBack: 60,
      description: '🟡 Medium Confidence (20 unique dates)'
    },
    {
      name: 'HIGH',
      products: [products[4], products[5]], // Memória RAM 16GB DDR4, PlayStation 5
      uniqueDays: 40, // 30-59 unique days
      salesPerDay: 1,
      daysBack: 90,
      description: '🟢 High Confidence (40 unique dates)'
    },
    {
      name: 'VERY_HIGH',
      products: [products[6], products[7], products[8]], // Xbox Series X, MacBook Pro M3, iPhone 15 Pro
      uniqueDays: 70, // 60+ unique days
      salesPerDay: 1, // Can have multiple sales on same day
      daysBack: 90,
      description: '✅ Very High Confidence (70 unique dates)'
    }
  ];

  const createdSales = [];
  let saleNumber = 1;

  console.log('\n📊 Creating sales with guaranteed unique dates for confidence levels:\n');

  for (const level of confidenceLevels) {
    console.log(`${level.description}`);

    for (const product of level.products) {
      // Generate unique dates for this product
      const uniqueDates: Date[] = [];
      const usedDayOffsets = new Set<number>();

      // Ensure we get exactly uniqueDays different dates
      while (uniqueDates.length < level.uniqueDays) {
        const dayOffset = Math.floor(Math.random() * level.daysBack);
        if (!usedDayOffsets.has(dayOffset)) {
          const date = new Date();
          date.setDate(date.getDate() - dayOffset);
          date.setHours(getRandomInt(8, 20), getRandomInt(0, 59), getRandomInt(0, 59));
          uniqueDates.push(date);
          usedDayOffsets.add(dayOffset);
        }
      }

      // Create sales on each unique date
      for (const saleDate of uniqueDates) {
        // Create 1-2 sales per date (to simulate realistic sales patterns)
        const salesThisDay = level.salesPerDay + (Math.random() > 0.7 ? 1 : 0);

        for (let s = 0; s < salesThisDay; s++) {
          const status = getRandomElement(saleStatuses);
          const user = getRandomElement(users);
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
      }

      console.log(`  - ${product.name}: ${uniqueDates.length} unique dates, ${level.uniqueDays * level.salesPerDay} total sales`);
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
  console.log('- 10 products (tech products in pt-BR)');
  console.log(`- ${createdSales.length} sales distributed across confidence levels`);
  console.log('\n📊 Sales Distribution for ML Confidence Testing (UNIQUE DATES):');
  console.log('  ❌ VERY_LOW (5 unique dates): Película de Vidro');
  console.log('  ⚠️  LOW (10 unique dates): Teclado Mecânico RGB, Fone Bluetooth Premium');
  console.log('  🟡 MEDIUM (20 unique dates): Mouse Gamer RGB, SSD 480GB SATA');
  console.log('  🟢 HIGH (40 unique dates): Memória RAM 16GB DDR4, PlayStation 5');
  console.log('  ✅ VERY_HIGH (70 unique dates): Xbox Series X, MacBook Pro M3, iPhone 15 Pro');
  console.log('\n💡 Next steps:');
  console.log('  1. Run ML predictions: cd ../estokia-ml && source venv/bin/activate');
  console.log('  2. Generate forecasts: python run_daily_predictions.py');
  console.log('  3. Check API: GET /api/predictions/sales/:userId');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
