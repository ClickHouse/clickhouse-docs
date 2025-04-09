---
slug: /guides/replacing-merge-tree
title: ReplacingMergeTree
description: ReplacingMergeTree エンジンの ClickHouse での使用
keywords: [replacingmergetree, inserts, deduplication]
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';

トランザクショナルデータベースは、トランザクションの更新や削除ワークロードに最適化されていますが、OLAPデータベースはそのような操作に対する保証が低くなっています。代わりに、これらはバッチで挿入された不変データの最適化を行い、非常に高速な分析クエリの恩恵を受けます。ClickHouse は、ミューテーションを通じた更新操作や、行を削除するための軽量な手段を提供していますが、その列指向構造により、上記のようにこれらの操作は慎重にスケジュールする必要があります。これらの操作は非同期に処理され、シングルスレッドで処理されるため、（更新の場合）ディスク上でデータを書き直す必要があります。そのため、高数の小さな変更には使用すべきではありません。
更新や削除の行のストリームを処理しながら、上記の使用パターンを避けるために、ClickHouse テーブルエンジン ReplacingMergeTree を使用することができます。

## 挿入された行の自動アップサート {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree テーブルエンジン](/engines/table-engines/mergetree-family/replacingmergetree)は、非効率的な `ALTER` や `DELETE` ステートメントを使用することなく、ユーザーが同じ行の複数のコピーを挿入し、1つを最新のバージョンとして示すことができるため、行に対する更新操作を適用することができます。バックグラウンドプロセスは、非同期的に同じ行の古いバージョンを削除し、不変の挿入を使用して効率的に更新操作を模倣します。
これは、テーブルエンジンが重複する行を特定する能力に依存しています。これは、`ORDER BY` 節を使用して一意性を決定することで達成されます。すなわち、`ORDER BY` で指定されたカラムの値が同じ2行は重複と見なされます。テーブルを定義する際に指定された `version` カラムにより、重複として特定された場合に、行の最新バージョンが保持されます。すなわち、最高のバージョン値を持つ行が保持されます。
以下の例でこのプロセスを示します。ここでは、行は A カラム（テーブルの `ORDER BY`）によって一意に識別されます。これらの行が2つのバッチとして挿入されたと仮定し、ディスク上に2つのデータパーツが形成されたとします。後に、非同期のバックグラウンドプロセスでこれらのパーツがマージされます。

ReplacingMergeTree ではさらに、削除されたカラムを指定できます。これには 0 または 1 のいずれかが含まれ、1 の値はその行（およびその重複）が削除されたことを示し、0 はそれ以外の場合に使用されます。 **注意: 削除された行はマージ時に削除されません。**

このプロセス中、パートのマージ時には次のことが発生します。

- カラム A に対して値 1 に識別された行は、バージョン 2 の更新行と、バージョン 3 の削除行（削除カラムの値が 1）を持っています。そのため、最新の行である削除としてマークされたものが保持されます。
- カラム A に対して値 2 に識別された行は、2つの更新行を持っています。後の行が、価格カラムの値が 6 の状態で保持されます。
- カラム A に対して値 3 に識別された行は、バージョン 1 の行と、バージョン 2 の削除行を持っています。この削除行が保持されます。

このマージプロセスの結果、最終状態を表す4つの行があります：

<br />

<img src={postgres_replacingmergetree} class="image" alt="ReplacingMergeTree process" style={{width: '800px', background: 'none'}} />

<br />

削除された行は決して削除されません。これらは `OPTIMIZE table FINAL CLEANUP` によって強制的に削除されることができます。これには、実験的設定 `allow_experimental_replacing_merge_with_cleanup=1` が必要です。これは、以下の条件のもとでのみ実行すべきです。

1. クリーンアップで削除される行について、古いバージョンを持つ行が操作が発行された後に挿入されないことを確信できる場合。これが挿入されると、削除された行はもはや存在しないため、誤って保持されます。
2. クリーンアップを発行する前に、すべてのレプリカが同期していることを確認してください。これは次のコマンドで実行できます：

<br />

```sql
SYSTEM SYNC REPLICA table
```

このコマンドとその後のクリーンアップが完了するまで、挿入を一時停止することをお勧めします。

> ReplacingMergeTree での削除処理は、削除数が少ない（10% 未満）テーブルにのみ推奨されます。上記の条件でクリーンアップをスケジュールできる場合を除き、使用すべきではありません。

> ヒント: ユーザーは、もはや変更の対象とならない選択的パーティションに対して `OPTIMIZE FINAL CLEANUP` を発行できる場合があります。

## プライマリ/重複排除キーの選択 {#choosing-a-primarydeduplication-key}

上記のように、ReplacingMergeTree の場合に満たす必要がある重要な追加制約を強調しました。すなわち、`ORDER BY` のカラムの値は、変更を跨いで行を一意に識別します。Postgresのようなトランザクショナルデータベースから移行する場合、元の Postgres の主キーは ClickHouse の `ORDER BY` 節に含める必要があります。

