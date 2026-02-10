---
description: '厳密ベクトル検索および近似ベクトル検索に関するドキュメント'
keywords: ['vector similarity search', 'ann', 'knn', 'hnsw', 'indices', 'index', 'nearest neighbor', 'vector search']
sidebar_label: '厳密ベクトル検索および近似ベクトル検索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '厳密ベクトル検索および近似ベクトル検索'
doc_type: 'guide'
---

# 厳密ベクトル検索と近似ベクトル検索 \{#exact-and-approximate-vector-search\}

多次元（ベクトル）空間において、ある点に最も近い N 個の点を見つける問題は、[nearest neighbor search](https://en.wikipedia.org/wiki/Nearest_neighbor_search)（最近傍探索）、あるいは略してベクトル検索と呼ばれます。
ベクトル検索を解くための一般的なアプローチには 2 種類あります。

* 厳密ベクトル検索は、与えられた点とベクトル空間内のすべての点との距離を計算します。これにより可能な限り最高の精度が得られ、返される点が実際の最近傍であることが保証されます。ベクトル空間を網羅的に探索するため、厳密ベクトル検索は実運用のユースケースでは遅くなりすぎる場合があります。
* 近似ベクトル検索は、一群の手法（例: グラフやランダムフォレストといった特殊なデータ構造）を指し、厳密ベクトル検索よりもはるかに高速に結果を計算します。結果の精度は通常、実用上「十分良い」レベルです。多くの近似手法は、結果精度と検索時間のトレードオフを調整するためのパラメータを提供します。

ベクトル検索（厳密・近似いずれも）は、次のように SQL で記述できます。

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内の点は、配列型のカラム `vectors` に格納されます。例えば [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) です。
参照ベクトルは定数配列であり、共通テーブル式として指定します。
`<DistanceFunction>` は参照点と格納されているすべての点との距離を計算します。
この計算には、利用可能な任意の [distance function](/sql-reference/functions/distance-functions) を使用できます。
`<N>` は返される近傍点の数を指定します。


## 厳密ベクトル検索 \{#exact-nearest-neighbor-search\}

厳密ベクトル検索は、前述の SELECT クエリをそのまま使用して実行できます。
この種のクエリの実行時間は、一般に保存されているベクトル数とその次元数、すなわち配列要素数に比例します。
また、ClickHouse はすべてのベクトルに対して全探索（brute-force）スキャンを行うため、実行時間はクエリで使用されるスレッド数（setting [max_threads](../../../operations/settings/settings.md#max_threads) を参照）にも依存します。

### 例 \{#exact-nearest-neighbor-search-example\}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

戻り値

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```


## 近似ベクトル検索 \{#approximate-nearest-neighbor-search\}

### ベクトル類似度索引 \{#vector-similarity-index\}

ClickHouse は、近似ベクトル検索を実行するための専用の「ベクトル類似度」索引を提供します。

:::note
ベクトル類似度索引は、ClickHouse バージョン 25.8 以降で利用できます。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues)で issue を作成してください。
:::

#### ベクトル類似度インデックスの作成 \{#creating-a-vector-similarity-index\}

新しいテーブルには、次のようにベクトル類似度インデックスを作成できます。

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>]
)
ENGINE = MergeTree
ORDER BY [...]
```

別の方法として、既存のテーブルにベクトル類似度索引を追加するには次のようにします。

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

ベクトル類似度索引は特別な種類のスキッピング索引です（[こちら](mergetree.md#table_engine-mergetree-data_skipping-indexes)および[こちら](../../../optimize/skipping-indexes)を参照してください)。
したがって、上記の `ALTER TABLE` ステートメントでは、テーブルに新たに挿入される将来のデータに対してのみ索引が構築されます。
既存データに対しても索引を構築するには、その索引をマテリアライズする必要があります。

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

`<distance_function>` 関数は次のいずれかである必要があります。

* `L2Distance` — [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)（ユークリッド距離）。ユークリッド空間における 2 点間を結ぶ線分の長さを表します。
* `cosineDistance` — [cosine distance](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)（コサイン距離）。ゼロでない 2 つのベクトル間の角度を表します。

正規化されたデータに対しては通常 `L2Distance` が最適な選択であり、それ以外の場合はスケールの違いを補正するために `cosineDistance` を推奨します。

`<dimensions>` は、基となるカラム内の配列の基数（要素数）を指定します。
ClickHouse がインデックス作成中に異なる基数の配列を検出した場合、そのインデックスは破棄され、エラーが返されます。

オプションの GRANULARITY パラメータ `<N>` は、インデックスのグラニュールのサイズを表します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値の 1 億はほとんどのユースケースで十分に良好に動作しますが、チューニングすることもできます。
ただし、チューニングは自分の行っていることの影響を理解している上級ユーザーのみに推奨します（[下記](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似度インデックスは汎用的であり、さまざまな近似検索手法を利用できます。
実際に使用される手法はパラメータ `<type>` によって指定されます。
現時点で利用可能な手法は HNSW（[academic paper](https://arxiv.org/abs/1603.09320)）のみであり、階層的近傍グラフに基づく、近似ベクトル検索のための一般的かつ最先端の手法です。
`type` として HNSW が使用される場合、ユーザーは任意で HNSW 固有の追加パラメータを指定できます。

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX index_name vectors TYPE vector_similarity('hnsw', <distance_function>, <dimensions>[, <quantization>, <hnsw_max_connections_per_layer>, <hnsw_candidate_list_size_for_construction>]) [GRANULARITY N]
)
ENGINE = MergeTree
ORDER BY [...]
```

これらの HNSW 固有のパラメータを指定できます:

* `<quantization>` は近傍グラフ内のベクトルの量子化を制御します。指定可能な値は `f64`、`f32`、`f16`、`bf16`、`i8`、`b1` です。デフォルト値は `bf16` です。このパラメータは、基盤となるカラム内でのベクトル表現には影響しないことに注意してください。
* `<hnsw_max_connections_per_layer>` は、グラフの各ノードあたりの近傍数を制御します。これは HNSW ハイパーパラメータ `M` としても知られています。デフォルト値は `32` です。値が `0` の場合はデフォルト値が使用されます。
* `<hnsw_candidate_list_size_for_construction>` は、HNSW グラフの構築中に使用される動的候補リストのサイズを制御します。これは HNSW ハイパーパラメータ `ef_construction` としても知られています。デフォルト値は `128` です。値が `0` の場合はデフォルト値が使用されます。

すべての HNSW 固有パラメータのデフォルト値は、ほとんどのユースケースにおいて良好に機能します。
そのため、HNSW 固有パラメータをカスタマイズすることは推奨しません。

さらに制約が適用されます:


* ベクトル類似性インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のカラム上にのみ構築できます。`Array(Nullable(Float32))` や `Array(LowCardinality(Float32))` などの Nullable や low-cardinality の float 配列は使用できません。
* ベクトル類似性インデックスは単一カラム上に構築しなければなりません。
* ベクトル類似性インデックスは計算式上に構築することもできます（例: `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`）。ただし、そのようなインデックスは後から近似近傍検索には使用できません。
* ベクトル類似性インデックスでは、基になるカラム内のすべての配列が `<dimension>` 個の要素を持つ必要があります。この要件はインデックス作成時に検証されます。この要件への違反を可能な限り早期に検出するために、ユーザーはベクトルカラムに対して [CONSTRAINT](/sql-reference/statements/create/table.md#constraints) を追加できます（例: `CONSTRAINT same_length CHECK length(vectors) = 256`）。
* 同様に、基になるカラム内の配列値は空 (`[]`) であってはならず、デフォルト値（同じく `[]`）を持つように設定してもいけません。

**ストレージおよびメモリ消費の見積もり**

典型的な AI モデル（例: Large Language Model、[LLMs](https://en.wikipedia.org/wiki/Large_language_model)）で使用するために生成されるベクトルは、数百から数千の浮動小数点値で構成されます。
そのため、1 つのベクトル値だけで複数キロバイトのメモリを消費する可能性があります。
テーブル内の基になるベクトルカラムに必要なストレージ量と、ベクトル類似性インデックスに必要なメインメモリ量を見積もりたいユーザーは、以下の 2 つの式を使用できます。

テーブル内のベクトルカラムのストレージ消費量（非圧縮時）:

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) の例：

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

ベクトル類似度索引は、検索を実行するために、ディスクからメインメモリに完全に読み込まれている必要があります。
同様に、ベクトル索引もメモリ上で完全に構築されてからディスクに書き出されます。

ベクトル索引をロードする際に必要となるメモリ使用量:

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)を用いた例：

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上記の式では、ベクトル類似度索引が事前割り当てバッファやキャッシュといった実行時データ構造を確保するために必要となる追加のメモリは考慮されていません。


#### ベクトル類似インデックスの使用 \{#using-a-vector-similarity-index\}

:::note
ベクトル類似インデックスを使用するには、[compatibility](../../../operations/settings/settings.md) の設定が `''`（デフォルト値）または `'25.1'` 以降である必要があります。
:::

ベクトル類似インデックスは、次の形式の SELECT クエリをサポートします。

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouseのクエリオプティマイザは、上記のクエリテンプレートに一致させて、利用可能なベクトル類似度インデックスを活用しようとします。
クエリがベクトル類似度インデックスを使用できるのは、SELECTクエリ内の距離関数がインデックス定義内の距離関数と同じ場合のみです。

高度なユーザーは、検索中の候補リストのサイズをチューニングするために、設定 [hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（HNSW ハイパーパラメータ「ef&#95;search」とも呼ばれる）にカスタム値を指定できます（例: `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
この設定のデフォルト値 256 は、ほとんどのユースケースで十分に機能します。
設定値を高くすると精度は向上しますが、その代わりにパフォーマンスが低下します。

クエリがベクトル類似度インデックスを使用できる場合、ClickHouse は SELECTクエリで指定された LIMIT `<N>` が妥当な範囲内にあることを確認します。
より具体的には、`<N>` がデフォルト値 100 の設定 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) の値より大きい場合にエラーが返されます。
LIMIT の値が大きすぎると検索が遅くなり、通常は誤った利用方法を示しています。

SELECTクエリがベクトル類似度インデックスを使用しているかどうかを確認するには、クエリの前に `EXPLAIN indexes = 1` を付けて実行します。

例として、次のクエリを示します。

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

返すことがあります

```result
    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (Project names)                                                                      │
 2. │   Limit (preliminary LIMIT (without OFFSET))                                                    │
 3. │     Sorting (Sorting for ORDER BY)                                                              │
 4. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers))) │
 5. │         ReadFromMergeTree (default.tab)                                                         │
 6. │         Indexes:                                                                                │
 7. │           PrimaryKey                                                                            │
 8. │             Condition: true                                                                     │
 9. │             Parts: 1/1                                                                          │
10. │             Granules: 575/575                                                                   │
11. │           Skip                                                                                  │
12. │             Name: idx                                                                           │
13. │             Description: vector_similarity GRANULARITY 100000000                                │
14. │             Parts: 1/1                                                                          │
15. │             Granules: 10/575                                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この例では、[dbpedia dataset](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 内の 100 万個のベクトル（各ベクトルの次元は 1536）が 575 個のグラニュールに格納されており、すなわち 1 グラニュールあたり約 1.7k 行が含まれています。
クエリでは 10 個の近傍を要求しており、ベクトル類似度索引はこれら 10 個の近傍を 10 個の別々のグラニュールから見つけます。
クエリの実行時には、これら 10 個のグラニュールが読み取られます。

出力に `Skip` と、ベクトル索引の名前および型（この例では `idx` と `vector_similarity`）が含まれている場合、ベクトル類似度索引が使用されています。
この場合、ベクトル類似度索引は 4 個のグラニュールのうち 2 個をスキップしており、つまりデータの 50% を除外しています。
より多くのグラニュールをスキップできるほど、索引の利用はより効果的になります。

:::tip
索引の使用を強制するには、設定 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) を指定して SELECT クエリを実行します（設定値として索引名を指定します）。
:::

**ポストフィルタリングとプリフィルタリング**

ユーザーは任意で、SELECT クエリに対して追加のフィルタ条件を含む `WHERE` 句を指定できます。
ClickHouse は、ポストフィルタリングまたはプリフィルタリング戦略を用いてこれらのフィルタ条件を評価します。
要するに、どちらの戦略もフィルタを評価する順序を決定します:

* ポストフィルタリングは、最初にベクトル類似度索引を評価し、その後に ClickHouse が `WHERE` 句で指定された追加のフィルタを評価することを意味します。
* プリフィルタリングは、フィルタの評価順序がその逆になることを意味します。

これらの戦略は、それぞれ異なるトレードオフを持ちます。


* ポストフィルタリングには、`LIMIT <N>` 句で要求された行数より少ない行しか返さない場合がある、という一般的な問題があります。この状況は、ベクトル類似度索引から返された結果行のうち 1 行以上が、追加のフィルタ条件を満たさないときに発生します。
* プリフィルタリングは、一般的には未解決の問題です。特定の専用ベクトルデータベースはプリフィルタリング用のアルゴリズムを提供しますが、ほとんどのリレーショナルデータベース（ClickHouse を含む）は、厳密な近傍探索、すなわち索引を用いない総当たり走査にフォールバックします。

どの戦略が採用されるかは、フィルタ条件によって決まります。

*追加のフィルタがパーティションキーの一部である場合*

追加のフィルタ条件がパーティションキーの一部である場合、ClickHouse はパーティションプルーニングを適用します。
例として、あるテーブルがカラム `year` によるレンジパーティションで分割されており、次のクエリが実行されるとします。

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse は、2025 年のもの以外のすべてのパーティションをプルーニングします。

*追加フィルタを索引を使って評価できない場合*

追加のフィルタ条件を索引（主キー索引、スキッピング索引）を使って評価できない場合、ClickHouse はポストフィルタリングを適用します。

*追加フィルタを主キー索引を使って評価できる場合*

追加のフィルタ条件を [primary key](mergetree.md#primary-key) を使って評価できる場合（つまり、主キーのプレフィックスを構成している場合）で、かつ

* フィルタ条件によって、あるパーツ内で少なくとも 1 行が除外される場合、ClickHouse はそのパーツ内の「生き残った」範囲に対してプリフィルタリングにフォールバックします。
* フィルタ条件によって、あるパーツ内で 1 行も除外されない場合、ClickHouse はそのパーツに対してポストフィルタリングを実行します。

実際のユースケースでは、後者のケースが発生することはほとんどありません。

*追加フィルタをスキッピング索引を使って評価できる場合*

追加のフィルタ条件を [skipping indexes](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax 索引、set 索引など）を使って評価できる場合、ClickHouse はポストフィルタリングを実行します。
このような場合、他のスキッピング索引と比較して最も多くの行を除外できると期待されるため、まずベクトル類似索引が評価されます。

ポストフィルタリングとプリフィルタリングをより細かく制御するために、2 つの SETTING を使用できます。

[vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy) SETTING（デフォルト: 上記のヒューリスティクスを実装する `auto`）を `prefilter` に設定できます。
これは、追加のフィルタ条件が非常に選択的な場合に、強制的にプリフィルタリングを行わせるのに有用です。
例として、次のクエリはプリフィルタリングの恩恵を受ける可能性があります。

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

2ドル未満の本がごく少数しか存在しないと仮定すると、ベクター索引から返される上位10件の一致がすべて2ドル超である可能性があるため、ポストフィルタリングでは行が1件も返されない場合があります。
事前フィルタを強制するには（クエリに `SETTINGS vector_search_filter_strategy = 'prefilter'` を追加）、ClickHouse はまず価格が2ドル未満のすべての本を検索し、その後、見つかった本に対して総当たりのベクター検索を実行します。

上記の問題を解決する別のアプローチとして、[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（デフォルト: `1.0`, 最大: `1000.0`）を `1.0` より大きい値（例えば `2.0`）に設定することができます。
ベクター索引から取得される最近傍の候補行数は、この設定値を掛け合わせた数になり、その後、それらの行に対して追加のフィルタを適用して、LIMIT で指定された件数の行を返します。
例として、乗数を `3.0` にして再度クエリを実行してみます。

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse は各パーツごとにベクトル索引から 3.0 x 10 = 30 個の最近傍を取得し、その後で追加のフィルター条件を評価します。
最も近い 10 個の近傍だけが返されます。
`vector_search_index_fetch_multiplier` を設定することでこの問題を軽減できますが、極端なケース（非常に選択度の高い WHERE 条件）では、要求した N 行より少ない行しか返されない可能性があります。

**再スコアリング**


一般的に、ClickHouse の skip 索引はグラニュールレベルでフィルタリングします。つまり、skip 索引でのルックアップは（内部的に）潜在的に一致するグラニュールのリストを返し、その後のスキャンで読み取るデータ量を削減します。
これは skip 索引一般ではうまく機能しますが、ベクトル類似性索引の場合には「グラニュラリティのミスマッチ」を引き起こします。
もう少し詳しく言うと、ベクトル類似性索引は、ある参照ベクトルに対して最も類似した N 個のベクトルの行番号を決定しますが、その後これらの行番号をグラニュール番号に対応付ける必要があります。
ClickHouse はその後、これらのグラニュールをディスクから読み込み、それらのグラニュール内のすべてのベクトルについて距離計算を再度行います。
このステップはリスコアリングと呼ばれ、理論的には精度を改善できる可能性があります（ベクトル類似性索引は *近似的な* 結果しか返さないことを思い出してください）が、パフォーマンスの観点からは明らかに最適ではありません。

そのため ClickHouse は、リスコアリングを無効にして、索引から直接、最も類似したベクトルとその距離を返す最適化を提供しています。
この最適化はデフォルトで有効になっており、設定 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring) を参照してください。
高レベルでは、ClickHouse は最も類似したベクトルとその距離を仮想カラム `_distances` として利用可能にします。
これを確認するには、`EXPLAIN header = 1` を付けてベクトル検索クエリを実行します。

```sql
EXPLAIN header = 1
WITH [0., 2.] AS reference_vec
SELECT id
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3
SETTINGS vector_search_with_rescoring = 0
```

```result
Query id: a2a9d0c8-a525-45c1-96ca-c5a11fa66f47

    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (Project names)                                                                              │
 2. │ Header: id Int32                                                                                        │
 3. │   Limit (preliminary LIMIT (without OFFSET))                                                            │
 4. │   Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64     │
 5. │           __table1.id Int32                                                                             │
 6. │     Sorting (Sorting for ORDER BY)                                                                      │
 7. │     Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64   │
 8. │             __table1.id Int32                                                                           │
 9. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers)))         │
