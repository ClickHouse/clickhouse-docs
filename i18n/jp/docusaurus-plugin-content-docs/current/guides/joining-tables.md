---
title: 'ClickHouse における JOIN の利用'
description: 'ClickHouse でテーブルを結合する方法'
keywords: ['joins', 'テーブルの結合']
slug: /guides/joining-tables
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse には、多様な結合アルゴリズムを備えた[完全な `JOIN` 機能のサポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)があります。性能を最大化するために、本ガイドで示す結合最適化の推奨事項に従うことをお勧めします。

* 最適なパフォーマンスを得るには、特にミリ秒単位の性能が求められるリアルタイム分析ワークロードにおいて、クエリ内の `JOIN` の数を減らすことを目指すべきです。1 つのクエリ内の結合は最大でも 3〜4 個を目安としてください。[データモデリングのセクション](/data-modeling/schema-design)では、非正規化、Dictionaries、マテリアライズドビューなど、結合を最小限に抑えるためのさまざまな手法について詳しく説明しています。
* 現在、ClickHouse は結合の順序を自動的に並べ替えません。常に、最も小さいテーブルが JOIN の右辺に来るようにしてください。ほとんどの結合アルゴリズムでは右側のテーブルがメモリ上に保持されるため、これによりクエリのメモリオーバーヘッドを最小限に抑えられます。
* クエリで、以下に示すような `LEFT ANY JOIN` のような「直接的な結合」が必要な場合は、可能な限り [Dictionaries](/dictionary) の使用を推奨します。

<Image img={joins_1} size="sm" alt="Left any join" />

* 内部結合を実行する場合、`IN` 句を用いたサブクエリとして記述した方が、より効率的であることがよくあります。以下のクエリは機能的には同等であり、いずれも「質問文には ClickHouse が含まれていないが、`comments` には含まれている `posts` の数」を求めています。

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

`ANY INNER JOIN` を使用している点に注意してください。単なる `INNER JOIN` を使うとデカルト積になってしまうため、各 post につき 1 件だけマッチする形にしたいのです。

この結合はサブクエリを用いて書き換えることができ、パフォーマンスを大幅に向上できます。

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

ClickHouse はすべての `JOIN` 句およびサブクエリに対して条件のプッシュダウンを試みますが、可能な場合には常に、関係するすべての句に手動で条件を適用することを推奨します。こうすることで、`JOIN` されるデータ量を最小化できます。以下の例では、2020 年以降の Java 関連の投稿に対するアップボート数を計算したいとします。

大きいテーブルを左側に置いた素朴なクエリは、完了までに 56 秒かかります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘
```


結果セット内の行数: 1 行。経過時間: 56.642 秒。処理 252.30 百万行、1.62 GB (4.45 百万行/秒、28.60 MB/秒)。

````

この結合の順序を変更することで、パフォーマンスが劇的に改善され1.5秒になります:

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

左側のテーブルにフィルターを追加すると、パフォーマンスはさらに向上し、0.5 秒にまで短縮されます。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行が結果セットに含まれています。経過時間: 0.597秒。処理された行数: 8114万行、1.31 GB (1億3582万行/秒、2.19 GB/秒)
ピークメモリ使用量: 249.42 MiB。
```

このクエリは、前述したように `INNER JOIN` をサブクエリに移動し、外側および内側の両方のクエリでフィルタを維持することで、さらに最適化できます。

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