ClickHouse のユーザーは、[クエリパフォーマンスを最適化するために]( /data-modeling/schema-design#choosing-an-ordering-key) テーブルの `ORDER BY` 節のカラムを選択することに慣れています。一般に、これらのカラムは、[頻繁なクエリに基づいて選択され、増加するカーディナリティの順にリストされるべきです]( /guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要なのは、ReplacingMergeTree は追加の制約を強制します。これらのカラムは不変でなければなりません。すなわち、Postgres からレプリケートする場合、基になる Postgres データで変化しないカラムだけをこの節に追加する必要があります。他のカラムは変更される可能性がありますが、これらは一意の行の識別のために一貫している必要があります。
分析ワークロードにおいて、Postgres の主キーは一般にほとんど役に立たないため、ユーザーはポイント行ルックアップを実行することは稀です。カラムは増加するカーディナリティの順に並べられるべきであり、また [ORDER BY で先にリストされているカラムでの一致は通常は速くなる]( /guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)という事実を考慮すると、Postgres の主キーは `ORDER BY` の最後に追加するべきです（分析価値がない場合を除き）。Postgres で主キーを形成する複数のカラムがある場合、それらはカーディナリティとクエリ値の可能性を尊重して `ORDER BY` に追加されるべきです。ユーザーは、`MATERIALIZED` カラムを通して値を連結することで、一意の主キーを生成したいと考えるかもしれません。

Stack Overflow データセットの posts テーブルを考えてみましょう。

```sql
CREATE TABLE stackoverflow.posts_updateable
(
       `Version` UInt32,
       `Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	`PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
	`AcceptedAnswerId` UInt32,
	`CreationDate` DateTime64(3, 'UTC'),
	`Score` Int32,
	`ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
	`Body` String,
	`OwnerUserId` Int32,
	`OwnerDisplayName` String,
	`LastEditorUserId` Int32,
	`LastEditorDisplayName` String,
	`LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
	`LastActivityDate` DateTime64(3, 'UTC'),
	`Title` String,
	`Tags` String,
	`AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
	`CommentCount` UInt8,
	`FavoriteCount` UInt8,
	`ContentLicense` LowCardinality(String),
	`ParentId` String,
	`CommunityOwnedDate` DateTime64(3, 'UTC'),
	`ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(Version, Deleted)
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)
```

`ORDER BY` キーとして `(PostTypeId, toDate(CreationDate), CreationDate, Id)` を使用します。各投稿に対して一意の `Id` カラムは、行が重複排除できることを保証します。`Version` および `Deleted` カラムは、必要に応じてスキーマに追加されます。

## ReplacingMergeTreeのクエリ {#querying-replacingmergetree}

マージ時に、ReplacingMergeTree は `ORDER BY` カラムの値を一意の識別子として使用し、重複行を識別し、最新バージョンのみを保持するか、最新バージョンが削除を示す場合はすべての重複を削除します。ただし、これは最終的な正確性のみを提供し、行が重複排除されることは保証されませんので、これに依存すべきではありません。そのため、クエリにおいて更新および削除行が考慮されることにより、クエリが不正確な回答を生成する可能性があります。

正しい回答を得るには、ユーザーはバックグラウンドマージをクエリ時の重複排除と削除削除で補完する必要があります。これは `FINAL` 演算子を使用することで実現できます。

上記の posts テーブルを考えてみましょう。このデータセットを通常の方法でロードしますが、削除とバージョンカラムを0の値とともに指定します。ここでは例示のために、10,000行のみをロードします。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

行数を確認しましょう。

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

次に、ポストの回答統計を更新します。これらの値を更新するのではなく、5000行の新しいコピーを挿入し、そのバージョン番号に1を追加します（これは150行がテーブルに存在することを意味します）。これをシンプルな `INSERT INTO SELECT` でシミュレートできます。

```sql
INSERT INTO posts_updateable SELECT
	Version + 1 AS Version,
	Deleted,
	Id,
	PostTypeId,
	AcceptedAnswerId,
	CreationDate,
	Score,
	ViewCount,
	Body,
	OwnerUserId,
	OwnerDisplayName,
	LastEditorUserId,
	LastEditorDisplayName,
	LastEditDate,
	LastActivityDate,
	Title,
	Tags,
	AnswerCount,
	CommentCount,
	FavoriteCount,
	ContentLicense,
	ParentId,
	CommunityOwnedDate,
	ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0
LIMIT 5000

0 rows in set. Elapsed: 4.056 sec. Processed 1.42 million rows, 2.20 GB (349.63 thousand rows/s., 543.39 MB/s.)
```

さらに、削除カラムの値を1にして1000のランダムな投稿を削除します。このシミュレーションも同じく `INSERT INTO SELECT` で実行できます。

```sql
INSERT INTO posts_updateable SELECT
	Version + 1 AS Version,
	1 AS Deleted,
	Id,
	PostTypeId,
	AcceptedAnswerId,
	CreationDate,
	Score,
	ViewCount,
	Body,
	OwnerUserId,
	OwnerDisplayName,
	LastEditorUserId,
	LastEditorDisplayName,
	LastEditDate,
	LastActivityDate,
	Title,
	Tags,
	AnswerCount + 1 AS AnswerCount,
	CommentCount,
	FavoriteCount,
	ContentLicense,
	ParentId,
	CommunityOwnedDate,
	ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0 AND AnswerCount > 0
LIMIT 1000

0 rows in set. Elapsed: 0.166 sec. Processed 135.53 thousand rows, 212.65 MB (816.30 thousand rows/s., 1.28 GB/s.)
```

上記の操作の結果、その合計は16,000行、すなわち 10,000 + 5000 + 1000 となります。至極正確には、元の合計から1000行少ない、すなわち 10,000 - 1000 = 9000 行であるべきです。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

マージが発生した場合、結果は異なる可能性があります。重複行があるため、合計が異なることが確認できます。`FINAL` をテーブルに適用することで、正しい結果が得られます。

```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│	9000 │
└─────────┘

1 row in set. Elapsed: 0.006 sec. Processed 11.81 thousand rows, 212.54 KB (2.14 million rows/s., 38.61 MB/s.)
Peak memory usage: 8.14 MiB.
```

## FINAL のパフォーマンス {#final-performance}

`FINAL` 演算子は、クエリに対してパフォーマンスオーバーヘッドを持ちますが、継続的に改善されています。これは、クエリがプライマリキーのカラムでフィルタリングされていない場合に最も顕著に現れ、より多くのデータが読み込まれ、重複排除オーバーヘッドが増加します。ユーザーが `WHERE` 条件を使ってキーのカラムでフィルタリングする場合、読み込まれるデータと重複排除のために渡されるデータが削減されます。

もし `WHERE` 条件がキーのカラムを使用しない場合、ClickHouse は現在、`FINAL` を使用する際に `PREWHERE` 最適化を利用しません。この最適化は、フィルタリングされないカラムのために読み込まれる行数を減少させることを目的としています。この `PREWHERE` を模倣し、パフォーマンスを向上させる例は [こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance) で見つけることができます。

## ReplacingMergeTree でのパーティションの活用 {#exploiting-partitions-with-replacingmergetree}

ClickHouse ではデータのマージはパーティションレベルで行われます。ReplacingMergeTree を使用する際、ユーザーは、**このパーティショニングキーが行のために変更されないことを保証できる限り**、ベストプラクティスに従ってテーブルをパーティショニングすることを推奨します。これにより、同じ行に対応する更新が同じ ClickHouse パーティションに送信されることが保証されます。ユーザーは、ここで示すベストプラクティスに従っている限り、Postgres と同じパーティションキーを再利用することができます。

これが当てはまる場合、ユーザーは `do_not_merge_across_partitions_select_final=1` 設定を使用して `FINAL` クエリのパフォーマンスを向上させることができます。この設定は、FINAL を使用しているときに、パーティションを独立してマージおよび処理させます。

以下の posts テーブルを考えてみましょう。この場合、パーティショニングは行われていません：

```sql
CREATE TABLE stackoverflow.posts_no_part
(
	`Version` UInt32,
	`Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	…
)
ENGINE = ReplacingMergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

