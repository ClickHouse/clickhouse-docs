---
slug: '/deletes/overview'
title: '削除の概要'
description: 'ClickHouseでデータを削除する方法'
keywords:
- 'delete'
- 'truncate'
- 'drop'
- 'lightweight delete'
---



ClickHouseでデータを削除する方法はいくつかあり、それぞれ異なる利点とパフォーマンス特性があります。データモデルや削除するデータの量に基づいて、適切な方法を選択する必要があります。

| 方法 | 構文 | 使用するタイミング |
| --- | --- | --- |
| [軽量削除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 小量のデータを削除する場合に使用します。行はすぐにすべての後続の SELECT クエリからフィルターアウトされますが、最初は内部的に削除されたとマークされるだけで、ディスクからは削除されません。 |
| [削除ミューテーション](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | ディスクからデータを即座に削除する必要がある場合に使用します（例：コンプライアンスのため）。SELECT のパフォーマンスに悪影響を及ぼします。 |
| [テーブルのトランケート](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | テーブルからすべてのデータを効率的に削除します。 |
| [パーティションの削除](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | パーティションからすべてのデータを効率的に削除します。 |

ClickHouseでデータを削除する異なる方法の概要は以下の通りです。

## 軽量削除 {#lightweight-deletes}

軽量削除は、行をすぐに削除済みとしてマークし、すべての後続の `SELECT` クエリから自動的にフィルターアウトできるようにします。削除された行のその後の削除は自然なマージサイクル中に発生し、I/Oが少なくて済みます。そのため、未指定の期間、データが実際にはストレージから削除されず、削除されたとしてマークされているだけである可能性があります。データを削除したことを保証する必要がある場合は、上記のミューテーションコマンドを考慮してください。

```sql
-- 軽量削除で2018年のデータをすべて削除します。推奨されません。
DELETE FROM posts WHERE toYear(CreationDate) = 2018

軽量 `DELETE` ステートメントで大量のデータを削除すると、`SELECT` クエリのパフォーマンスにも悪影響を及ぼす可能性があります。このコマンドは、プロジェクションを持つテーブルとは互換性がありません。

削除された行を [マークするために](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse) 操作中にミューテーションが使用されるため（`_row_exists` カラムを追加する）、I/Oが発生します。

一般的に、ディスク上の削除されたデータの存在が許容できる場合（例：コンプライアンスが必要ない場合）は、軽量削除がミューテーションを上回るべきです。ただし、すべてのデータを削除する必要がある場合は、依然としてこのアプローチは避けるべきです。

[軽量削除についてさらに読む](/guides/developer/lightweight-delete)。

## 削除ミューテーション {#delete-mutations}

削除ミューテーションは `ALTER TABLE ... DELETE` コマンドを介して発行できます。例えば：

```sql
-- ミューテーションで2018年のデータをすべて削除します。推奨されません。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018

これらは、非レプリケートの場合はデフォルトで同期的に、または [mutations_sync](/operations/settings/settings#mutations_sync) 設定によって非同期的に実行されます。これらは非常にI/O集約型で、`WHERE` 式に合致するすべてのパーツを再書き込みます。このプロセスには原子性がありません - パーツは、準備が整い次第、変更されたパーツに置き換えられ、ミューテーション中に実行を開始した `SELECT` クエリは、すでに変更されたパーツのデータと、まだ変更されていないパーツのデータの両方を見ることになります。ユーザーは [systems.mutations](/operations/system-tables/mutations#monitoring-mutations) テーブルを通じて進捗状況を追跡できます。これらはI/O集約型の操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、控えめに使用するべきです。

[削除ミューテーションについてさらに読む](/sql-reference/statements/alter/delete)。

## テーブルのトランケート {#truncate-table}

テーブル内のすべてのデータを削除する必要がある場合は、以下に示す `TRUNCATE TABLE` コマンドを使用してください。これは軽量の操作です。

```sql
TRUNCATE TABLE posts

[TRUNCATE TABLE についてさらに読む](/sql-reference/statements/truncate)。

## パーティションの削除 {#drop-partition}

データのカスタムパーティショニングキーを指定している場合、パーティションを効率的に削除できます。高カーディナリティのパーティションを避けるべきです。

```sql
ALTER TABLE posts (DROP PARTITION '2008')

[DROP PARTITION についてさらに読む](/sql-reference/statements/alter/partition)。

## より多くのリソース {#more-resources}

- [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
