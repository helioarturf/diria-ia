"""Servidor FTP mínimo para testar o deploy-infinityfree.sh (sem dependências).

Suporta exactamente o que o curl precisa: USER, PASS, PWD, CWD, MKD, TYPE,
PASV, NLST, LIST, STOR, RETR, SIZE, QUIT.

Não é um servidor de produção — só serve para o teste de integração do deploy.

Uso: python3 _test_ftp_server.py <ROOT> <PORT>
"""

import os
import posixpath
import socket
import socketserver
import sys
import threading

ROOT = os.path.abspath(sys.argv[1])
PORT = int(sys.argv[2])
EXP_USER = os.environ.get("FTP_USER", "if0_test")
EXP_PASS = os.environ.get("FTP_PASS", "secret")


def to_abs(path):
    """Caminho FTP -> caminho absoluto no disco (dentro de ROOT)."""
    if not path:
        path = "/"
    if not path.startswith("/"):
        path = "/" + path
    norm = posixpath.normpath(path)
    full = os.path.abspath(os.path.join(ROOT, norm.lstrip("/")))
    if full != ROOT and not full.startswith(ROOT + os.sep):
        raise ValueError("fora de ROOT")
    return full


def ftp_path(disk_path):
    r = os.path.relpath(disk_path, ROOT)
    return "/" if r == "." else "/" + r.replace(os.sep, "/")


