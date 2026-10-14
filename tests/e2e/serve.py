"""Servidor estático simples para a versão web exportada (resolve /plan -> plan.html)."""
import http.server, os, sys
ROOT=sys.argv[1]; PORT=int(sys.argv[2])
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=ROOT,**k)
    def log_message(s,*a): pass
    def send_head(s):
        p=s.path.split('?')[0]
        full=os.path.join(ROOT,p.lstrip('/'))
        if not os.path.exists(full) or os.path.isdir(full) and not os.path.exists(os.path.join(full,'index.html')):
            for cand in [full+'.html', os.path.join(ROOT,'(tabs)',p.lstrip('/')+'.html'), os.path.join(ROOT,'index.html')]:
                if os.path.exists(cand):
                    s.path='/'+os.path.relpath(cand,ROOT); break
        return super().send_head()
http.server.ThreadingHTTPServer(('127.0.0.1',PORT),H).serve_forever()
