---
slug: /guides/replacing-merge-tree
title: 'ReplacingMergeTree'
description: 'ClickHouse における ReplacingMergeTree エンジンの使用'
keywords: ['replacingmergetree', 'inserts', 'deduplication']
doc_type: 'guide'
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

トランザクションデータベースが更新や削除を伴うトランザクション処理向けに最適化されているのに対し、OLAP データベースはそのような操作に対する保証をある程度犠牲にしています。その代わりに、バッチで挿入される不変データに最適化することで、分析クエリを大幅に高速化します。ClickHouse はミューテーションによる更新操作と、行を軽量に削除する手段の両方を提供しますが、そのカラム指向構造により、これらの操作は前述のとおり慎重にスケジューリングする必要があります。これらの操作は非同期に処理され、単一スレッドで実行され、（更新の場合）ディスク上のデータを書き換える必要があります。そのため、多数の小さな変更を行う用途には使用すべきではありません。
上記のような利用パターンを回避しつつ、更新および削除行からなるストリームを処理するために、ClickHouse のテーブルエンジンである ReplacingMergeTree を使用できます。


## 挿入行の自動アップサート {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replacingmergetree)を使用すると、非効率的な`ALTER`文や`DELETE`文を使用せずに、行に対する更新操作を適用できます。これは、ユーザーが同じ行の複数のコピーを挿入し、そのうちの1つを最新バージョンとして指定できる機能を提供することで実現されます。バックグラウンドプロセスは、同じ行の古いバージョンを非同期的に削除し、不変の挿入を使用して更新操作を効率的に模倣します。
これは、テーブルエンジンが重複行を識別する機能に依存しています。重複の判定には`ORDER BY`句が使用され、2つの行が`ORDER BY`で指定された列に対して同じ値を持つ場合、それらは重複とみなされます。テーブル定義時に指定される`version`列により、2つの行が重複として識別された場合に、行の最新バージョンを保持できます。つまり、最も高いバージョン値を持つ行が保持されます。
以下の例でこのプロセスを説明します。ここでは、行はA列(テーブルの`ORDER BY`)によって一意に識別されます。これらの行は2つのバッチとして挿入され、ディスク上に2つのデータパートが形成されたと仮定します。その後、非同期バックグラウンドプロセスにおいて、これらのパートがマージされます。

ReplacingMergeTreeでは、さらにdeleted列を指定できます。この列には0または1を含めることができ、値が1の場合は行(およびその重複)が削除されたことを示し、それ以外の場合は0が使用されます。**注意: 削除された行はマージ時に削除されません。**

このプロセスにおいて、パートのマージ時に以下が発生します:

- 列Aの値1で識別される行には、バージョン2の更新行とバージョン3の削除行(deleted列の値が1)の両方があります。したがって、削除としてマークされた最新の行が保持されます。
- 列Aの値2で識別される行には、2つの更新行があります。後者の行が保持され、price列の値は6になります。
- 列Aの値3で識別される行には、バージョン1の行とバージョン2の削除行があります。この削除行が保持されます。

このマージプロセスの結果、最終状態を表す4つの行が得られます:

<br />

<Image
  img={postgres_replacingmergetree}
  size='md'
  alt='ReplacingMergeTreeプロセス'
/>

<br />

削除された行は決して削除されないことに注意してください。これらは`OPTIMIZE table FINAL CLEANUP`で強制的に削除できます。これには実験的設定`allow_experimental_replacing_merge_with_cleanup=1`が必要です。これは以下の条件下でのみ実行してください:

1. 操作が発行された後に、古いバージョンの行(クリーンアップで削除されるもの)が挿入されないことを確認できる必要があります。これらが挿入されると、削除された行が存在しなくなるため、誤って保持されます。
2. クリーンアップを発行する前に、すべてのレプリカが同期していることを確認してください。これは次のコマンドで実現できます:

<br />

```sql
SYSTEM SYNC REPLICA table
```

(1)が保証され、このコマンドとその後のクリーンアップが完了するまで、挿入を一時停止することを推奨します。

