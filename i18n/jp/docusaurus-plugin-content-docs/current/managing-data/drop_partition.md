---
slug: /managing-data/drop_partition
sidebar_label: 'パーティションの削除'
title: 'パーティションを削除する'
hide_title: false
description: 'パーティションの削除に関するページ'
---

## 背景 {#background}

パーティショニングは、`PARTITION BY`句を介してテーブルが最初に定義されるときに指定されます。この句には、カラムに対するSQL式が含まれ、行が送信されるパーティションを定義する結果を生成します。

データパーツは、ディスク上の各パーティションと論理的に関連付けられており、孤立してクエリ可能です。以下の例では、`posts`テーブルを年ごとに`toYear(CreationDate)`という式を使用してパーティション分けしています。行がClickHouseに挿入されると、この式は各行に対して評価され、結果のパーティションが存在する場合はそこにルーティングされます（その年の最初の行である場合、パーティションが作成されます）。

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

パーティション式の設定については、[パーティション式を設定する方法](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)のセクションをお読みください。

ClickHouseでは、ユーザーは主にデータ管理機能としてパーティショニングを考慮すべきであり、クエリ最適化技術ではありません。キーに基づいてデータを論理的に分離することにより、各パーティションは独立して操作できるようになります。これにより、ユーザーはパーティションを移動したり、したがってサブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動したり、[データを削除する/クラスターから効率的に削除する](/sql-reference/statements/alter/partition)ことができます。

## パーティションの削除 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION`は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

このクエリはパーティションを非アクティブとしてマークし、データを完全に削除します。おおよそ10分かかります。このクエリはレプリケートされ、すべてのレプリカでデータが削除されます。

以下の例では、関連するパーティションを削除することによって、2008年の投稿を前述のテーブルから削除します。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

0 rows in set. Elapsed: 0.103 sec.
```