INSERT INTO stackoverflow.posts_no_part SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 182.895 sec. Processed 59.82 million rows, 38.07 GB (327.07 thousand rows/s., 208.17 MB/s.)
```

`FINAL` による処理の負荷を確保するため、1百万行を更新します - それらの `AnswerCount` を増加させるために重複行を挿入します。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

`FINAL` を使用して年ごとの回答数の合計を計算します：

```sql
SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_no_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │    	371480 │
…
│ 2024 │    	127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 2.338 sec. Processed 122.94 million rows, 1.84 GB (52.57 million rows/s., 788.58 MB/s.)
Peak memory usage: 2.09 GiB.
```

同じ手順を年ごとにパーティショニングされたテーブルで繰り返し、先ほどのクエリを `do_not_merge_across_partitions_select_final=1` で実行します。

```sql
CREATE TABLE stackoverflow.posts_with_part
(
	`Version` UInt32,
	`Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	…
)
ENGINE = ReplacingMergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

// 構築と更新は省略

SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_with_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │    	387832 │
│ 2009 │   	1165506 │
│ 2010 │   	1755437 │
…
│ 2023 │    	787032 │
│ 2024 │    	127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

このように、パーティショニングは、重複排除プロセスをパーティションレベルで並列で行えるため、このケースでクエリパフォーマンスを大幅に改善しました。

## マージ動作の考慮事項 {#merge-behavior-considerations}

ClickHouse のマージ選択メカニズムは、単純なパーツのマージを超えています。以下では、ReplacingMergeTree のコンテキスト内でこの動作を検討し、古いデータのより攻撃的なマージを有効にするための設定オプションや、より大きなパーツに関する考慮事項を含めます。

### マージ選択ロジック {#merge-selection-logic}

マージの目的は、パーツの数を最小限に抑えることですが、この目標は書き込みアンプのコストとのバランスも取ります。その結果、一部のパーツの範囲は、内部計算に基づいて過剰な書き込みアンプを引き起こす場合、マージから除外されます。この動作は、不必要なリソース使用を防ぎ、ストレージコンポーネントの寿命を延ばすのに役立ちます。

### 大きなパーツのマージ動作 {#merging-behavior-on-large-parts}

ClickHouse の ReplacingMergeTree エンジンは、重複行の管理のためにデータパーツをマージし、指定された一意のキーに基づいて各行の最新バージョンのみを保持するように最適化されています。ただし、マージパーツが max_bytes_to_merge_at_max_space_in_pool 閾値に達した場合、さらにマージの選択から除外されます。たとえ min_age_to_force_merge_seconds を設定してもです。その結果、自動マージは、継続的なデータ挿入に伴って蓄積される重複を除去することができません。

これに対処するために、ユーザーは手動でパーツをマージし重複を削除するために OPTIMIZE FINAL を呼び出すことができます。自動マージとは異なり、OPTIMIZE FINAL は max_bytes_to_merge_at_max_space_in_pool 閾値をバイパスし、利用可能なリソース、特にディスクスペースに基づいてパーツがマージされます。結果として、各パーティションに単一のパーツが残るまでこのプロセスは続きます。しかし、このアプローチは大きなテーブルではメモリ集約的である可能性があり、新しいデータが追加されるごとに繰り返し実行する必要があるかもしれません。

パフォーマンスを維持するために、テーブルをパーティショニングすることを推奨します。これにより、データパーツが最大マージサイズに達するのを防ぎ、継続的な手動最適化の必要性を減少させます。

### パーティショニングとパーティション間のマージ {#partitioning-and-merging-across-partitions}

ReplacingMergeTree のパーティションの活用で説明したように、テーブルをパーティショニングすることはベストプラクティスとして推奨されます。パーティショニングはデータを分離し、より効率的なマージを可能にし、特にクエリ実行中にパーティションを超えてのマージを避けます。この動作は、23.12 以降のバージョンで強化されています: もしパーティションキーがソートキーのプレフィックスである場合、クエリ時にパーティションを超えてのマージは行われず、クエリパフォーマンスが向上します。

### より良いクエリパフォーマンスのためのマージ調整 {#tuning-merges-for-better-query-performance}

デフォルトでは、min_age_to_force_merge_seconds と min_age_to_force_merge_on_partition_only はそれぞれ 0 および false に設定されており、これらの機能は無効です。この設定では、ClickHouseはパーティションの年齢に基づいて強制的なマージを行わず、標準のマージ動作を適用します。

min_age_to_force_merge_seconds の値が指定されている場合、ClickHouse は指定された期間より古いパーツに対し通常のマージヒューリスティックを無視します。これは、パーツの総数を最小化することが目的としている場合に有効です。ReplacingMergeTree のクエリパフォーマンスを向上させるために、クエリ時のマージが必要なパーツの数を減少させます。

この動作は、min_age_to_force_merge_on_partition_only=true を設定することでさらに調整できます。この設定を行うと、積極的なマージを行うために、パーティション内のすべてのパーツが min_age_to_force_merge_seconds より古くなることが必要です。この設定により、古いパーティションが時間の経過とともに単一のパーツにマージされ、データが統合され、クエリパフォーマンスが維持されます。

### 推奨設定 {#recommended-settings}

:::warning
マージ動作の調整は高度な操作です。これらの設定を本番ワークロードで有効にする前に、ClickHouse サポートに相談することをお勧めします。
:::

ほとんどの場合、min_age_to_force_merge_seconds を低い値に設定することが推奨されます。パーティション期間よりもかなり少ない値が望ましいです。これにより、パーツ数が最小化され、FINAL 演算子による不必要なマージを防ぎます。

たとえば、すでに単一のパーツにマージされた月次パーティションを考えてみましょう。もし小さなストレイ挿入がこのパーティション内に新しいパーツを作成すると、ClickHouse はマージが完了するまでに複数のパーツを読み込まなければならず、クエリパフォーマンスが低下することがあります。min_age_to_force_merge_seconds を設定すると、これらのパーツが積極的にマージされ、クエリパフォーマンスの悪化を防ぐことができます。
