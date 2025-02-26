---
slug: /guides/replacing-merge-tree
title: ReplacingMergeTree
description: ReplacingMergeTreeエンジンの使用方法 ClickHouseにおける
keywords: [replacingmergetree, inserts, deduplication]
---


トランザクショナルデータベースがトランザクショナルな更新および削除のワークロードに最適化されているのに対し、OLAPデータベースはそのような操作に対して保証を減少させています。その代わり、OLAPデータベースは、バッチで挿入された不変のデータを最適化し、分析クエリを大幅に高速化することを目的としています。ClickHouseは、ミューテーションを通じての更新操作や、行削除の軽量な手段を提供しますが、その列指向の構造により、これらの操作は上記のように注意してスケジュールする必要があります。これらの操作は非同期で処理され、単一スレッドで実行され、（更新の場合）ディスク上のデータを書き換える必要があります。したがって、小規模な変更の大量適用には使用すべきではありません。
上記の使用パターンを回避しつつ、更新および削除行のストリームを処理するために、ClickHouseのテーブルエンジンであるReplacingMergeTreeを使用できます。

## 挿入行の自動アップサート {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replacingmergetree)は、非効率的な `ALTER` または `DELETE` ステートメントを使用せずに、行に更新操作を適用できるようにします。ユーザーが同じ行の複数のコピーを挿入し、そのうちの1つを最新版として指定できる機能を提供します。バックグラウンドプロセスが、非同期で古いバージョンの同じ行を削除し、不変の挿入を通じて更新操作を効率的に模倣します。
これは、テーブルエンジンが重複行を識別する能力に依存しています。これは、`ORDER BY`句を使用して一意性を決定することによって達成されます。つまり、`ORDER BY`で指定されたカラムの値が同じ場合、それらは重複として考えられます。テーブル定義時に指定された `version` カラムにより、重複として識別された2つの行のうち、最新の行が保持されます。つまり、最大のバージョン値を持つ行が保持されます。
以下の例でこのプロセスを説明します。ここでは、行はAカラムによって一意に特定されます（テーブルの `ORDER BY`）。これらの行は2つのバッチとして挿入されたと仮定し、データパーツがディスク上で2つ形成されます。後に、非同期のバックグラウンドプロセス中に、これらのパーツがマージされます。

ReplacingMergeTreeは、削除カラムを指定することも許可します。これは0または1を含むことができ、1は行（およびその重複）を削除したことを示し、0はそれ以外の状態を示します。**注意: 削除された行は、マージ時に削除されません。**

マージプロセス中に、次のことが行われます：

- Aカラムの値が1で識別される行には、バージョン2のアップデート行と、バージョン3の削除行（削除カラム値が1）が存在します。削除マークされた最新の行が保持されます。
- Aカラムの値が2の行には2つのアップデート行があります。後者の行は、価格カラムの値が6で保持されます。
- Aカラムの値が3の行には、バージョン1の行と、バージョン2の削除行があります。この削除行が保持されます。

このマージプロセスの結果、最終状態を表す4行が得られます：

<br />

<img src={require('../images/postgres-replacingmergetree.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px', background: 'none'}} />

<br />

削除された行は決して削除されないことに注意してください。それらは `OPTIMIZE table FINAL CLEANUP` で強制的に削除できます。これには、実験的設定 `allow_experimental_replacing_merge_with_cleanup=1` が必要です。これは以下の条件下でのみ実行するべきです：

1. 操作が完了した後、クリーンアップで削除される古いバージョンの行が再挿入されないことを確実にする必要があります。これらが挿入されると、削除された行が存在しないため、誤って保持されることになります。
2. クリーンアップを実行する前に、すべてのレプリカが同期していることを確認してください。これは次のコマンドで達成できます：

<br />

```sql
SYSTEM SYNC REPLICA table
```

1の条件が保証されたら、このコマンドとその後のクリーンアップが完了するまで、挿入を一時停止することをお勧めします。

