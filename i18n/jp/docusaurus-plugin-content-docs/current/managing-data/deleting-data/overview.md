---
slug: /deletes/overview
title: '削除概要'
description: 'ClickHouseでデータを削除する方法'
keywords: ['delete', 'truncate', 'drop', 'lightweight delete']
---

ClickHouseにはデータを削除するためのいくつかの方法があり、それぞれに利点とパフォーマンス特性があります。データモデルと削除するデータの量に応じて、適切な方法を選択するべきです。

| 方法 | 構文 | 使用するタイミング |
| --- | --- | --- |
| [軽量削除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 少量のデータを削除する場合に使用します。行はすぐにすべての後続のSELECTクエリからフィルタリングされますが、最初は内部的に削除済みとしてマークされるだけで、ディスクからは削除されません。 |
| [削除ミューテーション](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | ディスクからデータを即座に削除する必要がある場合に使用します（例：コンプライアンスのため）。SELECTパフォーマンスに悪影響を及ぼします。 |
| [テーブルのトランケート](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | テーブルのすべてのデータを効率的に削除します。 |
| [パーティションの削除](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | パーティションのすべてのデータを効率的に削除します。 |

以下は、ClickHouseでデータを削除するためのさまざまな方法の概要です。

## 軽量削除 {#lightweight-deletes}

軽量削除は、行をすぐに削除済みとしてマークするため、その後のすべての`SELECT`クエリから自動的にフィルタリングできます。これらの削除された行のその後の削除は、自然なマージサイクル中に行われるため、I/Oが少なくて済みます。そのため、特定の期間、データが実際にストレージから削除されずに削除済みとしてマークされている可能性があります。データを削除することを保証する必要がある場合は、上記のミューテーションコマンドを検討してください。

```sql
-- 軽量削除を用いて2018年のすべてのデータを削除します。推奨されません。
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

軽量の`DELETE`文を使用して大量のデータを削除することは、`SELECT`クエリのパフォーマンスにも悪影響を及ぼす可能性があります。このコマンドは、プロジェクションを持つテーブルとも互換性がありません。

削除された行をマークするためにオペレーションでミューテーションが使用されていることに注意してください。これは`_row_exists`カラムを追加し、I/Oの負荷が発生します。

一般的に、削除されたデータがディスク上に存在することが許容される場合（例：コンプライアンスが関与しない場合）には、軽量削除をミューテーションよりも優先すべきです。このアプローチは、すべてのデータを削除する必要がある場合は避けるべきです。

[軽量削除](/guides/developer/lightweight-delete)についてもっと詳しく読む。

## 削除ミューテーション {#delete-mutations}

削除ミューテーションは、`ALTER TABLE ... DELETE`コマンドを介して発行できます。例えば：

```sql
-- ミューテーションを用いて2018年のすべてのデータを削除します。推奨されません。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

これらは、非レプリケートの場合はデフォルトで同期的に、または[mutations_sync](/operations/settings/settings#mutations_sync)設定によって非同期的に実行できます。これらは非常にI/Oが負荷の高い操作で、`WHERE`式に一致するすべてのパーツを書き換えます。このプロセスには原子性がなく、ミューテーション中に実行される`SELECT`クエリは、すでにミューテーションされたパーツのデータと、まだミューテーションされていないパーツのデータの両方を表示します。ユーザーは、進行状況の状態を[systems.mutations](/operations/system-tables/mutations#monitoring-mutations)テーブルを通じて追跡できます。これらはI/Oが負荷の高い操作であり、クラスターの`SELECT`パフォーマンスに影響を与える可能性があるため、控えめに使用するべきです。

[削除ミューテーション](/sql-reference/statements/alter/delete)についてもっと詳しく読む。

## テーブルのトランケート {#truncate-table}

テーブル内のすべてのデータを削除する必要がある場合は、以下の`TRUNCATE TABLE`コマンドを使用します。これは軽量な操作です。

```sql
TRUNCATE TABLE posts
```

[TRUNCATE TABLE](/sql-reference/statements/truncate)についてもっと詳しく読む。

## パーティションの削除 {#drop-partition}

データにカスタムのパーティショニングキーを指定している場合、パーティションを効率的に削除することができます。高いカーディナリティのパーティショニングは避けてください。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

[DROP PARTITION](/sql-reference/statements/alter/partition)についてもっと詳しく読む。

## 追加のリソース {#more-resources}

- [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
