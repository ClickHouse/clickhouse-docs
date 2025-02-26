---
slug: /deletes/overview
title: 削除の概要
description: ClickHouseでデータを削除する方法
keywords: [削除, トランケート, ドロップ, 論理削除]
---

ClickHouseでデータを削除する方法はいくつかあり、それぞれ利点やパフォーマンス特性があります。データモデルや削除しようとするデータの量に基づいて適切な方法を選択する必要があります。

| 方法 | 構文 | 使用するタイミング |
| --- | --- | --- |
| [軽量削除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 少量のデータを削除する際に使用します。行はすぐにすべての後続のSELECTクエリからフィルタリングされますが、初めは内部的に削除済みとしてマークされるだけで、ディスクからは削除されません。 |
| [削除ミューテーション](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | データをすぐにディスクから削除する必要がある場合に使用します（例：コンプライアンスのため）。SELECTパフォーマンスに悪影響を与えます。 |
| [テーブルのトランケート](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | テーブルからすべてのデータを効率的に削除します。 |
| [パーティションのドロップ](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | パーティションからすべてのデータを効率的に削除します。 |

以下は、ClickHouseでデータを削除するさまざまな方法の概要です。

## 軽量削除 {#lightweight-deletes}

軽量削除は、行がすぐに削除済みとしてマークされるため、すべての後続の`SELECT`クエリから自動的にフィルタリングされます。これらの削除された行の実際の削除は、自然なマージサイクル中に行われるため、I/Oが少なくて済みます。その結果、指定されていない期間、データは実際にはストレージから削除されず、削除済みとしてマークされるだけの可能性があります。データの削除が保証される必要がある場合は、上記のミューテーションコマンドを検討してください。

```sql
-- ミューテーションで2018年のすべてのデータを削除します。推奨されません。
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

軽量の`DELETE`文で大量のデータを削除すると、`SELECT`クエリパフォーマンスに悪影響を与える可能性があります。このコマンドは、プロジェクションを持つテーブルとは互換性がありません。

この操作では、削除された行を[マークする](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse)ためにミューテーションが使用され（`_row_exists`カラムが追加されます）、それに伴い一定のI/Oが発生します。

一般的に、削除されたデータがディスクに存在することが許容される場合（例：コンプライアンスでない場合）、軽量削除がミューテーションよりも好まれます。このアプローチは、すべてのデータを削除する必要がある場合には避けるべきです。

[軽量削除](/guides/developer/lightweight-delete)について詳しく読む。

## 削除ミューテーション {#delete-mutations}

削除ミューテーションは`ALTER TABLE … DELETE`コマンドを介して発行できます。例えば:

```sql
-- ミューテーションで2018年のすべてのデータを削除します。推奨されません。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

これらは、非レプリケートの場合はデフォルトで同期的に（または非同期的に、[mutations_sync](/operations/settings/settings#mutations_sync)設定によって決定されます）実行できます。これらは非常にI/O集約的で、`WHERE`式に一致するすべてのパーツを書き換えます。このプロセスには原子性がなく、ミューテーション中に実行が開始される`SELECT`クエリは、既にミューテーションされたパーツのデータと、まだミューテーションされていないパーツのデータを同時に見ることになります。ユーザーは[systems.mutations](/operations/system-tables/mutations#system_tables-mutations)テーブルを通じて進行状況の状態を追跡できます。これらはI/O集中型の操作で、クラスターの`SELECT`パフォーマンスに影響を与える可能性があるため、控えめに使用するべきです。

[削除ミューテーション](/sql-reference/statements/alter/delete)について詳しく読む。

## テーブルのトランケート {#truncate-table}

テーブル内のすべてのデータを削除する必要がある場合は、以下の`TRUNCATE TABLE`コマンドを使用します。これは軽量な操作です。

```sql
TRUNCATE TABLE posts
```

[TRUNCATE TABLE](/sql-reference/statements/truncate)について詳しく読む。

## パーティションのドロップ {#drop-partition}

データにカスタムパーティショニングキーを指定している場合、パーティションを効率的に削除できます。高カーディナリティのパーティショニングは避けてください。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

[DROPPARTITION](/sql-reference/statements/alter/partition)について詳しく読む。

## さらなるリソース {#more-resources}

- [ClickHouseにおける更新および削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
