---
title: ClickHouseにおけるJOINの利用
description: ClickHouseでテーブルを結合する方法
keywords: [joins, join tables]
---

import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouseは[完全な`JOIN`サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、多くの結合アルゴリズムを利用可能です。パフォーマンスを最大化するために、このガイドに掲載されている結合最適化の提案に従うことをお勧めします。

- 最適なパフォーマンスを得るために、ユーザーはクエリ内の`JOIN`の数を減らすことを目指すべきです。特にミリ秒単位のパフォーマンスが求められるリアルタイム分析のワークロードでは、その傾向が顕著です。クエリ内の結合は最大で3〜4個に抑えることをお勧めします。デノーマライゼーション、辞書、およびマテリアライズドビューを含む[データモデリングセクション](/data-modeling/schema-design)で、結合を最小化するための変更について詳述しています。
- 現在、ClickHouseは結合の順序を変更しません。常に最小のテーブルをJOINの右側に配置することを確認してください。これにより、ほとんどの結合アルゴリズムでメモリに保持され、クエリのメモリオーバーヘッドが最小限に抑えられます。
- もしクエリが直接結合を必要とする場合、すなわち`LEFT ANY JOIN`が必要な場合、可能であれば[辞書](/dictionary)を使用することをお勧めします。

<br />

<img src={joins_1}
    alt="NEEDS ALT"
    class="image"
    style={{width: '250px'}}
/>

<br />

- 内部結合を行う場合は、`IN`句を使用してサブクエリとして書く方が最適です。以下のクエリは機能的に同等ですが、どちらも質問にClickHouseについての言及はないが、`comments`には言及がある`posts`の数を数えます。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│  	86 │
└─────────┘

1行の結果。経過時間: 8.209秒。処理された行数: 1億5020万、56.05 GB (1秒あたり1823万行、1秒あたり6.83 GB)。
ピークメモリ使用量: 1.23 GiB。
```

`ANY INNER JOIN`を使用していることに注意してください。単なる`INNER`結合ではなく、デカルト積を望まないため、すなわち各投稿に対して1つの一致のみを希望しています。

この結合はサブクエリを使用して書き直すことができ、パフォーマンスが劇的に向上します：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
	SELECT PostId
	FROM stackoverflow.comments
	WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│  	86 │
└─────────┘

1行の結果。経過時間: 2.284秒。処理された行数: 1億5020万、16.61 GB (1秒あたり6576万行、1秒あたり7.27 GB)。
ピークメモリ使用量: 323.52 MiB。
```

ClickHouseは条件をすべての結合句とサブクエリに適用しようとしますが、ユーザーは常に可能な限りすべてのサブ句に条件を手動で適用することをお勧めします。これにより`JOIN`するデータのサイズを最小限に抑えることができます。以下の例を考えてみましょう。ここでは2020年以降のJava関連の投稿へのアップボートの数を計算したいとします。

左側に大きなテーブルがあるという単純なクエリは、56秒で完了します：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 56.642秒。処理された行数: 2億5230万、1.62 GB (1秒あたり445万行、1秒あたり28.60 MB)。
```

この結合の順序を変更すると、パフォーマンスが劇的に向上し、1.5秒になります：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 1.519秒。処理された行数: 2億5230万、1.62 GB (1秒あたり1億660万行、1秒あたり1.07 GB)。
```

右側のテーブルにフィルターを追加すると、パフォーマンスはさらに改善され、0.5秒になります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 0.597秒。処理された行数: 8114万、1.31 GB (1秒あたり1億3582万行、1秒あたり2.19 GB)。
ピークメモリ使用量: 249.42 MiB。
```

このクエリは、先ほど指摘したように、`INNER JOIN`をサブクエリに移動することでさらに改善できます。外部および内部の両方のクエリでフィルターを維持します。

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

1行の結果。経過時間: 0.383秒。処理された行数: 9964万、804.55 MB (1秒あたり2億5985万行、1秒あたり2.10 GB)。
ピークメモリ使用量: 250.66 MiB。
```

## 結合アルゴリズムの選定 {#choosing-a-join-algorithm}

ClickHouseは多くの[結合アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは通常、パフォーマンスとメモリ使用量をトレードオフします。以下に、相対的なメモリ消費量と実行時間に基づくClickHouseの結合アルゴリズムの概要を示します。

<br />

<img src={joins_2}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

これらのアルゴリズムは、結合クエリの計画と実行の方法を指定します。デフォルトでは、ClickHouseは結合タイプおよび結合テーブルのエンジンに基づいて、直接結合またはハッシュ結合アルゴリズムを使用します。 あるいは、ClickHouseは実行時にリソースの使用状況や可用性に応じて、動的に結合アルゴリズムを選択して変更するように構成できます。`join_algorithm=auto`の場合、ClickHouseはまずハッシュ結合アルゴリズムを試み、そのアルゴリズムのメモリ制限が違反された場合には、アルゴリズムが自動的に部分マージ結合に切り替わります。どのアルゴリズムが選択されたかは、トレースログを介して確認できます。 ClickHouseはまた、ユーザーが自分で希望する結合アルゴリズムを`join_algorithm`設定を使用して指定することも許可しています。

各結合アルゴリズムでサポートされている`JOIN`タイプは以下に示されており、最適化の際に考慮する必要があります。

<br />

<img src={joins_3}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
/>

<br />

各`JOIN`アルゴリズムの詳細な説明は[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)にあり、利点、欠点、およびスケーリング特性が含まれています。

適切な結合アルゴリズムの選択は、メモリの最適化を期待するか、パフォーマンスの最適化を期待するかによります。

## JOINパフォーマンスの最適化 {#optimizing-join-performance}

キーとしている最適化指標がパフォーマンスであり、可能な限り迅速に結合を実行したい場合は、次の意思決定ツリーを使用して適切な結合アルゴリズムを選択できます：

<br />

<img src={joins_4}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
/>

<br />

- **(1)** 右側のテーブルからデータをメモリ内の低遅延キー・バリュー構造にプリロードできる場合、例えば辞書の場合、結合キーが基礎となるキー・バリュー・ストレージのキー属性と一致する場合、かつ`LEFT ANY JOIN`のセマンティクスが適切である場合には、**直接結合**が適用され、最も早いアプローチを提供します。

- **(2)** テーブルの[物理行順序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順と一致する場合、次は条件によります。この場合、**完全ソートマージ結合**は[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)したソートフェーズにより、メモリ使用量が大幅に削減され、データサイズや結合キーの値の分布に応じて、いくつかのハッシュ結合アルゴリズムよりも速い実行時間を得られます。

- **(3)** 右のテーブルがメモリに収まる場合でも、**並列ハッシュ結合**の[追加メモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を考慮する必要があります。その場合、このアルゴリズムまたはハッシュ結合の方が速くなります。データサイズ、データ型、および結合キーのカラムの値の分布に依存します。

- **(4)** 右のテーブルがメモリに収まらない場合、再び条件によります。ClickHouseは3つのメモリに制約のない結合アルゴリズムを提供しており、すべて一時的にデータをディスクに吐き出します。**完全ソートマージ結合**と**部分マージ結合**はデータの事前ソートを必要とします。一方、**グレースハッシュ結合**はデータからハッシュテーブルを構築します。データのボリューム、データタイプ、および結合キーのカラムの値の分布にもよりますが、データからハッシュテーブルを構築する方がデータのソートより速くなるシナリオや、その逆が考えられます。

部分マージ結合は、大きなテーブルを結合する際にメモリ使用量を最小化することに最適化されていますが、その分結合速度が非常に遅くなります。これは特に、左のテーブルの物理行順序が結合キーのソート順と一致しない場合に当てはまります。

グレースハッシュ結合は、3つのメモリに制約のない結合アルゴリズムの中で最も柔軟性が高く、[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定により、メモリ使用量と結合速度の制御に優れています。データボリュームに応じて、グレースハッシュは部分マージアルゴリズムよりも速くなることがあり、またその逆もあり得ます。[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)の量が、両方のアルゴリズムのメモリ使用量がほぼ一致するように選ばれている場合、グレースハッシュ結合のメモリ使用量が完全ソートマージのメモリ使用量とほぼ一致するように設定されている場合、私たちのテストでは常に完全ソートマージの方が早かったです。

3つのメモリに制約のないアルゴリズムのうち、どれが最も速いかは、データの量、データ型、および結合キーのカラムの値の分布によって異なります。最も速いアルゴリズムを特定するには、現実的なデータ量で実際のデータを使用してベンチマークを実行することが最善です。

## メモリの最適化 {#optimizing-for-memory}

最も速い実行時間よりも最低のメモリ使用量を最適化したい場合は、代わりに次の意思決定ツリーを使用できます。

<br />

<img src={joins_5}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />

- **(1)** テーブルの物理行順序が結合キーのソート順と一致する場合、**完全ソートマージ結合**のメモリ使用量は最低限になります。ソートフェーズが[無効にされている](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)ため、結合速度も良好です。
- **(2)** **グレースハッシュ結合**は、結合スピードの対価として[構成](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)された多くの[バケット](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)によって非常に低いメモリ使用量に調整できます。**部分マージ結合**は意図的に主メモリを低容量で使用します。外部ソートが有効になっている**完全ソートマージ結合**は、一般に部分マージ結合よりもメモリを多く使用します（行順序がキーのソート順と一致しない場合であることを前提とします）が、実行時間は大幅に改善されます。

以上に関して追加の詳細を必要とするユーザーには、次の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