10. │       Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64 │
11. │               __table1.id Int32                                                                         │
12. │         ReadFromMergeTree (default.tab)                                                                 │
13. │         Header: id Int32                                                                                │
14. │                 _distance Float32                                                                       │
    └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
`vector_search_with_rescoring = 0` でスコア再計算なしのクエリを実行していても、並列レプリカを有効にしている場合はスコア再計算にフォールバックすることがあります。
:::


#### パフォーマンスチューニング \{#performance-tuning\}

**圧縮の調整**

ほとんどのユースケースでは、基盤となるカラム内のベクトルは密であり、圧縮効率がよくありません。
その結果、[compression](/sql-reference/statements/create/table.md#column_compression_codec) により、ベクトルカラムへの挿入およびそこからの読み取りが遅くなります。
そのため、圧縮を無効化することを推奨します。
そのためには、次のようにベクトルカラムに対して `CODEC(NONE)` を指定します。

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成のチューニング**

ベクトル類似性索引のライフサイクルは、パーツのライフサイクルに結び付いています。
言い換えると、ベクトル類似性索引が定義された新しいパーツが作成されるたびに、その索引も作成されます。
これは通常、データが[挿入](https://clickhouse.com/docs/guides/inserting-data)されるとき、または[マージ](https://clickhouse.com/docs/merges)時に発生します。
残念ながら、HNSW は索引作成に時間がかかることで知られており、INSERT やマージを大幅に遅くする可能性があります。
ベクトル類似性索引は、理想的にはデータが不変、あるいはほとんど変更されない場合にのみ使用すべきです。

索引作成を高速化するために、次の手法を使用できます。

まず、索引作成を並列化できます。
索引作成スレッドの最大数は、サーバー設定 [max&#95;build&#95;vector&#95;similarity&#95;index&#95;thread&#95;pool&#95;size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) を使用して設定できます。
最適なパフォーマンスを得るには、この設定値を CPU コア数に合わせて構成する必要があります。

次に、INSERT 文を高速化するために、セッション設定 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) を使用して、新しく挿入されたパーツに対するスキップ索引の作成を無効化できます。
そのようなパーツに対する SELECT クエリは、厳密検索にフォールバックします。
挿入されたパーツは、通常テーブル全体のサイズと比較して小さい傾向があるため、そのパフォーマンスへの影響は無視できる程度と予想されます。

3 番目に、マージを高速化するために、セッション設定 [materialize&#95;skip&#95;indexes&#95;on&#95;merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) を使用して、マージされたパーツに対するスキップ索引の作成を無効化できます。
これは、文 [ALTER TABLE [...] MATERIALIZE INDEX [...]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) と組み合わせることで、ベクトル類似性索引のライフサイクルを明示的に制御できます。
たとえば、すべてのデータが取り込まれるまで、あるいは週末のようなシステム負荷の低い期間まで、索引作成を延期することができます。

**インデックス使用のチューニング**

SELECT クエリは、ベクトル類似性索引を利用するために、それらをメインメモリにロードする必要があります。
同じベクトル類似性索引が繰り返しメインメモリにロードされることを避けるために、ClickHouse はそのような索引のための専用インメモリキャッシュを提供します。
このキャッシュが大きいほど、不要なロード回数は少なくなります。
最大キャッシュサイズは、サーバー設定 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) を使用して構成できます。
デフォルトでは、キャッシュは最大 5 GB まで成長できます。

:::note
ベクトル類似性索引キャッシュには、ベクトル索引のグラニュールが保存されます。
個々のベクトル索引グラニュールがキャッシュサイズより大きい場合、それらはキャッシュされません。
したがって、「ストレージおよびメモリ消費量の見積もり」の式、または [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) に基づいてベクトル索引サイズを算出し、それに応じてキャッシュサイズを設定してください。
:::

*ベクトル索引キャッシュを確認し、必要に応じて拡張することが、ベクトル検索クエリの低速化を調査する際の最初のステップであるべきだという点を、あらためて強調します。*

ベクトル類似性索引キャッシュの現在のサイズは、[system.metrics](../../../operations/system-tables/metrics.md) に表示されます。

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

特定のクエリ ID を持つクエリのキャッシュヒットとキャッシュミスは、[system.query&#95;log](../../../operations/system-tables/query_log.md) から取得できます。

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

本番環境では、すべてのベクトル索引が常にメモリ上に保持されるよう、キャッシュサイズを十分に大きく設定することを推奨します。

**量子化のチューニング**

[Quantization](https://huggingface.co/blog/embedding-quantization) は、ベクトルのメモリフットプリント（メモリ使用量）と、ベクトル索引の構築および探索にかかる計算コストを削減するための手法です。
ClickHouse のベクトル索引は、以下の量子化オプションをサポートしています。


| Quantization   | Name             | Storage per dimension |
| -------------- | ---------------- | --------------------- |
| f32            | 単精度              | 4 bytes               |
| f16            | 半精度              | 2 bytes               |
| bf16 (default) | 半精度（brain float） | 2 bytes               |
| i8             | 4分の1精度           | 1 byte                |
| b1             | バイナリ             | 1 bit                 |

Quantization は、元のフル精度の浮動小数点値（`f32`）で検索する場合と比べて、ベクトル検索の精度を低下させます。
ただし、ほとんどのデータセットでは、half-precision brain float quantization（`bf16`）による精度低下はごくわずかであるため、ベクトル類似性インデックスはデフォルトでこの quantization 手法を使用します。
4分の1精度（`i8`）およびバイナリ（`b1`）の quantization は、ベクトル検索において無視できない精度低下を引き起こします。
これら 2 種類の quantization は、ベクトル類似性インデックスのサイズが利用可能な DRAM 容量を大きく上回る場合にのみ使用することを推奨します。
この場合、精度を改善するために rescoring（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）を有効にすることも推奨します。
バイナリ quantization は、1) 正規化された埋め込み（すなわちベクトル長 = 1、OpenAI モデルは通常正規化されています）、および 2) 距離関数として cosine distance を使用する場合にのみ推奨されます。
バイナリ quantization は内部的に Hamming distance を用いて近傍グラフを構築・検索します。
rescoring ステップでは、テーブルに保存されている元のフル精度ベクトルを使用して、cosine distance により最近傍を特定します。

**データ転送のチューニング**

ベクトル検索クエリにおける参照ベクトルはユーザーから提供され、一般的には Large Language Model (LLM) を呼び出して取得されます。
ClickHouse でベクトル検索を実行する典型的な Python コードは次のようになります。

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

埋め込みベクトル（上記スニペットの `search_v`）は、次元数が非常に大きくなる場合があります。
例えば、OpenAI は 1536 次元や 3072 次元の埋め込みベクトルを生成するモデルを提供しています。
上記のコードでは、ClickHouse Python ドライバは埋め込みベクトルを人間が読める文字列に置き換え、その後 SELECT クエリ全体を文字列として送信します。
埋め込みベクトルが 1536 個の単精度浮動小数点値で構成されていると仮定すると、送信される文字列の長さは 20 kB に達します。
これにより、トークナイズ、パース、および何千回にもおよぶ文字列から浮動小数点数への変換により、高い CPU 使用率が発生します。
また、ClickHouse サーバーログファイルにもかなりの領域が必要となり、`system.query_log` の肥大化も招きます。

ほとんどの LLM モデルは、ネイティブな float のリストまたは NumPy 配列として埋め込みベクトルを返す点に注意してください。
そのため、Python アプリケーションでは、参照ベクトルのパラメータを次のスタイルを用いてバイナリ形式でバインドすることを推奨します。

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, reinterpret($search_v_binary$, 'Array(Float32)'))
    LIMIT 10"
    parameters = params)
