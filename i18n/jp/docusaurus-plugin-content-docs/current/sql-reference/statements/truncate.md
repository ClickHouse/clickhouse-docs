---
'description': 'TRUNCATE statements のドキュメント'
'sidebar_label': 'TRUNCATE'
'sidebar_position': 52
'slug': '/sql-reference/statements/truncate'
'title': 'TRUNCATE Statements'
'doc_type': 'reference'
---


# TRUNCATE ステートメント

ClickHouseの `TRUNCATE` ステートメントは、テーブルやデータベースからすべてのデータを迅速に削除し、その構造を保持するために使用されます。

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```
<br/>
| パラメータ           | 説明                                                                                         |
|---------------------|----------------------------------------------------------------------------------------------|
| `IF EXISTS`         | テーブルが存在しない場合にエラーを防ぎます。省略した場合、クエリはエラーを返します。            |
| `db.name`           | オプションのデータベース名。                                                            |
| `ON CLUSTER cluster`| 指定されたクラスター全体でコマンドを実行します。                                          |
| `SYNC`              | レプリケートテーブルを使用している場合、レプリカ間でトランケーションを同期的に行います。省略した場合、トランケーションはデフォルトで非同期で行われます。 |

[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して、レプリカでアクションが実行されるのを待つように設定できます。

非アクティブなレプリカが `TRUNCATE` クエリを実行するまでの待機時間（秒単位）を指定するには、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定を使用します。

:::note    
`alter_sync` が `2` に設定されていて、一部のレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えて非アクティブな場合、例外 `UNFINISHED` が発生します。
:::

`TRUNCATE TABLE` クエリは、以下のテーブルエンジンには **サポートされていません**：

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
| パラメータ                  | 説明                                             |
|----------------------------|---------------------------------------------------|
| `ALL`                      | データベース内のすべてのテーブルからデータを削除します。   |
| `IF EXISTS`                | データベースが存在しない場合にエラーを防ぎます。             |
| `db`                       | データベース名。                                    |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | パターンでテーブルをフィルタリングします。     |
| `ON CLUSTER cluster`       | クラスター全体でコマンドを実行します。                  |

データベース内のすべてのテーブルからすべてのデータを削除します。

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```
<br/>
| パラメータ            | 説明                                         |
|----------------------|----------------------------------------------|
| `IF EXISTS`          | データベースが存在しない場合にエラーを防ぎます。 |
| `db`                 | データベース名。                            |
| `ON CLUSTER cluster` | 指定されたクラスター全体でコマンドを実行します。  |

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。 `IF EXISTS` 条項を省略した場合、データベースが存在しない場合にエラーを返します。

:::note
`TRUNCATE DATABASE` は `Replicated` データベースには対応していません。その代わりに、データベースをただ `DROP` して `CREATE` してください。
:::
