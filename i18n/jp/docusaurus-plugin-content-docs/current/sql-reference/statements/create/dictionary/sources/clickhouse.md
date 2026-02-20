---
slug: /sql-reference/statements/create/dictionary/sources/clickhouse
title: 'ClickHouse Dictionary ソース'
sidebar_position: 8
sidebar_label: 'ClickHouse'
description: 'ClickHouse テーブルを Dictionary のソースとして構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

設定例:

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

設定項目:

| Setting            | Description                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`             | ClickHouse ホスト。ローカルホストの場合、クエリはネットワーク通信を行わずに処理されます。耐障害性を向上させるには、[Distributed](/engines/table-engines/special/distributed) テーブルを作成し、その後の設定でそれを指定できます。      |
| `port`             | ClickHouse サーバーのポート。                                                                                                                                     |
| `user`             | ClickHouse ユーザー名。                                                                                                                                        |
| `password`         | ClickHouse ユーザーのパスワード。                                                                                                                                   |
| `db`               | データベース名。                                                                                                                                                 |
| `table`            | テーブル名。                                                                                                                                                   |
| `where`            | 選択条件。省略可能。                                                                                                                                               |
| `invalidate_query` | Dictionary の状態を確認するためのクエリ。省略可能。詳細は「[Refreshing dictionary data using LIFETIME](../lifetime.md#refreshing-dictionary-data-using-lifetime)」セクションを参照してください。 |
| `secure`           | 接続に SSL を使用します。                                                                                                                                          |
| `query`            | カスタムクエリ。省略可能。                                                                                                                                            |

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず指定する必要があります。
:::
