---
sidebar_label: '向量'
sidebar_position: 220
slug: /integrations/vector
description: '如何使用 Vector 将日志文件尾随到 ClickHouse 中'
---

import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';


# 将 Vector 与 ClickHouse 集成

实时分析日志对生产应用程序至关重要。您是否曾想过 ClickHouse 是否擅长存储和分析日志数据？只需查看 <a href="https://eng.uber.com/logging/" target="_blank">Uber 关于将其日志基础设施从 ELK 转换为 ClickHouse 的经验</a>。

本指南展示了如何使用流行的数据管道 <a href="https://vector.dev/docs/about/what-is-vector/" target="_blank">Vector</a> 将 Nginx 日志文件尾随并发送到 ClickHouse。下面的步骤对于任何类型的日志文件尾随都是相似的。我们将假设您已经安装并运行了 ClickHouse 和 Vector（但还无需启动 Vector）。

## 1. 创建数据库和表 {#1-create-a-database-and-table}

让我们定义一个表来存储日志事件：

1. 我们将从一个名为 `nginxdb` 的新数据库开始：
    ```sql
    CREATE DATABASE IF NOT EXISTS nginxdb
    ```

2. 一开始，我们只会将整个日志事件作为一个字符串插入。显然，这不是对日志数据进行分析的好格式，但我们将在下面通过 ***物化视图*** 解决这个问题。
    ```sql
    CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
        message String
    )
    ENGINE = MergeTree()
    ORDER BY tuple()
    ```
    :::note
    目前没有必要使用主键，这就是为什么 **ORDER BY** 被设置为 **tuple()**。
    :::


## 2. 配置 Nginx {#2--configure-nginx}

我们当然不想花太多时间解释 Nginx，但我们也不想隐藏所有细节，因此在此步骤中，我们将提供足够的信息以配置 Nginx 日志记录。

1. 以下 `access_log` 属性将日志发送到 `/var/log/nginx/my_access.log`，格式为 **combined**。该值应放在您 `nginx.conf` 文件的 `http` 部分：
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

2. 如果您修改了 `nginx.conf`，请确保重新启动 Nginx。

3. 通过访问您的 web 服务器上的页面生成一些访问日志。**combined** 格式的日志具有以下格式：
    ```bash
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

## 3. 配置 Vector {#3-configure-vector}

Vector 收集、转换和路由日志、指标和跟踪（称为 **sources**）到许多不同的供应商（称为 **sinks**），包括与 ClickHouse 的开箱即用兼容性。sources 和 sinks 在一个名为 **vector.toml** 的配置文件中定义。

1. 以下 **vector.toml** 定义了一种类型为 **file** 的 **source**，其尾随 **my_access.log** 的末尾，并且还将上述定义为 **access_logs** 表的 **sink**：
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

2. 使用上述配置启动 Vector。 <a href="https://vector.dev/docs/" target="_blank">访问 Vector 文档</a> 以获取有关定义 sources 和 sinks 的更多详细信息。

3. 验证访问日志是否已插入到 ClickHouse。运行以下查询，您应该在表中看到访问日志：
    ```sql
    SELECT * FROM nginxdb.access_logs
    ```
    <img src={vector01} class="image" alt="查看日志" />


## 4. 解析日志 {#4-parse-the-logs}

将日志存储在 ClickHouse 中很好，但将每个事件作为单个字符串存储并不利于数据分析。让我们看看如何使用物化视图解析日志事件。

1. **物化视图**（简称 MV）是基于现有表的新表，当向现有表插入数据时，新数据也会添加到物化视图中。让我们看一下如何定义一个包含 **access_logs** 中解析表示的 MV，换句话说：
    ```bash
    192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
    ```

    在 ClickHouse 中有各种函数可以解析字符串，但首先让我们看看 **splitByWhitespace** - 它通过空格解析字符串并将每个标记返回为数组。为了演示，运行以下命令：
    ```sql
    SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    请注意，响应与我们想要的非常接近！几个字符串有一些多余的字符，用户代理（浏览器详细信息）也不需要被解析，但我们将在下一步中解决这个问题：
    ```text
    ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
    ```

2. 类似于 **splitByWhitespace**，**splitByRegexp** 函数根据正则表达式将字符串拆分为数组。运行以下命令，它将返回两个字符串。
    ```sql
    SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
    ```

    请注意，第二个返回的字符串是成功从日志中解析出来的用户代理：
    ```text
    ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
    ```

3. 在查看最终的 **CREATE MATERIALIZED VIEW** 命令之前，让我们查看更多用于清理数据的函数。例如，`RequestMethod` 看起来像 **"GET** 但有一个多余的双引号。运行以下 **trim** 函数，它会删除双引号：
    ```sql
    SELECT trim(LEADING '"' FROM '"GET')
    ```

4. 时间字符串有一个前导方括号，且格式不符合 ClickHouse 的日期解析要求。然而，如果我们将分隔符从冒号 (**:**) 改为逗号 (**,**) 则解析效果非常好：
    ```sql
    SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
    ```

5. 现在我们准备定义我们的物化视图。我们的定义包括 **POPULATE**，这意味着将立即处理并插入 **access_logs** 中的现有行。运行以下 SQL 语句：
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

6. 现在验证它是否有效。您应该看到访问日志被很好地解析为列：
    ```sql
    SELECT * FROM nginxdb.access_logs_view
    ```
    <img src={vector02} class="image" alt="查看日志" />

    :::note
    上面的例子将数据存储在两个表中，但您可以将初始 `nginxdb.access_logs` 表更改为使用 **Null** 表引擎 - 虽然解析的数据仍将最终进入 `nginxdb.access_logs_view` 表，原始数据将不会存储在表中。
    :::


**总结：** 通过使用 Vector，只需简单的安装和快速配置，我们可以将来自 Nginx 服务器的日志发送到 ClickHouse 中的一个表。通过使用巧妙的物化视图，我们可以将这些日志解析为列，以便更轻松进行分析。

## 相关内容 {#related-content}

- 博客：[在 2023 年使用 ClickHouse 构建可观测性解决方案 - 第 1 部分 - 日志](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- 博客：[使用 Fluent Bit 将 Nginx 日志发送到 ClickHouse](https://clickhouse.com/blog/nginx-logs-to-clickhouse-fluent-bit)
- 博客：[使用 Fluent Bit 将 Kubernetes 日志发送到 ClickHouse](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)
