---
slug: /guides/replacing-merge-tree
title: 'ReplacingMergeTree'
description: 'ClickHouseでReplacingMergeTreeエンジンを使用する'
keywords: ['replacingmergetree', 'inserts', 'deduplication']
---
```

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

トランザクションデータベースはトランザクションの更新および削除のワークロードに最適化されていますが、OLAPデータベースはそのような操作に対しては低い保証を提供します。代わりに、これらは大規模にバッチで挿入される不変のデータに最適化され、高速な分析クエリの恩恵を受けます。ClickHouseは、ミューテーションを介した更新操作や、行を削除するための軽量な手段を提供していますが、その列指向構造により、これらの操作は上記のように注意深くスケジュールする必要があります。これらの操作は非同期で処理され、単一のスレッドで実行され、（更新の場合は）ディスク上にデータを書き込む必要があります。したがって、小さな変更を多数行うためには使用すべきではありません。
上記の使用パターンを避けながら、更新および削除行のストリームを処理するために、ClickHouseのテーブルエンジンであるReplacingMergeTreeを使用することができます。

## 挿入された行の自動アップサート {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replacingmergetree)は、非効率的な`ALTER`や`DELETE`ステートメントを使用せずに、行に更新操作を適用できるようにすることで、ユーザーが同じ行の複数のコピーを挿入し、そのうちの1つを最新バージョンとして指定する能力を提供します。バックグラウンドプロセスが同じ行の古いバージョンを非同期で削除し、不変の挿入を使用して更新操作を効率的に模倣します。
これは、テーブルエンジンが重複行を特定する能力に依存しています。これは、`ORDER BY`句を使用して一意性を決定することで達成されます。つまり、`ORDER BY`で指定されたカラムの値が同じ2つの行は重複として扱われます。テーブル定義時に指定された`version`カラムにより、2つの行が重複していると見なされた場合、最新のバージョンの行が保持されます。すなわち、最高のバージョン値を持つ行が保持されます。
以下の例でこのプロセスを示します。ここでは、行はAカラム（テーブルの`ORDER BY`）によって一意に識別されます。これらの行は2つのバッチとして挿入されたと仮定し、ディスク上に2つのデータパーツが形成されます。後に、非同期のバックグラウンドプロセス中に、これらのパーツが一緒にマージされます。

ReplacingMergeTreeは、削除されたカラムを指定することも可能です。このカラムには0または1を含めることができ、1の値は行（およびその重複）が削除されたことを示し、それ以外はゼロが使用されます。**注意: 削除された行はマージ時に削除されません。**

このプロセス中、パーツのマージ時に以下が発生します：

- Aカラムの値1で識別される行には、バージョン2の更新行と、バージョン3（削除カラムの値が1）の削除行があります。したがって、削除としてマークされた最新の行が保持されます。
- Aカラムの値2で識別される行には、2つの更新行があります。後の行が価格カラムの値6を持って保持されます。
- Aカラムの値3で識別される行には、バージョン1の行と、バージョン2の削除行があります。この削除行が保持されます。

このマージプロセスの結果として、最終状態を表す4つの行があります：

<br />

<Image img={postgres_replacingmergetree} size="md" alt="ReplacingMergeTree process"/>

<br />

削除された行は決して削除されないことに注意してください。これらは`OPTIMIZE table FINAL CLEANUP`で強制的に削除することができます。これは、実験的設定`allow_experimental_replacing_merge_with_cleanup=1`を必要とします。この操作は以下の条件下でのみ実行すべきです：

1. 古いバージョンの行（クリーンアップで削除されるもの）が操作が発行された後に挿入されないことを確認できます。これらが挿入されると、削除された行はもはや存在しないため、誤って保持されます。
2. クリーンアップを発行する前にすべてのレプリカが同期していることを確認してください。これは以下のコマンドで達成できます：

<br />

```sql
SYSTEM SYNC REPLICA table
```

このコマンドとその後のクリーンアップが完了するまで、挿入を一時停止することをお勧めします。

> ReplacingMergeTreeを使用した削除の処理は、削除が少ない（10％未満）のテーブルにのみ推奨され、上記の条件でクリーンアップの期間をスケジュールできる場合を除きます。

> ヒント: ユーザーは、もはや変更対象とされない選択的パーティションに対して`OPTIMIZE FINAL CLEANUP`を発行できる場合もあります。

## 主キー/重複排除キーの選択 {#choosing-a-primarydeduplication-key}

上記では、ReplacingMergeTreeのケースで満たされなければならない重要な追加制約を強調しました：`ORDER BY`のカラムの値が変更を通じて行を一意に識別します。Postgresのようなトランザクションデータベースから移行する場合、元のPostgresの主キーは、ClickHouseの`ORDER BY`句に含めるべきです。

ClickHouseのユーザーは、テーブルの`ORDER BY`句でのカラムの選択を[クエリパフォーマンスを最適化するために](/data-modeling/schema-design#choosing-an-ordering-key)熟知しているでしょう。一般的に、これらのカラムは[頻繁なクエリに基づいて選択し、増加する基数の順にリストされるべきです](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要なことに、ReplacingMergeTreeは追加の制約を課します - これらのカラムは不変でなければなりません。すなわち、Postgresからレプリケーションする場合、基盤となるPostgresデータで変更されないカラムのみをこの句に追加する必要があります。他のカラムは変更可能ですが、これらは一意の行識別のために一貫性を持つ必要があります。
分析ワークロードにおいて、Postgresの主キーはほとんど役に立たないことが一般的です。ユーザーは点行ルックアップを実行することは稀です。基数が増加する順にカラムを並べ替えることをお勧めし、また[ORDER BYで早くリストされるカラムで一致させると一般的に速い](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)という事実を考慮に入れると、Postgresの主キーは`ORDER BY`の最後に追加すべきです（分析的価値がない場合を除いて）。Postgresで複数のカラムが主キーを形成する場合、これらを基数とクエリ値の可能性を考慮して`ORDER BY`に追加するべきです。ユーザーは、`MATERIALIZED`カラムを介して値の連結を使用して一意の主キーを生成することを望むかもしれません。

Stack Overflowデータセットからのpostsテーブルを考えてみましょう。

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

私たちは`(PostTypeId, toDate(CreationDate), CreationDate, Id)`の`ORDER BY`キーを使用します。`Id`カラムは各投稿に対して一意であり、行を重複排除できます。`Version`と`Deleted`カラムは必要に応じてスキーマに追加されます。

## ReplacingMergeTreeのクエリ {#querying-replacingmergetree}

マージ時に、ReplacingMergeTreeは`ORDER BY`カラムの値をユニークな識別子として使用して重複行を特定し、最新のバージョンのみを保持するか、最新のバージョンが削除を示す場合にはすべての重複を削除します。しかし、これは最終的な正しさしか提供せず、行が重複排除されることを保証するものではなく、これに依存すべきではありません。したがって、クエリが重複行および削除行を考慮することで誤った答えを生成する可能性があります。

正しい答えを得るためには、ユーザーはバックグラウンドマージとクエリ時の重複排除および削除削除を補完する必要があります。これは`FINAL`演算子を使用することで達成できます。

上記のpostsテーブルを考えてみましょう。このデータセットを通常の方法で読み込むことができますが、削除およびバージョンカラムを指定し、値0を使用します。例の目的のため、10000行のみを読み込みます。

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

次に、私たちは投稿-回答統計を更新します。これらの値を更新するのではなく、5000行の新しいコピーを挿入し、バージョン番号を1増やします（これにより、テーブル内に150行が存在することになります）。これを単純な`INSERT INTO SELECT`でシミュレートできます。

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

さらに、私たちは1000のランダムな投稿を削除します。行を再挿入しますが、削除カラムの値を1にします。これも単純な`INSERT INTO SELECT`でシミュレートできます。

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

上記の操作の結果、16000行が生成されます。すなわち、10000 + 5000 + 1000です。正しい合計は、現実には元の合計から1000行少なくなります。すなわち、10000 - 1000 = 9000であるべきです。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

マージの結果に応じてここで得られる結果は異なります。重複行が存在するため、合計が異なることがわかります。テーブルに`FINAL`を適用することで正しい結果を得ることができます。

```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│    9000 │
└─────────┘

