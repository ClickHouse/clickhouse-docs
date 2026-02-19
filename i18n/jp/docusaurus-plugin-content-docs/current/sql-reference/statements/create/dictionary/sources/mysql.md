---
slug: /sql-reference/statements/create/dictionary/sources/mysql
title: 'MySQL Dictionary ソース'
sidebar_position: 7
sidebar_label: 'MySQL'
description: 'ClickHouse で Dictionary のソースとして MySQL を構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

設定例:

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

  <TabItem value="xml" label="構成ファイル">
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

設定項目:

| Setting                   | Description                                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                    | MySQL サーバーのポートです。すべてのレプリカに対して指定することも、各レプリカごとに個別に（`<replica>` 内で）指定することもできます。                                                                                         |
| `user`                    | MySQL ユーザー名です。すべてのレプリカに対して指定することも、各レプリカごとに個別に（`<replica>` 内で）指定することもできます。                                                                                            |
| `password`                | MySQL ユーザーのパスワードです。すべてのレプリカに対して指定することも、各レプリカごとに個別に（`<replica>` 内で）指定することもできます。                                                                                       |
| `replica`                 | レプリカ設定のセクションです。複数のセクションを定義できます。                                                                                                                                      |
| `replica/host`            | MySQL ホストです。                                                                                                                                                         |
| `replica/priority`        | レプリカの優先度です。接続を試行する際、ClickHouse は優先度の順にレプリカを走査します。数値が小さいほど優先度が高くなります。                                                                                                 |
| `db`                      | データベース名です。                                                                                                                                                           |
| `table`                   | テーブル名です。                                                                                                                                                             |
| `where`                   | 抽出条件です。条件の構文は MySQL の `WHERE` 句と同じで、たとえば `id > 10 AND id < 20` のように記述します。省略可能です。                                                                                     |
| `invalidate_query`        | Dictionary の状態を確認するためのクエリです。省略可能です。詳細は [Refreshing dictionary data using LIFETIME](../lifetime.md#refreshing-dictionary-data-using-lifetime) セクションを参照してください。         |
| `fail_on_connection_loss` | 接続喪失時のサーバーの動作を制御します。`true` の場合、クライアントとサーバー間の接続が失われるとすぐに例外がスローされます。`false` の場合、ClickHouse サーバーは例外をスローする前にクエリの実行を 3 回再試行します。再試行により応答時間が増加する点に注意してください。デフォルト値: `false`。 |
| `query`                   | カスタムクエリです。省略可能です。                                                                                                                                                    |

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドか `query` フィールドのいずれか一方は必ず指定する必要があります。
:::

:::note
明示的なパラメータ `secure` は存在しません。SSL 接続を確立する場合は、セキュアな接続が必須となります。
:::

MySQL には、ソケットを使用してローカルホスト経由で接続できます。そのためには、`host` と `socket` を設定します。

設定例:


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
<TabItem value="xml" label="設定ファイル">

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