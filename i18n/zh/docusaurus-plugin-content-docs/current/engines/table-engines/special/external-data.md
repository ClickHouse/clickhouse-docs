---
'description': 'ClickHouse 允许向服务器发送处理查询所需的数据，连同一个 `SELECT` 查询。这些数据被放入一个临时表中，可以在查询中使用（例如，在
  `IN` 操作符中）。'
'sidebar_label': '外部数据'
'sidebar_position': 130
'slug': '/engines/table-engines/special/external-data'
'title': '外部数据用于查询处理'
---


# 外部数据用于查询处理

ClickHouse 允许向服务器发送处理查询所需的数据，连同一个 `SELECT` 查询。这些数据被放入一个临时表中（参见“临时表”一节），并可以在查询中使用（例如，在 `IN` 操作符中）。

例如，如果你有一个包含重要用户标识符的文本文件，你可以将其上传到服务器，并使用该列表进行过滤的查询一起发送。

如果需要执行超过一个查询，并且外部数据量很大，请不要使用此功能。最好提前将数据上传到数据库。

外部数据可以通过命令行客户机（在非交互模式下）或通过 HTTP 接口上传。

在命令行客户机中，可以以以下格式指定参数部分

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

您可以有多个这样的部分，以传输表的数量。

**–external** – 标记子句的开始。  
**–file** – 包含表转储的文件路径，或 -，表示标准输入。  
只能从标准输入检索单个表。

以下参数是可选的：**–name** – 表的名称。如果省略，则使用 _data。  
**–format** – 文件中的数据格式。如果省略，则使用 TabSeparated。

以下参数之一是必需的：**–types** – 用逗号分隔的列类型列表。例如：`UInt64,String`。列将命名为 _1, _2, ...  
**–structure** – 表结构的格式为 `UserID UInt64`, `URL String`。定义列的名称和类型。

在 'file' 中指定的文件将由在 'format' 中指定的格式解析，使用在 'types' 或 'structure' 中指定的数据类型。表将被上传到服务器，并以 'name' 中的名称作为临时表可访问。

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

使用 HTTP 接口时，外部数据以 multipart/form-data 格式传递。每个表作为单独的文件传输。表名称取自文件名。`query_string` 传递的参数为 `name_format`、`name_types` 和 `name_structure`，其中 `name` 是这些参数对应的表的名称。参数的含义与使用命令行客户机时相同。

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

对于分布式查询处理，临时表会发送到所有远程服务器。