```

この例では、参照ベクトルはそのままバイナリ形式で送信され、サーバー側で浮動小数点数の配列として再解釈されます。
これによりサーバー側の CPU 時間を節約でき、サーバーログおよび `system.query_log` の肥大化も防止できます。


#### 管理とモニタリング \{#administration\}

ベクトル類似性索引のディスク上のサイズは、[system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) から取得できます。

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

出力例：

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```


#### 通常のスキッピングインデックスとの違い \{#differences-to-regular-skipping-indexes\}

すべての通常の [skipping indexes](/optimize/skipping-indexes) と同様に、ベクター類似度インデックスはグラニュール単位で構築され、各インデックスブロックは `GRANULARITY = [N]` 個のグラニュール（通常のスキッピングインデックスではデフォルトで `[N]` = 1）から構成されます。
たとえば、テーブルのプライマリインデックスの粒度が 8192（`index_granularity = 8192` の設定）で `GRANULARITY = 2` の場合、各インデックスブロックには 16384 行が含まれます。
しかし、おおよその近傍探索のためのデータ構造とアルゴリズムは、本質的に行指向です。
それらは行の集合をコンパクトに表現して保存し、ベクター検索クエリに対しても行を返します。
このため、ベクター類似度インデックスの動作は、通常のスキッピングインデックスと比べると、直感に反するいくつかの違いが生じます。

