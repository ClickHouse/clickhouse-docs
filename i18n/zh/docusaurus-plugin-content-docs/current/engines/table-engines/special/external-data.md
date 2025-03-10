---
slug: /engines/table-engines/special/external-data
sidebar_position: 130
sidebar_label: 外部数据
title: '用于查询处理的外部数据'
description: 'ClickHouse 允许将处理查询所需的数据与 `SELECT` 查询一起发送给服务器。这些数据被放入一个临时表中，并可以在查询中使用（例如，在 `IN` 运算符中）。'
---


# 用于查询处理的外部数据

ClickHouse 允许将处理查询所需的数据与 `SELECT` 查询一起发送给服务器。这些数据被放入一个临时表中（请参见“临时表”部分），并可以在查询中使用（例如，在 `IN` 运算符中）。

例如，如果您有一个包含重要用户标识符的文本文件，您可以将其上传到服务器，并使用这个列表进行过滤的查询。

如果您需要使用大量外部数据运行多个查询，建议不要使用此功能。最好提前将数据上传到数据库。

外部数据可以通过命令行客户端（以非交互模式）或通过 HTTP 接口上传。

在命令行客户端中，您可以指定参数部分，格式如下：

``` bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

对于传输的表，可以有多个这样的部分。

**–external** – 标记子句的开始。
**–file** – 表的转储文件的路径，或 - ，表示标准输入。
只能从标准输入中检索单个表。

以下参数是可选的：**–name** – 表的名称。如果省略，使用 _data。
**–format** – 文件中的数据格式。如果省略，使用 TabSeparated。

以下参数之一是必需的：**–types** – 以逗号分隔的列类型列表。例如：`UInt64,String`。列将被命名为 _1, _2, ... 
**–structure** – 表结构，格式为 `UserID UInt64`, `URL String`。定义列的名称和类型。

在“file”中指定的文件将按“format”中指定的格式解析，使用“types”或“structure”中指定的数据类型。该表将被上传到服务器，并在服务器上作为临时表以“name”中的名称访问。

示例：

``` bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

使用 HTTP 接口时，外部数据以 multipart/form-data 格式传递。每个表作为单独的文件传输。表名取自文件名。`query_string` 传递参数 `name_format`、`name_types` 和 `name_structure`，其中 `name` 是这些参数所对应的表名。参数的含义与使用命令行客户端时相同。

示例：

``` bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

对于分布式查询处理，临时表将发送到所有远程服务器。
