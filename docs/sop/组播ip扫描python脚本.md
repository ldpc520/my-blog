# 组播IP扫描之python脚本
```
import asyncio
import configparser
import logging
import os
import sys
import time
from datetime import datetime
import aiohttp
from typing import List, Optional

# ==================== 极简日志系统 ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scanner.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ==================== 配置 ====================
CONFIG_FILE = "config.ini"
SCAN_INTERVAL = 15 * 60
TIMEOUT = 8
MAX_CONCURRENT = 200
PROGRESS_STEP = 1000  # 每1000个IP打印一次进度

# ==================== 工具函数 ====================
def create_default_config():
    if not os.path.exists(CONFIG_FILE):
        config = configparser.ConfigParser()
        sample_tasks = [
            ("Task1", "广东电信", "113.101.245.14", "9988", "239.77.0.198:5146", "245", "246", "yes"),
            ("Task2", "广东惠州电信", "219.131.11.149", "8188", "239.77.0.198:5146", "8", "11", "yes"),
            ("Task3", "四川自贡电信", "125.66.145.243", "8848", "239.77.0.198:5146", "145", "255", "yes"),
            ("Task4", "广东东莞电信", "14.216.135.1", "8188", "239.77.0.1:5146", "135", "255", "yes"),
        ]
        for tid, name, ip, port, mc, sc, ec, en in sample_tasks:
            config[tid] = {
                "name": name, "ip": ip, "port": port,
                "multicast": mc, "start_c": sc, "end_c": ec, "enabled": en
            }
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            config.write(f)
        logger.info("已创建默认配置文件 config.ini")

def load_config():
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE, encoding="utf-8")
    return config

def generate_ip_list(base_ip: str, start_c: int, end_c: int) -> List[str]:
    prefix = '.'.join(base_ip.split('.')[:2]) + '.'
    return [f"{prefix}{c}.{d}" for c in range(start_c, end_c + 1) for d in range(256)]

async def check_ip_valid(session, ip, port, multicast) -> bool:
    try:
        async with session.get(
            f"http://{ip}:{port}/udp/{multicast}",
            timeout=aiohttp.ClientTimeout(total=TIMEOUT)
        ) as r:
            return r.status < 400
    except:
        return False

async def scan_task(task_id, info, exist_ip=None):
    name = info["name"]
    ip = info["ip"]
    port = info["port"]
    multicast = info["multicast"]
    sc = int(info["start_c"])
    ec = int(info["end_c"])
    
    total_ips = (ec - sc + 1) * 256
    logger.info(f"开始任务 {task_id}: {name}")
    logger.info(f"IP范围: {ip} C段 {sc}-{ec} | 端口: {port} | 组播: {multicast}")
    logger.info(f"待扫描IP总数: {total_ips:,}")
    
    # 检查现有IP
    if exist_ip:
        logger.info(f"检查现有IP: {exist_ip}:{port}")
        async with aiohttp.ClientSession() as s:
            if await check_ip_valid(s, exist_ip, port, multicast):
                logger.info(f"IP {exist_ip}:{port} 仍然有效，跳过扫描")
                return exist_ip
            logger.warning(f"IP {exist_ip}:{port} 已失效，重新扫描")
    
    ips = generate_ip_list(ip, sc, ec)
    found = None
    checked = 0
    start_time = time.time()
    
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    
    async def check_one(session, ip):
        nonlocal found, checked
        async with semaphore:
            if found:
                return
            
            checked += 1
            if checked % PROGRESS_STEP == 0:
                elapsed = time.time() - start_time
                rate = checked / elapsed if elapsed > 0 else 0
                logger.info(f"进度: {checked:,}/{total_ips:,} ({checked/total_ips*100:.1f}%) | 速率: {rate:.1f}/s")
            
            if await check_ip_valid(session, ip, port, multicast):
                found = ip
                logger.info(f"发现有效IP: {ip}:{port}")
    
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT, force_close=True)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [check_one(session, ip) for ip in ips]
        for i in range(0, len(tasks), 2000):
            await asyncio.gather(*tasks[i:i+2000])
            await asyncio.sleep(0.1)
    
    if not found:
        logger.warning(f"任务 {task_id} 未发现有效IP")
    
    return found

def save_ip(task_id, ip, port):
    with open(f"udp_ip_{task_id}.txt", "w", encoding="utf-8") as f:
        f.write(f"{ip}:{port}")
    logger.info(f"已保存IP到 udp_ip_{task_id}.txt: {ip}:{port}")

# ==================== 主循环 ====================
async def main_loop():
    create_default_config()
    round_num = 0
    
    while True:
        round_num += 1
        logger.info("=" * 60)
        logger.info(f"第 {round_num} 轮扫描开始 | 时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 60)
        
        config = load_config()
        enabled_tasks = [s for s in config.sections() if config[s].get("enabled", "no") == "yes"]
        
        for idx, section in enumerate(enabled_tasks, 1):
            task_id = section.replace("Task", "")
            info = config[section]
            
            logger.info(f"\n处理任务 {idx}/{len(enabled_tasks)}: {info['name']}")
            
            # 检查现有文件
            exist_ip = None
            ip_file = f"udp_ip_{task_id}.txt"
            if os.path.exists(ip_file):
                with open(ip_file, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        exist_ip = content.split(':')[0]
                        logger.info(f"检测到已保存IP: {content}")
            
            try:
                result = await scan_task(task_id, info, exist_ip)
                if result:
                    save_ip(task_id, result, info["port"])
            except Exception as e:
                logger.error(f"任务 {task_id} 执行失败: {e}")
        
        logger.info("=" * 60)
        logger.info(f"第 {round_num} 轮扫描完成，休眠 {SCAN_INTERVAL//60} 分钟")
        logger.info("=" * 60)
        await asyncio.sleep(SCAN_INTERVAL)

if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
    except KeyboardInterrupt:
        logger.info("程序已手动终止")
    except Exception as e:
        logger.error(f"程序崩溃: {e}")
```

---

