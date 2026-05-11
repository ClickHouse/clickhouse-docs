---
slug: /sql-reference/statements/create/dictionary/sources/redis
title: "Redis Dictionary ソース"
sidebar_position: 10
sidebar_label: 'Redis'
description: "ClickHouse で Dictionary ソースとして Redis を使用するよう構成します。"
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

設定例:

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

設定項目:

| Setting        | Description                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`         | Redis のホスト名です。                                                                                                                                                       |
| `port`         | Redis サーバーのポート番号です。                                                                                                                                                  |
| `storage_type` | キー操作に使用される Redis の内部ストレージ構造です。`simple` は単純なソースおよびハッシュ化された単一キーソース向け、`hash_map` は 2 つのキーを持つハッシュ化ソース向けです。範囲ソースおよび複雑なキーを持つキャッシュソースはサポートされません。デフォルト値は `simple` です。省略可能です。 |
| `db_index`     | Redis 論理データベースの数値インデックスを指定します。デフォルト値は `0` です。省略可能です。                                                                                                                 |
