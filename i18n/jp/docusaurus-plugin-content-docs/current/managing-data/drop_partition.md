---
slug: '/managing-data/drop_partition'
sidebar_label: 'パーティションを削除'
title: 'パーティションの削除'
hide_title: false
description: 'パーティションを削除に関するページ'
---



## 背景 {#background}

パーティションは、`PARTITION BY` 句を介してテーブルが最初に定義されるときに指定されます。この句には、カラムの任意の SQL 式を含めることができ、その結果が行が送信されるパーティションを定義します。

データパーツは、ディスク上の各パーティションと論理的に関連付けられ、個別にクエリ可能です。以下の例では、`posts` テーブルを年ごとにパーティション分割し、式 `toYear(CreationDate)` を使用します。行が ClickHouse に挿入されると、この式は各行に対して評価され、結果のパーティションが存在すればそこにルーティングされます（その年の最初の行であれば、パーティションが作成されます）。

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

パーティション式の設定については、[パーティション式の設定方法](/sql-reference/statements/alter/partition/#how-to-set-partition-expression) セクションを参照してください。

ClickHouse では、ユーザーは主にパーティションをデータ管理機能として考える必要があります。クエリ最適化技術ではありません。キーに基づいてデータを論理的に分離することにより、各パーティションは独立して操作できる（例えば、削除など）ため、ユーザーはパーティションを移動させ、そのためにサブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動させることができたり、[データを有効期限切れにしたり/クラスターから効率的に削除したり](/sql-reference/statements/alter/partition)することができます。

## パーティションの削除 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` は、全体のパーティションを削除する費用対効果の高い方法を提供します。

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr

このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に削除します。おおよそ 10 分間で行われます。このクエリはレプリケートされ、すべてのレプリカでデータを削除します。

以下の例では、関連するパーティションを削除することによって、2008 年の投稿を前述のテーブルから削除します。

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

17 行のセットが返されました。経過時間: 0.002 秒。

ALTER TABLE posts
(DROP PARTITION '2008')

0 行のセットが返されました。経過時間: 0.103 秒。
