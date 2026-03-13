---
slug: /sql-reference/statements/create/dictionary/sources/mysql
title: 'MySQL 字典源'
sidebar_position: 7
sidebar_label: 'MySQL'
description: '将 MySQL 配置为 ClickHouse 中的字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(MYSQL(
        port 3306
        user 'clickhouse'
        password 'qwerty'
        replica(host 'example01-1' priority 1)
        replica(host 'example01-2' priority 1)
        db 'db_name'
        table 'table_name'
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        fail_on_connection_loss 'true'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="配置文件">
    ```xml
    <source>
      <mysql>
          <port>3306</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <replica>
              <host>example01-1</host>
              <priority>1</priority>
          </replica>
          <replica>
              <host>example01-2</host>
              <priority>1</priority>
          </replica>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <fail_on_connection_loss>true</fail_on_connection_loss>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </mysql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

设置字段：

| Setting                   | 描述                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `port`                    | MySQL 服务器端口。你可以为所有副本统一指定，或在每个副本配置部分（`&lt;replica&gt;` 内部）单独指定。                                                            |
| `user`                    | MySQL USER 名称。你可以为所有副本统一指定，或在每个副本配置部分（`&lt;replica&gt;` 内部）单独指定。                                                          |
| `password`                | MySQL USER 的密码。你可以为所有副本统一指定，或在每个副本配置部分（`&lt;replica&gt;` 内部）单独指定。                                                         |
| `replica`                 | 副本配置部分。可以有多个该配置段。                                                                                                         |
| `replica/host`            | MySQL 主机地址。                                                                                                               |
| `replica/priority`        | 副本优先级。在尝试连接时，ClickHouse 会按优先级顺序遍历副本。数字越小，优先级越高。                                                                           |
| `db`                      | 数据库名称。                                                                                                                    |
| `table`                   | 表名称。                                                                                                                      |
| `where`                   | 选择条件。条件语法与 MySQL 中 `WHERE` 子句相同，例如 `id &gt; 10 AND id &lt; 20`。可选。                                                        |
| `invalidate_query`        | 用于检查字典状态的查询。可选。详见章节 [Refreshing dictionary data using LIFETIME](../lifetime.md)。                                          |
| `fail_on_connection_loss` | 控制服务器在连接丢失时的行为。如果为 `true`，当客户端与服务器之间的连接丢失时会立即抛出异常。如果为 `false`，ClickHouse 服务器会在抛出异常前重试执行该查询三次。请注意，重试会导致响应时间增加。默认值：`false`。 |
| `query`                   | 自定义查询。可选。                                                                                                                 |

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。同时，`table` 与 `query` 字段中必须声明其中一个。
:::

:::note
不存在显式的 `secure` 参数。在建立 SSL 连接时，安全性是强制要求的。
:::

可以在本地主机上通过套接字连接到 MySQL。为此，请设置 `host` 和 `socket`。

设置示例：


<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

</TabItem>
<TabItem value="xml" label="配置文件">

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

</TabItem>
</Tabs>