ユーザーがカラムに対してベクター類似度インデックスを定義すると、ClickHouse は内部的に各インデックスブロックごとにベクター類似度の「サブインデックス」を作成します。
サブインデックスは、自身が含まれるインデックスブロック内の行だけを把握しているという意味で「ローカル」です。
前の例で、あるカラムが 65536 行を持つとすると、8 個のグラニュールにまたがる 4 つのインデックスブロックと、各インデックスブロックに対する 1 つのベクター類似度サブインデックスを得ることになります。
サブインデックスは理論的には、自身のインデックスブロック内で最も近い点を持つ行を N 個まで直接返すことができます。
しかし、ClickHouse はディスクからメモリへのデータ読み込みをグラニュール単位で行うため、サブインデックスはマッチした行をグラニュール粒度に外挿します。
これは、インデックスブロックの粒度でデータをスキップする通常のスキッピングインデックスとは異なります。

`GRANULARITY` パラメーターは、作成されるベクター類似度サブインデックスの数を決定します。
`GRANULARITY` の値が大きいほど、数は少ないがサイズの大きいベクター類似度サブインデックスとなり、最終的にはカラム（またはカラムのデータパーツ）が 1 つのサブインデックスしか持たない状態になります。
その場合、サブインデックスはすべてのカラム行に対する「グローバル」なビューを持ち、関連する行を含むカラム（パーツ）のすべてのグラニュールを直接返すことができます（そのようなグラニュールは高々 `LIMIT [N]` 個です）。
2 段階目として、ClickHouse はこれらのグラニュールを読み込み、グラニュール内のすべての行に対して総当たりの距離計算を行うことで、本当に最も良い行を特定します。
小さな `GRANULARITY` の値では、各サブインデックスは最大で `LIMIT N` 個のグラニュールを返します。
その結果、読み込んで後処理（ポストフィルタリング）する必要のあるグラニュールが増えます。
どちらの場合でも検索精度は同等であり、異なるのは処理性能だけである点に注意してください。
一般的には、ベクター類似度インデックスには大きな `GRANULARITY` を使用し、ベクター類似度構造によるメモリ消費の過大などの問題がある場合にのみ、より小さな `GRANULARITY` の値にフォールバックすることが推奨されます。
ベクター類似度インデックスに対して `GRANULARITY` が指定されていない場合、デフォルト値は 1 億です。

