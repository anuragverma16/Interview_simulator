import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const port = String(process.env.PORT || 5000);
const ownPid = String(process.pid);

function pause(ms) {
  if (process.platform === 'win32') {
    try {
      execSync(`ping -n ${Math.ceil(ms / 500) + 1} 127.0.0.1 >nul`, { stdio: 'ignore' });
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    execSync(`sleep ${ms / 1000}`, { stdio: 'ignore' });
  } catch {
    /* ignore */
  }
}

function freePortWin(targetPort) {
  try {
    const out = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0' && pid !== ownPid) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`[dev] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
    if (pids.size > 0) pause(400);
  } catch {
    /* port already free */
  }
}

function freePortUnix(targetPort) {
  try {
    const out = execSync(`lsof -ti :${targetPort}`, { encoding: 'utf8' });
    for (const pid of out.split('\n').map((s) => s.trim()).filter(Boolean)) {
      if (pid === ownPid) continue;
      try {
        process.kill(Number(pid), 'SIGTERM');
        console.log(`[dev] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        /* ignore */
      }
    }
    pause(400);
  } catch {
    /* port free */
  }
}

if (process.platform === 'win32') {
  freePortWin(port);
} else {
  freePortUnix(port);
}