> ReplacingMergeTreeでの削除処理は、上記の条件でクリーンアップ期間をスケジュールできる場合を除き、削除数が少ないから中程度(10%未満)のテーブルに対してのみ推奨されます。

> ヒント: ユーザーは、変更の対象でなくなった特定のパーティションに対して`OPTIMIZE FINAL CLEANUP`を発行することもできます。


## プライマリ/重複排除キーの選択 {#choosing-a-primarydeduplication-key}

上記では、ReplacingMergeTreeの場合に満たす必要がある重要な追加制約を強調しました。`ORDER BY`の列の値が、変更を通じて行を一意に識別する必要があります。Postgresのようなトランザクショナルデータベースから移行する場合、元のPostgresプライマリキーをClickHouseの`ORDER BY`句に含める必要があります。

ClickHouseのユーザーは、[クエリパフォーマンスを最適化する](/data-modeling/schema-design#choosing-an-ordering-key)ために、テーブルの`ORDER BY`句で列を選択することに慣れているでしょう。一般的に、これらの列は[頻繁に実行されるクエリに基づいて選択し、カーディナリティの昇順に並べる](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)必要があります。重要なことに、ReplacingMergeTreeは追加の制約を課します。これらの列は不変である必要があります。つまり、Postgresからレプリケートする場合、基礎となるPostgresデータで変更されない列のみをこの句に追加してください。他の列は変更可能ですが、これらの列は一意な行識別のために一貫性を保つ必要があります。
分析ワークロードでは、ユーザーがポイント行ルックアップを実行することはほとんどないため、Postgresプライマリキーは一般的にほとんど有用ではありません。列をカーディナリティの昇順に並べることを推奨していること、および[ORDER BYの前方に記載された列での一致は通常より高速である](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)という事実を考慮すると、Postgresプライマリキーは`ORDER BY`の末尾に追加する必要があります(分析的価値がある場合を除く)。Postgresで複数の列がプライマリキーを構成する場合、カーディナリティとクエリでの使用可能性を考慮して、それらを`ORDER BY`に追加する必要があります。ユーザーは、`MATERIALIZED`列を介して値を連結することで、一意なプライマリキーを生成することもできます。

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

`(PostTypeId, toDate(CreationDate), CreationDate, Id)`の`ORDER BY`キーを使用します。各投稿に対して一意な`Id`列により、行の重複排除が可能になります。必要に応じて、`Version`列と`Deleted`列がスキーマに追加されます。


## ReplacingMergeTreeのクエリ {#querying-replacingmergetree}

マージ時に、ReplacingMergeTreeは`ORDER BY`列の値を一意識別子として使用して重複行を識別し、最高バージョンのみを保持するか、最新バージョンが削除を示す場合はすべての重複を削除します。ただし、これは結果整合性のみを提供します。行の重複排除を保証するものではなく、これに依存すべきではありません。したがって、更新行や削除行がクエリで考慮されるため、クエリは誤った結果を生成する可能性があります。

正確な結果を得るには、バックグラウンドマージをクエリ時の重複排除と削除除去で補完する必要があります。これは`FINAL`演算子を使用することで実現できます。

上記のpostsテーブルを考えてみましょう。このデータセットを読み込む通常の方法を使用できますが、値0に加えてdeletedとversionの列を指定します。例として、10000行のみを読み込みます。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

行数を確認しましょう:

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

次に、投稿回答の統計を更新します。これらの値を更新する代わりに、5000行の新しいコピーを挿入し、そのバージョン番号に1を加えます(これは、テーブルに15000行が存在することを意味します)。これは単純な`INSERT INTO SELECT`でシミュレートできます:

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

さらに、deleted列の値を1にして行を再挿入することで、1000件のランダムな投稿を削除します。これも単純な`INSERT INTO SELECT`でシミュレートできます。

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

上記の操作の結果は16,000行、つまり10,000 + 5000 + 1000になります。ここでの正しい合計は、実際には元の合計より1000行少ない10,000 - 1000 = 9000であるべきです。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

発生したマージによって、ここでの結果は異なります。重複行があるため、ここでの合計が異なることがわかります。テーブルに`FINAL`を適用すると、正しい結果が得られます。


```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│    9000 │
└─────────┘

1行のセット。経過時間: 0.006秒。処理行数: 11.81千行、212.54 KB (214万行/秒、38.61 MB/秒)
ピークメモリ使用量: 8.14 MiB。
```


## FINALのパフォーマンス {#final-performance}

`FINAL`演算子はクエリに対して若干のパフォーマンスオーバーヘッドが発生します。
これは、クエリがプライマリキー列でフィルタリングを行わない場合に最も顕著となり、
より多くのデータが読み込まれ、重複排除のオーバーヘッドが増加します。ユーザーが`WHERE`条件を使用してキー列でフィルタリングを行う場合、
重複排除のために読み込まれ渡されるデータ量は削減されます。

`WHERE`条件がキー列を使用しない場合、ClickHouseは現在`FINAL`使用時に`PREWHERE`最適化を利用しません。この最適化は、フィルタリングされていない列に対して読み込まれる行数を削減することを目的としています。この`PREWHERE`をエミュレートし、パフォーマンスを向上させる可能性のある例は[こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)で確認できます。


## ReplacingMergeTreeでパーティションを活用する {#exploiting-partitions-with-replacingmergetree}

ClickHouseにおけるデータのマージはパーティションレベルで発生します。ReplacingMergeTreeを使用する場合、**行に対してパーティションキーが変更されないこと**をユーザーが保証できる限り、ベストプラクティスに従ってテーブルをパーティション化することを推奨します。これにより、同じ行に関する更新が同じClickHouseパーティションに送信されることが保証されます。ここで説明するベストプラクティスに従う限り、Postgresと同じパーティションキーを再利用することができます。

これが該当する場合、ユーザーは`do_not_merge_across_partitions_select_final=1`設定を使用して`FINAL`クエリのパフォーマンスを向上させることができます。この設定により、FINALを使用する際にパーティションが独立してマージおよび処理されます。

パーティション化を使用しない以下のpostsテーブルを考えてみましょう:

```sql
CREATE TABLE stackoverflow.posts_no_part
(
        `Version` UInt32,
        `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        ...
)
ENGINE = ReplacingMergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

