---
slug: /managing-data/drop_partition
sidebar_label: パーティションの削除
title: パーティションを削除する
hide_title: false
---

## 背景 {#background}

パーティショニングは、`PARTITION BY`句を使用してテーブルを初めて定義するときに指定されます。この句には、行が送られるパーティションを定義するSQL式を含めることができます。

データパーツは、ディスク上の各パーティションに論理的に関連付けられており、独立してクエリを実行できます。以下の例では、`posts`テーブルを`toYear(CreationDate)`の式を使用して年でパーティション化しています。行がClickHouseに挿入されると、この式は各行に対して評価され、結果のパーティションが存在する場合、そのパーティションにルーティングされます（行がその年の最初のものであれば、パーティションが作成されます）。

```sql
 CREATE TABLE posts
(
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	`PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
	`AcceptedAnswerId` UInt32,
	`CreationDate` DateTime64(3, 'UTC'),
...
	`ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

パーティション式の設定方法については、[パーティション式の設定方法](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)のセクションをお読みください。

ClickHouseでは、ユーザーは主にパーティショニングをデータ管理機能と見なすべきであり、クエリ最適化技術としてではありません。キーに基づいてデータを論理的に分離することで、各パーティションは独立して操作でき、例えば削除することができます。これにより、ユーザーはパーティション、つまりサブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動したり、[データを期限切れにしたり/クラスターから効率的に削除したり](/sql-reference/statements/alter/partition)することが可能になります。

## パーティションの削除 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION`は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

このクエリはパーティションを非アクティブとしてタグ付けし、約10分でデータを完全に削除します。このクエリはレプリケートされ、すべてのレプリカのデータを削除します。

以下の例では、関連するパーティションを削除することで、以前のテーブルから2008年の投稿を削除します。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 rows in set. Elapsed: 0.002 sec.
	
	ALTER TABLE posts
	(DROP PARTITION '2008')

0 rows in set. Elapsed: 0.103 sec.
```