> ReplacingMergeTreeによる削除の処理は、削除の数が少ないか中程度（10％未満）のテーブルにのみ推奨されます。上記の条件でクリーンアップの期間をスケジュールできる場合を除いて。

> ヒント: ユーザーは、もはや変更対象でない選択的なパーティションに対して `OPTIMIZE FINAL CLEANUP` を発行することも可能です。 

## プライマリ/重複排除キーの選択 {#choosing-a-primarydeduplication-key}

上記では、ReplacingMergeTreeの場合に満たす必要のある重要な追加制約を強調しました：`ORDER BY`のカラムの値が、変更を通じて行を一意に特定しなければなりません。Postgresのようなトランザクショナルデータベースから移行する場合、元のPostgresの主キーをClickhouseの `ORDER BY`句に含めるべきです。

ClickHouseのユーザーは、テーブルの `ORDER BY`句内のカラムを選択する最適化を [クエリパフォーマンスを向上させるため](/data-modeling/schema-design#choosing-an-ordering-key) に慣れているでしょう。通常、これらのカラムは [頻繁なクエリに基づいて選択され、順に並べるべきです](/optimize/sparse-primary-indexes)。重要なのは、ReplacingMergeTreeには追加の制約があり、これらのカラムは不変である必要があるということです。すなわち、Postgresからレプリケートする場合、これらが基盤となるPostgresデータにおいて変更されない場合にのみこの句にカラムを追加する必要があります。他のカラムは変更可能ですが、一意な行の識別には一貫している必要があります。
分析ワークロードの場合、Postgresの主キーは一般的にはあまり役に立たず、ユーザーはほとんどポイント行のルックアップを行いません。通常、カラムが順に並べられることを推奨し、さらに [ORDER BYの早い段階にリストされたカラムでの一致が通常はより早くなることを考慮すると](/optimize/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)、Postgresの主キーは `ORDER BY`の最後に追加されるべきです（分析価値がある場合を除いて）。Postgresで複数のカラムが主キーを形成する場合、これらは `ORDER BY`の末尾に追加されるべきで、カーディナリティとクエリ値の発生の可能性を考慮します。ユーザーは、`MATERIALIZED`カラムを使用して値の結合による一意の主キーを生成することも望むかもしれません。

Stack Overflowデータセットのpostsテーブルを考えてみましょう。

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

ここでは `(PostTypeId, toDate(CreationDate), CreationDate, Id)` の `ORDER BY`キーを使用します。各投稿に一意な `Id`カラムによって、行の重複を排除できることを保証します。必要に応じて `Version` および `Deleted`カラムがスキーマに追加されます。

## ReplacingMergeTreeのクエリ {#querying-replacingmergetree}

マージ時に、ReplacingMergeTreeは重複行を識別し、`ORDER BY`カラムの値を一意な識別子として使用します。そして、最高のバージョンを保持するか、最新のバージョンが削除を示す場合はすべての重複を削除します。ただし、これは最終的な正確性しか提供せず—行が重複排除されることは保証されません。したがって、クエリは更新および削除行がクエリに考慮されることで不正確な結果を生成する可能性があります。

正しい結果を取得するためには、ユーザーはバックグラウンドマージをクエリ時の重複排除および削除の除去で補完する必要があります。これは、`FINAL`オペレーターを使用することで実現できます。

上記のpostsテーブルを考えてみましょう。このデータセットを通常の方法で読み込むことができますが、削除およびバージョンカラムを値0とともに指定します。例の目的のために、10000行のみを読み込みます。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

行数を確認しましょう：

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

投稿に対する統計を更新します。これらの値を更新するのではなく、5000行の新しいコピーを挿入し、それらのバージョン番号に1を追加します（これにより、テーブルには150行が存在します）。これは、単純な `INSERT INTO SELECT`を使用してシミュレートできます：

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

さらに、1000のランダムな投稿を削除するために、行を再挿入しますが、削除カラム値を1に設定します。再び、これをシンプルな `INSERT INTO SELECT`でシミュレートできます。

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

上記の操作の結果は16000行です。すなわち、10000 + 5000 + 1000です。ここでの正確な合計は、実際にはもとの合計から1000行少ないはずです。即ち、10000 - 1000 = 9000行です。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

ここでの結果は、発生したマージによって異なる場合があります。この合計は重複行があるため、異なることがわかります。テーブルに `FINAL`を適用することで正しい結果が得られます。

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

## FINALのパフォーマンス {#final-performance}

`FINAL`オペレーターは、クエリにはパフォーマンスオーバーヘッドをもたらしますが、改善が進められています。これは、クエリが主キーのカラムでフィルタリングされていない場合に最も顕著です。そのため、より多くのデータが読み込まれ、重複排除のオーバーヘッドが増加します。ユーザーが `WHERE`条件を用いてキーのカラムでフィルタリングを行うと、読み込まれるデータと重複排除のために渡されるデータが減少します。

`WHERE`条件がキーのカラムを使用しない場合、ClickHouseは現在、`FINAL`を使用する際に `PREWHERE`最適化を活用していません。この最適化は、フィルタリングされていないカラムのために読み込まれる行数を減少させることを目的としています。この `PREWHERE`をエミュレートし、パフォーマンスを向上させる方法の例については、[こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)を参照してください。

## ReplacingMergeTreeによるパーティションの活用 {#exploiting-partitions-with-replacingmergetree}

ClickHouseでは、データのマージがパーティションレベルで行われます。ReplacingMergeTreeを使用する際には、ユーザーがテーブルを最適なプラクティスに従ってパーティション分割することを推奨します。これは、**パーティションキーが行に対して変更されないことを保証できる場合**に限ります。これにより、同じ行に関連する更新が同じClickHouseのパーティションに送信されることを確実にします。ユーザーは、ここで概説した最適なプラクティスに従う限り、Postgresと同じパーティションキーを再利用できます。

それが適用可能であると仮定すると、ユーザーは `do_not_merge_across_partitions_select_final=1`の設定を使用して、`FINAL`クエリのパフォーマンスを向上させることができます。この設定により、`FINAL`を使用する際に、パーティションが独立してマージおよび処理されるようになります。

次のようなパーティションを使用しないpostsテーブルを考えてみましょう：

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

`FINAL`が何らかの作業を行う必要があることを保証するために、100万行を更新します - それらの `AnswerCount`を重複行の挿入によってインクリメントします。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

`FINAL`を使用して年間ごとの回答数を計算します：

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

年ごとにパーティションしたテーブルに対して同じ手順を繰り返し、上記のクエリを `do_not_merge_across_partitions_select_final=1`で実行します。

```sql
CREATE TABLE stackoverflow.posts_with_part
(
	`Version` UInt32,
	`Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	...
)
ENGINE = ReplacingMergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

