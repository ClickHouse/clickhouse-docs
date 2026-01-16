---
description: 'TRUNCATE 文のリファレンス'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE 文'
doc_type: 'reference'
---

# TRUNCATE 文 \\{#truncate-statements\\}

ClickHouse の `TRUNCATE` 文は、テーブルまたはデータベースからすべてのデータを、構造を保持したまま高速に削除するために使用されます。

## TRUNCATE TABLE \\{#truncate-table\\}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Parameter            | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `IF EXISTS`          | テーブルが存在しない場合にエラーが発生するのを防ぎます。省略した場合、クエリはエラーを返します。                                         |
| `db.name`            | 任意のデータベース名。                                                                              |
| `ON CLUSTER cluster` | 指定したクラスタ全体でコマンドを実行します。                                                                   |
| `SYNC`               | レプリケートされたテーブルを使用している場合、レプリカ間での TRUNCATE 処理を同期的に実行します。省略した場合、TRUNCATE 処理はデフォルトで非同期に行われます。 |

[alter&#95;sync](/operations/settings/settings#alter_sync) SETTING を使用して、レプリカ上でアクションが実行されるまで待機するように設定できます。

[replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) SETTING を使用して、非アクティブなレプリカが `TRUNCATE` クエリを実行するまで何秒待機するかを指定できます。

:::note
`alter_sync` SETTING が `2` に設定されていて、一部のレプリカが `replication_wait_for_inactive_replica_timeout` SETTING で指定された時間より長く非アクティブな場合、`UNFINISHED` という例外がスローされます。
:::

`TRUNCATE TABLE` クエリは、次のテーブルエンジンでは**サポートされていません**:

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)

## すべてのテーブルを TRUNCATE する \\{#truncate-all-tables\\}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description                  |
| --------------------------------------- | ---------------------------- |
| `ALL`                                   | データベース内のすべてのテーブルからデータを削除します。 |
| `IF EXISTS`                             | データベースが存在しない場合でもエラーを発生させません。 |
| `db`                                    | データベース名。                     |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | パターンでテーブルをフィルタリングします。        |
| `ON CLUSTER cluster`                    | クラスター全体に対してコマンドを実行します。       |

データベース内のすべてのテーブルから全データを削除します。

## TRUNCATE DATABASE \\{#truncate-database\\}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| Parameter            | Description                     |
| -------------------- | ------------------------------- |
| `IF EXISTS`          | データベースが存在しない場合にエラーが発生しないようにします。 |
| `db`                 | データベース名。                        |
| `ON CLUSTER cluster` | 指定したクラスタ全体でコマンドを実行します。          |

データベース自体は保持したまま、そのデータベース内のすべてのテーブルを削除します。句 `IF EXISTS` を省略すると、データベースが存在しない場合はクエリはエラーとなります。

:::note
`TRUNCATE DATABASE` は `Replicated` データベースではサポートされていません。代わりに、データベースを `DROP` してから `CREATE` してください。
:::
