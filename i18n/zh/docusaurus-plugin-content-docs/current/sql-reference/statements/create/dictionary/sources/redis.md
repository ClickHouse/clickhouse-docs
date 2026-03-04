---
slug: /sql-reference/statements/create/dictionary/sources/redis
title: 'Redis 字典源'
sidebar_position: 10
sidebar_label: 'Redis'
description: '在 ClickHouse 中将 Redis 配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(REDIS(
        host 'localhost'
        port 6379
        storage_type 'simple'
        db_index 0
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <redis>
            <host>localhost</host>
            <port>6379</port>
            <storage_type>simple</storage_type>
            <db_index>0</db_index>
        </redis>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

设置字段：

| Setting        | Description                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `host`         | Redis 主机。                                                                                              |
| `port`         | Redis 服务器上的端口。                                                                                         |
| `storage_type` | 用于处理键的 Redis 内部存储结构。`simple` 适用于简单源以及单键哈希源，`hash_map` 适用于具有两个键的哈希源。不支持范围源以及具有复杂键的缓存源。默认值为 `simple`。可选。 |
| `db_index`     | Redis 逻辑数据库的特定数字索引。默认值为 `0`。可选。                                                                        |
