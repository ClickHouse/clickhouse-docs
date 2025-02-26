---
title: ClickHouseでのJOINの使用
description: ClickHouseでのテーブルの結合方法
keywords: [結合, テーブルの結合]
---

ClickHouseは[完全な`JOIN`サポート](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を提供しており、多様な結合アルゴリズムを備えています。パフォーマンスを最大化するために、このガイドに記載されている結合最適化の提案に従うことをお勧めします。

- 最適なパフォーマンスを得るために、ユーザーはクエリ内の`JOIN`の数を減らすことを目指すべきです。特にミリ秒単位のパフォーマンスが必要とされるリアルタイム分析ワークロードでは、クエリ内の結合は最大で3〜4に抑えることを目指してください。[データモデリングセクション](/data-modeling/schema-design)では、非正規化、辞書、マテリアライズドビューを含む結合を最小限に抑えるための多くの変更を詳述しています。
- 現在、ClickHouseは結合を再配置しません。常に最小のテーブルがJOINの右側にあることを確認してください。これにより、ほとんどの結合アルゴリズムでメモリに保持され、クエリのメモリオーバーヘッドを最小に保つことができます。
- クエリが直接結合を要求する場合、すなわち`LEFT ANY JOIN`のように、可能な限り[辞書](/dictionary)を使用することをお勧めします。

<br />

<img src={require('./images/joins-1.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '250px'}}
    />

<br />

- 内部結合を実行する場合、これを`IN`句を使用したサブクエリとして記述する方が最適な場合がよくあります。以下のクエリは機能的には同等であり、どちらも質問にはClickHouseに言及せずコメントには言及する`posts`の数を数えます。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│  	86 │
└─────────┘

1行の結果。経過時間: 8.209 秒。処理した行数: 150.20百万行、56.05 GB (18.30百万行/s., 6.83 GB/s.)
ピークメモリ使用量: 1.23 GiB.
```

`ANY INNER JOIN`を使用しており、単なる`INNER`結合ではなく、直積を避けるため、すなわち各ポストに対して1つのマッチだけを望んでいることに注意してください。

この結合はサブクエリを使用して再記述でき、パフォーマンスを大幅に改善します：

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

1行の結果。経過時間: 2.284 秒。処理した行数: 150.20百万行、16.61 GB (65.76百万行/s., 7.27 GB/s.)
ピークメモリ使用量: 323.52 MiB.
```

ClickHouseはすべての結合句やサブクエリに条件をプッシュダウンしようとしますが、ユーザーは常に可能な限りすべてのサブ句に条件を手動で適用することをお勧めします。これにより、結合するデータのサイズを最小限に抑えます。以下の例を考えてみてください。2020年以降のJava関連のポストに対するアップボートの数を計算します。

小さなテーブルが左側にあるナイーブなクエリは、56秒で完了します：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 56.642 秒。処理した行数: 252.30百万行、1.62 GB (4.45百万行/s., 28.60 MB/s.)
```

この結合を再順序すると、パフォーマンスが劇的に向上し、1.5秒で完了します：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 1.519 秒。処理した行数: 252.30百万行、1.62 GB (166.06百万行/s., 1.07 GB/s.)
```

右側のテーブルにフィルタを追加すると、パフォーマンスはさらに向上し、0.5秒になります。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1行の結果。経過時間: 0.597 秒。処理した行数: 81.14百万行、1.31 GB (135.82百万行/s., 2.19 GB/s.)
ピークメモリ使用量: 249.42 MiB.
```

このクエリは、前述のように`INNER JOIN`をサブクエリに移動することでさらに改善できます。外部クエリと内部クエリの両方のフィルタを維持します。

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

1行の結果。経過時間: 0.383 秒。処理した行数: 99.64百万行、804.55 MB (259.85百万行/s., 2.10 GB/s.)
ピークメモリ使用量: 250.66 MiB.
```

## 結合アルゴリズムの選択 {#choosing-a-join-algorithm}

ClickHouseは多くの[結合アルゴリズム](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をサポートしています。これらのアルゴリズムは、通常、メモリ使用量とパフォーマンスのトレードオフを行います。以下は、相対的なメモリ消費量と実行時間に基づいたClickHouseの結合アルゴリズムの概要です：

<br />

<img src={require('./images/joins-2.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
    />

<br />

これらのアルゴリズムは、結合クエリがどのように計画され、実行されるかを決定します。デフォルトでは、ClickHouseは使用された結合のタイプと厳密さ、結合されたテーブルのエンジンに基づいて、直接結合またはハッシュ結合アルゴリズムを使用します。あるいは、ClickHouseは設定により、リソースの可用性と使用状況に応じて、実行時に動的に使用する結合アルゴリズムを選択するように構成できます。`join_algorithm=auto`のとき、ClickHouseは最初にハッシュ結合アルゴリズムを試み、メモリ制限が違反された場合、そのアルゴリズムは即座に部分マージ結合に切り替えられます。どのアルゴリズムが選択されたかはトレースログで確認できます。ClickHouseはまた、ユーザーが`join_algorithm`設定を介して希望する結合アルゴリズムを指定することを許可しています。

各結合アルゴリズムに対するサポートされている`JOIN`タイプは以下に示されており、最適化の前に考慮する必要があります：

<br />

<img src={require('./images/joins-3.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
    />

<br />

各`JOIN`アルゴリズムの詳細な説明は[こちら](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)で見つけることができ、各アルゴリズムの利点、欠点、スケーリング特性が紹介されています。

適切な結合アルゴリズムの選択は、メモリ最適化を目指しているのか、パフォーマンス最適化を目指しているのかによります。

## JOINパフォーマンスの最適化 {#optimizing-join-performance}

キーメトリックがパフォーマンスであり、可能な限り速く結合を実行しようとしている場合は、以下の意思決定ツリーを利用して適切な結合アルゴリズムを選択できます：

<br />

<img src={require('./images/joins-4.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
    />

<br />

- **(1)** 右側のテーブルからのデータを、辞書のようなインメモリの低遅延キー-バリューデータ構造に事前に読み込むことができ、かつ結合キーが基礎となるキー-バリュー記憶装置のキー属性と一致し、`LEFT ANY JOIN`のセマンティクスが適切であるならば、**直接結合**が適用可能であり、最速のアプローチを提供します。

- **(2)** テーブルの[物理行順序](/optimize/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)が結合キーのソート順序と一致している場合は、状況によります。この場合、**完全ソートマージ結合**はソートフェーズを[スキップ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)し、メモリ使用量が大幅に削減され、データサイズと結合キーの値の分布に応じて、一部のハッシュ結合アルゴリズムよりも速い実行時間をもたらすことがあります。

- **(3)** 右側のテーブルがメモリに収まる場合、[追加のメモリ使用オーバーヘッド](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)を持つ**並列ハッシュ結合**では、このアルゴリズムまたはハッシュ結合が速くなる場合があります。これはデータサイズ、データタイプ、結合キーのカラムの値の分布に依存します。

- **(4)** 右側のテーブルがメモリに収まらない場合は、再び状況に依存します。ClickHouseは3つの非メモリバウンド結合アルゴリズムを提供しています。これらのすべては、データを一時的にディスクにスピルします。**完全ソートマージ結合**と**部分マージ結合**はデータの事前ソートを必要とします。**グレースハッシュ結合**はデータからハッシュテーブルを構築します。データのボリューム、データタイプ、結合キーのカラムの値の分布に応じて、データからハッシュテーブルを構築する方がデータをソートするよりも速い場合があります。そしてその逆もまた然りです。

部分マージ結合は、大きなテーブルの結合時にメモリ使用量を最小限に抑えることを最適化しており、結合速度は比較的遅いです。これは特に、左テーブルの物理行順序が結合キーのソート順序と一致しない場合に当てはまります。

グレースハッシュ結合は、3つの非メモリバウンド結合アルゴリズムの中で最も柔軟性があり、メモリ使用量と結合速度のコントロールが優れた設定を持っています。[grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)設定を利用することで、データのボリュームに応じて、グレースハッシュは部分マージアルゴリズムよりも速いまたは遅い場合があります。バケットの数が両アルゴリズムのメモリ使用量にほぼ沿って選択されるときがそうです。グレースハッシュ結合のメモリ使用量が、完全ソートマージのメモリ使用量とほぼ整合するように構成された場合、テスト実行においては常に完全ソートマージの方が速い結果が得られました。

3つの非メモリバウンドアルゴリズムのうちどれが最も速いかは、データのボリューム、データタイプ、結合キーカラムの値の分布に依存します。どのアルゴリズムが最も速いかを特定するには、現実的なデータボリュームでベンチマークを実施することが常に最適です。

## メモリの最適化 {#optimizing-for-memory}

最速の実行時間ではなく、最も低いメモリ使用量で結合を最適化したい場合は、代わりにこの意思決定ツリーを使用できます：

<br />

<img src={require('./images/joins-5.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
    />

<br />

- **(1)** テーブルの物理行順序が結合キーのソート順序と一致する場合、**完全ソートマージ結合**のメモリ使用量は最小限になります。ソートフェーズが[無効](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)になるため、結合速度も良好です。
- **(2)** **グレースハッシュ結合**は、結合速度を犠牲にして[構成することで](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)、非常に低いメモリ使用量に調整できます。**部分マージ結合**は意図的にメインメモリの使用量が低くなるように設計されています。**外部ソートが有効な完全ソートマージ結合**は、通常、部分マージ結合よりも多くのメモリを使用します（行順序がキーソート順序と一致しない場合）。その代わり、結合の実行時間は大幅に改善されます。

上記の詳細が必要なユーザーには、以下の[ブログシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。
