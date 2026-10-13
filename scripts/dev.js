const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '==================================================================');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '  🏥 MediSlot Healthcare OPD Platform');
console.log('\x1b[36m%s\x1b[0m', '==================================================================');
console.log('  ⚡ Backend API:      \x1b[33mhttp://localhost:5000\x1b[0m');
console.log('  🌐 Frontend Portal:  \x1b[34mhttp://localhost:5173\x1b[0m');
console.log('  🔐 Unified Sign In:  \x1b[34mhttp://localhost:5173/\x1b[0m');
console.log('------------------------------------------------------------------');
console.log('  👑 Chief Admin:      \x1b[35madmin@medislot.gov.in\x1b[0m / AdminSecure@2026');
console.log('  👨🏻‍⚕️ Duty Doctor:      \x1b[36mdr.ramesh@medislot.gov.in\x1b[0m / DoctorPass@2026');
console.log('  🧑‍💼 Demo Patient:     \x1b[32mpatient@medislot.gov.in\x1b[0m / PatientPass@2026');
console.log('\x1b[36m%s\x1b[0m', '==================================================================');
console.log('\x1b[90m%s\x1b[0m', '  Press Ctrl + C at any time to gracefully terminate both services.\n');

// Prefix stream helper
function pipePrefixed(stream, prefix, colorCode) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep partial line
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
      }
    }
  });
}

// 1. Start Backend Server
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: backendDir,
  shell: true,
  env: { ...process.env, FORCE_COLOR: 'true' }
});

pipePrefixed(backend.stdout, 'BACKEND', '36'); // Cyan
pipePrefixed(backend.stderr, 'BACKEND', '31'); // Red

// 2. Start Frontend Vite Dev Server
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  shell: true,
  env: { ...process.env, FORCE_COLOR: 'true' }
});

pipePrefixed(frontend.stdout, 'FRONTEND', '32'); // Green
pipePrefixed(frontend.stderr, 'FRONTEND', '31'); // Red

// Clean exit handler
let terminating = false;
function terminateAll(signal) {
  if (terminating) return;
  terminating = true;
  console.log(`\n\x1b[33m[MEDISLOT] Gracefully shutting down services (${signal || 'EXIT'})...\x1b[0m`);

  if (isWindows) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/T', '/F']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/T', '/F']);
  } else {
    if (backend.pid) backend.kill('SIGTERM');
    if (frontend.pid) frontend.kill('SIGTERM');
  }

  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', () => terminateAll('SIGINT'));
process.on('SIGTERM', () => terminateAll('SIGTERM'));
process.on('exit', () => terminateAll('exit'));

backend.on('close', (code) => {
  if (!terminating && code !== 0) {
    console.error(`\x1b[31m[BACKEND] Process exited with error code ${code}\x1b[0m`);
  }
});

frontend.on('close', (code) => {
  if (!terminating && code !== 0) {
    console.error(`\x1b[31m[FRONTEND] Process exited with error code ${code}\x1b[0m`);
  }
});
