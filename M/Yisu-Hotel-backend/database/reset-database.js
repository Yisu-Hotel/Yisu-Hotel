const { sequelize } = require('../src/models');

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!');

    console.log('\n🗑️  Dropping all tables...');
    await sequelize.drop();
    console.log('✓ All tables dropped');

    console.log('\n🏗️  Creating all tables...');
    await sequelize.sync();
    console.log('✓ All tables created');

    console.log('\n✅ Database reset successfully!');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

resetDatabase();
