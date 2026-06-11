const { execSync } = require('child_process');

try {
  console.log('Running static Prisma validation...');
  execSync('npx prisma validate', { stdio: 'inherit' });
  console.log('Prisma schema is valid!');
} catch (error) {
  console.error('Prisma schema validation failed:', error.message);
  process.exit(1);
}
