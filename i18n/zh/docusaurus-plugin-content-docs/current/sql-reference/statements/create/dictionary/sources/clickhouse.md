---
slug: /sql-reference/statements/create/dictionary/sources/clickhouse
title: 'ClickHouse 字典源'
sidebar_position: 8
sidebar_label: 'ClickHouse'
description: '将 ClickHouse 表配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

配置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CLICKHOUSE(
        host 'example01-01-1'
        port 9000
        user 'default'
        password ''
        db 'default'
        table 'ids'
        where 'id=10'
        secure 1
        query 'SELECT id, value_1, value_2 FROM default.ids'
    ));
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <clickhouse>
            <host>example01-01-1</host>
            <port>9000</port>
            <user>default</user>
            <password></password>
            <db>default</db>
            <table>ids</table>
            <where>id=10</where>
            <secure>1</secure>
            <query>SELECT id, value_1, value_2 FROM default.ids</query>
        </clickhouse>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

设置字段：

| Setting            | Description                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `host`             | ClickHouse 主机。如果是本地主机，查询会在没有任何网络活动的情况下被处理。为提高容错性，可以创建一个 [Distributed](/engines/table-engines/special/distributed) 表，并在后续配置中使用它。 |
| `port`             | ClickHouse 服务器上的端口。                                                                                                             |
| `user`             | ClickHouse 用户名。                                                                                                                 |
| `password`         | ClickHouse 用户的密码。                                                                                                               |
| `db`               | 数据库名称。                                                                                                                          |
| `table`            | 表名。                                                                                                                             |
| `where`            | 选择条件。可选。                                                                                                                        |
| `invalidate_query` | 用于检查字典状态的查询。可选。更多信息参见 [Refreshing dictionary data using LIFETIME](../lifetime.md) 章节。                                           |
| `secure`           | 使用 SSL 进行连接。                                                                                                                    |
| `query`            | 自定义查询。可选。                                                                                                                       |

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。并且 `table` 和 `query` 字段中必须至少声明一个。
:::