class Handler(socketserver.StreamRequestHandler):
    def __init__(self, *a, **kw):
        self.cwd = "/"
        self.data_listen = None
        self.data_conn = None
        self.data_ready = threading.Event()
        self.user_ok = False
        super().__init__(*a, **kw)

    def send(self, line):
        self.wfile.write((line + "\r\n").encode("utf-8"))
        self.wfile.flush()

    def resolve(self, path):
        """Resolve um caminho (relativo ou absoluto) contra o cwd actual."""
        if not path:
            path = self.cwd
        if not path.startswith("/"):
            path = posixpath.join(self.cwd, path)
        return to_abs(path)

    def open_pasv(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("127.0.0.1", 0))
        s.listen(1)
        s.settimeout(15)
        self.data_listen = s
        self.data_conn = None
        self.data_ready.clear()

        def accept():
            try:
                conn, _ = s.accept()
                conn.settimeout(20)
                self.data_conn = conn
                self.data_ready.set()
            except Exception:
                self.data_ready.set()

        threading.Thread(target=accept, daemon=True).start()
        port = s.getsockname()[1]
        p1, p2 = port // 256, port % 256
        self.send("227 Entering Passive Mode (127,0,0,1,%d,%d)" % (p1, p2))

    def get_data(self):
        if not self.data_ready.wait(15):
            return None
        return self.data_conn

    def close_data(self, conn=None):
        for c in (conn, self.data_conn):
            if c:
                try:
                    c.close()
                except Exception:
                    pass
        self.data_conn = None
        if self.data_listen:
            try:
                self.data_listen.close()
            except Exception:
                pass
            self.data_listen = None

    def handle(self):
        self.send("220 mini-ftp pronto")
        while True:
            raw = self.rfile.readline()
            if not raw:
                return
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if not line:
                continue
            parts = line.split(" ", 1)
            cmd = parts[0].upper()
            arg = parts[1] if len(parts) > 1 else ""

            if cmd == "USER":
                self.user_ok = (arg == EXP_USER)
                self.send("331 password?")
            elif cmd == "PASS":
                if self.user_ok and arg == EXP_PASS:
                    self.send("230 loggado")
                else:
                    self.send("530 credenciais invalidas")
            elif cmd == "PWD" or cmd == "XPWD":
                self.send('257 "%s"' % self.cwd)
            elif cmd == "CWD" or cmd == "XCWD":
                try:
                    target = arg if arg.startswith("/") else posixpath.join(self.cwd, arg)
                    disk = to_abs(target)
                    if not os.path.isdir(disk):
                        raise FileNotFoundError(target)
                    self.cwd = ftp_path(disk)
                    self.send("250 OK")
                except Exception:
                    self.send("550 pasta inexistente")
            elif cmd == "MKD" or cmd == "XMKD":
                try:
                    target = arg if arg.startswith("/") else posixpath.join(self.cwd, arg)
                    disk = to_abs(target)
                    os.makedirs(disk, exist_ok=True)
                    self.send('257 "%s" criado' % ftp_path(disk))
                except Exception:
                    self.send("550 nao foi possivel criar")
            elif cmd == "TYPE":
                self.send("200 tipo OK")
            elif cmd in ("MODE", "STRU", "NOOP", "OPTS", "SITE"):
                self.send("200 OK")
            elif cmd == "SYST":
                self.send("215 UNIX Type: L8")
            elif cmd == "FEAT":
                self.send("211-Features:")
                self.send("211 End")
            elif cmd == "PASV":
                self.close_data()
                self.open_pasv()
            elif cmd == "NLST" or cmd == "LIST":
                conn = self.get_data()
                if not conn:
                    self.send("425 sem ligação de dados")
                    continue
                try:
                    disk = self.resolve(arg) if arg else to_abs(self.cwd)
                    names = sorted(os.listdir(disk)) if os.path.isdir(disk) else []
                    if cmd == "NLST":
                        payload = "".join(n + "\r\n" for n in names)
                    else:
                        out = []
                        for n in names:
                            p = os.path.join(disk, n)
                            mode = "d" if os.path.isdir(p) else "-"
                            size = os.path.getsize(p) if os.path.isfile(p) else 0
                            out.append("%srw-r--r-- 1 owner group %d Jan 01 00:00 %s\r\n" % (mode, size, n))
                        payload = "".join(out)
                except Exception as exc:
                    self.send("550 erro: %s" % exc)
                    self.close_data(conn)
                    continue
                self.send("150 a abrir ligação de dados")
                try:
                    conn.sendall(payload.encode("utf-8"))
                    self.send("226 fim")
                except Exception as exc:
                    self.send("550 erro: %s" % exc)
                finally:
                    self.close_data(conn)
            elif cmd == "SIZE":
                try:
                    self.send("213 %d" % os.path.getsize(self.resolve(arg)))
                except Exception:
                    self.send("550 nao existe")
            elif cmd == "STOR":
                conn = self.get_data()
                if not conn:
                    self.send("425 sem ligação de dados")
                    continue
                self.send("150 a receber ficheiro")
                try:
                    disk = self.resolve(arg)
                    os.makedirs(os.path.dirname(disk), exist_ok=True)
                    with open(disk, "wb") as fh:
                        while True:
                            chunk = conn.recv(65536)
                            if not chunk:
                                break
                            fh.write(chunk)
                    self.send("226 escrito")
                except Exception as exc:
                    self.send("550 erro: %s" % exc)
                finally:
                    self.close_data(conn)
            elif cmd == "RETR":
                conn = self.get_data()
                if not conn:
                    self.send("425 sem ligação de dados")
                    continue
                try:
                    fh = open(self.resolve(arg), "rb")
                except Exception as exc:
                    self.send("550 erro: %s" % exc)
                    self.close_data(conn)
                    continue
                self.send("150 a enviar ficheiro")
                try:
                    conn.sendall(fh.read())
                    self.send("226 enviado")
                except Exception as exc:
                    self.send("550 erro: %s" % exc)
                finally:
                    fh.close()
                    self.close_data(conn)
            elif cmd == "QUIT":
                self.send("221 tchau")
                return
            else:
                self.send("502 comando nao suportado: %s" % cmd)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), Handler) as srv:
        print("ftp em 127.0.0.1:%d root=%s" % (PORT, ROOT), flush=True)
        srv.serve_forever()
