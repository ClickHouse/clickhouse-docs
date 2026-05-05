---
slug: /sql-reference/statements/create/dictionary/sources/postgresql
title: 'PostgreSQL Dictionary ソース'
sidebar_position: 12
sidebar_label: 'PostgreSQL'
description: 'ClickHouse で PostgreSQL を Dictionary のソースとして構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(POSTGRESQL(
        port 5432
        host 'postgresql-hostname'
        user 'postgres_user'
        password 'postgres_password'
        db 'db_name'
        table 'table_name'
        replica(host 'example01-1' port 5432 priority 1)
        replica(host 'example01-2' port 5432 priority 2)
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="構成ファイル">
    ```xml
    <source>
      <postgresql>
          <host>postgresql-hostname</hoat>
          <port>5432</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </postgresql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

設定フィールド:

| Setting                | Description                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `host`                 | PostgreSQL サーバー上のホスト。すべてのレプリカに対して一括で指定することも、各レプリカごと（`<replica>` 内）に個別指定することもできます。                        |
| `port`                 | PostgreSQL サーバー上のポート。すべてのレプリカに対して一括で指定することも、各レプリカごと（`<replica>` 内）に個別指定することもできます。                        |
| `user`                 | PostgreSQL ユーザー名。すべてのレプリカに対して一括で指定することも、各レプリカごと（`<replica>` 内）に個別指定することもできます。                            |
| `password`             | PostgreSQL ユーザーのパスワード。すべてのレプリカに対して一括で指定することも、各レプリカごと（`<replica>` 内）に個別指定することもできます。                       |
| `replica`              | レプリカ設定セクション。複数のセクションを指定できます。                                                                             |
| `replica/host`         | PostgreSQL のホスト。                                                                                         |
| `replica/port`         | PostgreSQL のポート。                                                                                         |
| `replica/priority`     | レプリカの優先度。接続を試行する際、ClickHouse は優先度の高い順にレプリカへの接続を試みます。数値が小さいほど優先度が高くなります。                                  |
| `db`                   | データベース名。                                                                                                 |
| `table`                | テーブル名。                                                                                                   |
| `where`                | 選択条件。条件式の構文は PostgreSQL の `WHERE` 句と同じです。例: `id > 10 AND id < 20`。省略可能です。                                |
| `invalidate_query`     | Dictionary の状態を確認するためのクエリ。省略可能です。詳しくは [LIFETIME を使用した Dictionary データの更新](../lifetime.md) セクションを参照してください。 |
| `background_reconnect` | 接続失敗時にバックグラウンドでレプリカへ再接続します。省略可能です。                                                                       |
| `query`                | カスタムクエリ。省略可能です。                                                                                          |

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず指定する必要があります。
:::
