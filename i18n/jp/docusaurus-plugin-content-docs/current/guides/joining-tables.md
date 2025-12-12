---
title: 'ClickHouse における JOIN の使い方'
description: 'ClickHouse でテーブルを JOIN する方法'
keywords: ['JOIN', 'テーブル結合']
slug: /guides/joining-tables
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse は[完全な `JOIN` サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、幅広い結合アルゴリズムを利用できます。パフォーマンスを最大化するために、本ガイドで挙げる結合最適化の推奨事項に従うことをお勧めします。

* 最適なパフォーマンスを得るには、特にミリ秒単位の応答が要求されるリアルタイム分析ワークロードにおいて、クエリ内の `JOIN` の数を減らすことを目標にしてください。1 つのクエリでの JOIN は最大 3〜4 個を目安にします。[データモデリングのセクション](/data-modeling/schema-design)では、非正規化、辞書、マテリアライズドビューなど、JOIN を最小限に抑えるためのいくつかの工夫について詳しく説明しています。
* 現在、ClickHouse は JOIN の順序を並べ替えません。常に最も小さいテーブルが JOIN の右側に来るようにしてください。ほとんどの結合アルゴリズムでは右側のテーブルがメモリ上に保持されるため、これによりクエリのメモリオーバーヘッドを最小限にできます。
* クエリが、以下に示すような `LEFT ANY JOIN` のような直接結合を必要とする場合は、可能な限り [Dictionaries](/dictionary) を使用することをお勧めします。

<Image img={joins_1} size="sm" alt="Left any join" />

* 内部結合を実行する場合、多くのケースで `IN` 句を使用したサブクエリとして記述した方がより効率的です。次のクエリを考えてみてください。これらは機能的には同等であり、いずれも質問文には ClickHouse が含まれていないが `comments` には含まれている `posts` の件数を取得します。

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

`INNER JOIN` ではなく `ANY INNER JOIN` を使用しているのは、直積（cartesian product）を避けたい、つまり各 post につき 1 件だけマッチさせたいからです。

この結合はサブクエリを使って書き換えることができ、大幅なパフォーマンス向上が見込めます。

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

ClickHouse は、すべての `JOIN` 句およびサブクエリに対して条件のプッシュダウンを試みますが、可能な限りすべてのサブ句に条件を手動で適用することを常に推奨しています。こうすることで、`JOIN` するデータ量を最小限に抑えられます。以下の例では、2020 年以降の Java 関連の投稿に対するアップボート数を計算したいものとします。

左側に大きなテーブルを置いた素朴なクエリは、完了までに 56 秒かかります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 56.642 sec. Processed 252.30 million rows, 1.62 GB (4.45 million rows/s., 28.60 MB/s.)
```


1 行の結果。経過時間: 56.642秒。252.30 百万行、1.62 GBを処理しました (4.45 百万行/秒、28.60 MB/秒)。

````sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
````sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
Peak memory usage: 249.42 MiB.
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

ClickHouse は、いくつかの[JOIN アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは、一般的にメモリ使用量とパフォーマンスの間にトレードオフの関係があります。以下では、ClickHouse の JOIN アルゴリズムを、相対的なメモリ消費量と実行時間に基づいて概観します。

<br />

<Image img={joins_2} size="lg" alt="JOIN におけるメモリ別スピード"/>

<br />

これらのアルゴリズムは、JOIN クエリがどのように計画および実行されるかを決定します。デフォルトでは、ClickHouse は使用される JOIN の種類と厳密さ、および結合対象テーブルのエンジンに基づいて、direct JOIN または hash JOIN アルゴリズムを使用します。また、ClickHouse を構成して、リソースの利用可能性と使用状況に応じて、実行時に使用する JOIN アルゴリズムを自動的に選択し動的に切り替えることもできます。`join_algorithm=auto` の場合、ClickHouse は最初に hash JOIN アルゴリズムを試し、そのアルゴリズムのメモリ制限を超えた場合には、その場でアルゴリズムを partial merge JOIN に切り替えます。どのアルゴリズムが選択されたかは、トレースログで確認できます。また ClickHouse では、`join_algorithm` 設定を通じて、ユーザーが希望する JOIN アルゴリズムを明示的に指定することも可能です。

各 JOIN アルゴリズムでサポートされる `JOIN` タイプを以下に示します。最適化を行う前に考慮してください。

<br />

<Image img={joins_3} size="lg" alt="JOIN の機能"/>

<br />

各 `JOIN` アルゴリズムの詳細な説明は、その長所・短所・スケーリング特性とともに[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で確認できます。

適切な JOIN アルゴリズムの選択は、メモリ使用量とパフォーマンスのどちらを優先して最適化するかによって決まります。



## JOIN のパフォーマンス最適化 {#optimizing-join-performance}

主な最適化指標がパフォーマンスであり、JOIN をできるだけ高速に実行したい場合は、適切な JOIN アルゴリズムを選択するために次の意思決定ツリーを使用できます。

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 右側のテーブルのデータを、辞書などのインメモリ低レイテンシーなキー・バリュー型データ構造にあらかじめロードでき、JOIN キーが基盤となるキー・バリューストレージのキー属性と一致し、かつ `LEFT ANY JOIN` のセマンティクスで十分な場合は、**direct join** が適用可能で、最も高速なアプローチとなります。

- **(2)** テーブルの [物理行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) が JOIN キーのソート順序と一致している場合は、判断が分かれます。このケースでは、**full sorting merge join** はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)し、その結果、メモリ使用量が大幅に削減されるとともに、データサイズや JOIN キー値の分布によっては、いくつかのハッシュ JOIN アルゴリズムよりも高速に実行されます。

- **(3)** 右側のテーブルが、**parallel hash join** の[追加のメモリ使用量オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を考慮してもメモリに収まる場合は、このアルゴリズム、もしくは hash join のほうが高速になることがあります。これは、データサイズ、データ型、および JOIN キーカラムの値分布に依存します。

- **(4)** 右側のテーブルがメモリに収まらない場合も、やはり状況により変わります。ClickHouse には、メモリ制約を受けない 3 つの JOIN アルゴリズムが用意されています。これら 3 つはいずれも一時的にデータをディスクにスピルします。**full sorting merge join** と **partial merge join** は、事前にデータをソートする必要があります。**grace hash join** は代わりにデータからハッシュテーブルを構築します。データ量、データ型、および JOIN キーカラムの値分布に応じて、データからハッシュテーブルを構築するほうがデータをソートするより高速となるシナリオもあれば、その逆もあります。

partial merge join は、大規模なテーブルを結合する際のメモリ使用量を最小化するよう最適化されていますが、その代償として JOIN の速度はかなり遅くなります。特に、左側テーブルの物理行順序が JOIN キーのソート順序と一致しない場合に顕著です。

grace hash join は、3 つのメモリ制約非依存 JOIN アルゴリズムの中で最も柔軟であり、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 設定によってメモリ使用量と JOIN 速度のトレードオフをうまく制御できます。データ量に応じて、[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)の数が両アルゴリズムのメモリ使用量がおおむね揃うように選択されている場合には、grace hash が partial merge アルゴリズムより高速になることもあれば、遅くなることもあります。grace hash join のメモリ使用量が full sorting merge のメモリ使用量とおおむね揃うように設定されている場合、われわれのテストでは常に full sorting merge のほうが高速でした。

3 つのメモリ制約非依存アルゴリズムのうちどれが最速かは、データ量、データ型、および JOIN キーカラムの値分布によって決まります。どのアルゴリズムが最速かを判断するには、現実的なデータ量・データでベンチマークを実行するのが最善です。



## メモリ使用量の最適化 {#optimizing-for-memory}

最速の実行時間ではなくメモリ使用量の最小化を目的に結合を最適化したい場合は、代わりに次の決定木を使用できます。

<br />

<Image img={joins_5} size="lg" alt="結合のメモリ最適化の決定木" />

<br />

- **(1)** テーブルの物理行順序が結合キーのソート順序と一致している場合、**full sorting merge join** のメモリ使用量はこれ以上ないほど低く抑えられます。さらに、ソートフェーズが[無効化される](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)ことで、結合速度も良好になります。
- **(2)** **grace hash join** は、結合速度を犠牲にして多数の [bucket](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) を[設定](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することで、非常に低いメモリ使用量になるようにチューニングできます。**partial merge join** は、意図的に少量のメインメモリしか使用しません。外部ソートを有効にした **full sorting merge join** は（行順序がキーのソート順序と一致していないと仮定すると）、一般的に partial merge join より多くのメモリを使用しますが、その代わりに結合の実行時間が大幅に向上します。

上記の内容についてさらに詳しい情報が必要なユーザーには、次の [ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
