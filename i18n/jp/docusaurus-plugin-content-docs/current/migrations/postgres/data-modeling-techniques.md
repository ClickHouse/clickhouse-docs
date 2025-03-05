---
slug: /migrations/postgresql/data-modeling-techniques
title: データモデリング技術
description: PostgreSQLからClickHouseへの移行のためのデータモデリング
keywords: [postgres, postgresql, migrate, migration, data modeling]
---

import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';

> これは **第3部**です。PostgreSQL から ClickHouse へ移行するためのガイドです。この内容は導入的なものであり、ユーザーが ClickHouse のベストプラクティスに従った初期の機能的なシステムを展開するのを助けることを目的としています。複雑なトピックは避けられ、完全に最適化されたスキーマにはならないでしょう。むしろ、ユーザーが本番システムを構築し、学習の基盤を置くための堅実な基礎を提供します。

Postgres から移行するユーザーには、[ClickHouse でのデータモデリングに関するガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を使用した複数のアプローチを探ります。

## パーティション {#partitions}

Postgres ユーザーは、大規模データベースのパフォーマンスと管理能力を向上させるためにテーブルを小さく、管理しやすい部分（パーティション）に分割するテーブルパーティショニングの概念に親しんでいるでしょう。このパーティショニングは、指定されたカラム（例：日付）の範囲を使用したり、定義されたリストを使用したり、キーに対してハッシュを使用したりして実現できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理できます。パーティショニングは、パーティションプルーニングやより効率的なインデックス作成を通じて、クエリパフォーマンスを改善するのに役立ちます。また、全体のテーブルではなく、個別のパーティションで操作を行うことにより、バックアップやデータの削除などのメンテナンスタスクもサポートします。さらに、パーティショニングは、複数のパーティションに負荷を分散させることによって、PostgreSQL データベースのスケーラビリティを大幅に向上させることができます。

ClickHouse では、`PARTITION BY` 句を介してテーブルが最初に定義される際にパーティショニングを指定します。この句には、任意のカラムに対する SQL 式を含めることができ、その結果が行が送信されるパーティションを定義します。

<br />

<img src={postgres_partitions} class="image" alt="PostgreSQL partitions to ClickHouse partitions" style={{width: '600px'}} />

<br />

データパーツはディスク上の各パーティションに論理的に関連付けられ、単独でクエリを実行できます。以下の例では、`posts` テーブルを作成日に基づいて年ごとにパーティション分けしています。行が ClickHouse に挿入されると、この式は各行に対して評価され、その結果、存在する場合はそのパーティションにルーティングされます（行がその年の最初の場合は、パーティションが作成されます）。

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

## パーティションの応用 {#applications-of-partitions}

ClickHouse におけるパーティショニングは、Postgres と同様の応用がありますが、いくつかの微妙な違いがあります。より具体的には：

- **データ管理** - ClickHouse では、ユーザーはパーティショニングを主にデータ管理機能と考えるべきです。ロジカルにデータをキーに基づいて分けることで、各パーティションは独立して操作できるようになります（例：削除）。これにより、ユーザーはパーティションを移動させ、そのサブセットを[ストレージ層](/integrations/s3#storage-tiers)間で効率的に移動させたり、[データの有効期限切れ/クラスターからの効率的な削除](/sql-reference/statements/alter/partition)を行うことができます。以下の例では、2008年の投稿を削除しています。

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

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **クエリ最適化** - パーティションはクエリパフォーマンスを助けることができますが、その依存はアクセスパターンに大きく影響します。クエリが少数のパーティション（理想的には1つ）だけを対象とする場合、パフォーマンスが向上する可能性があります。これは、パーティショニングキーが主キーに含まれていない場合に、パーティショニングキーでフィルタリングする際のみ一般的に有効です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果としてより多くのパーツが存在する可能性があるため）。パーティションをターゲットにするメリットは、パーティショニングキーがすでに主キーの早いエントリである場合、ほとんど存在しないか、無視されるほどに低くなります。また、各パーティションの値が一意である場合、パーティショニングを使用して[GROUP BY クエリを最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)することもできます。しかし、一般的にユーザーは主キーが最適化されていることを確認し、一部の特定の予測可能なサブセットデイにアクセスするアクセスパターンが存在する場合に限り、パーティショニングをクエリ最適化技術として考慮すべきです。例えば、日単位でパーティショニングし、ほとんどのクエリが前日である場合です。

## パーティションに関する推奨事項 {#recommendations-for-partitions}

ユーザーは、パーティショニングをデータ管理技術として考慮すべきです。時間系列データを扱うときに、クラスターからデータを有効期限切れにする必要がある場合には理想的です。例として、最も古いパーティションは[単純に削除](/sql-reference/statements/alter/partition#alter_drop-partition)できます。

**重要:** パーティショニングキーの式が高いカーディナリティのセットを生じないことを確認してください。つまり、100を超えるパーティションを作成することは避けるべきです。たとえば、クライアントIDや名前などの高カーディナリティのカラムでデータをパーティショニングしないでください。代わりに、クライアントIDや名前を ORDER BY 式の最初のカラムにしてください。

> 内部的に、ClickHouse は挿入されたデータのために[パーツ](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)を作成します。データが挿入されるにつれて、パーツの数は増加します。クエリパフォーマンスを低下させる候補となる高いパーツ数を防ぐために（読み取る必要があるファイルが多くなる）、パーツはバックグラウンドの非同期プロセスで結合されます。パーツの数が事前に設定された限界を超えると、ClickHouse は挿入時に例外をスローします - 「パーツが多すぎる」というエラーが発生します。これは通常の操作の下では発生せず、ClickHouse が誤って設定されているか、誤って使用された場合、つまり多くの小さな挿入が行われる場合にのみ発生します。

> パーツはパーティションごとに独立して作成されるため、パーティション数の増加はパーツ数の増加を引き起こします。すなわち、それはパーティション数の倍数です。高いカーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクションの比較 {#materialized-views-vs-projections}

Postgres では、単一テーブルに対して複数のインデックスを作成でき、さまざまなアクセスパターンに最適化されています。この柔軟性により、管理者や開発者は特定のクエリや運用ニーズに合わせてデータベースのパフォーマンスを調整できます。ClickHouse のプロジェクションの概念は完全に類似しているわけではありませんが、ユーザーはテーブルに複数の `ORDER BY` 句を指定できます。

ClickHouse の[データモデリングドキュメント](/data-modeling/schema-design)では、マテリアライズドビューを使用して集計を事前に計算したり、行を変換したり、さまざまなアクセスパターンのクエリを最適化する方法を探ります。

これらのうち、[例](/materialized-view/incremental-materialized-view#lookup-table)を提供しています。ここでは、マテリアライズドビューが、元のテーブルと異なる順序キーを使用してターゲットテーブルに行を送信します。

例えば、次のクエリを考えてみましょう：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリではすべての90M行をスキャンする必要があります（迅速に行われますが）、`UserId` は順序キーではありません。以前は、`PostId` のルックアップとして機能するマテリアライズドビューを使用してこの問題を解決しました。同じ問題はプロジェクションで解決できます。以下のコマンドは、`ORDER BY user_id` のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを最初に作成し、その後でマテリアライズする必要があることに注意してください。この後者のコマンドにより、データはディスク上で二重に異なる順序で保存されます。データが作成される際に、プロジェクションを定義することもでき、以下のようにデータが挿入される際に自動的に維持されります。

```sql
CREATE TABLE comments
(
	`Id` UInt32,
	`PostId` UInt32,
	`Score` UInt16,
	`Text` String,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`UserDisplayName` LowCardinality(String),
	PROJECTION comments_user_id
	(
    	SELECT *
    	ORDER BY UserId
	)
)
ENGINE = MergeTree
ORDER BY PostId
```

プロジェクションが `ALTER` を介して作成される場合、`MATERIALIZE PROJECTION` コマンドが発行されると、作成は非同期に行われます。ユーザーは次のクエリでこの操作の進捗を確認し、`is_done=1` を待ちます。

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │       	1 │   	0 │                	│
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

上記のクエリを繰り返すと、追加ストレージのコストを伴いつつもパフォーマンスが大幅に向上していることが分かります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

`EXPLAIN` コマンドで、このクエリを提供するためにプロジェクションが使用されたことも確認できます：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

	┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))     	│
 2. │   Aggregating                                   	│
 3. │ 	Filter                                      	│
 4. │   	ReadFromMergeTree (comments_user_id)      	│
 5. │   	Indexes:                                  	│
 6. │     	PrimaryKey                              	│
 7. │       	Keys:                                 	│
 8. │         	UserId                              	│
 9. │       	Condition: (UserId in [8592047, 8592047]) │
10. │       	Parts: 2/2                            	│
11. │       	Granules: 2/11360                     	│
	└─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

## プロジェクションの使用適切な時期 {#when-to-use-projections}

プロジェクションは、データが挿入される際に自動的に維持されるため、新しいユーザーにとって魅力的な機能です。さらに、クエリは、可能な限りプロジェクションを活用して単一のテーブルに送信でき、応答時間を短縮します。

<br />

<img src={postgres_projections} class="image" alt="PostgreSQL projections in ClickHouse" style={{width: '600px'}} />

<br />

これは、ユーザーが適切な最適化されたターゲットテーブルを選択する必要があるマテリアライズドビューに対して、依存するフィルターに応じてクエリを書き直す必要があることと対照的です。これにより、ユーザーアプリケーションへの依存が高まり、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があるため、ユーザーはそれを十分に理解し、それゆえにプロジェクションを慎重に展開する必要があります。

- プロジェクションは、ソーステーブルと（隠し）ターゲットテーブルに異なる TTL を使用することを許可しませんが、マテリアライズドビューでは異なる TTL が許可されます。
- プロジェクションは現在[サポートされていません](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) `optimize_read_in_order`（隠しターゲットテーブル用）。
- プロジェクションのあるテーブルには軽量な更新および削除はサポートされていません。
- マテリアライズドビューはチェーンで使用できます。一つのマテリアライズドビューのターゲットテーブルは、別のマテリアライズドビューのソーステーブルになることができ、……することができます。これはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルター（WHERE 句）をサポートしていませんが、マテリアライズドビューはサポートしています。

プロジェクションを使用することをお勧めする状況は次のとおりです：

- データの完全な順序変更が必要な場合。プロジェクションの式は理論的には `GROUP BY` を使用できますが、マテリアライズドビューは集計を維持するのにより効果的です。クエリオプティマイザーも単純な順序変更（すなわち `SELECT * ORDER BY x`）を使用するプロジェクションを効果的に利活用する可能性が高いです。ユーザーは、この式でカラムのサブセットを選択してストレージフットプリントを削減することができます。
- ユーザーがデータを二重に書き込むことによるストレージフットプリントとオーバーヘッドの増加に慣れている場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価する](/data-compression/compression-in-clickhouse)ことができます。

[第4部はこちら](/migrations/postgresql/rewriting-queries).
