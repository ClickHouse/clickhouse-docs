---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: '如何使用 Vector 将日志文件实时写入 ClickHouse'
title: 'Vector 与 ClickHouse 集成'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', '日志采集', '可观测性', '数据摄取', '数据管道']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 Vector 与 ClickHouse 集成

<PartnerBadge />

对于生产应用程序而言,实时分析日志至关重要。
ClickHouse 在存储和分析日志数据方面表现卓越,这得益于其出色的压缩能力(日志压缩比可达 [170 倍](https://clickhouse.com/blog/log-compression-170x))
以及快速聚合海量数据的能力。

本指南将向您展示如何使用流行的数据管道工具 [Vector](https://vector.dev/docs/about/what-is-vector/) 来跟踪 Nginx 日志文件并将其发送到 ClickHouse。
以下步骤同样适用于跟踪任何类型的日志文件。

**前置条件:**

- 您已经安装并运行了 ClickHouse
- 您已经安装了 Vector

<VerticalStepper headerLevel="h2">


## 创建数据库和表 {#1-create-a-database-and-table}

定义一个用于存储日志事件的表:

1. 首先创建一个名为 `nginxdb` 的新数据库:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 将整个日志事件作为单个字符串插入。显然,这种格式不适合对日志数据进行分析,但我们将在下文中使用**_物化视图_**来解决这个问题。

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note
**ORDER BY** 设置为 **tuple()**(空元组),因为目前还不需要主键。
:::


## 配置 Nginx {#2--configure-nginx}

在此步骤中,将介绍如何配置 Nginx 日志记录。

1. 以下 `access_log` 属性会将日志以 **combined** 格式发送到 `/var/log/nginx/my_access.log`。
   该配置应放置在 `nginx.conf` 文件的 `http` 部分:

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

2. 如果修改了 `nginx.conf`,请务必重启 Nginx。

3. 通过访问 Web 服务器上的页面来生成一些访问日志事件。
   **combined** 格式的日志如下所示:

```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```


## 配置 Vector {#3-configure-vector}

Vector 收集、转换和路由日志、指标和追踪数据(称为 **sources**)到多个不同的目标系统(称为 **sinks**),包括对 ClickHouse 的开箱即用支持。
Sources 和 sinks 在名为 **vector.toml** 的配置文件中定义。

1. 以下 **vector.toml** 文件定义了一个类型为 **file** 的 **source**,用于追踪 **my_access.log** 文件末尾的内容,同时还定义了一个 **sink** 指向上面定义的 **access_logs** 表:

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

2. 使用上述配置启动 Vector。访问 Vector [文档](https://vector.dev/docs/)了解有关定义 sources 和 sinks 的更多详细信息。

3. 通过运行以下查询验证访问日志是否正在插入到 ClickHouse 中。您应该能在表中看到访问日志:

```sql
SELECT * FROM nginxdb.access_logs
```

<Image
  img={vector01}
  size='lg'
  border
  alt='以表格格式查看 ClickHouse 日志'
/>


## 解析日志 {#4-parse-the-logs}

将日志存储在 ClickHouse 中固然很好,但将每个事件存储为单个字符串并不便于进行深入的数据分析。
接下来我们将介绍如何使用[物化视图](/materialized-view/incremental-materialized-view)来解析日志事件。

**物化视图**的功能类似于 SQL 中的插入触发器。当数据行插入到源表时,物化视图会对这些行进行转换,并将结果插入到目标表中。
可以配置物化视图来生成 **access_logs** 中日志事件的解析表示。
下面是一个此类日志事件的示例:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

ClickHouse 中有多种函数可以解析上述字符串。[`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) 函数按空格解析字符串,并将每个标记以数组形式返回。
为了演示,请运行以下命令:

```sql title="查询"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="响应"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

部分字符串包含额外的字符,并且用户代理(浏览器详细信息)不需要被解析,但结果数组已经接近所需的格式。

与 `splitByWhitespace` 类似,[`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) 函数基于正则表达式将字符串拆分为数组。
运行以下命令,它将返回两个字符串。

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

注意返回的第二个字符串是从日志中成功解析出的用户代理:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

在查看最终的 `CREATE MATERIALIZED VIEW` 命令之前,让我们先了解几个用于清理数据的函数。
例如,`RequestMethod` 的值是 `"GET`,包含一个不需要的双引号。
您可以使用 [`trimBoth`(别名 `trim`)](/sql-reference/functions/string-functions#trimBoth) 函数来删除双引号:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

时间字符串有一个前导方括号,并且其格式也不是 ClickHouse 可以解析为日期的格式。
但是,如果我们将分隔符从冒号(**:**)更改为空格,那么解析就能很好地工作:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```


现在我们可以定义物化视图了。
下面的定义包含 `POPULATE` 参数,这意味着 **access_logs** 中的现有行将立即被处理并插入。
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

现在验证是否成功。
您应该能看到访问日志已被正确解析为列:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image
  img={vector02}
  size='lg'
  border
  alt='以表格格式查看已解析的 ClickHouse 日志'
/>

:::note
上述示例将数据存储在两个表中,但您可以将初始的 `nginxdb.access_logs` 表改为使用 [`Null`](/engines/table-engines/special/null) 表引擎。
解析后的数据仍会存储在 `nginxdb.access_logs_view` 表中,但原始数据不会被存储。
:::

</VerticalStepper>

> 通过使用 Vector(只需简单安装和快速配置),您可以将 Nginx 服务器的日志发送到 ClickHouse 表中。通过使用物化视图,您可以将这些日志解析为列,从而更便于进行分析。