// populate & update omitted

SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_with_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │    	387832 │
│ 2009 │   	1165506 │
│ 2010 │   	1755437 │
...
│ 2023 │    	787032 │
│ 2024 │    	127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

このように、パーティション化がクエリパフォーマンスを大幅に改善したことがわかります。これは、重複排除プロセスがパーティションレベルで並行して行われることを許可します。

## マージ動作の考慮事項 {#merge-behavior-considerations}

ClickHouseのマージ選択メカニズムは、単なるパーツのマージを超えています。以下では、ReplacingMergeTreeのコンテキストでこの動作を検討し、古いデータのより積極的なマージを有効にするための構成オプションや、大きな部分に関する考慮事項を含めます。

### マージ選択ロジック {#merge-selection-logic}

マージは、パーツの数を最小限に抑えることを目指していますが、この目標を著しい書き込み増幅のコストとのバランスを取ります。したがって、過度な書き込み増幅をもたらす場合、一部のパーツの範囲がマージから除外されます。これは、内部計算に基づく動作です。この動作は、不必要なリソース使用を防ぎ、ストレージコンポーネントの寿命を延ばすのに役立ちます。

### 大きなパーツのマージ動作 {#merging-behavior-on-large-parts}

ClickHouseのReplacingMergeTreeエンジンは、重複行を管理するために最適化されており、データパーツをマージしてそれぞれの行の最新バージョンのみを保持します。しかし、マージされたパーツが `max_bytes_to_merge_at_max_space_in_pool`の閾値に達すると、それはさらなるマージの対象とはならず、`min_age_to_force_merge_seconds`が設定されていても同様です。その結果、現在のデータ挿入に伴い蓄積される重複を削除するための自動マージを信頼できなくなります。

