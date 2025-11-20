---
title: 'ClickHouse での JOIN の使い方'
description: 'ClickHouse でテーブルを結合する方法'
keywords: ['joins', 'join tables']
slug: /guides/joining-tables
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse は、多様な結合アルゴリズムを備えた [完全な `JOIN` サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1) を提供します。パフォーマンスを最大化するために、本ガイドで挙げる結合最適化の推奨事項に従うことを推奨します。

* 最適なパフォーマンスを得るには、特にミリ秒レベルの応答が求められるリアルタイム分析ワークロードにおいて、クエリ内の `JOIN` の数を減らすようにしてください。1 つのクエリ内の結合は最大 3〜4 回を目安とします。[データモデリングのセクション](/data-modeling/schema-design) では、非正規化、辞書、マテリアライズドビューなど、結合を最小限に抑えるためのさまざまな手法について詳しく説明しています。
* 現在、ClickHouse は結合順序の再配置を行いません。常に、最も小さいテーブルが JOIN の右側になるようにしてください。ほとんどの結合アルゴリズムでは右側のテーブルがメモリ上に保持され、これによりクエリのメモリオーバーヘッドを最小限に抑えることができます。
* クエリで直接結合、すなわち以下の例に示すような `LEFT ANY JOIN` が必要な場合は、可能であれば [辞書](/dictionary) の使用を推奨します。

<Image img={joins_1} size="sm" alt="Left any join" />

* INNER JOIN を実行する場合、`IN` 句を用いたサブクエリとして記述したほうが、より効率的になることがよくあります。次のクエリを考えてみてください。これらは機能的には同等です。どちらのクエリも、質問文では ClickHouse に言及していないものの、`comments` では言及している `posts` の数を求めます。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

ここでは単なる `INNER` JOIN ではなく `ANY INNER JOIN` を使用しています。これはデカルト積を避け、各 post につき 1 件だけマッチさせたいからです。

この JOIN はサブクエリを使用して書き直すことができ、その場合パフォーマンスが大幅に向上します。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
        SELECT PostId
        FROM stackoverflow.comments
        WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
Peak memory usage: 323.52 MiB.
```

ClickHouse はすべての `JOIN` 句およびサブクエリに対して条件のプッシュダウンを試みますが、可能な限り各サブ句に対して手動で条件を適用することを推奨します。これにより、`JOIN` 対象となるデータ量を最小化できます。以下の例では、2020 年以降の Java 関連投稿に対する up-vote の数を計算したいとします。

左側に大きいテーブルを置いた単純なクエリは、完了までに 56 秒かかります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘
```


1 行が結果セットに含まれます。経過時間: 56.642 秒。252.30 百万行、1.62 GB を処理しました (4.45 百万行/秒、28.60 MB/秒)

````

このJOINの順序を変更することで、パフォーマンスが劇的に向上し1.5秒になります:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
````

