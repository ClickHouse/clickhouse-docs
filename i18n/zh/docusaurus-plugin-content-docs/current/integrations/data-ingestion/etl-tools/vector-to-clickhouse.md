---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: '如何使用 Vector 跟踪日志文件并写入 ClickHouse'
title: '将 Vector 与 ClickHouse 集成'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', '日志收集', '可观测性', '数据摄取', '管道']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# 将 Vector 与 ClickHouse 集成 {#integrating-vector-with-clickhouse}

<PartnerBadge />

实时分析日志对于生产应用程序至关重要。
ClickHouse 在存储和分析日志数据方面表现卓越,这得益于其出色的压缩能力(日志压缩率可达 [170 倍](https://clickhouse.com/blog/log-compression-170x))以及快速聚合海量数据的能力。

本指南将介绍如何使用流行的数据管道工具 [Vector](https://vector.dev/docs/about/what-is-vector/) 来跟踪 Nginx 日志文件并将其发送到 ClickHouse。
以下步骤同样适用于跟踪任何类型的日志文件。

**前置条件:**

* 您已部署并运行 ClickHouse
* 您已安装 Vector

<VerticalStepper headerLevel="h2">

## 创建数据库和表 {#1-create-a-database-and-table}

定义一个用于存储日志事件的表：

1. 首先创建一个名为 `nginxdb` 的新数据库：

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 将整条日志事件作为一个字符串插入。显然，这并不是对日志数据进行分析的理想格式，不过我们会在下文中借助***物化视图***来解决这一问题。

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** 被设置为 **tuple()**（一个空元组），因为当前还不需要主键。
:::

## 配置 Nginx {#2--configure-nginx}

在本步骤中，将演示如何配置 Nginx 日志记录。

1. 以下 `access_log` 属性会以 **combined** 格式将日志写入 `/var/log/nginx/my_access.log`。
   该配置应放在 `nginx.conf` 文件的 `http` 块中：

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

2. 如果你修改了 `nginx.conf`，务必重启 Nginx。

3. 通过访问 Web 服务器上的页面，在访问日志（access log）中生成一些日志事件。\
   以 **combined** 格式记录的日志大致如下：

```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## 配置 Vector {#3-configure-vector}

Vector 会收集、转换并路由日志、指标和追踪数据（统称为 **sources**），将其发送到多个不同的后端目标（统称为 **sinks**），并且开箱即用地兼容 ClickHouse。
Sources 和 sinks 都在名为 **vector.toml** 的配置文件中定义。

1. 以下 **vector.toml** 文件定义了一个类型为 **file** 的 **source**，用于持续跟踪读取 **my_access.log** 文件末尾的内容，同时还定义了一个 **sink**，即上文定义的 **access_logs** 表：

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

2. 使用上述配置启动 Vector。请参阅 Vector 的[文档](https://vector.dev/docs/)，以了解更多关于定义 source 和 sink 的详细信息。

3. 通过运行以下查询验证访问日志是否已经写入 ClickHouse。您应该能在表中看到这些访问日志：

```sql
SELECT * FROM nginxdb.access_logs
```

<Image img={vector01} size="lg" border alt="以表格形式查看 ClickHouse 日志" />

## 解析日志 {#4-parse-the-logs}

将日志存储在 ClickHouse 中固然很好，但如果将每个事件都存储为单个字符串，就很难进行有效的数据分析。
接下来我们将介绍如何使用[物化视图](/materialized-view/incremental-materialized-view)来解析日志事件。

**物化视图**的作用类似于 SQL 中的插入触发器。当数据行被插入到源表时，物化视图会对这些行进行转换，并将结果插入到目标表中。
我们可以配置物化视图，将 **access_logs** 中的日志事件解析为结构化表示。
下面是一个此类日志事件的示例：

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

ClickHouse 中有多种函数可以用来解析上述字符串。[`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) 函数按空白字符对字符串进行分割，并将每个标记作为数组元素返回。
为演示这一点，运行以下命令：

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

有些字符串包含一些多余字符，而且用户代理字符串（浏览器信息）其实无需解析，不过
生成的数组已经与所需结果非常接近。

类似于 `splitByWhitespace`，[`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) 函数会基于正则表达式将字符串拆分为数组。
运行以下命令，它会返回两个字符串。

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

请注意，返回的第二个字符串是从日志中成功解析出的 User-Agent：

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

在查看最终的 `CREATE MATERIALIZED VIEW` 命令之前，先来看几个用于清理数据的函数。
例如，`RequestMethod` 的值是 `"GET`，其中包含一个多余的双引号。
可以使用 [`trimBoth`（别名 `trim`）](/sql-reference/functions/string-functions#trimBoth) 函数来移除这个双引号：

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

时间字符串开头有一个左方括号，而且其格式也不是 ClickHouse 能够解析为日期的格式。
但是，如果我们把分隔符从冒号（**:**）改成逗号（**,**），那么就可以顺利完成解析：

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

现在我们可以定义物化视图了。
下面的定义包含 `POPULATE`,这意味着 **access_logs** 中的现有行将立即被处理并插入。
运行以下 SQL 语句:

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

现在验证其是否生效。
您应该看到访问日志已被正确解析为列:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image img={vector02} size="lg" border alt="以表格格式查看已解析的 ClickHouse 日志" />

:::note
上述示例将数据存储在两个表中,但您可以将初始的 `nginxdb.access_logs` 表更改为使用 [`Null`](/engines/table-engines/special/null) 表引擎。
解析后的数据仍将存储在 `nginxdb.access_logs_view` 表中,但原始数据不会存储在表中。
:::
</VerticalStepper>

> 通过使用 Vector(只需简单安装和快速配置),您可以将 Nginx 服务器的日志发送到 ClickHouse 表中。通过使用物化视图,您可以将这些日志解析为列,以便更轻松地进行分析。
