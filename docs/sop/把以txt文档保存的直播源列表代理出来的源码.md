```php
<?php
// 设置脚本不超时并增加内存限制
set_time_limit(0);
ini_set('memory_limit', '256M');

// 获取当前协议（智能识别http或https）
function getCurrentProtocol() {
    if ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
        (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
        return 'https://';
    } else {
        return 'http://';
    }
}

// 获取频道数据
function fetchChannelData() {
    $url = 'https://live.bpzx.dpdns.org/txt/至尊.txt';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 128 * 1024);
    $data = curl_exec($ch);
    
    if (curl_errno($ch)) {
        error_log('cURL Error: ' . curl_error($ch));
        return false;
    }
    
    curl_close($ch);
    
    return $data;
}

// 解析频道数据（修复空白分类问题）
function parseChannels($data) {
    // 处理不同操作系统的换行符
    $lines = preg_split('/\r\n|\n|\r/', $data);
    $channels = [];
    $currentGenre = '';
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        // 检测分类行
        if (preg_match('/^(.*?),\s*#genre#\s*$/i', $line, $matches)) {
            $currentGenre = trim($matches[1]);
            
            // 确保每个分类都被初始化，即使后面没有频道行
            if (!isset($channels[$currentGenre])) {
                $channels[$currentGenre] = [];
            }
            continue;
        }
        
        // 只有设置了当前分类才处理频道行
        if (!empty($currentGenre)) {
            // 解析频道行（支持双逗号分隔）
            $parts = explode(',', $line, 2);
            if (count($parts) === 2) {
                $name = trim($parts[0]);
                $url = trim($parts[1]);
                
                // 放宽URL验证（支持相对路径）
                if (!empty($url) && (filter_var($url, FILTER_VALIDATE_URL) || preg_match('/^https?:\/\//i', $url))) {
                    $channels[$currentGenre][$name] = $url;
                }
            }
        }
    }
    
    return $channels;
}

// 主处理逻辑
$channelData = fetchChannelData();

if ($channelData === false) {
    header('Content-Type: text/plain; charset=utf-8');
    die('无法获取频道数据，请稍后再试');
}

$channels = parseChannels($channelData);

// 处理播放请求
if (isset($_GET['id']) && isset($_GET['genre'])) {
    $id = $_GET['id'];
    $genre = $_GET['genre'];
    
    if (isset($channels[$genre]) && isset($channels[$genre][$id])) {
        header('Location: ' . $channels[$genre][$id]);
        exit;
    } else {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo "找不到频道: " . $id . " (分类: " . $genre . ")";
        exit;
    }
}

// 获取当前协议和主机信息
$protocol = getCurrentProtocol();
$host = $_SERVER['HTTP_HOST'];
$scriptName = basename($_SERVER['SCRIPT_NAME']);

// 输出频道列表
header('Content-Type: text/plain; charset=utf-8');
ob_start();

foreach ($channels as $genre => $items) {
    // 输出分类行
    echo $genre . ",#genre#\n";
    
    if (!empty($items)) {
        foreach ($items as $name => $url) {
            // 根据当前协议创建代理URL
            $proxyUrl = "{$protocol}{$host}/{$scriptName}?id={$name}&genre={$genre}";
            $cleanUrl = str_replace(['%2F', '%20'], ['/', ' '], $proxyUrl);
            
            echo $name . "," . $cleanUrl . "\n";
        }
    }
    
    // 分类之间添加空行
    echo "\n";
}

ob_end_flush();
```
## 使用方法
访问：http://localhost/daili.php
就可以把所有代理后的频道列表展示出来
