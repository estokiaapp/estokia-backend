/**
 * Verification script to check if the logging system is properly configured
 * Run with: node verify-logging-setup.js
 */

const { MongoClient } = require('mongodb');

async function verifySetup() {
  console.log('🔍 Verifying Logging System Setup...\n');

  // Check 1: Environment variables
  console.log('1️⃣  Checking environment variables...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const mongoDb = process.env.MONGODB_DATABASE || 'estokia_logs';
  const mongoCollection = process.env.MONGODB_COLLECTION || 'activity_logs';

  console.log(`   ✓ MONGODB_URI: ${mongoUri}`);
  console.log(`   ✓ MONGODB_DATABASE: ${mongoDb}`);
  console.log(`   ✓ MONGODB_COLLECTION: ${mongoCollection}\n`);

  // Check 2: MongoDB connection
  console.log('2️⃣  Testing MongoDB connection...');
  let client;
  try {
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    console.log('   ✅ MongoDB connection successful!\n');

    // Check 3: Database and collection
    console.log('3️⃣  Checking database and collection...');
    const db = client.db(mongoDb);
    const collection = db.collection(mongoCollection);

    // Check if collection exists, create if not
    const collections = await db.listCollections({ name: mongoCollection }).toArray();
    if (collections.length === 0) {
      console.log(`   ℹ️  Collection "${mongoCollection}" does not exist yet (will be created on first log)`);
    } else {
      console.log(`   ✅ Collection "${mongoCollection}" exists`);

      // Count existing logs
      const count = await collection.countDocuments();
      console.log(`   📊 Current log count: ${count}\n`);
    }

    // Check 4: Indexes
    console.log('4️⃣  Checking indexes...');
    const indexes = await collection.listIndexes().toArray();
    console.log(`   📑 Found ${indexes.length} index(es):`);
    indexes.forEach(idx => {
      console.log(`      - ${idx.name}`);
    });
    console.log('');

    // Check 5: Write test log
    console.log('5️⃣  Testing write operation...');
    const testLog = {
      timestamp: new Date(),
      eventType: 'SYSTEM_STARTUP',
      action: 'TEST',
      description: 'Verification test log',
      severity: 'INFO',
      metadata: {
        test: true,
        verificationTime: new Date().toISOString()
      }
    };

    const result = await collection.insertOne(testLog);
    console.log(`   ✅ Test log written successfully (ID: ${result.insertedId})\n`);

    // Check 6: Read test
    console.log('6️⃣  Testing read operation...');
    const readLog = await collection.findOne({ _id: result.insertedId });
    console.log(`   ✅ Test log read successfully`);
    console.log(`   📝 Log description: "${readLog.description}"\n`);

    // Clean up test log
    await collection.deleteOne({ _id: result.insertedId });
    console.log('   🧹 Test log cleaned up\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Your logging system is ready to use! 🎉\n');
    console.log('Next steps:');
    console.log('  1. Start your application: npm run dev');
    console.log('  2. Make some API requests (login, create product, etc.)');
    console.log('  3. View logs via API: GET /api/logs/recent');
    console.log('  4. Or use MongoDB Compass to browse logs visually\n');

  } catch (error) {
    console.log('   ❌ MongoDB connection failed!\n');
    console.log('Error:', error.message, '\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ SETUP INCOMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Please install and start MongoDB:\n');
    console.log('Windows:');
    console.log('  1. Download from https://www.mongodb.com/try/download/community');
    console.log('  2. Or install via Chocolatey: choco install mongodb');
    console.log('  3. Start service: net start MongoDB\n');
    console.log('Mac:');
    console.log('  1. brew tap mongodb/brew');
    console.log('  2. brew install mongodb-community');
    console.log('  3. brew services start mongodb-community\n');
    console.log('Linux (Ubuntu/Debian):');
    console.log('  1. sudo apt-get install mongodb');
    console.log('  2. sudo systemctl start mongodb\n');
    console.log('Docker:');
    console.log('  docker run -d -p 27017:27017 --name mongodb mongo:latest\n');
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

verifySetup().catch(console.error);
