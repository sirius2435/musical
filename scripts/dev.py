"""Start the local coursework stack using its existing caches; Ctrl+C stops this run."""
from pathlib import Path
import json
import os
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / '.runtime'
PG_BIN = ROOT.parent / 'homework2/.dsh-runtime/pg/bin'
DATA = RUNTIME / 'pgdata'
environment = os.environ.copy()
if (ROOT / '.env').exists():
    for line in (ROOT / '.env').read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            name, value = line.split('=', 1)
            environment.setdefault(name.strip(), value.strip().strip('\"\''))
environment.setdefault('DATABASE_URL', 'jdbc:postgresql://127.0.0.1:55432/stage_stories')
environment.setdefault('DB_USER', 'db')
environment.setdefault('DB_PASSWORD', 'root')
environment.setdefault('HTTP_PORT', '8082')
environment.setdefault('VITE_BACKEND_PROXY_TARGET', 'http://127.0.0.1:' + environment['HTTP_PORT'])
RUNTIME.mkdir(exist_ok=True)
children = []
logs = []
started_database = False
exit_code = 0

def checked(command, **kwargs):
    subprocess.run([str(part) for part in command], check=True, **kwargs)

def single_user(sql):
    result = subprocess.run([str(PG_BIN / 'postgres'), '--single', '-D', str(DATA), 'postgres'], input=sql+'\n', text=True, capture_output=True)
    if result.returncode or any(level in result.stderr for level in ['ERROR:', 'FATAL:', 'PANIC:']):
        raise RuntimeError(result.stderr)
    return result.stdout

def launch(command, cwd, name):
    log = (RUNTIME / (name + '.log')).open('w')
    logs.append(log)
    process = subprocess.Popen(command, cwd=cwd, env=environment, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    children.append(process)
    return process

def stop_children():
    for process in children:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGTERM)
    for process in children:
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
    for log in logs:
        log.close()

try:
    # A non-default URL denotes an externally managed database; leave it alone.
    if environment['DATABASE_URL'] == 'jdbc:postgresql://127.0.0.1:55432/stage_stories':
        if not (PG_BIN / 'pg_ctl').exists():
            raise RuntimeError('Cached PostgreSQL is missing. Start the database with docker compose up -d db, set DATABASE_URL for that database, then start backend and frontend as described in README.')
        if environment['DB_USER'] != 'db':
            raise RuntimeError('The cached local cluster uses DB_USER=db. For another database, configure DATABASE_URL and start it separately.')
        if not (DATA / 'PG_VERSION').exists():
            checked([PG_BIN / 'initdb', '-D', DATA, '-U', 'db', '--auth=trust', '--encoding=UTF8'])
        running = subprocess.run([str(PG_BIN / 'pg_ctl'), '-D', str(DATA), 'status'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
        if not running:
            # Bootstrap only this private, stopped cluster; preserve existing databases.
            databases = single_user('select datname from pg_database;')
            if 'datname = "stage_stories"' not in databases:
                single_user('create database stage_stories owner db;')
            checked([PG_BIN / 'pg_ctl', '-D', DATA, '-l', RUNTIME / 'postgres.log', '-o', '-h 127.0.0.1 -p 55432 -k "' + str(RUNTIME) + '"', '-w', 'start'])
            started_database = True
    if not (ROOT / 'frontend/node_modules/vite').exists():
        raise RuntimeError('Frontend dependencies are missing. Run npm ci in frontend/.')
    print('Starting Scala backend and Vite. Logs: musical/.runtime/backend.log and frontend.log', flush=True)
    backend = launch([sys.executable, 'scripts/backend.py'], ROOT, 'backend')
    frontend = launch(['npm', 'run', 'dev', '--', '--strictPort'], ROOT / 'frontend', 'frontend')
    request = urllib.request.Request('http://127.0.0.1:' + environment['HTTP_PORT'] + '/api/listfeaturedproductions', data=b'{}', headers={'Content-Type': 'application/json'})
    for attempt in range(120):
        if any(process.poll() is not None for process in children):
            raise RuntimeError('A service exited. Inspect the logs in musical/.runtime/.')
        try:
            with urllib.request.urlopen(request, timeout=1) as response:
                json.load(response)
            with urllib.request.urlopen('http://127.0.0.1:5175', timeout=1) as response:
                if response.status != 200:
                    raise RuntimeError('Frontend is not ready')
            break
        except (urllib.error.URLError, TimeoutError):
            time.sleep(1)
    else:
        raise RuntimeError('Startup timed out. Inspect musical/.runtime/backend.log and frontend.log.')
    print('Ready: http://127.0.0.1:5175 — API and database request verified. Keep this terminal open; Ctrl+C stops this run.', flush=True)
    while all(process.poll() is None for process in children):
        time.sleep(1)
    raise RuntimeError('A service exited. Inspect the logs in musical/.runtime/.')
except KeyboardInterrupt:
    print('\nStopping this run.', flush=True)
except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
    print('Startup failed: '+str(error), file=sys.stderr)
    exit_code = 1
finally:
    stop_children()
    if started_database:
        subprocess.run([str(PG_BIN / 'pg_ctl'), '-D', str(DATA), '-m', 'fast', '-w', 'stop'])
if exit_code:
    raise SystemExit(exit_code)
