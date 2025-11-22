---
description: 'TRUNCATE 文のドキュメント'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE 文'
doc_type: 'reference'
---



# TRUNCATE ステートメント

ClickHouse の `TRUNCATE` ステートメントは、テーブルまたはデータベースの構造を保持したまま、すべてのデータを高速に削除するために使用されます。



## TRUNCATE TABLE {#truncate-table}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />| パラメータ | 説明 |
|---------------------|---------------------------------------------------------------------------------------------------|
| `IF EXISTS` | テーブルが存在しない場合のエラーを防ぎます。省略した場合、クエリはエラーを返します。 | | `db.name` | オプションのデータベース名。 | | `ON CLUSTER cluster`| 指定されたクラスタ全体でコマンドを実行します。 | | `SYNC` | レプリケートされたテーブルを使用する際に、レプリカ間でトランケート処理を同期的に実行します。省略した場合、デフォルトでは非同期でトランケート処理が行われます。 |

[alter_sync](/operations/settings/settings#alter_sync)設定を使用して、レプリカでのアクションの実行を待機するように設定できます。

[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout)設定を使用して、非アクティブなレプリカが`TRUNCATE`クエリを実行するまで待機する時間(秒単位)を指定できます。

:::note  
`alter_sync`が`2`に設定されており、一部のレプリカが`replication_wait_for_inactive_replica_timeout`設定で指定された時間を超えてアクティブでない場合、`UNFINISHED`例外がスローされます。
:::

`TRUNCATE TABLE`クエリは、以下のテーブルエンジンでは**サポートされていません**:

- [`View`](../../engines/table-engines/special/view.md)
- [`File`](../../engines/table-engines/special/file.md)
- [`URL`](../../engines/table-engines/special/url.md)
- [`Buffer`](../../engines/table-engines/special/buffer.md)
- [`Null`](../../engines/table-engines/special/null.md)


## TRUNCATE ALL TABLES {#truncate-all-tables}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br/>
| パラメータ                  | 説明                                       |
|----------------------------|---------------------------------------------------|
| `ALL`                      | データベース内のすべてのテーブルからデータを削除します。     |
| `IF EXISTS`                | データベースが存在しない場合のエラーを防ぎます。 |
| `db`                       | データベース名。                                |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | パターンによってテーブルをフィルタリングします。           |
| `ON CLUSTER cluster`       | クラスタ全体でコマンドを実行します。                |

データベース内のすべてのテーブルからすべてのデータを削除します。


## TRUNCATE DATABASE {#truncate-database}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />| Parameter | Description |
|----------------------|---------------------------------------------------| |
`IF EXISTS` | データベースが存在しない場合のエラーを防止します。 | | `db` | データベース名。 | | `ON CLUSTER cluster` | 指定されたクラスタ全体でコマンドを実行します。 |

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。`IF EXISTS`句を省略した場合、データベースが存在しないとクエリはエラーを返します。

:::note
`TRUNCATE DATABASE`は`Replicated`データベースではサポートされていません。代わりに、データベースを`DROP`して`CREATE`してください。
:::