ClickHouse は複数の [join アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは通常、メモリ使用量とパフォーマンスのトレードオフを行います。以下は、相対的なメモリ消費量と実行時間に基づいた ClickHouse の join アルゴリズムの概要です:

<br />

<Image img={joins_2} size='lg' alt='join のメモリ使用量と速度' />

<br />

これらのアルゴリズムは、join クエリの計画と実行方法を決定します。デフォルトでは、ClickHouse は使用される join タイプと厳密性、および結合されるテーブルのエンジンに基づいて、direct または hash join アルゴリズムを使用します。また、ClickHouse はリソースの可用性と使用状況に応じて、実行時に使用する join アルゴリズムを適応的に選択し、動的に変更するように設定することもできます。`join_algorithm=auto` の場合、ClickHouse はまず hash join アルゴリズムを試行し、そのアルゴリズムのメモリ制限を超えた場合、アルゴリズムは実行中に partial merge join に切り替えられます。トレースログを通じて、どのアルゴリズムが選択されたかを確認できます。ClickHouse では、`join_algorithm` 設定を使用して、ユーザー自身が希望する join アルゴリズムを指定することもできます。

各 join アルゴリズムでサポートされる `JOIN` タイプを以下に示します。最適化を行う前に考慮する必要があります:

<br />

<Image img={joins_3} size='lg' alt='join の機能' />

<br />

各 `JOIN` アルゴリズムの詳細な説明は、長所、短所、スケーリング特性を含めて[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で確認できます。

適切な join アルゴリズムの選択は、メモリとパフォーマンスのどちらを最適化したいかによって異なります。


## JOIN性能の最適化 {#optimizing-join-performance}

主要な最適化指標がパフォーマンスであり、可能な限り高速にJOINを実行したい場合は、以下の決定木を使用して適切なJOINアルゴリズムを選択できます:

<br />

<Image img={joins_4} size='lg' alt='JOINフローチャート' />

<br />

- **(1)** 右側テーブルのデータを辞書などのインメモリ低レイテンシキーバリューデータ構造に事前ロード可能で、JOINキーが基盤となるキーバリューストレージのキー属性と一致し、`LEFT ANY JOIN`のセマンティクスで十分な場合、**direct join**が適用可能であり、最速のアプローチを提供します。

- **(2)** テーブルの[物理的な行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)がJOINキーのソート順序と一致する場合は、状況次第です。この場合、**full sorting merge join**はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)するため、メモリ使用量が大幅に削減され、さらにデータサイズとJOINキー値の分布によっては、一部のハッシュJOINアルゴリズムよりも高速な実行時間を実現します。

- **(3)** **parallel hash join**の[追加メモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を考慮しても右側テーブルがメモリに収まる場合、このアルゴリズムまたはハッシュJOINの方が高速になる可能性があります。これはデータサイズ、データ型、およびJOINキー列の値分布に依存します。

- **(4)** 右側テーブルがメモリに収まらない場合も、状況次第です。ClickHouseは3つのメモリ非依存JOINアルゴリズムを提供しています。3つすべてが一時的にデータをディスクに書き出します。**Full sorting merge join**と**partial merge join**はデータの事前ソートが必要です。**Grace hash join**は代わりにデータからハッシュテーブルを構築します。データ量、データ型、およびJOINキー列の値分布に基づいて、データからハッシュテーブルを構築する方がデータをソートするよりも高速な場合があります。その逆もあります。

Partial merge joinは、大規模テーブルを結合する際のメモリ使用量を最小化するように最適化されていますが、JOIN速度が犠牲になり、かなり低速です。これは特に、左側テーブルの物理的な行順序がJOINキーのソート順序と一致しない場合に顕著です。

Grace hash joinは3つのメモリ非依存JOINアルゴリズムの中で最も柔軟性が高く、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定により、メモリ使用量とJOIN速度の適切な制御を提供します。データ量によっては、両アルゴリズムのメモリ使用量がほぼ同等になるように[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)数を選択した場合、grace hashはpartial mergeアルゴリズムよりも高速または低速になる可能性があります。grace hash joinのメモリ使用量をfull sorting mergeのメモリ使用量とほぼ同等に設定した場合、当社のテスト実行では常にfull sorting mergeの方が高速でした。

3つのメモリ非依存アルゴリズムのうちどれが最速かは、データ量、データ型、およびJOINキー列の値分布に依存します。どのアルゴリズムが最速かを判断するには、現実的なデータ量と内容でベンチマークを実行することが常に最善です。


## メモリの最適化 {#optimizing-for-memory}

最速の実行時間ではなく、最小のメモリ使用量でjoinを最適化したい場合は、以下のデシジョンツリーを使用できます:

<br />

<Image img={joins_5} size='lg' alt='Joinメモリ最適化デシジョンツリー' />

<br />

- **(1)** テーブルの物理的な行順序がjoinキーのソート順序と一致する場合、**full sorting merge join**のメモリ使用量は最小限になります。さらに、ソートフェーズが[無効化](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)されるため、join速度が向上するという追加の利点があります。
- **(2)** **grace hash join**は、join速度を犠牲にして多数の[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)を[設定](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することで、非常に低いメモリ使用量に調整できます。**partial merge join**は意図的に少量のメインメモリを使用します。外部ソートを有効にした**full sorting merge join**は、一般的にpartial merge joinよりも多くのメモリを使用しますが(行順序がキーのソート順序と一致しない場合)、join実行時間が大幅に改善されるという利点があります。

上記の詳細については、以下の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を参照してください。
