---
'sidebar_label': 'Vector'
'sidebar_position': 220
'slug': '/integrations/vector'
'description': '如何使用 Vector 将日志文件尾部传输到 ClickHouse'
'title': '将 Vector 与 ClickHouse 集成'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Vector 与 ClickHouse 集成

<CommunityMaintainedBadge/>

能够实时分析日志对于生产应用程序至关重要。您是否曾想过 ClickHouse 是否适合存储和分析日志数据？只需查看 <a href="https://eng.uber.com/logging/" target="_blank">Uber 的经验</a>，了解他们将日志基础设施从 ELK 转换为 ClickHouse 的过程。

本指南展示了如何使用流行的数据管道 <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> 监控 Nginx 日志文件并将其发送到 ClickHouse。下面的步骤对于监控任何类型的日志文件都是相似的。我们将假设您已经安装并运行 ClickHouse 和 Vector（不过目前不需要启动它）。

## 1. 创建数据库和表 {#1-create-a-database-and-table}

让我们定义一个表来存储日志事件：

1. 我们将从一个名为 `nginxdb` 的新数据库开始：
```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 首先，我们将把整个日志事件作为一个字符串插入。显然，这对于对日志数据进行分析并不是一个很好的格式，但我们将在下面通过 ***物化视图*** 来解决这个问题。
```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
    message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```
    :::note
    目前并不需要主键，这就是为什么 **ORDER BY** 设置为 **tuple()** 的原因。
    :::

## 2. 配置 Nginx {#2--configure-nginx}

我们当然不想花太多时间来解释 Nginx，但我们也不想隐藏所有细节，因此在此步骤中，我们将为您提供足够的细节以配置 Nginx 日志记录。

1. 以下 `access_log` 属性将日志发送到 `/var/log/nginx/my_access.log`，采用 **combined** 格式。此值应该放在 `nginx.conf` 文件的 `http` 部分：
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

2. 如果您需要修改 `nginx.conf`，请务必重启 Nginx。

3. 通过访问您的 Web 服务器上的页面来生成一些访问日志事件。**combined** 格式的日志具有以下格式：
```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## 3. 配置 Vector {#3-configure-vector}

Vector 收集、转换和路由日志、指标和跟踪（称为 **sources**）到多个不同的供应商（称为 **sinks**），包括开箱即用的 ClickHouse 兼容性。sources 和 sinks 在名为 **vector.toml** 的配置文件中定义。

1. 以下 **vector.toml** 定义了一个类型为 **file** 的 **source**，它监控 **my_access.log** 的末尾，同时也定义了一个 **sink**，即上面定义的 **access_logs** 表：
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

2. 使用上述配置启动 Vector。有关定义 sources 和 sinks 的更多详情，请 <a href="https://vector.dev/docs/" target="_blank">查看 Vector 文档</a>。

3. 验证访问日志是否已插入到 ClickHouse 中。运行以下查询，您应该在表中看到访问日志：
```sql
SELECT * FROM nginxdb.access_logs
```
    <Image img={vector01} size="lg" border alt="以表格格式查看 ClickHouse 日志" />

## 4. 解析日志 {#4-parse-the-logs}

将日志存储在 ClickHouse 中很好，但将每个事件存储为一个字符串并不能进行太多数据分析。让我们看看如何使用物化视图解析日志事件。

1. **物化视图**（简称 MV）是基于现有表的新表，当往现有表插入数据时，新数据也会添加到物化视图中。让我们看看如何定义一个 MV，该 MV 包含 **access_logs** 中日志事件的解析表示，也就是说：
```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

    ClickHouse 中有多种函数用于解析字符串，但首先让我们看看 **splitByWhitespace** ——它通过空格解析字符串并返回每个标记的数组。为了演示，请运行以下命令：
```sql
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    请注意，响应非常接近我们所需的！一些字符串有额外的字符，而用户代理（浏览器详细信息）不需要被解析，但我们将在下一步解决这个问题：
```text
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

2. 类似于 **splitByWhitespace**，**splitByRegexp** 函数根据正则表达式将字符串拆分为数组。运行以下命令，它返回两个字符串。
```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

    请注意，返回的第二个字符串是成功从日志中解析的用户代理：
```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

3. 在查看最终的 **CREATE MATERIALIZED VIEW** 命令之前，让我们再看几个用于清理数据的函数。例如，`RequestMethod` 看起来像 **"GET** 并带有不需要的双引号。运行以下 **trim** 函数，它会移除双引号：
```sql
SELECT trim(LEADING '"' FROM '"GET')
```

4. 时间字符串前面有一个左方括号，而且它的格式也不在 ClickHouse 能解析为日期的范围内。然而，如果我们将分隔符从冒号（**:**）更改为逗号（**,**），那么解析将会很好：
```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

5. 现在我们准备定义我们的物化视图。我们的定义包括 **POPULATE**，这意味着 **access_logs** 中的现有行将立即被处理并插入。运行以下 SQL 语句：
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

6. 现在验证它是否有效。您应该看到访问日志已很好地解析为列：
```sql
SELECT * FROM nginxdb.access_logs_view
```
    <Image img={vector02} size="lg" border alt="以表格格式查看解析后的 ClickHouse 日志" />

    :::note
    上述课程将数据存储在两个表中，但您可以将初始的 `nginxdb.access_logs` 表更改为使用 **Null** 表引擎——解析后的数据仍将最终存储在 `nginxdb.access_logs_view` 表中，但原始数据不会存储在表中。
    :::

**总结：** 通过使用 Vector，只需简单安装和快速配置，我们可以将日志从 Nginx 服务器发送到 ClickHouse 中的一个表中。通过使用巧妙的物化视图，我们可以将这些日志解析为列，以便于分析。
