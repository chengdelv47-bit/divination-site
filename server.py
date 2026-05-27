#!/usr/bin/env python3
"""星启占卜 — 本地代理服务器（解决 CORS + SSL 问题）"""

import http.server
import json
import requests
import os
import sys

PORT = 8080
DEEPSEEK_API = "https://api.deepseek.com/chat/completions"

# 禁用 SSL 警告（Windows 上的证书问题）
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors_headers()
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/proxy":
            self._handle_proxy()
        else:
            self.send_error(404)

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _handle_proxy(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        auth = self.headers.get("Authorization", "")

        try:
            headers = {"Content-Type": "application/json"}
            if auth:
                headers["Authorization"] = auth

            resp = requests.post(
                DEEPSEEK_API,
                data=body,
                headers=headers,
                timeout=120,
                verify=False
            )

            self.send_response(resp.status_code)
            self._cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(resp.content)

        except requests.exceptions.Timeout:
            self.send_response(504)
            self._cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(
                {"error": {"message": "API 请求超时，请稍后重试"}}
            ).encode())
        except requests.exceptions.ConnectionError as e:
            self.send_response(502)
            self._cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(
                {"error": {"message": f"无法连接到 DeepSeek API: {str(e)}"}}
            ).encode())
        except Exception as e:
            self.send_response(500)
            self._cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(
                {"error": {"message": f"代理服务器错误: {str(e)}"}}
            ).encode())

    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        """减少控制台日志噪音"""
        if "/api/" in str(args[0]):
            super().log_message(format, *args)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print(f"* 星启占卜服务器已启动 -> http://localhost:{PORT}")
    print(f"* 按 Ctrl+C 停止服务器")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.server_close()
