---
description: 'ClickHouse 允许在发送 `SELECT` 查询的同时，将处理该查询所需的数据一并发送到服务器。该数据会被放入一张临时表中，并且可以在查询中使用（例如在 `IN` 运算符中）。'
sidebar_label: '用于查询处理的外部数据'
sidebar_position: 130
slug: /engines/table-engines/special/external-data
title: '用于查询处理的外部数据'
doc_type: 'reference'
---

# 用于查询处理的外部数据 {#external-data-for-query-processing}

ClickHouse 允许在发送 `SELECT` 查询时，将查询处理所需的数据一并发送到服务器。此数据会被放入一张临时表（参见“临时表”一节），并且可以在查询中使用（例如用于 `IN` 运算符）。

例如，如果你有一个包含重要用户标识符的文本文件，可以在执行按该列表进行过滤的查询时，将该文件一并上传到服务器。

如果你需要在包含大量外部数据的场景下运行多条查询，请不要使用此功能。更好的做法是预先将数据导入数据库。

外部数据可以通过命令行客户端（非交互模式）上传，或者通过 HTTP 接口上传。

在命令行客户端中，你可以按如下格式指定一个参数部分

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

对于要传输的每个表，你可以有像这样的一段配置。

**–external** – 标志一个子句的开始。
**–file** – 包含表转储的文件路径，或者 -，表示使用标准输入（stdin）。
只能从标准输入中获取单个表。

以下参数是可选的：**–name** – 表名。如果省略，则使用 &#95;data。
**–format** – 文件中的数据格式。如果省略，则使用 TabSeparated。

以下参数中至少需要提供一个：**–types** – 以逗号分隔的列类型列表。例如：`UInt64,String`。列名将为 &#95;1、&#95;2、...
**–structure** – 表结构，格式为 `UserID UInt64`、`URL String`。用于定义列名和列类型。

在 &#39;file&#39; 中指定的文件将按 &#39;format&#39; 中指定的格式解析，并使用在 &#39;types&#39; 或 &#39;structure&#39; 中指定的数据类型。该表将被上传到服务器，并可在服务器端作为名为 &#39;name&#39; 的临时表进行访问。

示例：

```bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

通过 HTTP 接口时，外部数据以 `multipart/form-data` 格式传输。每个表作为单独的文件发送，表名取自文件名。通过 `query_string` 传递参数 `name_format`、`name_types` 和 `name_structure`，其中 `name` 是这些参数对应的表名。这些参数的含义与使用命令行客户端时相同。

示例：

```bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

在进行分布式查询处理时，会将临时表发送到所有远程服务器。
