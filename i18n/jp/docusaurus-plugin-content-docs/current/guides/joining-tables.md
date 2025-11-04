---
'title': 'ClickHouseでのJOINの使用'
'description': 'ClickHouseでのテーブルの結合方法'
'keywords':
- 'joins'
- 'join tables'
'slug': '/guides/joining-tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouseは[完全な `JOIN` サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、幅広い選択肢の結合アルゴリズムがあります。パフォーマンスを最大化するために、こちらのガイドに記載された結合最適化の提案に従うことをお勧めします。

- 最適なパフォーマンスを得るために、ユーザーはクエリにおける `JOIN` の数を減らすことを目指すべきです。特に、ミリ秒単位のパフォーマンスが求められるリアルタイム分析ワークロードでは、クエリ中の結合の最大数は3から4であることが推奨されます。[データモデリングセクション](/data-modeling/schema-design)では、非正規化、ディクショナリ、マテリアライズドビューを含む結合を最小限に抑える方法について詳しく説明しています。
- 現在、ClickHouseは結合の順序を再配置しません。必ず、最小のテーブルをジョインの右側に配置してください。これにより、ほとんどの結合アルゴリズムでメモリに保持され、クエリのメモリオーバーヘッドが最小限に抑えられます。
- クエリが直接ジョインを必要とする場合（例: `LEFT ANY JOIN`）、可能な限り[Dictionaries](/dictionary)を使用することをお勧めします。

<Image img={joins_1} size="sm" alt="Left any join"/>

- inner joinを行う場合、これを `IN` 句を使用したサブクエリとして記述する方がより最適であることがよくあります。以下のクエリは機能的に等価であり、両方は質問の中でClickHouseに言及していないが、`comments` では言及している `posts` の数を調べます。

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

`INNER` ジョインではなく `ANY INNER JOIN` を使用するのは、直積を避け、各投稿に対して一致を一つだけ取得したいためです。

このジョインはサブクエリを使用して書き換えられ、パフォーマンスが大幅に向上します：

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

ClickHouseは条件をすべての結合句とサブクエリにプッシュダウンしようとしますが、ユーザーは可能な限りすべてのサブ句に条件を手動で適用することをお勧めします。これにより `JOIN` するデータのサイズが最小限に抑えられます。以下の例を考えます。Javaに関連する投稿の上票数を2020年以降に計算したいとします。

大きなテーブルが左側にある単純なクエリは56秒で完了します：

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

このジョインの順序を変更すると、パフォーマンスが劇的に1.5秒に改善されます：

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

左側のテーブルにフィルタを追加すると、パフォーマンスはさらに向上し0.5秒になります。

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

このクエリは、前述のように `INNER JOIN` をサブクエリに移動することによってさらに改善でき、外側と内側のクエリの両方でフィルタを維持できます。

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

