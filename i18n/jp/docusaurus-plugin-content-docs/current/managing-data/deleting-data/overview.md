---
slug: /deletes/overview
title: 削除の概要
description: ClickHouseでデータを削除する方法
keywords: [削除, トランケート, ドロップ, 論理削除]
---

ClickHouseでデータを削除する方法はいくつかあり、それぞれに利点とパフォーマンス特性があります。データモデルや削除するデータの量に基づいて適切な方法を選択する必要があります。

| 方法 | 構文 | 使用するタイミング |
| --- | --- | --- |
| [論理削除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | データ量が少ない場合に使用します。行はすぐにすべての後続の SELECT クエリからフィルタリングされますが、最初は内部で削除されたとしてマークされるだけで、ディスクからは削除されません。 |
| [削除ミューテーション](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | データをディスクからすぐに削除する必要がある場合に使用します（例：コンプライアンスのため）。SELECTパフォーマンスに悪影響を与えます。 |
| [テーブルのトランケート](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | テーブルからすべてのデータを効率的に削除します。 |
| [パーティションのドロップ](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | パーティションからすべてのデータを効率的に削除します。 |

ClickHouseでデータを削除する方法の概要は以下の通りです：

## 論理削除 {#lightweight-deletes}

論理削除は、行がすぐに削除されたとしてマークされ、以降のすべての `SELECT` クエリから自動的にフィルタリングされるようにします。これらの削除された行のその後の削除は、自然なマージサイクル中に行われるため、I/Oが少なくなります。その結果、指定された期間中に実際にはデータがストレージから削除されず、削除されたとしてマークされている可能性があります。データが削除されていることを保証する必要がある場合は、上記のミューテーションコマンドを検討してください。

```sql
-- ミューテーションを使用して2018年のすべてのデータを削除します。推奨しません。
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

論理的な `DELETE` ステートメントを使って大量のデータを削除することは、`SELECT` クエリのパフォーマンスにも悪影響を与える可能性があります。このコマンドは、プロジェクションを含むテーブルとは互換性がありません。

削除された行を [マークする操作](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse) でミューテーションが使用されるため（`_row_exists` カラムを追加）、若干のI/Oが発生します。

一般的に、削除されたデータがディスク上に存在していることが許容される場合（例：コンプライアンスが必要ない場合）は、ミューテーションよりも論理削除が好まれます。ただし、すべてのデータを削除する必要がある場合は、このアプローチは避けるべきです。

[論理削除](/guides/developer/lightweight-delete)について詳しく読む。

## 削除ミューテーション {#delete-mutations}

削除ミューテーションは `ALTER TABLE … DELETE` コマンドを通じて発行できます。例えば：

```sql
-- ミューテーションを使用して2018年のすべてのデータを削除します。推奨しません。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

これらは、同期的に（非レプリケートの場合はデフォルト）または非同期的に（[mutations_sync](/operations/settings/settings#mutations_sync) 設定で決定）実行できます。これは非常にI/O集約的で、`WHERE` 式に一致するすべてのパーツを再書き込みます。このプロセスには原子性がなく、ミューテーション中に実行を開始した `SELECT` クエリは、既にミューテーションされた部分からのデータと、まだミューテーションされていない部分からのデータを同時に見ることになります。ユーザーは、[systems.mutations](/operations/system-tables/mutations#monitoring-mutations) テーブルを使用して進行状況を追跡できます。これらはI/O集約的な操作であり、クラスターの `SELECT` パフォーマンスに影響を与える可能性があるため、使用は控えめにすべきです。

[削除ミューテーション](/sql-reference/statements/alter/delete)について詳しく読む。

## テーブルのトランケート {#truncate-table}

テーブル内のすべてのデータを削除する必要がある場合は、以下の `TRUNCATE TABLE` コマンドを使用してください。これは軽量の操作です。

```sql
TRUNCATE TABLE posts
```

[TRUNCATE TABLE](/sql-reference/statements/truncate)について詳しく読む。

## パーティションのドロップ {#drop-partition}

データのカスタムパーティショニングキーを指定している場合、パーティションを効率的に削除できます。高いカーディナリティのパーティショニングは避けてください。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

[DROP PARTITION](/sql-reference/statements/alter/partition)について詳しく読む。

## 追加リソース {#more-resources}

- [ClickHouseにおける更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
