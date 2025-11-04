---
'description': 'ClickHouse 允许将所需的数据发送给服务器，以处理查询，连同 `SELECT` 查询一起发送。这些数据被放置在一个临时表中，并可以在查询中使用（例如，在
  `IN` 操作符中）。'
'sidebar_label': '外部数据'
'sidebar_position': 130
'slug': '/engines/table-engines/special/external-data'
'title': '用于查询处理的外部数据'
'doc_type': 'reference'
---


# 外部数据用于查询处理

ClickHouse 允许将处理查询所需的数据与 `SELECT` 查询一起发送到服务器。这些数据被放入一个临时表中（请参见“临时表”部分），可以在查询中使用（例如，在 `IN` 操作符中）。

例如，如果您有一个包含重要用户标识符的文本文件，您可以将其与使用该列表进行过滤的查询一起上传到服务器。

如果您需要运行多个查询并处理大量外部数据，请勿使用此功能。最好提前将数据上传到数据库。

外部数据可以通过命令行客户端（非交互模式）或 HTTP 接口上传。

在命令行客户端中，您可以以以下格式指定参数部分

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

您可以拥有多个这样的部分，具体数量取决于所传输的表的数量。

**–external** – 标记子句的开始。  
**–file** – 表转储文件的路径，或者 -，表示标准输入。  
只能从标准输入中检索单个表。

以下参数是可选的：**–name**– 表的名称。如果省略，使用 _data。  
**–format** – 文件中的数据格式。如果省略，使用 TabSeparated。

以下参数之一是必需的：**–types** – 用逗号分隔的列类型列表。例如：`UInt64,String`。列将命名为 _1, _2, ...  
**–structure**– 表结构，格式为 `UserID UInt64`, `URL String`。定义列的名称和类型。

在 'file' 中指定的文件将根据 'format' 中指定的格式进行解析，使用在 'types' 或 'structure' 中指定的数据类型。该表将上传到服务器，并在那里作为名为 'name' 的临时表进行访问。

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

使用 HTTP 接口时，外部数据以 multipart/form-data 格式传递。每个表作为单独的文件进行传输。表名取自文件名。`query_string` 中传递参数 `name_format`、`name_types` 和 `name_structure`，其中 `name` 是这些参数所对应的表名。参数的含义与使用命令行客户端时相同。

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

对于分布式查询处理，临时表将发送到所有远程服务器。