#### 例 \{#approximate-nearest-neighbor-search-example\}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

戻り値

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

近似ベクトル検索を用いたその他のサンプルデータセット:

* [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
* [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
* [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
* [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)


### Quantized Bit (QBit) \{#approximate-nearest-neighbor-search-qbit\}

厳密なベクトル検索を高速化するための一般的な手法の 1 つは、より低い精度の [float データ型](../../../sql-reference/data-types/float.md) を使用することです。
たとえば、ベクトルを `Array(Float32)` ではなく `Array(BFloat16)` として保存すると、データサイズは半分になり、それに比例してクエリの実行時間も短縮されると期待できます。
この手法は量子化 (quantization) と呼ばれます。計算を高速化できますが、すべてのベクトルに対して全探索を行っていても、結果の精度が低下する可能性があります。

従来の量子化では、検索時とデータ保存時の両方で精度を失います。上記の例では、`Float32` ではなく `BFloat16` を保存することになり、たとえ望んだとしても、後からより高精度な検索を実行することは二度とできません。別のアプローチとしては、量子化済みデータとフル精度データの 2 つのコピーを保存する方法があります。これは有効ですが、冗長なストレージを必要とします。たとえば、元データが `Float64` であり、異なる精度 (16-bit、32-bit、またはフル 64-bit) で検索を実行したいケースを考えてみます。この場合、データを 3 つの別々のコピーとして保存する必要があります。

ClickHouse は、次のようにこれらの制約に対処する Quantized Bit (`QBit`) データ型を提供します:

1. 元のフル精度データを保存する。
2. クエリ時に量子化の精度を指定できるようにする。

これは、データをビットグループ形式 (すべてのベクトルの i 番目のビットをまとめて保存する形式) で保存することで実現されます。これにより、要求された精度レベルでのみ読み取ることが可能になります。量子化による I/O と計算量削減から得られる高速化のメリットを享受しつつ、必要なときには常に元のすべてのデータを利用できます。最大精度が選択された場合、検索は厳密検索になります。

`QBit` 型のカラムを宣言するには、次の構文を使用します:

```sql
column_name QBit(element_type, dimension)
```

ここで、

* `element_type` – 各ベクトル要素の型。サポートされる型は `BFloat16`、`Float32`、`Float64` です
* `dimension` – 各ベクトル内の要素数


#### `QBit` テーブルの作成とデータの追加 \{#qbit-create\}

```sql
CREATE TABLE fruit_animal (
    word String,
    vec QBit(Float64, 5)
) ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
    ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
    ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
    ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
    ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
    ('cat', [-0.56611276, 0.52267331, 1.27839863, -0.59809804, -1.26721048]),
    ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```


#### `QBit` を用いたベクトル検索 \{#qbit-search\}

L2 距離を用いて、単語 &#39;lemon&#39; を表すベクトルに最も近いベクトル（最近傍）を検索してみます。距離関数の 3 番目のパラメータはビット数による精度を指定します。値が大きいほど高精度になりますが、その分計算量も増加します。

`QBit` で利用可能なすべての距離関数は[こちら](../../../sql-reference/data-types/qbit.md#vector-search-functions)で確認できます。

**フル精度検索 (64 ビット):**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 64) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬────────────distance─┐
1. │ apple  │ 0.14639757188169716 │
2. │ banana │   1.998961369007679 │
3. │ orange │   2.039041552613732 │
4. │ cat    │   2.752802631487914 │
5. │ horse  │  2.7555776805484813 │
6. │ dog    │   3.382295083120104 │
   └────────┴─────────────────────┘
```

**低精度検索:**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 12) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬───────────distance─┐
1. │ apple  │  0.757668703053566 │
2. │ orange │ 1.5499475034938677 │
3. │ banana │ 1.6168396735102937 │
4. │ cat    │  2.429752230904804 │
5. │ horse  │  2.524650475528617 │
6. │ dog    │   3.17766975527459 │
   └────────┴────────────────────┘
```

12ビット量子化では、クエリ実行が高速になる一方で、距離の近似精度も良好であることに注目してください。相対的な順序はほぼ保たれており、&#39;apple&#39; が依然として最も近い一致となっています。


#### パフォーマンスに関する考慮事項 \{#qbit-performance\}

`QBit` のパフォーマンス上の利点は、精度を下げることで読み出す必要のあるデータ量が減り、その分ストレージからの I/O 操作が少なくて済む点にあります。さらに、`QBit` に含まれるデータ型が `Float32` の場合、`precision` パラメータが 16 以下であれば、計算量の削減による追加のメリットも得られます。`precision` パラメータは、精度と速度のトレードオフを直接制御します。

- **精度が高い場合**（元のデータ幅に近い場合）：結果はより正確になるが、クエリは遅くなる
- **精度が低い場合**：近似結果になるがクエリは高速になり、メモリ使用量も削減される

### 参考文献 \{#references\}

ブログ記事:

- [Vector Search with ClickHouse - Part 1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [Vector Search with ClickHouse - Part 2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
- [We built a vector search engine that lets you choose precision at query time](https://clickhouse.com/blog/qbit-vector-search)