左側のテーブルにフィルターを追加すると、処理時間はさらに短縮されて 0.5 秒になります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
ピークメモリ使用量: 249.42 MiB.
```

このクエリは、前述のとおり `INNER JOIN` をサブクエリに移動し、外側と内側の両方のクエリでフィルタを保持することで、さらに改善できます。

```sql
SELECT count() AS upvotes
FROM stackoverflow.votes
WHERE (VoteTypeId = 2) AND (PostId IN (
        SELECT Id
        FROM stackoverflow.posts
        WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
))

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.383 sec. Processed 99.64 million rows, 804.55 MB (259.85 million rows/s., 2.10 GB/s.)
Peak memory usage: 250.66 MiB.
```


## JOIN アルゴリズムの選択 {#choosing-a-join-algorithm}

ClickHouse は複数の [join アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1) をサポートしています。これらのアルゴリズムは通常、メモリ使用量とパフォーマンスのトレードオフの関係にあります。以下は、相対的なメモリ消費量と実行時間に基づいた ClickHouse の join アルゴリズムの概要です:

<br />

<Image img={joins_2} size='lg' alt='join のメモリ使用量と速度の関係' />

<br />

これらのアルゴリズムは、join クエリの計画と実行方法を決定します。デフォルトでは、ClickHouse は使用される join タイプと厳密性、および結合されるテーブルのエンジンに基づいて、direct または hash join アルゴリズムを使用します。また、ClickHouse はリソースの可用性と使用状況に応じて、実行時に使用する join アルゴリズムを適応的に選択し、動的に変更するように設定することもできます。`join_algorithm=auto` の場合、ClickHouse はまず hash join アルゴリズムを試行し、そのアルゴリズムのメモリ制限を超えた場合は、その場で partial merge join にアルゴリズムを切り替えます。トレースログを通じて、どのアルゴリズムが選択されたかを確認できます。ClickHouse では、`join_algorithm` 設定を使用して、ユーザー自身が希望する join アルゴリズムを指定することもできます。

各 join アルゴリズムでサポートされている `JOIN` タイプを以下に示します。最適化を行う前に考慮してください:

<br />

<Image img={joins_3} size='lg' alt='join の機能' />

<br />

各 `JOIN` アルゴリズムの詳細な説明は、長所、短所、スケーリング特性を含めて [こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) で確認できます。

適切な join アルゴリズムの選択は、メモリとパフォーマンスのどちらを最適化するかによって異なります。


## JOIN パフォーマンスの最適化 {#optimizing-join-performance}

主要な最適化指標がパフォーマンスであり、可能な限り高速に JOIN を実行したい場合は、以下の決定木を使用して適切な JOIN アルゴリズムを選択できます:

<br />

<Image img={joins_4} size='lg' alt='JOIN フローチャート' />

<br />

- **(1)** 右側テーブルのデータを、辞書などのインメモリ低レイテンシキーバリューデータ構造に事前ロードでき、JOIN キーが基盤となるキーバリューストレージのキー属性と一致し、`LEFT ANY JOIN` のセマンティクスで十分な場合、**direct join** が適用可能であり、最速のアプローチを提供します。

- **(2)** テーブルの[物理的な行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が JOIN キーのソート順序と一致する場合は、状況によります。この場合、**full sorting merge join** はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)するため、メモリ使用量が大幅に削減され、さらにデータサイズと JOIN キー値の分布によっては、一部のハッシュ JOIN アルゴリズムよりも高速な実行時間を実現します。

- **(3)** **parallel hash join** の[追加メモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を考慮しても右側テーブルがメモリに収まる場合、このアルゴリズムまたはハッシュ JOIN の方が高速になる可能性があります。これはデータサイズ、データ型、および JOIN キー列の値分布に依存します。

- **(4)** 右側テーブルがメモリに収まらない場合も、状況によります。ClickHouse は 3 つのメモリ非依存 JOIN アルゴリズムを提供しています。3 つすべてが一時的にデータをディスクにスピルします。**Full sorting merge join** と **partial merge join** はデータの事前ソートが必要です。**Grace hash join** は代わりにデータからハッシュテーブルを構築します。データ量、データ型、および JOIN キー列の値分布に基づいて、データからハッシュテーブルを構築する方がデータをソートするよりも高速なシナリオがあります。その逆もあります。

Partial merge join は、大規模テーブルを JOIN する際のメモリ使用量を最小化するように最適化されていますが、JOIN 速度が犠牲になり、かなり低速です。これは特に、左側テーブルの物理的な行順序が JOIN キーのソート順序と一致しない場合に顕著です。

Grace hash join は 3 つのメモリ非依存 JOIN アルゴリズムの中で最も柔軟性が高く、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 設定によってメモリ使用量と JOIN 速度の適切な制御を提供します。データ量によっては、両アルゴリズムのメモリ使用量がほぼ一致するように[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)数を選択した場合、grace hash は partial merge アルゴリズムよりも高速または低速になる可能性があります。grace hash join のメモリ使用量を full sorting merge のメモリ使用量とほぼ一致するように設定した場合、テスト実行では full sorting merge が常に高速でした。

3 つのメモリ非依存アルゴリズムのうちどれが最速かは、データ量、データ型、および JOIN キー列の値分布に依存します。どのアルゴリズムが最速かを判断するには、現実的なデータ量の現実的なデータでベンチマークを実行することが常に最善です。


## メモリ使用量の最適化 {#optimizing-for-memory}

最速の実行時間ではなく、最小のメモリ使用量でJOINを最適化したい場合は、代わりに次のデシジョンツリーを使用できます:

<br />

<Image img={joins_5} size='lg' alt='JOINメモリ最適化デシジョンツリー' />

<br />

- **(1)** テーブルの物理的な行順序がJOINキーのソート順序と一致する場合、**full sorting merge join**のメモリ使用量は最小限になります。さらに、ソートフェーズが[無効化](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)されるため、優れたJOIN速度という追加のメリットもあります。
- **(2)** **grace hash join**は、JOIN速度を犠牲にして多数の[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)を[設定](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することで、非常に低いメモリ使用量に調整できます。**partial merge join**は意図的に少量のメインメモリを使用します。外部ソートを有効にした**full sorting merge join**は、一般的にpartial merge joinよりも多くのメモリを使用しますが(行順序がキーのソート順序と一致しない場合)、JOIN実行時間が大幅に改善されるというメリットがあります。

上記の詳細が必要なユーザーには、次の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
