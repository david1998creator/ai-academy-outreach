import http.server
import socketserver
import webbrowser
import os
import shutil
import json
import urllib.request
import urllib.error

base_dir = os.path.dirname(os.path.abspath(__file__))
viewer_dir = os.path.join(base_dir, "viewer")

# Ensure template is in viewer
src_template = os.path.join(base_dir, "01_whatsapp_flyers", "flyer_template_render.html")
dst_template = os.path.join(viewer_dir, "flyer_template_render.html")
if os.path.exists(src_template):
    shutil.copyfile(src_template, dst_template)

os.chdir(viewer_dir)

DEFAULT_KEY = os.environ.get("GEMINI_API_KEY", "")

class AppHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/generate':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                api_key = data.get('apiKey', '').strip() or DEFAULT_KEY
                prompt = data.get('prompt', '')
                task_type = data.get('type', 'text') # text, flyer_svg, image

                result = self.call_gemini(api_key, prompt, task_type)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def call_gemini(self, api_key, prompt, task_type):
        # We try candidate models in order of health & speed: gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3-flash-preview, gemini-flash-lite-latest
        candidate_models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-flash-lite-latest', 'gemini-flash-latest']
        
        system_instruction = (
            "You are the Lead Marketing & Growth AI for Waynautic Academy (academy.waynautic.com). "
            "Waynautic offers production-grade AI engineering training (Python, Git, Vector DBs, RAG, MCP, Autonomous Agents). "
            "Key offers: 1) Free 1-on-1 AI Career Consultation, 2) ₹19 Live AI Masterclass Webinar, "
            "3) Flagship 4-Week AI Intensive + guaranteed 3-Month Industry Internship with Dual Certification (₹9,999). "
            "Trust Anchor: Winner of the Best AI/ML Testing Strategy 2025 at the GenAI and ML Awards. "
            "Contact: Pramod Gogadare (+91 9158998226). "
            "Produce compelling, ready-to-use output formatted with markdown, emojis, bullet points, and strong calls to action."
        )

        full_prompt = f"{system_instruction}\n\nTask: {prompt}"

        # If user wants an image or flyer, we can attempt gemini-2.5-flash-image first, then fallback to rich SVG flyer design
        if task_type == 'image':
            image_models = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image']
            for m in image_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
                payload = {'contents': [{'parts': [{'text': prompt}]}]}
                req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                try:
                    with urllib.request.urlopen(req) as resp:
                        res = json.loads(resp.read().decode('utf-8'))
                        parts = res.get('candidates', [{}])[0].get('content', {}).get('parts', [])
                        for p in parts:
                            if 'inlineData' in p:
                                return {
                                    'type': 'image_base64',
                                    'mimeType': p['inlineData'].get('mimeType', 'image/png'),
                                    'data': p['inlineData'].get('data')
                                }
                except Exception:
                    continue # Fallback to text/SVG generator below

        # Text generation fallback / standard
        last_error = None
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                'contents': [{'parts': [{'text': full_prompt}]}],
                'generationConfig': {
                    'temperature': 0.7,
                    'topP': 0.95
                }
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
            try:
                with urllib.request.urlopen(req, timeout=8) as resp:
                    res = json.loads(resp.read().decode('utf-8'))
                    text = res['candidates'][0]['content']['parts'][0]['text']
                    return {'type': 'text', 'content': text, 'model': model}
            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                last_error = f"{model} returned {e.code}: {err_body}"
                continue
            except Exception as e:
                last_error = str(e)
                continue

        raise Exception(f"All models failed. Last error: {last_error}")

def start():
    PORT = 8080
    for p in range(8080, 8095):
        try:
            class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
                daemon_threads = True
                allow_reuse_address = True
            with ThreadedServer(("", p), AppHandler) as httpd:
                url = f"http://localhost:{p}/index.html"
                print(f"Waynautic Outreach Command Center running at: {url}")
                print("Press Ctrl+C to stop the local dashboard.")
                webbrowser.open(url)
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    start()
