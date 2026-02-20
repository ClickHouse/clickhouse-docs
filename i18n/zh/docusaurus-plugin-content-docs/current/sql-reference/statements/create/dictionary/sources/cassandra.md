---
slug: /sql-reference/statements/create/dictionary/sources/cassandra
title: 'Cassandra 字典源'
sidebar_position: 11
sidebar_label: 'Cassandra'
description: '在 ClickHouse 中将 Cassandra 配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CASSANDRA(
        host 'localhost'
        port 9042
        user 'username'
        password 'qwerty123'
        keyspace 'database_name'
        column_family 'table_name'
        allow_filtering 1
        partition_key_prefix 1
        consistency 'One'
        where '"SomeColumn" = 42'
        max_threads 8
        query 'SELECT id, value_1, value_2 FROM database_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <cassandra>
            <host>localhost</host>
            <port>9042</port>
            <user>username</user>
            <password>qwerty123</password>
            <keyspase>database_name</keyspase>
            <column_family>table_name</column_family>
            <allow_filtering>1</allow_filtering>
            <partition_key_prefix>1</partition_key_prefix>
            <consistency>One</consistency>
            <where>"SomeColumn" = 42</where>
            <max_threads>8</max_threads>
            <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
        </cassandra>
    </source>
    ```
  </TabItem>
</Tabs>

设置字段：

| Setting                | Description                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `host`                 | Cassandra 主机或以逗号分隔的主机列表。                                                                                              |
| `port`                 | Cassandra 服务器上的端口。如果未指定，则使用默认端口 `9042`。                                                                               |
| `user`                 | Cassandra 用户名。                                                                                                        |
| `password`             | Cassandra 用户的密码。                                                                                                      |
| `keyspace`             | keyspace（数据库）的名称。                                                                                                     |
| `column_family`        | 列族（表）的名称。                                                                                                             |
| `allow_filtering`      | 是否允许在聚簇键列上使用潜在代价较高条件的标记。默认值为 `1`。                                                                                     |
| `partition_key_prefix` | Cassandra 表主键中分区键列的数量。对复合键字典是必需的。字典定义中的键列顺序必须与 Cassandra 中的顺序相同。默认值为 `1`（第一个键列为分区键，其余键列为聚簇键）。                         |
| `consistency`          | 一致性级别。可用值：`One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。默认值为 `One`。 |
| `where`                | 可选的筛选条件。                                                                                                              |
| `max_threads`          | 在复合键字典中从多个分区加载数据时使用的最大线程数。                                                                                            |
| `query`                | 自定义查询。可选。                                                                                                             |

:::note
`column_family` 或 `where` 字段不能与 `query` 字段同时使用，并且必须声明 `column_family` 或 `query` 字段中的一个。
:::
