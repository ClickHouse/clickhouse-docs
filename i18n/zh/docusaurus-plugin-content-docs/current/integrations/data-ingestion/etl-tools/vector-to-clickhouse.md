---
'sidebar_label': 'Vector'
'sidebar_position': 220
'slug': '/integrations/vector'
'description': '如何使用 Vector 将日志文件导入 ClickHouse'
'title': '将 Vector 与 ClickHouse 集成'
'show_related_blogs': true
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Vector 与 ClickHouse 集成

<CommunityMaintainedBadge/>

能够实时分析日志对生产应用至关重要。您是否曾想过 ClickHouse 在存储和分析日志数据方面是否表现良好？请查看 <a href="https://eng.uber.com/logging/" target="_blank">Uber 的经验</a>，了解他们如何将日志基础设施从 ELK 转换为 ClickHouse。

本指南展示了如何使用流行的数据管道 <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> 来跟踪 Nginx 日志文件并将其发送到 ClickHouse。下面的步骤适用于跟踪任何类型的日志文件。我们将假设您已经启动并运行 ClickHouse，并已安装 Vector（不过目前不需要启动它）。

## 1. 创建数据库和表 {#1-create-a-database-and-table}

让我们定义一个表来存储日志事件：

1. 我们将从一个名为 `nginxdb` 的新数据库开始：
```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 首先，我们将整个日志事件作为一个字符串插入。显然，这并不是进行日志数据分析的好格式，但我们将在下面利用 ***物化视图*** 来解决此问题。
```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
    message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```
    :::note
    目前并不需要主键，因此 **ORDER BY** 设置为 **tuple()**。
    :::


## 2. 配置 Nginx {#2--configure-nginx}

我们当然不想花太多时间来解释 Nginx，但我们也不想省略所有细节，因此在这一步中，我们将提供足够的细节，以便您配置 Nginx 日志记录。

1. 以下 `access_log` 属性将日志发送到 `/var/log/nginx/my_access.log`，格式为 **combined**。此值应放在 `nginx.conf` 文件的 `http` 部分：
```bash
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    access_log  /var/log/nginx/my_access.log combined;
    sendfile        on;
    keepalive_timeout  65;
    include /etc/nginx/conf.d/*.conf;
}
```

2. 如果修改了 `nginx.conf`，请务必重启 Nginx。

3. 通过访问您的 Web 服务器上的页面生成一些访问日志。**combined** 格式的日志具有以下格式：
```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## 3. 配置 Vector {#3-configure-vector}

Vector 收集、转换和路由日志、指标和跟踪（称为 **sources**）到许多不同的供应商（称为 **sinks**），包括与 ClickHouse 的开箱即用兼容性。源和接收器在名为 **vector.toml** 的配置文件中定义。

1. 以下 **vector.toml** 定义了一个类型为 **file** 的 **source**，它跟踪 **my_access.log** 的末尾，同时还定义了一个接收器作为上面定义的 **access_logs** 表：
```bash
[sources.nginx_logs]
type = "file"
include = [ "/var/log/nginx/my_access.log" ]
read_from = "end"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["nginx_logs"]
endpoint = "http://clickhouse-server:8123"
database = "nginxdb"
table = "access_logs"
skip_unknown_fields = true
```

2. 使用上述配置启动 Vector。有关定义源和接收器的更多细节，请<a href="https://vector.dev/docs/" target="_blank">访问 Vector 文档</a>。

3. 验证访问日志是否已插入 ClickHouse。运行以下查询，您应该能在表中看到访问日志：
```sql
SELECT * FROM nginxdb.access_logs
```
    <Image img={vector01} size="lg" border alt="以表格形式查看 ClickHouse 日志" />


## 4. 解析日志 {#4-parse-the-logs}

在 ClickHouse 中拥有日志是很好的，但将每个事件存储为单个字符串并不便于数据分析。让我们看看如何使用物化视图解析日志事件。

1. **物化视图**（简称 MV）是基于现有表的新表，当对现有表插入数据时，新数据也会被添加到物化视图中。让我们看一下如何定义一个包含日志事件解析表示的 MV，换句话说：
```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

    在 ClickHouse 中有各种函数可以解析字符串，但作为开端，让我们看看 **splitByWhitespace** - 它通过空格解析字符串并返回每个标记到数组中。为了演示，请运行以下命令：
```sql
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    请注意，返回的响应与我们想要的内容非常接近！一些字符串包含多余的字符，而用户代理（浏览器详细信息）不需要解析，但我们将在下一步解决这个问题：
```text
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

2. 类似于 **splitByWhitespace**，**splitByRegexp** 函数根据正则表达式将字符串拆分为数组。运行以下命令，返回两个字符串。
```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    注意返回的第二个字符串是成功从日志中解析的用户代理：
```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

3. 在查看最终的 **CREATE MATERIALIZED VIEW** 命令之前，让我们查看几个用于清理数据的函数。例如，`RequestMethod` 看起来像 **"GET** 有一个多余的双引号。运行以下 **trim** 函数，去除双引号：
```sql
SELECT trim(LEADING '"' FROM '"GET')
```

4. 时间字符串前面有一个左方括号，并且格式不符合 ClickHouse 可以解析为日期的格式。然而，如果我们将分隔符从冒号 (**:**) 改为逗号 (**)，则解析效果很好：
```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

5. 我们现在准备定义我们的物化视图。我们的定义包括 **POPULATE**，这意味着 **access_logs** 中现有的行将被立即处理并插入。运行以下 SQL 语句：
```sql
CREATE MATERIALIZED VIEW nginxdb.access_logs_view
(
    RemoteAddr String,
    Client String,
    RemoteUser String,
    TimeLocal DateTime,
    RequestMethod String,
    Request String,
    HttpVersion String,
    Status Int32,
    BytesSent Int64,
    UserAgent String
)
ENGINE = MergeTree()
ORDER BY RemoteAddr
POPULATE AS
WITH
    splitByWhitespace(message) as split,
    splitByRegexp('\S \d+ "([^"]*)"', message) as referer
SELECT
    split[1] AS RemoteAddr,
    split[2] AS Client,
    split[3] AS RemoteUser,
    parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM split[4]), ':', ' ')) AS TimeLocal,
    trim(LEADING '"' FROM split[6]) AS RequestMethod,
    split[7] AS Request,
    trim(TRAILING '"' FROM split[8]) AS HttpVersion,
    split[9] AS Status,
    split[10] AS BytesSent,
    trim(BOTH '"' from referer[2]) AS UserAgent
FROM
    (SELECT message FROM nginxdb.access_logs)
```

6. 现在验证是否成功。您应该能够看到访问日志整齐地解析为列：
```sql
SELECT * FROM nginxdb.access_logs_view
```
    <Image img={vector02} size="lg" border alt="以表格形式查看解析后的 ClickHouse 日志" />

    :::note
    上面的课程将数据存储在两个表中，但您可以将初始的 `nginxdb.access_logs` 表更改为使用 **Null** 表引擎 — 解析后的数据仍将进入 `nginxdb.access_logs_view` 表中，但原始数据将不会存储在表中。
    :::


**总结：** 通过使用 Vector，只需简单安装和快速配置，我们便可以将日志从 Nginx 服务器发送到 ClickHouse 中的一个表。通过使用巧妙的物化视图，我们可以将这些日志解析为列，以便于更简单的分析。
