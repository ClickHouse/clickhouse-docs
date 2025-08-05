---
title: 'ClickHouse における JOIN の使用方法'
description: 'ClickHouse でのテーブルの結合方法'
keywords:
- 'joins'
- 'join tables'
slug: '/guides/joining-tables'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouseは[完全な `JOIN` サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、さまざまな結合アルゴリズムを選択できます。パフォーマンスを最大化するためには、このガイドに記載されている結合最適化の提案に従うことをお勧めします。

- 最適なパフォーマンスを得るために、ユーザーはクエリ内の `JOIN` の数を減らすことを目指すべきです。特にミリ秒単位のパフォーマンスが要求されるリアルタイム分析ワークロードでは、クエリ内の `JOIN` の最大数は3から4に抑えることを目指してください。[データモデリングセクション](/data-modeling/schema-design)では、非正規化、辞書、およびマテリアライズドビューを含む、JOINを最小限に抑えるための多くの変更を詳述しています。
- 現在、ClickHouseはJOINの順序を変更しません。常に最小のテーブルを結合の右側に配置してください。これにより、大部分の結合アルゴリズムでメモリに保持され、クエリのメモリオーバーヘッドが最小限に抑えられます。
- あなたのクエリが直接結合を必要とする場合、すなわち `LEFT ANY JOIN` のように、できる限り[辞書](/dictionary)を使用することをお勧めします。

<Image img={joins_1} size="sm" alt="Left any join"/>

- 内部結合を行う場合、これを `IN` 句を使用したサブクエリとして記述する方がしばしば最適です。以下のクエリは機能的に等価であり、どちらも問題の中でClickHouseに言及しない `posts` の数を見つけますが、`comments` では言及があります。

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

ここでは、直積を避けるために `ANY INNER JOIN` を使用している点に注意してください。各投稿に対して1つのマッチのみを取得したいからです。

この結合はサブクエリを使用して書き換えることができ、パフォーマンスが大幅に向上します：

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

ClickHouseはすべてのJOIN句とサブクエリに条件をプッシュダウンする試みを行いますが、ユーザーは可能な限りすべてのサブ句に手動で条件を適用することをお勧めします。これにより、`JOIN`するデータのサイズが最小限に抑えられます。以下の例を考慮してください。2020年以降のJava関連の投稿に対するアップボート数を計算したいとします。

Naiveなクエリは、左側に大きなテーブルを配置すると、56秒で完了します：

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

このJOINを再配置すると、パフォーマンスが劇的に1.5秒に改善されます：

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

右側のテーブルにフィルターを追加すると、さらにパフォーマンスが0.5秒に改善されます。

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

このクエリは、前述のように `INNER JOIN` をサブクエリに移動することで、さらに改善できます。外側と内側のクエリの両方にフィルターを維持しています。

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

## 結合アルゴリズムの選択 {#choosing-a-join-algorithm}

ClickHouseは複数の[結合アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは、通常、パフォーマンスとメモリ使用量のトレードオフを行います。以下に、ClickHouseの結合アルゴリズムの概要を示します。これらは相対的なメモリ消費量と実行時間に基づいています。

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

これらのアルゴリズムは、結合クエリがどのように計画され、実行されるかを決定します。デフォルトでは、ClickHouseは、使用される結合タイプと接続されているテーブルの厳密さ、およびエンジンに基づいて、直接結合またはハッシュ結合アルゴリズムを使用します。あるいは、ClickHouseを構成して、リソースの使用状況に応じて実行時に使用する結合アルゴリズムを適応的に選択し、動的に変更することもできます。`join_algorithm=auto` の場合、ClickHouseは最初にハッシュ結合アルゴリズムを試み、そのアルゴリズムのメモリ制限が違反された場合は、アルゴリズムはその場で部分的なマージ結合に切り替わります。どのアルゴリズムが選ばれたかをトレースログで確認できます。ClickHouseはまた、ユーザーが `join_algorithm` 設定を介して自分で希望する結合アルゴリズムを指定することも許可しています。

各結合アルゴリズムのサポートされている `JOIN` タイプは以下に示されており、最適化前に考慮する必要があります。

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

各 `JOIN` アルゴリズムの詳細な説明は[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で見つけることができ、それぞれの長所、短所、スケーリング特性が含まれています。

適切な結合アルゴリズムの選択は、メモリを最適化するかパフォーマンスを最適化するかに依存します。

## JOINパフォーマンスの最適化 {#optimizing-join-performance}

あなたの主要な最適化指標がパフォーマンスであり、できるだけ速く結合を実行したい場合、次の意思決定ツリーを使用して適切な結合アルゴリズムを選択できます。

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 右側のテーブルからのデータをメモリ内の低遅延キーバリューデータ構造（例えば、辞書）に事前にロードでき、かつ結合キーが基礎となるキーバリューストレージのキー属性と一致する場合、さらに `LEFT ANY JOIN` の意味論が適切であれば、**直接結合**が適用可能であり、最も迅速なアプローチを提供します。

- **(2)** テーブルの[物理行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順に一致する場合、状況によります。この場合、**フルソートマージ結合**はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)し、メモリ使用量が大幅に削減され、データサイズと結合キーの値の分布に応じて、一部のハッシュ結合アルゴリズムよりも速い実行時間を実現できます。

- **(3)** 右側のテーブルがメモリに収まる場合、たとえ[追加のメモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)が**並列ハッシュ結合**の場合であっても、このアルゴリズムまたはハッシュ結合が速くなります。これはデータのサイズ、データタイプ、結合キーのカラムの値の分布に依存します。

- **(4)** 右側のテーブルがメモリに収まらない場合、再び状況によります。ClickHouseはメモリバウンドでない3つの結合アルゴリズムを提供します。すべてのアルゴリズムは、一時的にデータをディスクにスピルします。**フルソートマージ結合**と**部分マージ結合**は、データの事前ソートを必要とします。**グレースハッシュ結合**は代わりにデータからハッシュテーブルを構築します。データの量、データタイプ、および結合キーのカラムの値の分布に応じて、データからハッシュテーブルを構築する方がデータのソートよりも速いシナリオもあります。その逆も然りです。

部分マージ結合は、大きなテーブルを結合する際のメモリ使用量を最小限に抑えるよう最適化されていますが、結合速度はかなり遅くなります。これは特に左側のテーブルの物理行順序が結合キーのソート順に一致しない場合に当てはまります。

グレースハッシュ結合は、メモリ使用量と結合速度の良好な制御を提供する、メモリバウンドでない3つのアルゴリズムの中で最も柔軟です。[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定を使用してチューニング可能です。データ量に応じて、グレースハッシュが部分的マージアルゴリズムよりも速くなる場合もあれば、遅くなる場合もあります。その際、両アルゴリズムのメモリ使用量がほぼ align するようにバケット数を選択する必要があります。特にグレースハッシュ結合のメモリ使用量がフルソートマージとの間でおおよそ align するように構成されている場合、我々のテストではフルソートマージが常に速くなりました。

メモリをバウンドしない3つのアルゴリズムの中でどれが最速かは、データ量、データタイプ、および結合キーのカラムの値の分布に依存します。実際のデータ量で実行するベンチマークを行って、どのアルゴリズムが最も速いかを判断するのが常に最良です。

## メモリの最適化 {#optimizing-for-memory}

結合を最も迅速な実行時間ではなく、最低のメモリ使用量に最適化したい場合、この意思決定ツリーを使用できます。

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** あなたのテーブルの物理行順序が結合キーのソート順に一致する場合、**フルソートマージ結合**のメモリ使用量は最低限になります。ソートフェーズが[無効](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)にされているため、良好な結合速度の追加の利点もあります。
- **(2)** **グレースハッシュ結合**は、[構成](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することで非常に低いメモリ使用量に調整できますが、その代わり結合速度が遅くなります。**部分マージ結合**は意図的にメインメモリの低い量を使用します。**外部ソートが有効なフルソートマージ結合**は、一般的に部分マージ結合よりも多くのメモリを使用します（行順がキーのソート順に一致しないと仮定した場合）、ただし、結合実行時間は大幅に改善されます。

上記の詳細が必要なユーザーには、次の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
