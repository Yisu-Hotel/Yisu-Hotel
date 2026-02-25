const path = require('path');
const { spawn } = require('child_process');

const runScript = (scriptName) =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${scriptName} exited with code ${code}`));
    });
  });

const run = async () => {
  try {
    console.log('🚀 Starting full database reset...');
    await runScript('reset-database.js');
    await runScript('migrate-hotel-image-base64.js');
    await runScript('migrate-avatar-base64.js');
    await runScript('seed-database.js');
    console.log('✅ Database reset finished.');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

run();
