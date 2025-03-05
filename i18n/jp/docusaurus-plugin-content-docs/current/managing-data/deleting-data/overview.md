---
slug: /deletes/overview
title: 削除の概要
description: ClickHouseでデータを削除する方法
keywords: [delete, truncate, drop, lightweight delete]
---

ClickHouseでは、データを削除する方法がいくつかあり、それぞれにメリットとパフォーマンス特性があります。データモデルと削除したいデータの量に応じて適切な方法を選択してください。

| 方法 | 構文 | 使用のタイミング |
| --- | --- | --- |
| [軽量削除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 小さなデータ量を削除する場合に使用します。行はすぐにすべての後続の `SELECT` クエリからフィルタリングされますが、ディスクからは初めは削除されず、内部的に削除済みとしてのみマークされます。 |
| [削除ミューテーション](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | データをディスクからすぐに削除する必要がある場合に使用します（例：コンプライアンスのため）。`SELECT` パフォーマンスに悪影響を及ぼします。 |
| [テーブルの切り捨て](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | テーブルからすべてのデータを効率的に削除します。 |
| [パーティションの削除](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | パーティションからすべてのデータを効率的に削除します。 |

以下は、ClickHouseでデータを削除するさまざまな方法の概要です：

## 軽量削除 {#lightweight-deletes}

軽量削除は、行をすぐに削除済みとしてマークし、その結果、全ての後続の `SELECT` クエリから自動的にフィルタリングされるようになります。これらの削除された行の後続の削除は、自然なマージサイクル中に行われるため、I/Oが少なく済みます。このため、指定されていない期間は、データが実際にはストレージから削除されず、削除済みとしてのみマークされる可能性があります。データが削除されたことを保証する必要がある場合は、上記のミューテーションコマンドを検討してください。

```sql
-- ミューテーションで2018年のすべてのデータを削除します。推奨されません。
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

軽量 `DELETE` ステートメントを使用して大量のデータを削除すると、`SELECT` クエリのパフォーマンスに悪影響を及ぼすことがあります。このコマンドはプロジェクションを持つテーブルとも互換性がありません。

削除された行を [マークする](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse) 操作にミューテーションが使用されるため（`_row_exists` カラムを追加）、いくつかのI/Oが発生します。

一般的に、ディスク上の削除されたデータの存在が許容できる場合（例：コンプライアンス非適合の場合）には、軽量削除をミューテーションよりも優先すべきです。このアプローチは、すべてのデータを削除する必要がある場合には避けるべきです。

[軽量削除](/guides/developer/lightweight-delete) について詳細を読む。

## 削除ミューテーション {#delete-mutations}

削除ミューテーションは `ALTER TABLE … DELETE` コマンドを通じて発行できます。例えば：

```sql
-- ミューテーションで2018年のすべてのデータを削除します。推奨されません。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

これらは、通常（レプリケーションされていない場合はデフォルト）同期的または非同期で実行できます（[mutations_sync](/operations/settings/settings#mutations_sync) 設定によって決まります）。これは非常にI/Oが重く、`WHERE` 式に一致するすべてのパーツを再書き込みます。このプロセスには原子性がなく、ミューテーション中に実行が開始された `SELECT` クエリは、すでにミューテーションされたパーツからのデータと、まだミューテーションされていないパーツからのデータを参照します。ユーザーは [systems.mutations](/operations/system-tables/mutations#system_tables-mutations) テーブルを通じて進行状況の状態を追跡できます。これらはI/O集約的な操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、慎重に使用してください。

[削除ミューテーション](/sql-reference/statements/alter/delete) について詳細を読む。

## テーブルの切り捨て {#truncate-table}

テーブル内のすべてのデータを削除する必要がある場合は、以下の `TRUNCATE TABLE` コマンドを使用します。これは軽量な操作です。

```sql
TRUNCATE TABLE posts
```

[TRUNCATE TABLE](/sql-reference/statements/truncate) について詳細を読む。

## パーティションの削除 {#drop-partition}

データのためにカスタムパーティショニングキーを指定している場合、パーティションを効率的に削除できます。高いカーディナリティのパーティショニングは避けてください。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

[DROP PARTITION](/sql-reference/statements/alter/partition) について詳細を読む。

## さらなるリソース {#more-resources}

- [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