ClickHouseは、数種類の[結合アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは、一般的にパフォーマンスとの引き換えにメモリ使用量を変動させます。以下は、ClickHouseの結合アルゴリズムを相対的なメモリ消費量と実行時間に基づく概要です：

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

これらのアルゴリズムは、結合クエリがどのように計画され実行されるかを決定します。デフォルトでは、ClickHouseは使用される結合タイプ、厳守性、および結合テーブルのエンジンに基づいて、直接またはハッシュ結合アルゴリズムを使用します。あるいは、ClickHouseは、リソースの使用状況に応じて、ランタイム中に使用する結合アルゴリズムを動的に選択および変更するように設定できます。`join_algorithm=auto` の場合、ClickHouseは最初にハッシュ結合アルゴリズムを試み、そのアルゴリズムのメモリ制限が違反されると、アルゴリズムが部分的なマージ結合に切り替えられます。どのアルゴリズムが選ばれたかは、トレースログを通じて確認できます。また、ClickHouseはユーザーが自身で希望する結合アルゴリズムを `join_algorithm` 設定を介して指定することも可能です。

各結合アルゴリズムに対応する `JOIN` タイプは以下に示されており、最適化の前に考慮する必要があります：

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

各 `JOIN` アルゴリズムの詳細な説明は[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で確認でき、その利点、欠点、およびスケーリング特性が含まれています。

適切な結合アルゴリズムの選択は、メモリまたはパフォーマンスのどちらを最適化するかによって異なります。

## JOINパフォーマンスの最適化 {#optimizing-join-performance}

もしあなたの主な最適化指標がパフォーマンスであり、できるだけ迅速に結合を実行したい場合は、以下の意思決定ツリーを使用して適切な結合アルゴリズムを選択できます：

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 右側のテーブルからのデータを、ディクショナリなどのインメモリの低遅延キー・バリュー・データ構造に事前にロードでき、結合キーが基礎となるキー・バリュー・ストレージのキー属性と一致し、`LEFT ANY JOIN` の意味が適切であれば、**直接ジョイン**が適用され、最速の方法を提供します。

- **(2)** テーブルの[物理行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順と一致する場合、結果は不確定です。この場合、**完全ソートマージジョイン**は[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)されるため、メモリ使用量が大幅に削減され、データサイズや結合キーの値の分布によっては、一部のハッシュ結合アルゴリズムよりも高速な実行時間をもたらします。

- **(3)** 右側のテーブルがメモリに収まる場合、追加のメモリ使用オーバーヘッド[に関して](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)もあながら、**並列ハッシュジョイン**アルゴリズムまたはハッシュジョインの方が高速になる可能性もあります。これは、データサイズ、データ型、および結合キーのカラムの値の分布に依存します。

- **(4)** 右側のテーブルがメモリに収まらない場合、再び不確定です。ClickHouseは、非メモリ制限の結合アルゴリズムを三つ提供しています。すべてが一時的にデータをディスクにスピルします。**完全ソートマージジョイン**と**部分マージジョイン**は、データの事前ソートを必要とします。**グレースハッシュジョイン**は、代わりにデータからハッシュテーブルを構築します。データのボリューム、データ型、および結合キーのカラムの値の分布に基づいて、データからハッシュテーブルを構築する方がデータをソートするよりも迅速であるシナリオが存在します。その逆も然りです。

部分マージジョインは、大きなテーブルを結合するときにメモリ使用量を最小限に抑えるために最適化されていますが、結合速度は非常に遅くなります。これは、左側のテーブルの物理行順序が結合キーのソート順序と一致しない場合に特に当てはまります。

グレースハッシュジョインは、非メモリ制限の三つのアルゴリズムの中で最も柔軟性があり、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 設定を使用して、高速とメモリ使用量のバランスをうまく管理します。データ量によって、グレースハッシュが部分マージアルゴリズムよりも高速または遅くなる可能性があり、二つのアルゴリズムのメモリ使用量がほぼ整合する場合もあります。グレースハッシュジョインのメモリ使用量が完全ソートマージのメモリ使用量とほぼ一致するように設定された場合、我々のテスト結果では、常に完全ソートマージが速かったです。

三つの非メモリ制限アルゴリズムのうちどれが最も速いかは、データ量、データ型、および結合キーのカラムの値の分布によって異なります。どのアルゴリズムが最も速いかを判断するには、リアルなデータボリュームでいくつかのベンチマークを実行するのが最良です。

## メモリの最適化 {#optimizing-for-memory}

最速の実行時間ではなく、最小のメモリ使用量で結合を最適化したい場合は、こちらの意思決定ツリーを使用できます：

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** テーブルの物理行順序が結合キーのソート順序と一致する場合、**完全ソートマージジョイン**のメモリ使用量は非常に少なくなります。追加の利点は、ソートフェーズが[無効化](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)されるため、良好な結合速度が得られます。
- **(2)** **グレースハッシュジョイン**は、結合速度の犠牲にして[設定](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)することにより、非常に低いメモリ使用量に調整できます。**部分マージジョイン**は、メインメモリの少ない量を意図的に使用します。外部ソートを有効にした**完全ソートマージジョイン**は、一般に部分マージジョインよりも多くのメモリを使用します（行順序がキーのソート順序と一致していないと仮定した場合）、実行時間は大幅に改善されます。

上記の詳細が必要なユーザーには、以下の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
