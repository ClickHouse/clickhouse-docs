---
description: 'ClickHouse 允许在发送 `SELECT` 查询的同时，将查询处理所需的数据一并发送到服务器。这些数据会被放入一张临时表中，并可在查询中使用（例如用于 `IN` 运算符）。'
sidebar_label: '用于查询处理的外部数据'
sidebar_position: 130
slug: /engines/table-engines/special/external-data
title: '用于查询处理的外部数据'
doc_type: 'reference'
---

# 用于查询处理的外部数据

ClickHouse 允许在发送 `SELECT` 查询时，同时向服务器发送查询处理所需的数据。该数据会被放入一张临时表（参见“临时表”一节），并可在查询中使用（例如在 `IN` 运算符中）。

例如，如果你有一个包含重要用户标识符的文本文件，可以在发送使用该列表进行过滤的查询时，一并将其上传到服务器。

如果你需要在同一批体量较大的外部数据上运行多条查询，请不要使用此功能。更好的做法是预先将数据导入数据库。

外部数据可以通过命令行客户端（非交互模式）或通过 HTTP 接口上传。

在命令行客户端中，你可以按如下格式指定一个参数部分

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

对于要传输的多张表，您可以使用多个这样的区段。

**–external** – 标记一个区段的开始。
**–file** – 指向包含表转储的文件路径，或 -，表示 stdin。
从 stdin 只能读取一张表。

以下参数是可选的：**–name** – 表名。如果省略，则使用 &#95;data。
**–format** – 文件中的数据格式。如果省略，则使用 TabSeparated。

以下参数中必须提供一个：**–types** – 以逗号分隔的列类型列表。例如：`UInt64,String`。列名将为 &#95;1、&#95;2、...
**–structure** – 以 `UserID UInt64`、`URL String` 格式描述的表结构。用于定义列名和类型。

在 &#39;file&#39; 中指定的文件将按 &#39;format&#39; 中指定的格式进行解析，并使用 &#39;types&#39; 或 &#39;structure&#39; 中指定的数据类型。该表将被上传到服务器，并可在服务器上以 &#39;name&#39; 中的名称作为临时表进行访问。

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

使用 HTTP 接口时，外部数据以 multipart/form-data 格式进行传递。每个表作为单独的文件进行传输，表名取自文件名。通过 `query_string` 传入参数 `name_format`、`name_types` 和 `name_structure`，其中 `name` 是与这些参数对应的表名。各参数的含义与使用命令行客户端时相同。

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

在进行分布式查询处理时，临时表会被发送到所有远程服务器。
