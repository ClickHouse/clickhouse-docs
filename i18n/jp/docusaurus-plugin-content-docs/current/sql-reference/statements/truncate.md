---
description: 'TRUNCATE ステートメントのドキュメント'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE ステートメント'
doc_type: 'reference'
---



# TRUNCATE ステートメント

ClickHouse における `TRUNCATE` ステートメントは、テーブルまたはデータベースからすべてのデータを高速に削除しつつ、その構造を保持するために使用されます。



## TRUNCATE TABLE

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Parameter            | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `IF EXISTS`          | テーブルが存在しない場合にエラーが発生するのを防ぎます。省略すると、このクエリはエラーを返します。                        |
| `db.name`            | 任意のデータベース名。                                                              |
| `ON CLUSTER cluster` | 指定したクラスタ全体でコマンドを実行します。                                                   |
| `SYNC`               | レプリケートテーブルを使用している場合、レプリカ間での TRUNCATE 処理を同期的に実行します。省略した場合、既定では非同期で実行されます。 |

レプリカ上でアクションが実行されるまで待機するよう設定するには、[alter&#95;sync](/operations/settings/settings#alter_sync) 設定を使用できます。

非アクティブなレプリカが `TRUNCATE` クエリを実行するまでに待機する時間（秒）を、[replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note\
`alter_sync` が `2` に設定されていて、一部のレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えて非アクティブな状態である場合、`UNFINISHED` という例外がスローされます。
:::

`TRUNCATE TABLE` クエリは、次のテーブルエンジンでは**サポートされていません**。

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)


## すべてのテーブルを TRUNCATE

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description                     |
| --------------------------------------- | ------------------------------- |
| `ALL`                                   | データベース内のすべてのテーブルからデータを削除します。    |
| `IF EXISTS`                             | データベースが存在しない場合でもエラーにならないようにします。 |
| `db`                                    | データベース名。                        |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | パターンでテーブルをフィルタリングします。           |
| `ON CLUSTER cluster`                    | クラスター全体でコマンドを実行します。             |

データベース内のすべてのテーブルからすべてのデータを削除します。


## TRUNCATE DATABASE ステートメント

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| パラメーター               | 説明                         |
| -------------------- | -------------------------- |
| `IF EXISTS`          | データベースが存在しない場合でもエラーになりません。 |
| `db`                 | データベース名。                   |
| `ON CLUSTER cluster` | 指定したクラスタ全体でコマンドを実行します。     |

データベース自体は残したまま、そのデータベース内のすべてのテーブルを削除します。句 `IF EXISTS` を省略すると、データベースが存在しない場合にクエリはエラーを返します。

:::note
`TRUNCATE DATABASE` は `Replicated` データベースではサポートされていません。代わりに、そのデータベースを `DROP` してから `CREATE` し直してください。
:::
