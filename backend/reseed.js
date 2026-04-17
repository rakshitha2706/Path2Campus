require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { main } = require('./scripts/seedData');

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed Failed:', err);
    process.exit(1);
  });
