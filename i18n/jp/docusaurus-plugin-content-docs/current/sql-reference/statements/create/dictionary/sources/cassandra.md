---
slug: /sql-reference/statements/create/dictionary/sources/cassandra
title: 'Cassandra Dictionary ソース'
sidebar_position: 11
sidebar_label: 'Cassandra'
description: 'ClickHouse で Cassandra を Dictionary のソースとして設定します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

設定例:

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

設定フィールド:

| Setting                | Description                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                 | Cassandra のホスト、またはカンマ区切りのホストの一覧です。                                                                                                                                      |
| `port`                 | Cassandra サーバーのポートです。指定しない場合、デフォルトポート `9042` が使用されます。                                                                                                                   |
| `user`                 | Cassandra ユーザー名です。                                                                                                                                                      |
| `password`             | Cassandra ユーザーのパスワードです。                                                                                                                                                 |
| `keyspace`             | keyspace（データベース）の名前です。                                                                                                                                                  |
| `column_family`        | カラムファミリー（テーブル）の名前です。                                                                                                                                                    |
| `allow_filtering`      | クラスタリングキーカラムに対する高コストになり得る条件を許可するかどうかを示すフラグです。デフォルト値は `1` です。                                                                                                            |
| `partition_key_prefix` | Cassandra テーブルの主キーに含まれるパーティションキーのカラム数です。複合キー Dictionary で必須です。Dictionary 定義内のキーカラムの順序は Cassandra と同一でなければなりません。デフォルト値は `1`（最初のキーカラムがパーティションキーで、それ以外のキーカラムはクラスタリングキー）です。 |
| `consistency`          | Consistency レベルです。指定可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One` です。                    |
| `where`                | 任意の選択条件です。                                                                                                                                                              |
| `max_threads`          | 複合キー Dictionary で複数パーティションからデータを読み込む際に使用するスレッドの最大数です。                                                                                                                   |
| `query`                | カスタムクエリです。オプションです。                                                                                                                                                      |

:::note
`column_family` または `where` フィールドは、`query` フィールドと同時には使用できません。また、`column_family` または `query` のいずれか一方のフィールドを必ず指定する必要があります。
:::
