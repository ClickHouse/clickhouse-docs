---
title: 'ClickHouseでのJOINの使用'
description: 'ClickHouseでテーブルを結合する方法'
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

ClickHouseは、さまざまな結合アルゴリズムを備えた[完全な`JOIN`サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しています。パフォーマンスを最大化するために、このガイドにリストされている結合最適化の提案に従うことをお勧めします。

- 最適なパフォーマンスを得るには、クエリ内の`JOIN`の数を減らすことを目指す必要があります。特に、ミリ秒のパフォーマンスが必要なリアルタイム分析ワークロードでは重要です。クエリ内の結合の最大数は3〜4を目指してください。[データモデリングセクション](/data-modeling/schema-design)では、非正規化、ディクショナリ、マテリアライズドビューなど、結合を最小限に抑えるための多くの変更について詳しく説明しています。
- 現在、ClickHouseは結合を並べ替えません。常に最小のテーブルが結合の右側にあることを確認してください。これは、ほとんどの結合アルゴリズムでメモリに保持され、クエリの最小のメモリオーバーヘッドを保証します。
- クエリで直接結合、つまり`LEFT ANY JOIN`が必要な場合（以下に示すように）、可能な限り[ディクショナリ](/dictionary)を使用することをお勧めします。

<Image img={joins_1} size="sm" alt="Left any join"/>

- 内部結合を実行する場合、`IN`句を使用してサブクエリとして記述する方が最適であることがよくあります。次のクエリを考えてみましょう。これらは機能的に同等です。どちらも、質問にはClickHouseが言及されていないが、`comments`には言及されている`posts`の数を見つけます。

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

各投稿に対して1つの一致のみが必要なため、単なる`INNER`結合ではなく`ANY INNER JOIN`を使用していることに注意してください（デカルト積は不要です）。

この結合はサブクエリを使用して書き直すことができ、パフォーマンスが大幅に向上します:

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

ClickHouseはすべての結合句とサブクエリに条件をプッシュダウンしようとしますが、ユーザーは常に可能な限りすべてのサブ句に手動で条件を適用することをお勧めします。これにより、`JOIN`するデータのサイズが最小限に抑えられます。次の例を考えてみましょう。2020年以降のJava関連の投稿のアップ投票数を計算します。

左側に大きなテーブルを持つ単純なクエリは、56秒で完了します:

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

この結合を並べ替えると、パフォーマンスが劇的に向上し、1.5秒になります:

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

左側のテーブルにフィルターを追加すると、パフォーマンスがさらに向上し、0.5秒になります。

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

前述のように、`INNER JOIN`をサブクエリに移動し、外側と内側の両方のクエリにフィルターを維持することで、このクエリをさらに改善できます。

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

ClickHouseは、多数の[結合アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは通常、メモリ使用量とパフォーマンスをトレードオフします。以下は、相対的なメモリ消費と実行時間に基づくClickHouse結合アルゴリズムの概要です:

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

これらのアルゴリズムは、結合クエリの計画と実行方法を決定します。デフォルトでは、ClickHouseは使用される結合タイプと厳密性、および結合されるテーブルのエンジンに基づいて、直接またはハッシュ結合アルゴリズムを使用します。あるいは、ClickHouseは、リソースの可用性と使用状況に応じて、実行時に使用する結合アルゴリズムを適応的に選択し、動的に変更するように構成できます。`join_algorithm=auto`の場合、ClickHouseは最初にハッシュ結合アルゴリズムを試み、そのアルゴリズムのメモリ制限に違反した場合、アルゴリズムは即座にパーシャルマージ結合に切り替えられます。トレースログを介してどのアルゴリズムが選択されたかを確認できます。また、ClickHouseでは、`join_algorithm`設定を介して希望する結合アルゴリズムを自分で指定することもできます。

各結合アルゴリズムでサポートされている`JOIN`タイプを以下に示します。最適化の前に検討する必要があります:

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

各`JOIN`アルゴリズムの詳細な説明は、長所、短所、スケーリング特性を含めて[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で見つけることができます。

適切な結合アルゴリズムの選択は、メモリまたはパフォーマンスのどちらを最適化するかによって異なります。

## JOIN パフォーマンスの最適化 {#optimizing-join-performance}

主要な最適化メトリックがパフォーマンスであり、結合をできるだけ速く実行したい場合、適切な結合アルゴリズムを選択するために次のデシジョンツリーを使用できます:

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 右側のテーブルのデータをインメモリの低レイテンシキー値データ構造（たとえばディクショナリ）に事前ロードでき、結合キーが基礎となるキー値ストレージのキー属性と一致し、`LEFT ANY JOIN`セマンティクスが適切である場合、**直接結合**が適用可能で、最速のアプローチを提供します。

- **(2)** テーブルの[物理的な行の順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順序と一致する場合、それ次第です。この場合、**完全ソートマージ結合**はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)し、メモリ使用量が大幅に削減され、さらにデータサイズと結合キー値の分布によっては、一部のハッシュ結合アルゴリズムよりも高速な実行時間が得られます。

- **(3)** 右側のテーブルが、**並列ハッシュ結合**の[追加のメモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)があってもメモリに収まる場合、このアルゴリズムまたはハッシュ結合の方が高速になる可能性があります。これは、データサイズ、データタイプ、結合キー列の値の分布によって異なります。

- **(4)** 右側のテーブルがメモリに収まらない場合、これも状況次第です。ClickHouseは3つの非メモリバウンド結合アルゴリズムを提供しています。3つすべてが一時的にディスクにデータをスピルします。**完全ソートマージ結合**と**パーシャルマージ結合**は、データの事前ソートが必要です。**Graceハッシュ結合**は、代わりにデータからハッシュテーブルを構築します。データ量、データタイプ、結合キー列の値の分布に基づいて、データをソートするよりもデータからハッシュテーブルを構築する方が高速なシナリオがあります。逆もまた然りです。

パーシャルマージ結合は、大きなテーブルが結合される際のメモリ使用量を最小限に抑えるように最適化されていますが、結合速度は犠牲になり、非常に遅くなります。これは特に、左側のテーブルの物理的な行の順序が結合キーのソート順序と一致しない場合に当てはまります。

Graceハッシュ結合は、3つの非メモリバウンド結合アルゴリズムの中で最も柔軟性が高く、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定により、メモリ使用量と結合速度を適切に制御できます。データ量によっては、[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)の数が選択され、両方のアルゴリズムのメモリ使用量がほぼ一致する場合、Graceハッシュはパーシャルマージアルゴリズムよりも高速または低速になる可能性があります。Graceハッシュ結合のメモリ使用量が完全ソートマージのメモリ使用量とほぼ一致するように構成されている場合、テスト実行では常に完全ソートマージの方が高速でした。

3つの非メモリバウンドアルゴリズムのどれが最速であるかは、データ量、データタイプ、結合キー列の値の分布によって異なります。どのアルゴリズムが最速であるかを判断するには、現実的なデータの現実的なデータ量でベンチマークを実行するのが常に最善です。

## メモリの最適化 {#optimizing-for-memory}

最速の実行時間ではなく、最小のメモリ使用量で結合を最適化したい場合は、代わりにこのデシジョンツリーを使用できます:

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** テーブルの物理的な行の順序が結合キーのソート順序と一致する場合、**完全ソートマージ結合**のメモリ使用量は可能な限り低くなります。ソートフェーズが[無効](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)になるため、優れた結合速度という追加の利点があります。
- **(2)** **Graceハッシュ結合**は、結合速度を犠牲にして、高い数の[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)を[構成](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することで、非常に低いメモリ使用量に調整できます。**パーシャルマージ結合**は意図的に少量のメインメモリを使用します。外部ソートが有効な**完全ソートマージ結合**は、通常、パーシャルマージ結合よりも多くのメモリを使用します（行の順序がキーのソート順序と一致しないと仮定）が、結合実行時間が大幅に向上するという利点があります。

上記の詳細が必要なユーザーには、次の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
