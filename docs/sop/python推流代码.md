# python推流代码
```
#!/usr/bin/env python3
from flask import Flask, render_template_string, request, jsonify
import subprocess
import os
import signal
from datetime import datetime
from urllib.parse import urlparse
import requests
import re
import random
import base64
import time
import threading
import psutil

app = Flask(__name__)

# 配置常量
HISTORY_FILE = "stream_history.log"
SOURCE_CHECK_TIMEOUT = 10
MONITOR_INTERVAL = 30

# 两种推流模式模板
FFMPEG_DIRECT_TEMPLATE = """
ffmpeg -re -stream_loop -1 -i "{input_source}" \
-c:v copy -c:a aac -b:a 128k -f flv \
-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 \
"rtmp://ali.push.yximgs.com/live/{stream_id}"
"""

FFMPEG_BUFFERED_TEMPLATE = """
ffmpeg -re -stream_loop -1 -i "{input_source}" \
-c:v copy -c:a aac -b:a 128k -f flv \
-reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 \
-flvflags no_duration_filesize \
-avioflags direct \
-fflags +discardcorrupt \
-max_muxing_queue_size 1024 \
"rtmp://ali.push.yximgs.com/live/{stream_id}"
"""

# 当前推流模式
current_stream_mode = "direct"  # 默认直接推流模式

def generate_stream_id():
    """生成随机流ID"""
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    rand_str = ''.join(random.choice(chars) for _ in range(12))
    return base64.b64encode(rand_str.encode()).decode('utf-8').rstrip('=')

def check_stream_source(url):
    """检查输入源是否有效"""
    try:
        if url.startswith(('http://', 'https://')):
            result = urlparse(url)
            if not all([result.scheme, result.netloc]):
                return False
            
            with requests.get(url, 
                            stream=True, 
                            timeout=SOURCE_CHECK_TIMEOUT,
                            headers={'User-Agent': 'Mozilla/5.0'},
                            allow_redirects=True) as r:
                return r.status_code < 400
                
        elif url.startswith('file://') or os.path.exists(url.replace('file://', '')):
            file_path = url.replace('file://', '')
            return os.path.exists(file_path) and os.path.isfile(file_path)
        return False
    except:
        return False

def log_action(action, input_source="", stream_id="", pid=None, mode=None):
    """记录操作日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} {action}"
    if pid:
        log_entry += f" | PID: {pid}"
    if input_source:
        log_entry += f" | 输入源: {input_source}"
    if stream_id:
        log_entry += f" | 流ID: {stream_id}"
    if mode:
        log_entry += f" | 模式: {mode}"
    
    existing = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            existing = f.readlines()
    
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        f.write(log_entry + "\n")
        f.writelines(existing)

def get_running_streams():
    """获取所有推流进程"""
    try:
        processes = []
        pattern = re.compile(r'rtmp://ali\.push\.yximgs\.com/live/(\w+)')
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['name'] == 'ffmpeg' and any('rtmp://ali.push.yximgs.com/live/' in cmd for cmd in proc.info['cmdline']):
                    cmd = ' '.join(proc.info['cmdline'])
                    match = pattern.search(cmd)
                    if match:
                        stream_id = match.group(1)
                        # 判断推流模式
                        mode = "buffered" if "max_muxing_queue_size" in cmd else "direct"
                        processes.append({
                            'pid': proc.info['pid'],
                            'cmd': cmd,
                            'stream_url': f"https://ali.hlspull.yximgs.com/live/{stream_id}.flv",
                            'status': proc.status(),
                            'mode': mode
                        })
            except:
                continue
        return processes
    except:
        return []

def start_stream(input_source, stream_id, mode):
    """启动推流进程"""
    try:
        if mode == "direct":
            cmd = FFMPEG_DIRECT_TEMPLATE.format(
                input_source=input_source,
                stream_id=stream_id
            )
        else:
            cmd = FFMPEG_BUFFERED_TEMPLATE.format(
                input_source=input_source,
                stream_id=stream_id
            )
        
        process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True
        )
        
        log_action("启动推流", input_source, stream_id, process.pid, mode)
        return process.pid, None
    except Exception as e:
        return None, str(e)

def stop_process(pid):
    """停止指定PID的进程"""
    try:
        os.kill(pid, signal.SIGTERM)
        time.sleep(1)
        
        try:
            os.kill(pid, 0)
            os.kill(pid, signal.SIGKILL)
            log_action("强制终止进程", pid=pid)
        except:
            pass
            
        log_action("停止进程", pid=pid)
        return True
    except:
        return False

def stop_all_streams():
    """停止所有推流进程"""
    try:
        processes = get_running_streams()
        success_count = 0
        
        for proc in processes:
            if stop_process(proc['pid']):
                success_count += 1
        
        return success_count, len(processes)
    except:
        return 0, 0

def read_history():
    """读取历史记录"""
    try:
        with open(HISTORY_FILE, "r", encoding='utf-8') as f:
            lines = f.readlines()
        
        history_entries = []
        for line in lines:
            if "启动推流" in line or "停止进程" in line:
                parts = line.strip().split(" | ")
                if len(parts) < 2:
                    continue
                    
                entry = {
                    'timestamp': parts[0],
                    'action': parts[1],
                    'full_text': line.strip()
                }
                
                for part in parts[2:]:
                    if "PID:" in part:
                        entry['pid'] = part.split("PID: ")[1]
                    elif "输入源:" in part:
                        entry['input_source'] = part.split("输入源: ")[1]
                    elif "流ID:" in part:
                        entry['stream_id'] = part.split("流ID: ")[1]
                    elif "模式:" in part:
                        entry['mode'] = part.split("模式: ")[1]
                
                history_entries.append(entry)
        
        return history_entries
    except:
        return []

def monitor_streams():
    """后台监控推流进程"""
    while True:
        try:
            processes = get_running_streams()
            for proc in processes:
                try:
                    p = psutil.Process(proc['pid'])
                    if p.status() == psutil.STATUS_ZOMBIE:
                        log_action("检测到僵尸进程", pid=proc['pid'])
                        stop_process(proc['pid'])
                except:
                    log_action("检测到异常终止进程", pid=proc['pid'])
        except:
            pass
        
        time.sleep(MONITOR_INTERVAL)

# 启动监控线程
monitor_thread = threading.Thread(target=monitor_streams, daemon=True)
monitor_thread.start()

@app.route("/")
def control_panel():
    processes = get_running_streams()
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>直播推流控制</title>
    <style>
        :root {
            --primary: #3498db;
            --success: #2ecc71;
            --danger: #e74c3c;
            --warning: #f39c12;
            --info: #9b59b6;
            --radius: 8px;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 25px;
            border-radius: var(--radius);
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input[type="text"], textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: var(--radius);
            box-sizing: border-box;
            font-size: 14px;
        }
        button, .btn {
            padding: 10px 15px;
            margin: 5px 0;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            color: white;
            background: var(--primary);
        }
        .btn-start { background: var(--success); }
        .btn-stop { background: var(--danger); }
        .btn-warning { background: var(--warning); }
        .btn-info { 
            background: var(--info);
            min-width: 80px;
            width: auto;
            padding: 10px 12px;
        }
        .mode-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        .mode-btn {
            flex: 1;
            padding: 10px;
            text-align: center;
            background: #eee;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s;
        }
        .mode-btn.active {
            background: var(--primary);
            color: white;
        }
        button:hover, .btn:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .process-list {
            margin: 25px 0;
        }
        .process-item, .history-entry {
            margin-bottom: 15px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: var(--radius);
            border-left: 4px solid var(--primary);
        }
        .url-box {
            margin: 10px 0;
            padding: 12px;
            background: #eaf2f8;
            border-radius: var(--radius);
            word-break: break-all;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .action-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        #toast {
            display: none;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background-color: var(--success);
            color: white;
            border-radius: var(--radius);
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 90%;
            text-align: center;
        }
        #toast.error {
            background-color: var(--danger);
        }
        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .url-box {
                flex-direction: column;
                align-items: flex-start;
            }
            .action-buttons {
                flex-direction: column;
            }
            button, .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <form id="streamForm">
            <div class="form-group">
                <label for="input_source">输入源地址:</label>
                <input type="text" id="input_source" name="input_source" required
                       placeholder="http://example.com/stream.m3u8 或 file:///path/to/video.mp4">
            </div>
            
            <div class="form-group">
                <label for="stream_id">推流ID (留空自动生成):</label>
                <input type="text" id="stream_id" name="stream_id"
                       placeholder="不填写将自动生成随机ID">
            </div>
            
            <div class="mode-selector">
                <div class="mode-btn active" data-mode="direct" onclick="selectMode(this, 'direct')">
                    <div>直接推流模式</div>
                    <small>低延迟但稳定性稍差</small>
                </div>
                <div class="mode-btn" data-mode="buffered" onclick="selectMode(this, 'buffered')">
                    <div>缓冲推流模式</div>
                    <small>高稳定性但延迟稍高</small>
                </div>
            </div>
            
            <div class="action-buttons">
                <button type="button" class="btn-start" onclick="startStream()">开始推流</button>
                <button type="button" class="btn-stop" onclick="stopAllStreams()">停止所有推流</button>
            </div>
        </form>
        
        <div class="process-list">
            <h2>当前推流进程 <span style="background: var(--primary); color: white; padding: 3px 8px; border-radius: 12px;">{{ processes|length }} 个</span></h2>
            
            {% for proc in processes %}
            <div class="process-item">
                <div class="url-box">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: var(--primary); margin-bottom: 5px;">推流地址 ({{ "缓冲" if proc.mode == "buffered" else "直接" }}模式):</div>
                        {{ proc.stream_url }}
                    </div>
                    <button class="btn" onclick="copyToClipboard('{{ proc.stream_url }}')">复制</button>
                    <button class="btn-stop" onclick="stopStream({{ proc.pid }})">停止</button>
                </div>
            </div>
            {% else %}
            <p style="text-align: center; color: #666;">当前没有运行中的推流进程</p>
            {% endfor %}
        </div>
        
        <div class="action-buttons">
            <button class="btn" onclick="window.location.href='/history'">查看历史记录</button>
            <button class="btn-warning" onclick="clearHistory()">清空历史记录</button>
        </div>
    </div>

    <div id="toast"></div>

    <script>
        let currentMode = "direct";
        
        function copyToClipboard(text) {
            const input = document.createElement('textarea');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('已复制到剪贴板');
        }
        
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = isError ? 'error' : '';
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
        
        function selectMode(element, mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            element.classList.add('active');
        }
        
        function stopStream(pid) {
            if(confirm('确定要停止这个推流进程吗？')) {
                fetch('/stop_stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `pid=${pid}`
                })
                .then(response => {
                    if(response.ok) {
                        window.location.reload();
                    } else {
                        showToast('停止失败', true);
                    }
                })
                .catch(() => showToast('网络错误', true));
            }
        }
        
        function stopAllStreams() {
            if(confirm('确定要停止所有推流进程吗？')) {
                fetch('/stop_all_streams', {
                    method: 'POST'
                })
                .then(r => r.json())
                .then(data => {
                    if(data.status === 'success') {
                        showToast(`已停止 ${data.stopped} 个推流进程`);
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        showToast('停止失败', true);
                    }
                })
                .catch(() => showToast('网络错误', true));
            }
        }
        
        function clearHistory() {
            if(confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
                fetch('/clear_history', {
                    method: 'POST'
                })
                .then(() => window.location.reload())
                .catch(() => showToast('清空失败', true));
            }
        }
        
        function startStream() {
            const input_source = document.getElementById('input_source').value.trim();
            let stream_id = document.getElementById('stream_id').value.trim();
            
            if(!input_source) {
                showToast('请输入输入源地址', true);
                return;
            }
            
            // 自动生成流ID如果为空
            if(!stream_id) {
                stream_id = generateStreamId();
                document.getElementById('stream_id').value = stream_id;
            }
            
            const formData = new FormData();
            formData.append('input_source', input_source);
            formData.append('stream_id', stream_id);
            formData.append('mode', currentMode);
            
            fetch('/start_stream', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.status === 'success') {
                    showToast('推流已启动');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.message || '推流失败', true);
                }
            })
            .catch(() => showToast('网络错误', true));
        }
        
        function generateStreamId() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < 12; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return btoa(result).replace(/=+$/, '');
        }
    </script>
</body>
</html>
''', processes=processes)

@app.route("/start_stream", methods=["POST"])
def start_stream_handler():
    try:
        input_source = request.form.get("input_source", "").strip()
        stream_id = request.form.get("stream_id", "").strip()
        mode = request.form.get("mode", "direct")  # 默认为直接模式
        
        if not input_source:
            return jsonify({"status": "error", "message": "请输入输入源地址"}), 400
        
        if not stream_id:
            stream_id = generate_stream_id()
        
        for proc in get_running_streams():
            if input_source in proc['cmd']:
                return jsonify({"status": "error", "message": "该输入源已在推流中"}), 400
        
        if not check_stream_source(input_source):
            return jsonify({"status": "error", "message": "输入源无效或不可访问"}), 400
        
        pid, error = start_stream(input_source, stream_id, mode)
        if error:
            return jsonify({"status": "error", "message": error}), 500
        
        return jsonify({"status": "success"})
    except:
        return jsonify({"status": "error", "message": "服务器内部错误"}), 500

@app.route("/stop_stream", methods=["POST"])
def stop_stream_handler():
    try:
        pid = int(request.form.get("pid"))
        if stop_process(pid):
            return jsonify({"status": "success"})
        return jsonify({"status": "error", "message": "停止进程失败"}), 500
    except:
        return jsonify({"status": "error", "message": "服务器内部错误"}), 500

@app.route("/stop_all_streams", methods=["POST"])
def stop_all_streams_handler():
    try:
        stopped, total = stop_all_streams()
        return jsonify({
            "status": "success",
            "stopped": stopped,
            "total": total
        })
    except:
        return jsonify({"status": "error", "message": "服务器内部错误"}), 500

@app.route("/clear_history", methods=["POST"])
def clear_history_handler():
    try:
        if os.path.exists(HISTORY_FILE):
            os.remove(HISTORY_FILE)
        return jsonify({"status": "success"})
    except:
        return jsonify({"status": "error", "message": "服务器内部错误"}), 500

@app.route("/history")
def show_history():
    history_entries = read_history()
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>推流历史记录</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
        }
        .history-entry {
            margin-bottom: 15px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .history-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .history-time {
            color: #7f8c8d;
            font-size: 14px;
        }
        .history-content {
            margin: 8px 0;
            word-break: break-all;
            font-size: 14px;
            padding: 10px;
            background: #eaf2f8;
            border-radius: 4px;
        }
        .history-actions {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
        }
        .restart-btn {
            padding: 8px 15px;
            background: #2ecc71;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .back-link {
            display: block;
            margin-top: 20px;
            padding: 10px;
            background: #3498db;
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
        }
        .back-link:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>推流历史记录</h1>
        
        {% if history_entries %}
            {% for entry in history_entries %}
            <div class="history-entry">
                <div class="history-line">
                    <span class="history-time">{{ entry.timestamp }}</span>
                    <span>{{ entry.action }}</span>
                </div>
                
                {% if entry.input_source or entry.stream_id or entry.mode %}
                <div class="history-content">
                    {% if entry.input_source %}<div><strong>输入源:</strong> {{ entry.input_source }}</div>{% endif %}
                    {% if entry.stream_id %}<div><strong>流ID:</strong> {{ entry.stream_id }}</div>{% endif %}
                    {% if entry.mode %}<div><strong>模式:</strong> {{ "缓冲" if entry.mode == "buffered" else "直接" }}</div>{% endif %}
                </div>
                {% endif %}
                
                {% if entry.pid %}
                <div class="history-content"><strong>PID:</strong> {{ entry.pid }}</div>
                {% endif %}
                
                {% if entry.input_source and entry.stream_id %}
                <div class="history-actions">
                    <button class="restart-btn" onclick="restartStream('{{ entry.input_source }}', '{{ entry.stream_id }}', '{{ entry.mode or "direct" }}')">
                        重新推流
                    </button>
                </div>
                {% endif %}
            </div>
            {% endfor %}
        {% else %}
            <p style="text-align: center; color: #666;">暂无历史记录</p>
        {% endif %}
        
        <a href="/" class="back-link">返回控制面板</a>
    </div>

    <script>
        function restartStream(input_source, stream_id, mode) {
            fetch('/restart_stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input_source: input_source,
                    stream_id: stream_id,
                    mode: mode
                })
            })
            .then(r => r.json())
            .then(data => {
                if(data.status === 'success') {
                    alert('推流已启动！');
                    window.location.href = '/';
                } else {
                    alert('错误: ' + (data.message || '推流启动失败'));
                }
            });
        }
    </script>
</body>
</html>
''', history_entries=history_entries)

@app.route("/restart_stream", methods=["POST"])
def restart_stream():
    try:
        data = request.get_json()
        input_source = data.get("input_source", "").strip()
        stream_id = data.get("stream_id", "").strip()
        mode = data.get("mode", "direct")  # 默认为直接模式
        
        if not input_source or not stream_id:
            return jsonify({"status": "error", "message": "缺少必要参数"}), 400
        
        for proc in get_running_streams():
            if input_source in proc['cmd']:
                return jsonify({"status": "error", "message": "该输入源已在推流中"}), 400
        
        pid, error = start_stream(input_source, stream_id, mode)
        if error:
            return jsonify({"status": "error", "message": error}), 500
        
        return jsonify({"status": "success"})
    except:
        return jsonify({"status": "error", "message": "服务器内部错误"}), 500

if __name__ == "__main__":
    if not os.path.exists(HISTORY_FILE):
        open(HISTORY_FILE, "w").close()
    
    app.run(host="0.0.0.0", port=8080, debug=False)

```