これに対応するため、ユーザーは `OPTIMIZE FINAL`を呼び出して、手動でパーツをマージし重複を削除できます。自動マージとは異なり、`OPTIMIZE FINAL`は `max_bytes_to_merge_at_max_space_in_pool`の閾値を回避し、利用可能なリソース、特にディスクスペースに基づいてパーツをマージし、各パーティションに1つのパーツが残るまで続けます。しかし、このアプローチは、大きなテーブルではメモリを多く消費する可能性があり、新しいデータが追加されるたびに繰り返し実行する必要があります。

パフォーマンスを維持する持続可能な解決策としては、テーブルのパーティション化が推奨されます。これにより、データパーツが最大マージサイズに達するのを防ぎ、定期的な手動最適化の必要性が減ります。

### パーティションを跨いだマージとパーティション化 {#partitioning-and-merging-across-partitions}

ReplacingMergeTreeでのパーティションの活用で議論されたように、テーブルをパーティション化することはベストプラクティスとして推奨されます。パーティション化は、データを隔離し、より効率的なマージを実現し、特にクエリ実行中のパーティションを横断するマージを回避します。特に、バージョン23.12以降、この動作が強化されており、パーティションキーがソートキーのプレフィックスである場合、クエリ時のパーティションを跨いだマージは行われず、クエリパフォーマンスが向上します。

### より良いクエリパフォーマンスのためのマージの調整 {#tuning-merges-for-better-query-performance}

デフォルトでは、`min_age_to_force_merge_seconds`および `min_age_to_force_merge_on_partition_only`はそれぞれ0とfalseに設定されており、これらの機能が無効化されています。この構成では、ClickHouseは、パーティションの年齢に基づいてマージを強制することなく、標準的なマージ動作を適用します。

`min_age_to_force_merge_seconds`に値が指定されると、ClickHouseは指定された期間より古いパーツに関する通常のマージヒューリスティクスを無視します。これは、一般的にはパーツの総数を最小化することを目的とした場合にのみ効果がありますが、ReplacingMergeTreeではクエリ時のマージが必要なパーツの数を減らすことでクエリパフォーマンスを向上させることができます。

この動作は、`min_age_to_force_merge_on_partition_only=true`を設定することでさらに調整可能です。これにより、パーツは`min_age_to_force_merge_seconds`より古い場合にのみ積極的にマージされるようになります。この構成では、古いパーティションが時間の経過とともに単一のパーツにマージされ、データが統合されてクエリパフォーマンスが維持されます。

### 推奨設定 {#recommended-settings}

:::warning
マージ動作の調整は高度な操作です。生産環境でこれらの設定を有効にする前に、ClickHouseサポートに相談することをお勧めします。
:::

ほとんどの場合、`min_age_to_force_merge_seconds`を低い値に設定すること（パーティション期間よりかなり少ない値）が望ましいです。これにより、パーツの数が最小限になり、`FINAL`オペレーターでの不必要なマージを防止します。

例えば、すでに1つのパーツにマージされた月次パーティションを考えてみます。小さな挿入がこのパーティション内に新しいパーツを作成すると、ClickHouseはマージが完了するまで複数のパーツを読み込む必要があり、クエリパフォーマンスが低下します。`min_age_to_force_merge_seconds`を設定することで、これらのパーツを積極的にマージさせ、クエリパフォーマンスの低下を防ぐことができます。