INSERT INTO stackoverflow.posts_no_part SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 182.895 sec. Processed 59.82 million rows, 38.07 GB (327.07 thousand rows/s., 208.17 MB/s.)
```

`FINAL`が処理を実行する必要があることを確認するため、100万行を更新します - 重複行を挿入することで`AnswerCount`を増加させます。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

`FINAL`を使用して年ごとの回答数の合計を計算します:

```sql
SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_no_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │        371480 │
...
│ 2024 │        127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 2.338 sec. Processed 122.94 million rows, 1.84 GB (52.57 million rows/s., 788.58 MB/s.)
Peak memory usage: 2.09 GiB.
```

年ごとにパーティション化されたテーブルに対して同じ手順を繰り返し、`do_not_merge_across_partitions_select_final=1`を使用して上記のクエリを再実行します。

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

// データ投入と更新は省略

SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_with_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │       387832  │
│ 2009 │       1165506 │
│ 2010 │       1755437 │
...
│ 2023 │       787032  │
│ 2024 │       127765  │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

示されているように、この場合、パーティション化により重複排除プロセスがパーティションレベルで並列に実行されることが可能になり、クエリパフォーマンスが大幅に向上しています。


## マージ動作の考慮事項 {#merge-behavior-considerations}

ClickHouseのマージ選択メカニズムは、単純なパーツのマージを超えた機能を持ちます。以下では、ReplacingMergeTreeの文脈でこの動作を検証し、古いデータのより積極的なマージを有効にする設定オプションと、より大きなパーツに関する考慮事項について説明します。

### マージ選択ロジック {#merge-selection-logic}

マージはパーツ数の最小化を目指しますが、書き込み増幅のコストとのバランスも考慮します。その結果、内部計算に基づいて過度な書き込み増幅を引き起こす可能性がある場合、一部のパーツ範囲はマージから除外されます。この動作により、不要なリソース使用を防ぎ、ストレージコンポーネントの寿命を延ばすことができます。

### 大きなパーツでのマージ動作 {#merging-behavior-on-large-parts}

ClickHouseのReplacingMergeTreeエンジンは、データパーツをマージして重複行を管理するように最適化されており、指定された一意キーに基づいて各行の最新バージョンのみを保持します。ただし、マージされたパーツがmax_bytes_to_merge_at_max_space_in_pool閾値に達すると、min_age_to_force_merge_secondsが設定されていても、それ以上のマージ対象として選択されなくなります。その結果、継続的なデータ挿入によって蓄積される可能性のある重複を削除するために、自動マージに依存することができなくなります。

これに対処するため、ユーザーはOPTIMIZE FINALを実行してパーツを手動でマージし、重複を削除できます。自動マージとは異なり、OPTIMIZE FINALはmax_bytes_to_merge_at_max_space_in_pool閾値を回避し、利用可能なリソース、特にディスク容量のみに基づいてパーツをマージし、各パーティションに単一のパーツが残るまで処理を続けます。ただし、このアプローチは大きなテーブルではメモリ集約的になる可能性があり、新しいデータが追加されるたびに繰り返し実行が必要になる場合があります。

パフォーマンスを維持しながらより持続可能なソリューションとして、テーブルのパーティショニングが推奨されます。これにより、データパーツが最大マージサイズに達するのを防ぎ、継続的な手動最適化の必要性を減らすことができます。

### パーティショニングとパーティション間のマージ {#partitioning-and-merging-across-partitions}

「Exploiting Partitions with ReplacingMergeTree」で説明したように、ベストプラクティスとしてテーブルのパーティショニングを推奨します。パーティショニングはデータを分離してより効率的なマージを実現し、特にクエリ実行時にパーティション間のマージを回避します。この動作はバージョン23.12以降で強化されています。パーティションキーがソートキーの接頭辞である場合、クエリ時にパーティション間のマージは実行されず、クエリパフォーマンスが向上します。

### クエリパフォーマンス向上のためのマージ調整 {#tuning-merges-for-better-query-performance}

デフォルトでは、min_age_to_force_merge_secondsとmin_age_to_force_merge_on_partition_onlyはそれぞれ0とfalseに設定されており、これらの機能は無効化されています。この設定では、ClickHouseはパーティションの経過時間に基づいてマージを強制することなく、標準のマージ動作を適用します。

min_age_to_force_merge_secondsに値が指定されている場合、ClickHouseは指定された期間より古いパーツに対して通常のマージヒューリスティックを無視します。これは一般的にパーツの総数を最小化することが目標である場合にのみ有効ですが、ReplacingMergeTreeではクエリ時にマージが必要なパーツ数を減らすことでクエリパフォーマンスを向上させることができます。

この動作は、min_age_to_force_merge_on_partition_only=trueを設定することでさらに調整できます。これにより、積極的なマージを行うためにパーティション内のすべてのパーツがmin_age_to_force_merge_secondsより古い必要があります。この設定により、古いパーティションは時間の経過とともに単一のパーツにマージされ、データが統合されてクエリパフォーマンスが維持されます。

### 推奨設定 {#recommended-settings}

:::warning
マージ動作の調整は高度な操作です。本番ワークロードでこれらの設定を有効にする前に、ClickHouseサポートに相談することを推奨します。
:::

ほとんどの場合、min_age_to_force_merge_secondsをパーティション期間よりも大幅に短い低い値に設定することが推奨されます。これによりパーツ数が最小化され、FINALオペレータを使用したクエリ時の不要なマージを防ぐことができます。

例えば、すでに単一のパーツにマージされた月次パーティションを考えてみましょう。小規模な散発的な挿入がこのパーティション内に新しいパーツを作成すると、マージが完了するまでClickHouseが複数のパーツを読み取る必要があるため、クエリパフォーマンスが低下する可能性があります。min_age_to_force_merge_secondsを設定することで、これらのパーツが積極的にマージされることを保証し、クエリパフォーマンスの低下を防ぐことができます。