1 row in set. Elapsed: 0.006 sec. Processed 11.81 thousand rows, 212.54 KB (2.14 million rows/s., 38.61 MB/s.)
Peak memory usage: 8.14 MiB.
```

## FINALのパフォーマンス {#final-performance}

`FINAL`演算子は、クエリに対してパフォーマンスのオーバーヘッドをもたらしますが、継続的な改善が行われています。これは特に、クエリが主キーのカラムでフィルタリングしない場合に顕著であり、より多くのデータが読み込まれ、重複排除のオーバーヘッドが増加します。もしユーザーが`WHERE`条件を用いてキーのカラムでフィルタリングする場合、読み込まれるデータと重複排除のために渡されるデータは減少します。

`WHERE`条件がキーのカラムを使用していない場合、ClickHouseは現在`FINAL`を使用する際に`PREWHERE`最適化を利用しません。この最適化は、非フィルタリングされた列のために読み込む行数を減少させることを目指します。この`PREWHERE`を模倣し、パフォーマンスを向上させる方法の例は[こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)で見つけることができます。

## ReplacingMergeTreeのパーティションを活用する {#exploiting-partitions-with-replacingmergetree}

ClickHouseにおけるデータのマージは、パーティションレベルで行われます。ReplacingMergeTreeを使用する場合、ユーザーはテーブルをベストプラクティスに従ってパーティション分けることをお勧めします。これは**パーティションキーが行に対して変わらないことを保証できる場合**に行うべきです。これにより、同じ行に関連する更新が同じClickHouseパーティションに送信されるようになります。あなたは、ここで概説されたベストプラクティスに従っていれば、Postgresと同じパーティションキーを再利用できます。

これが実現する場合、ユーザーは設定`do_not_merge_across_partitions_select_final=1`を使用して`FINAL`クエリのパフォーマンスを向上させることができます。この設定により、FINALを使用する際のパーティションが独立してマージおよび処理されるようになります。

以下に、パーティションを使用しないpostsテーブルを考えます：

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

`FINAL`が作業を行う必要があることを確認するために、100万行を更新します - 重複行を挿入してその`AnswerCount`を増加させます。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

`FINAL`を用いて年ごとの回答の合計を計算します：

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

年でパーティション分けられたテーブルに対して、上記と同じ手順を繰り返し、`do_not_merge_across_partitions_select_final=1`で再クエリします。

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
│ 2008 │       387832  │
│ 2009 │       1165506 │
│ 2010 │       1755437 │
...
│ 2023 │       787032  │
│ 2024 │       127765  │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

このように、パーティショニングによって、重複排除プロセスがパーティションレベルで並行して行われることにより、クエリパフォーマンスが著しく向上しました。

## マージ動作に関する考慮事項 {#merge-behavior-considerations}

ClickHouseのマージ選択メカニズムは、単なるパーツのマージを超えています。以下では、ReplacingMergeTreeの文脈でこの動作を検討し、古いデータのより積極的なマージを有効にするための構成オプションおよび大きなパーツに関する考慮事項を含めます。

### マージ選択ロジック {#merge-selection-logic}

マージはパーツの数を最小限に抑えることを目的としていますが、この目標は書き込み増幅のコストとのバランスも取られています。したがって、過剰な書き込み増幅を引き起こす可能性のあるパーツの範囲は、内部計算に基づいてマージから除外されます。この動作は、不要なリソース使用を防ぎ、ストレージコンポーネントの寿命を延ばすのに役立ちます。

### 大規模パーツのマージ動作 {#merging-behavior-on-large-parts}

ClickHouseのReplacingMergeTreeエンジンは、指定されたユニークキーに基づいて最新の行を保持しながら重複行を管理するように最適化されています。しかし、マージされたパーツがmax_bytes_to_merge_at_max_space_in_poolの閾値に達すると、それは更なるマージのために選ばれなくなります。たとえmin_age_to_force_merge_secondsが設定されていてもです。その結果、進行中のデータ挿入で蓄積されるかもしれない重複を削除するための自動マージに依存することはできなくなります。

これに対処するために、ユーザーはOPTIMIZE FINALを呼び出してパーツを手動でマージし、重複を削除できます。自動マージとは異なり、OPTIMIZE FINALはmax_bytes_to_merge_at_max_space_in_poolの閾値をバイパスし、リソース、特にディスクスペースの利用可能性に基づいてパーツをマージし、各パーティションにおいて1つのパーツが残るまで行います。しかし、このアプローチは大規模なテーブルではメモリを多く消費する可能性があり、新しいデータが追加されるたびに繰り返し実行する必要があります。

パフォーマンスを維持する持続可能な解決策として、テーブルのパーティショニングを推奨します。これにより、データパーツが最大マージサイズに達するのを防ぎ、継続的な手動最適化の必要性を軽減します。

### パーティショニングとパーティション間のマージ {#partitioning-and-merging-across-partitions}

ReplacingMergeTreeを活用しっぱなしのパーティショニングの推奨をご覧ください。このテーブルをパーティショニングすることで、データを隔離し、より効率的なマージを実現し、特にクエリ実行中にパーティション間のマージを回避します。この動作は23.12以降のバージョンで強化されました：もしパーティションキーがソーティングキーのプレフィックスなら、クエリ時にパーティション間のマージは行われず、クエリパフォーマンスが向上します。

### より良いクエリパフォーマンスのためのマージの調整 {#tuning-merges-for-better-query-performance}

デフォルトでは、min_age_to_force_merge_secondsとmin_age_to_force_merge_on_partition_onlyはともに0およびfalseに設定され、これらの機能が無効になっています。この構成では、ClickHouseはパーティションの年齢に基づいてマージを強制することなく標準のマージ動作を適用します。

min_age_to_force_merge_secondsの値が指定されている場合、ClickHouseは指定された期間より古いパーツに対して通常のマージのヒューリスティックを無視します。一般的には、これはパーツの総数を最小化することが目標である場合にのみ効果的ですが、ReplacingMergeTreeではクエリ時にマージが必要なパーツの数を減らすことからクエリパフォーマンスを向上させる可能性があります。

この動作はさらに調整可能で、min_age_to_force_merge_on_partition_only=trueを設定することで、すべてのパーティション内のパーツがmin_age_to_force_merge_secondsより古い必要があります。これにより、古いパーティションが時間をかけて単一のパーツにマージされ、データが統合され、クエリパフォーマンスが維持されます。

### 推奨設定 {#recommended-settings}

:::warning
マージ動作の調整は高度な操作です。生産ワークロードでこれらの設定を有効にする前に、ClickHouseのサポートに相談することをお勧めします。
:::

ほとんどの場合、min_age_to_force_merge_secondsをパーティション期間よりもかなり低い値に設定することが好まれます。これにより、パーツの数が最小化され、FINAL演算子を使用したクエリ時の不要なマージが防止されます。

たとえば、すでに単一のパーツにマージされた月次パーティションを考えてみましょう。もし小さなはぐれ挿入がこのパーティション内で新しいパーツを作ると、クエリパフォーマンスが悪化する可能性があり、ClickHouseはマージが完了するまで複数のパーツを読み込まなければならなくなるためです。min_age_to_force_merge_secondsを設定することで、これらのパーツが積極的にマージされ、クエリパフォーマンスの劣化を防ぐことができます。
