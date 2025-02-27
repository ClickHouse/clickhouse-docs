---
slug: /managing-data/drop_partition
sidebar_label: パーティションの削除
title: パーティションの削除
hide_title: false
---

## 背景 {#background}

パーティショニングは、テーブルを最初に定義する際に `PARTITION BY` 句で指定されます。この句には、任意のカラムに対するSQL式が含まれ、その結果が行が送信されるパーティションを定義します。

データパーツはディスク上の各パーティションに論理的に関連付けられており、個別にクエリを実行できます。以下の例では、`posts` テーブルを年ごとにパーティション分けし、式 `toYear(CreationDate)` を使用します。行がClickHouseに挿入されると、この式は各行に対して評価され、パーティションが存在する場合はその結果のパーティションにルーティングされます（行がその年の最初のものであれば、パーティションが作成されます）。

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

パーティション式の設定については、[パーティション式の設定方法](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)のセクションをお読みください。

ClickHouseでは、ユーザーは主にパーティショニングをデータ管理機能と考えるべきであり、クエリ最適化技術とは考えないでください。キーに基づいてデータを論理的に分離することにより、各パーティションは独立して操作できます（例：削除）。これにより、ユーザーはパーティションを移動し、特定のサブセットを時間に基づいて、または[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に管理したり、[データの有効期限を設定/クラスターから効率的に削除](/sql-reference/statements/alter/partition)したりすることが可能になります。

## パーティションの削除 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に削除します。時間は約10分です。このクエリはレプリケートされており、すべてのレプリカでデータが削除されます。

以下の例では、関連するパーティションを削除して、2008年の投稿を削除します。

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

17 行の結果が得られました。経過時間: 0.002 秒。
	
	ALTER TABLE posts
	(DROP PARTITION '2008')

0 行の結果が得られました。経過時間: 0.103 秒。
```
