import http.server
import socketserver
import webbrowser
import os
import shutil
import json
import urllib.request
import urllib.error
import urllib.parse
import re
import requests
from bs4 import BeautifulSoup

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
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        if self.path == '/api/generate':
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

        elif self.path == '/api/leads/search':
            try:
                data = json.loads(body)
                audience = data.get('audience', 'tpo')
                city = data.get('city', 'Pune').strip()
                keywords = data.get('keywords', '').strip()
                google_key = data.get('googleKey', '').strip()
                google_cx = data.get('googleCx', '').strip()

                leads = self.search_leads(audience, city, keywords, google_key, google_cx)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'leads': leads, 'count': len(leads)}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

        elif self.path == '/api/leads/enrich-apollo':
            try:
                data = json.loads(body)
                apollo_key = data.get('apolloKey', '').strip()
                lead = data.get('lead', {})

                result = self.enrich_apollo(apollo_key, lead)
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

    def search_leads(self, audience, city, keywords, google_key="", google_cx=""):
        leads = []
        if audience == "tpo":
            query = f'site:linkedin.com/in ("Training and Placement Officer" OR "TPO" OR "Head of Placements" OR "Placement Officer") "{city}" {keywords}'.strip()
        else:
            query = f'site:linkedin.com/in ("B.Tech" OR "B.E." OR "MCA" OR "Computer Science") ("2025" OR "2026" OR "Seeking Internship" OR "AI") "{city}" {keywords}'.strip()

        # 1. Google Programmable Search API (if key + cx provided)
        if google_key and google_cx:
            try:
                google_url = f"https://www.googleapis.com/customsearch/v1?key={google_key}&cx={google_cx}&q={urllib.parse.quote(query)}"
                req = urllib.request.Request(google_url, headers={'User-Agent': 'WaynauticLeadRadar/1.0'})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    res_data = json.loads(resp.read().decode('utf-8'))
                    items = res_data.get('items', [])
                    for item in items:
                        link = item.get('link', '')
                        if 'linkedin.com/in/' not in link:
                            continue
                        title = item.get('title', '')
                        snippet = item.get('snippet', '')
                        name, headline, college = self.parse_linkedin_title(title, snippet)
                        phone = self.extract_phone_number(snippet + " " + title)
                        leads.append({
                            "id": abs(hash(link)) % 100000000,
                            "name": name,
                            "headline": headline,
                            "college": college,
                            "location": city,
                            "phone": phone,
                            "email": "",
                            "linkedinUrl": link,
                            "source": "Google Custom Search"
                        })
                    if leads:
                        return leads
            except Exception as e:
                print(f"Google API notice: {e}, using built-in search...")

        # 2. Free Built-in Search Engine (DuckDuckGo X-Ray Parser)
        try:
            url = 'https://html.duckduckgo.com/html/'
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
            resp = requests.post(url, headers=headers, data={'q': query}, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                results = soup.find_all('div', class_='result')
                for r in results[:15]:
                    title_el = r.find('a', class_='result__title') or r.find('a', class_='result__url')
                    snippet_el = r.find('a', class_='result__snippet')
                    raw_url = title_el.get('href') if title_el else ''
                    match = re.search(r'uddg=([^&]+)', raw_url)
                    real_url = urllib.parse.unquote(match.group(1)) if match else raw_url
                    if 'linkedin.com/in/' not in real_url:
                        continue
                    
                    title_text = title_el.text.strip() if title_el else ''
                    snippet_text = snippet_el.text.strip() if snippet_el else ''
                    name, headline, college = self.parse_linkedin_title(title_text, snippet_text)
                    phone = self.extract_phone_number(snippet_text + " " + title_text)
                    leads.append({
                        "id": abs(hash(real_url)) % 100000000,
                        "name": name,
                        "headline": headline,
                        "college": college,
                        "location": city,
                        "phone": phone,
                        "email": "",
                        "linkedinUrl": real_url,
                        "source": "Direct Search"
                    })
        except Exception as e:
            print(f"Direct search error: {e}")

        return leads

    def parse_linkedin_title(self, title, snippet):
        clean = re.sub(r'\s*[\-\|]\s*LinkedIn.*$', '', title, flags=re.I).strip()
        parts = re.split(r'\s*[\-–—]\s*', clean)
        name = parts[0].strip() if len(parts) > 0 else clean
        headline = parts[1].strip() if len(parts) > 1 else ""
        college = parts[2].strip() if len(parts) > 2 else ""

        if not college and snippet:
            m = re.search(r'\bat\s+([^,•\.\n\r]+(?:College|Institute|University|Academy|Technologies|Solutions|Group|Nutan|PCET|MIT|COEP|Pune)[^,•\.\n\r]*)', snippet, re.I)
            if m:
                college = m.group(1).strip()
        return name, headline, college

    def extract_phone_number(self, text):
        m = re.search(r'(?:\+?91[\-\s]?)?[6-9]\d{9}\b', text)
        return m.group(0) if m else ""

    def enrich_apollo(self, apollo_key, lead):
        if not apollo_key:
            return {"success": False, "error": "Apollo API Key is required for enrichment."}

        url = "https://api.apollo.io/v1/people/match"
        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": apollo_key
        }

        names = (lead.get("name") or "").split(" ")
        first_name = names[0] if names else ""
        last_name = " ".join(names[1:]) if len(names) > 1 else ""

        payload = {
            "first_name": first_name,
            "last_name": last_name,
            "organization_name": lead.get("college", ""),
            "linkedin_url": lead.get("linkedinUrl", "")
        }

        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                person = data.get("person") or {}
                email = person.get("email") or ""
                phone = lead.get("phone") or ""
                if not phone and person.get("phone_numbers"):
                    phone = person["phone_numbers"][0].get("sanitized_number") or ""
                return {
                    "success": True,
                    "email": email,
                    "phone": phone,
                    "title": person.get("title") or lead.get("headline"),
                    "seniority": person.get("seniority"),
                    "linkedinUrl": person.get("linkedin_url") or lead.get("linkedinUrl")
                }
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            return {"success": False, "error": f"Apollo returned {e.code}: {err_msg}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

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
