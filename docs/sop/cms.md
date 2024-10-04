# 苹果CMS搭建后只有首页打得开、其它页面404的处理方法

设置伪静态
```php
if (!-e $request_filename) {
rewrite ^/index.php(.*)$ /index.php?s=$1 last;
rewrite ^/admin.php(.*)$ /admin.php?s=$1 last;
rewrite ^/api.php(.*)$ /api.php?s=$1 last;
rewrite ^(.*)$ /index.php?s=$1 last;
break;
}
```
:::warning 注意事项 上面两个admin都要改成你自己修改后的名称
