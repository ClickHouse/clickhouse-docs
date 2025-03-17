---
slug: /migrations/postgresql/data-modeling-techniques
title: データモデリング技術
description: PostgreSQLからClickHouseへの移行のためのデータモデリング
keywords: [postgres, postgresql, migrate, migration, data modeling]
---

import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';

> これはPostgreSQLからClickHouseに移行するためのガイドの**パート3**です。このコンテンツは入門的な内容と考えられ、ユーザーがClickHouseのベストプラクティスに従った初期の実用的システムを展開するのを助けることを目的としています。複雑なトピックを避け、完全に最適化されたスキーマを結果として提供するのではなく、ユーザーがプロダクションシステムを構築し、学習の基盤を築くためのしっかりとした基盤を提供します。

Postgresから移行するユーザーには、[ClickHouseにおけるデータモデリングのガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じStack Overflowのデータセットを使用し、ClickHouseの機能を利用した複数のアプローチを探ります。

## パーティション {#partitions}

Postgresユーザーは、テーブルをパーティション（パート）と呼ばれる小さく管理しやすい部分に分割することで、大規模なデータベースのパフォーマンスと管理を向上させるためのテーブルのパーティショニングという概念に慣れているでしょう。このパーティショニングは、指定されたカラム（例：日付）に対する範囲を使用するか、定義されたリストを使用するか、またはキーに対するハッシュを使用することで達成できます。これにより、管理者は日付範囲や地理的な場所など、特定の基準に基づいてデータを整理できます。パーティショニングは、パーティションプルーニングによってデータアクセスを高速化し、より効率的なインデックス作成を可能にすることで、クエリパフォーマンスの向上を助けます。また、バックアップやデータの削除などのメンテナンスタスクにも役立ち、全テーブルではなく個々のパーティションに対して操作を行うことができます。さらに、パーティショニングはPostgreSQLデータベースのスケーラビリティを大幅に向上させ、負荷を複数のパーティションに分散させることができます。

ClickHouseでは、パーティショニングはテーブルが初めて定義される際に`PARTITION BY`句を使用して指定されます。この句には任意のカラムに対するSQL式を含めることができ、この結果が行が送信されるパーティションを定義します。

<br />

<img src={postgres_partitions} class="image" alt="PostgreSQL partitions to ClickHouse partitions" style={{width: '600px'}} />

<br />

データのパーツは、ディスク上の各パーティションと論理的に関連付けられ、独立してクエリできます。以下の例では、`posts`テーブルを年ごとにパーティション分けし、式`toYear(CreationDate)`を使用します。行がClickHouseに挿入されると、この式が各行に対して評価され、結果のパーティションにルーティングされます（その年の最初の行であれば、パーティションが作成されます）。

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

ClickHouseにおけるパーティショニングはPostgresと似た応用がありますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、ユーザーはパーティショニングを主にデータ管理機能と見なすべきであり、クエリ最適化技術と考えるべきではありません。キーに基づいてデータを論理的に分離することで、各パーティションは独立して操作でき、例えば削除できます。これにより、パーティションを移動させることができ、サブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動できます。また、古いパーティションは[単純に削除することができる](/sql-reference/statements/alter/partition)。以下の例では、2008年の投稿を削除します。

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

- **クエリ最適化** - パーティションはクエリパフォーマンスの改善に寄与することがありますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）をターゲットにする場合、パフォーマンスが向上する可能性があります。ただし、パーティショニングキーが主キーに含まれず、フィルタリングされている場合に限ります。しかし、多くのパーティションを対象とする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果、パーツの数が増える可能性があるためです）。単一のパーティションをターゲットにする利点は、パーティショニングキーがすでに主キーの初期エントリである場合にはほとんどなくなります。パーティショニングは、各パーティション内の値が一意である場合、[GROUP BYクエリを最適化するために使用することができます](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。ただし、一般的には、ユーザーは主キーが最適化されていることを確認し、特定の予測可能なサブセットへのアクセスパターンがある例外的な場合にのみクエリ最適化技術としてパーティショニングを考慮すべきです。たとえば、日ごとのパーティショニングを行い、ほとんどのクエリが前日のものである場合などです。

## パーティションの推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理技術と見なすべきです。これは、時系列データを扱う際にクラスターからデータを期限切れにする必要がある場合に最適です。例えば、最も古いパーティションは[単純に削除できる](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要:** パーティショニングキーの式が高いカーディナリティのセットを生成しないようにしてください。すなわち、100以上のパーティションを作成することは避けるべきです。例えば、クライアント識別子や名前のような高カーディナリティのカラムでデータをパーティショニングするのではなく、クライアント識別子または名前をORDER BY式の最初のカラムにします。

> 内部的にClickHouseは、挿入されたデータのために[パーツを作成します](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。データが挿入されるにつれて、パーツの数が増加します。クエリパフォーマンスを低下させる過度に多くのパーツを防ぐために、パーツはバックグラウンドの非同期プロセスで一緒にマージされます。パーツの数が事前に設定された限界を超えると、ClickHouseは挿入時に例外をスローします - "too many parts"エラーとしてです。これは、通常の運用では発生せず、ClickHouseが不適切に設定されているか、誤って使用されている場合（たとえば、多くの小規模な挿入の場合）にのみ発生します。

> パーツはパーティションごとに独立して作成されるため、パーティションの数を増やすと、パーツの数が増加します。すなわち、それはパーティションの数の倍数です。高カーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクションの違い {#materialized-views-vs-projections}

Postgresは、単一のテーブルに対して複数のインデックスを作成できるため、さまざまなアクセスパターンに最適化できます。この柔軟性により、管理者や開発者は特定のクエリと運用ニーズに応じてデータベースパフォーマンスを調整できます。ClickHouseのプロジェクションの概念はこれと完全には類似していませんが、ユーザーはテーブルに対して複数の`ORDER BY`句を指定できます。

ClickHouseの[データモデリングドキュメント](/data-modeling/schema-design)では、マテリアライズドビューを使って集計を事前に計算し、行を変換し、異なるアクセスパターン向けにクエリを最適化する方法を探ります。

後者の例として、マテリアライズドビューが異なる順序キーを持つターゲットテーブルに行を送る[例](/materialized-view/incremental-materialized-view#lookup-table)を提供しました。

例えば、以下のクエリを考えてみましょう：

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

このクエリでは、`UserId`が順序キーでないため、すべての90m行をスキャンする必要があります（迅速に行われるにしても）。以前は、`PostId`のためのルックアップアクションとしてマテリアライズドビューを使用してこの問題を解決しました。同様の問題はプロジェクションでも解決可能です。以下のコマンドは`ORDER BY user_id`のためのプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを最初に作成し、次にマテリアライズする必要があります。この後者のコマンドは、データが異なる順序でディスクに二重に保存される原因となります。データが作成される際にプロジェクションを定義することも可能で、以下に示すように、データが挿入されると自動的に維持されます。

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

プロジェクションが`ALTER`を介して作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されたときに非同期で作成されます。ユーザーは以下のクエリを使ってこの操作の進行状況を確認でき、`is_done=1`を待ちます。

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

上記のクエリを繰り返すと、パフォーマンスが著しく向上していることが確認でき、追加ストレージのコストがかかります。

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

`EXPLAIN`コマンドを使って、このクエリにプロジェクションが使用されたか確認します：

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

## プロジェクションを使用する時期 {#when-to-use-projections}

プロジェクションは、新しいユーザーにとって魅力的な機能で、データが挿入されると自動的に維持されます。さらに、クエリは単一のテーブルに送信され、可能な限りプロジェクションを利用することで応答時間を短縮できます。

<br />

<img src={postgres_projections} class="image" alt="PostgreSQL projections in ClickHouse" style={{width: '600px'}} />

<br />

これは、マテリアライズドビューの対照的な位置付けで、ユーザーは適切な最適化されたターゲットテーブルを選択する必要があるか、フィルターに応じてクエリを書き直す必要があります。これはユーザーアプリケーションにより大きな重点を置き、クライアント側の複雑さを増加させます。

これらの利点にもかかわらず、プロジェクションにはユーザーが注意すべきいくつかの固有の制限があります。そのため、プロジェクションは控えめに展開すべきです。

- プロジェクションでは、ソーステーブルと（隠れた）ターゲットテーブルに異なるTTLを使用することはできず、マテリアライズドビューでは異なるTTLが許可されます。
- プロジェクションは[現在サポートされていません](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) `optimize_read_in_order`（隠れた）ターゲットテーブルに対して。
- プロジェクションのあるテーブルでは、軽量更新と削除はサポートされていません。
- マテリアライズドビューはチェーン化可能です：1つのマテリアライズドビューのターゲットテーブルは、別のマテリアライズドビューのソーステーブルとなることができます。このようなことはプロジェクションでは不可能です。
- プロジェクションは結合（JOIN）をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルタ（WHERE句）をサポートしていませんが、マテリアライズドビューはサポートしています。

次の状況でプロジェクションを使用することをお勧めします：

- データの完全な再配置が必要な場合。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、マテリアライズドビューは集計を維持するのにより効果的です。クエリオプティマイザは、単純な再配置を使用するプロジェクションを利用しやすいです。すなわち、`SELECT * ORDER BY x`。ユーザーはこの式の中でカラムのサブセットを選択し、ストレージフットプリントを削減できます。
- ユーザーがストレージフットプリントとデータを二重に書き込むことによるオーバーヘッドの関連増加に快適である場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)。

[こちらをクリックしてパート4へ進む](/migrations/postgresql/rewriting-queries).
