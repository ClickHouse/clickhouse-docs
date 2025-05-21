---
title: 'ClickHouseにおけるJOINの使用'
description: 'ClickHouseでテーブルを結合する方法'
keywords: ['joins', 'テーブルの結合']
slug: /guides/joining-tables
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouseは[完全な`JOIN`サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、豊富なJOINアルゴリズムを選択できます。パフォーマンスを最大化するために、このガイドに記載されているJOINの最適化に関する提案に従うことをお勧めします。

- 最適なパフォーマンスのために、ユーザーはクエリ内の`JOIN`の数を減らすことを目指すべきです。特にミリ秒のパフォーマンスが求められるリアルタイム分析ワークロードでは、クエリ内のJOINは最大で3～4に抑えるようにします。[データモデルセクション](/data-modeling/schema-design)では、結合を最小限に抑えるための多くの変更、すなわち非正規化、ディクショナリ、およびマテリアライズドビューについて詳しく説明しています。
- 現在、ClickHouseはJOINの順序を再配置しません。常に最小のテーブルがJOINの右側に配置されていることを確認してください。これはほとんどのJOINアルゴリズムでメモリに保持され、クエリのメモリオーバーヘッドを最小限に抑えます。
- クエリに直接のJOIN、すなわち`LEFT ANY JOIN`が必要な場合、下記のように、可能な限り[Dictionaries](/dictionary)を使用することをお勧めします。

<Image img={joins_1} size="sm" alt="Left any join"/>

- 内部結合を行う場合、これを`IN`句を使用したサブクエリとして記述する方が最適です。以下のクエリは、機能的に同等であり、ClickHouseに言及しない質問の`posts`の数を特定しますが、`comments`では言及しています。

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

`ANY INNER JOIN`を使用していることに注意してください。単に`INNER` JOINを使用すると、デカルト積が生成されるため、各投稿に対して1つのマッチだけを求めたのです。

このJOINは、サブクエリを使用して書き換えることができ、パフォーマンスを大幅に向上させます：

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

ClickHouseはすべてのJOIN句およびサブクエリに条件をプッシュダウンしようとしますが、ユーザーは可能な限りすべてのサブクローズに条件を手動で適用し、JOINするデータのサイズを最小限に抑えることをお勧めします。以下の例を考えてみましょう。ここでは、2020年以降のJava関連の投稿のアップボートの数を計算したいとします。

ナイーブなクエリは、左側に大きなテーブルを配置して56秒で完了します：

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

このJOINの順序を変更すると、パフォーマンスが劇的に向上し、1.5秒で完了します：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
```

右側のテーブルにフィルタを追加すると、パフォーマンスがさらに向上し、0.5秒で完了します。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
Peak memory usage: 249.42 MiB.
```

このクエリは、先に述べたように、INNER JOINをサブクエリに移動することでさらに改善できます。外部クエリおよび内部クエリの両方でフィルタを維持します。

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

## JOINアルゴリズムの選択 {#choosing-a-join-algorithm}

ClickHouseは複数の[JOINアルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは、通常、パフォーマンスとメモリ使用量の間でトレードオフを行います。以下は、ClickHouseのJOINアルゴリズムの概要です。これは、相対的なメモリ消費と実行時間に基づいています。

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

これらのアルゴリズムは、JOINクエリが計画され、実行される方法を決定します。デフォルトでは、ClickHouseは使用されるJOINタイプと結合されたテーブルの厳密さやエンジンに基づいて、直接またはハッシュJOINアルゴリズムを使用します。あるいは、ClickHouseはリソースの可用性と使用量に応じて、実行時に使用するJOINアルゴリズムを適応的に選択し、動的に変更するように構成することもできます。`join_algorithm=auto`のとき、ClickHouseはまずハッシュJOINアルゴリズムを試み、そのアルゴリズムのメモリ制限が違反された場合、アルゴリズムはその場で部分マージJOINに切り替えられます。どのアルゴリズムが選択されたかは、トレースログにより確認できます。また、ClickHouseは、ユーザーが自分で希望するJOINアルゴリズムを`join_algorithm`設定を介して指定することを許可しています。

各JOINアルゴリズムに対するサポートされている`JOIN`タイプは以下に示されており、最適化を行う前に考慮すべきです。

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

各`JOIN`アルゴリズムの詳細な説明は、[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)に記載されており、それぞれの利点、欠点、スケーリング特性が記載されています。

適切なJOINアルゴリズムを選択することは、メモリを最適化するのかパフォーマンスを最適化するのかによります。

## JOINパフォーマンスの最適化 {#optimizing-join-performance}

最重要な最適化指標がパフォーマンスで、JOINをできるだけ早く実行したい場合は、適切なJOINアルゴリズムを選択するための意思決定ツリーを使用できます。

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 右側のテーブルからのデータをメモリ内の低遅延のキーとバリューデータ構造、例えばディクショナリに事前にロードできる場合、かつ結合キーが基礎となるキーとバリューストレージのキー属性に一致し、`LEFT ANY JOIN`のセマンティクスが適切である場合、**直接結合**が適用可能であり、最も迅速なアプローチを提供します。

- **(2)** テーブルの[物理行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順と一致する場合は、状況によります。この場合、**フルソーティングマージJOIN**はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)し、結果として大幅にメモリ使用量が削減されます。また、データサイズや結合キーの値の分布に応じて、いくつかのハッシュJOINアルゴリズムよりも速い実行時間を提供します。

- **(3)** 右側のテーブルがメモリに収まる場合、たとえ[追加のメモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を伴っても、**並列ハッシュJOIN**またはハッシュJOINの方が速くなる可能性があります。これはデータサイズ、データタイプ、結合キーのカラムの値の分布によって異なります。

- **(4)** 右側のテーブルがメモリに収まらない場合、再度依存します。ClickHouseはメモリに依存しない結合アルゴリズムを三つ提供しています。すべて三つとも一時的にデータをディスクにスピルします。**フルソーティングマージJOIN**と**部分マージJOIN**はデータを事前にソートする必要があります。**グレースハッシュJOIN**は代わりにデータからハッシュテーブルを構築します。データのボリューム、データのタイプ、結合キーのカラムの値の分布に基づいて、データからハッシュテーブルを構築する方がデータをソートするより速くなる状況もありますし、その逆もあります。

部分マージJOINは、大きなテーブルを結合する際にメモリ使用量を最小限に抑えるよう最適化されており、JOIN速度は非常に遅くなります。これは特に、左側のテーブルの物理行順序が結合キーのソート順序と一致しない場合に当てはまります。

グレースハッシュJOINは、メモリ使用量とJOIN速度を良好に管理できる、三つのメモリに依存しない結合アルゴリズムの中で最も柔軟性を持っており、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定により制御できます。データボリュームに応じて、グレースハッシュJOINは部分マージアルゴリズムよりも速い場合や遅い場合があります。これは、両方のアルゴリズムのメモリ使用量が概ね整合するようにバケツの数を選択すると、発生します。グレースハッシュJOINのメモリ使用量がフルソーティングマージのメモリ使用量とほぼ整合しているように構成されている場合、我々のテスト運用でもフルソーティングマージが常に速かったです。

メモリに依存しないアルゴリズムのどれが最も速いかは、データのボリューム、データタイプ、および結合キーのカラムの値の分布によります。リアルなデータボリュームでベンチマークを行い、どのアルゴリズムが最も速いかを判断するのが常に最良です。

## メモリの最適化 {#optimizing-for-memory}

最速の実行時間ではなく、メモリ使用量を最小限に抑えるためにJOINを最適化したい場合は、次の意思決定ツリーを使用できます。

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** テーブルの物理行順序が結合キーのソート順序に一致する場合、**フルソーティングマージJOIN**のメモリ使用量は最低になります。ソートフェーズが[無効](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)であるため、良好なJOIN速度の追加の利点もあります。
- **(2)** **グレースハッシュJOIN**は、JOIN速度の代わりに非常に低いメモリ使用量に調整できます。**部分マージJOIN**は、メインメモリを意図的に少量使用します。**フルソーティングマージJOIN**は外部ソートが有効になっていると一般的に部分マージJOINよりも多くのメモリを使用します（行順序がキーのソート順序と一致しない場合を前提にしています）が、JOIN実行時間は大幅に改善されます。

上述の内容に関する詳細が必要なユーザーには、次の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
