---
description: '厳密および近似ベクトル検索に関するドキュメント'
keywords: ['ベクトル類似度検索', 'ANN', 'kNN', 'HNSW', 'インデックス', 'インデックス作成', '最近傍探索', 'ベクトル検索']
sidebar_label: '厳密および近似ベクトル検索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '厳密および近似ベクトル検索'
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# 厳密ベクトル検索と近似ベクトル検索 \{#exact-and-approximate-vector-search\}

多次元（ベクトル）空間において、ある点に最も近い N 個の点を見つける問題は、[nearest neighbor search](https://en.wikipedia.org/wiki/Nearest_neighbor_search)（最近傍探索）、または略してベクトル検索と呼ばれます。
ベクトル検索を行うための一般的なアプローチは 2 つあります:

* 厳密ベクトル検索は、与えられた点とベクトル空間内のすべての点との距離を計算します。これにより可能な限り最高の精度が保証され、返される点は必ず実際の最近傍になります。ベクトル空間を総当たりで探索するため、厳密ベクトル検索は実運用では遅くなり過ぎる場合があります。
* 近似ベクトル検索は、一連の手法（例えばグラフやランダムフォレストといった特殊なデータ構造）を指し、厳密ベクトル検索よりもはるかに高速に結果を計算します。結果の精度は通常、実用上「十分良い」レベルです。多くの近似手法は、結果の精度と検索時間のトレードオフを調整するためのパラメータを提供します。

ベクトル検索（厳密または近似）は、次のように SQL で記述できます:

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内の点は、配列型の `vectors` 列に格納されます。例えば [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) です。
参照ベクトルは定数配列であり、共通テーブル式として与えられます。
`<DistanceFunction>` は、参照点と格納されているすべての点との距離を計算します。
この処理には、利用可能な任意の [distance function](/sql-reference/functions/distance-functions) を使用できます。
`<N>` は、返すべき近傍点の数を指定します。


## 厳密なベクトル検索 \{#exact-nearest-neighbor-search\}

厳密なベクトル検索は、上記の SELECT クエリをそのまま使用して実行できます。
このようなクエリの実行時間は、一般的に保存されているベクトル数とその次元数、つまり配列要素数に比例します。
また、ClickHouse はすべてのベクトルに対して総当たりスキャンを行うため、クエリで使用されるスレッド数（設定項目 [max&#95;threads](../../../operations/settings/settings.md#max_threads) を参照）にも実行時間が依存します。

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

### ベクトル類似度インデックス \{#vector-similarity-index\}

ClickHouse は、近似ベクトル検索を実行するための特別な「ベクトル類似度」インデックスを提供します。

:::note
ベクトル類似度インデックスは ClickHouse バージョン 25.8 以降で利用可能です。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

#### ベクトル類似度インデックスの作成 \{#creating-a-vector-similarity-index\}

新しいテーブルに対して、次のようにベクトル類似度インデックスを作成できます。

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

別の方法として、既存のテーブルにベクトル類似度インデックスを追加する場合は、次のようにします。

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

ベクトル類似性インデックスは特別な種類のスキッピングインデックスにあたります（[こちら](mergetree.md#table_engine-mergetree-data_skipping-indexes)および[こちら](../../../optimize/skipping-indexes)を参照してください）。
したがって、上記の `ALTER TABLE` 文では、テーブルに今後挿入される新規データに対してのみインデックスが作成されます。
既存データに対してもインデックスを構築するには、インデックスをマテリアライズする必要があります。

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

関数 `<distance_function>` には、次のいずれかを指定する必要があります。

* `L2Distance` — [ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)。ユークリッド空間における 2 点間を結ぶ線分の長さを表します。
* `cosineDistance` — [コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)。ゼロではない 2 つのベクトル間の角度を表します。

正規化済みデータに対しては、通常 `L2Distance` が最適な選択肢です。それ以外の場合はスケールの違いを補正するために `cosineDistance` を推奨します。

`<dimensions>` は、基礎となるカラムにおける配列のカーディナリティ（要素数）を指定します。
ClickHouse がインデックス作成中に異なるカーディナリティの配列を検出した場合、そのインデックスは破棄され、エラーが返されます。

オプションの GRANULARITY パラメータ `<N>` は、インデックスグラニュールのサイズを表します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値の 1 億は、ほとんどのユースケースで十分に良好に動作しますが、チューニングすることも可能です。
その影響を理解している上級ユーザーのみがチューニングすることをお勧めします（[下記](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似度インデックスは汎用的であり、さまざまな近似検索手法を利用できます。
実際に使用される手法は、パラメータ `<type>` によって指定されます。
現時点で利用可能な手法は HNSW（[論文](https://arxiv.org/abs/1603.09320)）のみであり、階層的近接グラフに基づく、近似ベクトル検索のための一般的かつ最先端の手法です。
`type` として HNSW を使用する場合、ユーザーは任意で HNSW 固有の追加パラメータを指定できます。

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

これらの HNSW 固有パラメータが利用可能です:

* `<quantization>` は近接グラフ内のベクトルの量子化方式を制御します。指定可能な値は `f64`、`f32`、`f16`、`bf16`、`i8`、`b1` です。デフォルト値は `bf16` です。このパラメータは、基盤となるカラム内でのベクトル表現には影響しない点に注意してください。
* `<hnsw_max_connections_per_layer>` は、グラフ内の各ノードあたりの近傍ノード数を制御します。これは HNSW のハイパーパラメータ `M` としても知られています。デフォルト値は `32` です。値 `0` はデフォルト値を使用することを意味します。
* `<hnsw_candidate_list_size_for_construction>` は、HNSW グラフ構築時の動的候補リストのサイズを制御します。これは HNSW のハイパーパラメータ `ef_construction` としても知られています。デフォルト値は `128` です。値 `0` はデフォルト値を使用することを意味します。

すべての HNSW 固有パラメータのデフォルト値は、ほとんどのユースケースで良好に機能します。
したがって、HNSW 固有パラメータのカスタマイズは推奨しません。

さらに、次の制約が適用されます。


* ベクター類似度インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型の列に対してのみ作成できます。`Array(Nullable(Float32))` や `Array(LowCardinality(Float32))` のような nullable や low-cardinality の浮動小数点数配列は使用できません。
* ベクター類似度インデックスは単一列に対してのみ作成しなければなりません。
* ベクター類似度インデックスは計算式（例: `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`）に対して作成することもできますが、そのようなインデックスは後で近似近傍探索に利用することはできません。
* ベクター類似度インデックスでは、基になる列中のすべての配列が `<dimension>` 個の要素を持つ必要があります。この条件はインデックス作成時に検査されます。この要件違反をできるだけ早期に検出するために、ユーザーはベクター列に対して [constraint](/sql-reference/statements/create/table.md#constraints) を追加できます（例: `CONSTRAINT same_length CHECK length(vectors) = 256`）。
* 同様に、基になる列中の配列値は空 (`[]`) であってはならず、デフォルト値（同じく `[]`）であってもいけません。

**ストレージおよびメモリ消費量の見積もり**

典型的な AI モデル（例: 大規模言語モデル [LLM](https://en.wikipedia.org/wiki/Large_language_model)）で使用するために生成されるベクターは、数百から数千の浮動小数点値で構成されます。
そのため、単一のベクター値でも複数キロバイトのメモリを消費する可能性があります。
テーブル内の基になるベクター列に必要なストレージ量、およびベクター類似度インデックスに必要なメインメモリ量を見積もりたい場合は、以下の 2 つの式を利用できます。

テーブル内のベクター列のストレージ使用量（非圧縮）:

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) の例:

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

ベクター類似度インデックスで検索を行うには、ディスクからメインメモリに完全に読み込まれている必要があります。
同様に、ベクターインデックスもメモリ上で完全に構築してからディスクに保存されます。

ベクターインデックスをロードする際に必要なメモリ使用量:

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) の例:

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上記の式には、事前割り当てバッファやキャッシュなど、ベクトル類似性インデックスがランタイムのデータ構造を割り当てるために必要となる追加メモリは含まれていません。


#### ベクター類似性インデックスの使用 \{#using-a-vector-similarity-index\}

:::note
ベクター類似性インデックスを使用するには、設定 [compatibility](../../../operations/settings/settings.md) の値が `''`（デフォルト値）、または `'25.1'` 以降である必要があります。
:::

ベクター類似性インデックスは、次の形式の SELECT クエリをサポートします。

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse のクエリオプティマイザは、上記のクエリテンプレートに一致させ、利用可能なベクター類似性インデックスを活用しようとします。
クエリがベクター類似性インデックスを使用できるのは、SELECT クエリ内の距離関数がインデックス定義の距離関数と同じ場合のみです。

上級ユーザーは、検索時の候補リストのサイズを調整するために、設定 [hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（HNSW ハイパーパラメータ「ef&#95;search」とも呼ばれます）にカスタム値を指定できます（例: `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
この設定のデフォルト値 256 は、ほとんどのユースケースで良好に動作します。
設定値を高くすると精度は向上しますが、その代わりにパフォーマンスが低下します。

クエリでベクター類似性インデックスを使用する場合、ClickHouse は SELECT クエリで指定された LIMIT `<N>` が妥当な範囲内かどうかをチェックします。
より具体的には、`<N>` が設定値 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries)（デフォルト値は 100）より大きい場合はエラーが返されます。
LIMIT の値が大きすぎると検索が遅くなり、通常は誤った使用方法であることを示しています。

SELECT クエリがベクター類似性インデックスを使用しているかどうかを確認するには、クエリの先頭に `EXPLAIN indexes = 1` を付けて実行します。

例として、次のクエリを示します。

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

次のような結果を返すことがあります

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

この例では、[dbpedia dataset](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) の 100 万個のベクトル（各ベクトルの次元は 1536）が 575 個の granule（グラニュール）に格納されており、つまり 1 granule あたり約 1.7k 行となります。
クエリは 10 個の近傍を要求し、ベクトル類似度インデックスはこれら 10 個の近傍を 10 個の別々の granule から見つけます。
クエリ実行中には、これら 10 個の granule が読み込まれます。

出力に `Skip` とベクトルインデックスの名前と型（この例では `idx` および `vector_similarity`）が含まれている場合、ベクトル類似度インデックスが使用されています。
このケースでは、ベクトル類似度インデックスによって 4 個の granule のうち 2 個がスキップされ、つまりデータの 50% が読み取り対象から外れました。
スキップできる granule が多いほど、インデックスの利用はより効果的になります。

:::tip
インデックスの使用を強制するには、設定 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) を指定して SELECT クエリを実行します（インデックス名を設定値として指定します）。
:::

**Post-filtering と Pre-filtering**

ユーザーはオプションで、SELECT クエリに対して追加のフィルター条件を含む `WHERE` 句を指定できます。
ClickHouse は、post-filtering あるいは pre-filtering 戦略を用いてこれらのフィルター条件を評価します。
要するに、どちらの戦略もフィルターを評価する順序を決定します。

* Post-filtering とは、まずベクトル類似度インデックスが評価され、その後に ClickHouse が `WHERE` 句で指定された追加フィルターを評価することを意味します。
* Pre-filtering とは、フィルター評価の順序がその逆になることを意味します。

これらの戦略には、それぞれ異なるトレードオフがあります。


* ポストフィルタリングには、`LIMIT <N>` 句で要求された行数より少ない行しか返さない可能性がある、という一般的な問題があります。この状況は、ベクター類似性インデックスによって返された 1 行以上の結果行が追加フィルターを満たさない場合に発生します。
* プリフィルタリングは、一般的に未解決の課題です。特定の専用ベクトルデータベースではプリフィルタリングアルゴリズムを提供していますが、ほとんどのリレーショナルデータベース（ClickHouse を含む）は厳密な近傍検索、すなわちインデックスなしの総当たりスキャンにフォールバックします。

どの戦略が使われるかは、フィルター条件に依存します。

*追加のフィルターがパーティションキーの一部である*

追加のフィルター条件がパーティションキーの一部である場合、ClickHouse はパーティションプルーニングを適用します。
例として、テーブルがカラム `year` によってレンジパーティションされており、次のクエリが実行されるとします。

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse は 2025 年のものを除くすべてのパーティションをプルーニングします。

*追加のフィルターはインデックスを用いて評価できない*

追加のフィルター条件がインデックス（プライマリキーインデックス、skipping index）を用いて評価できない場合、ClickHouse はポストフィルタリングを適用します。

*追加のフィルターはプライマリキーインデックスを用いて評価できる*

追加のフィルター条件が [プライマリキー](mergetree.md#primary-key) を用いて評価可能な場合（すなわち、プライマリキーのプレフィックスを構成している場合）、かつ

* フィルター条件がパーツ内で少なくとも 1 行を除外できる場合、ClickHouse はそのパーツ内の「生き残る」範囲に対してプレフィルタリングに切り替えます。
* フィルター条件がパーツ内で 1 行も除外しない場合、ClickHouse はそのパーツに対してポストフィルタリングを実行します。

実際のユースケースでは、後者のケースが発生することはほとんどありません。

*追加のフィルターは skipping index を用いて評価できる*

追加のフィルター条件が [skipping indexes](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax index、set index など）を用いて評価可能な場合、ClickHouse はポストフィルタリングを実行します。
このような場合、他の skipping index と比較して最も多くの行を除外できると期待されるため、まずベクトル類似度インデックスが評価されます。

ポストフィルタリングとプレフィルタリングをより細かく制御するために、2 つの設定を使用できます。

[vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy) 設定（デフォルト: 上記のヒューリスティクスを実装する `auto`）は `prefilter` に設定できます。
これは、追加のフィルター条件が非常に選択的な場合に、プレフィルタリングを強制したいケースで有用です。
例として、次のクエリはプレフィルタリングの恩恵を受ける可能性があります:

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

2ドル未満の本がごく少数しか存在しないと仮定すると、ベクターインデックスから返される上位10件の結果がすべて2ドルより高い価格である可能性があるため、ポストフィルタリングでは行が0件になることがあります。
プリフィルタリングを強制することで（クエリに `SETTINGS vector_search_filter_strategy = 'prefilter'` を追加）、ClickHouse はまず価格が2ドル未満のすべての本を検索し、その後、それらの本に対して総当たりのベクター検索を実行します。

上記の問題を解決する別のアプローチとして、[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（デフォルト: `1.0`、最大: `1000.0`）を `1.0` より大きい値（たとえば `2.0`）に設定することができます。
ベクターインデックスから取得される最近傍の数は、この設定値を掛けた数となり、その後、それらの行に対して追加のフィルタを適用して、LIMIT で指定された件数の行を返します。
例として、乗数を `3.0` にして再度クエリを実行できます。

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse は各パーツのベクターインデックスから 3.0 x 10 = 30 個の最近傍を取得し、その後に追加のフィルタを評価します。
そのうち最も近い 10 個だけが返されます。
`vector_search_index_fetch_multiplier` を設定することでこの問題を軽減できることに注意してください。
しかし、極端なケース（非常に選択性の高い WHERE 条件）では、要求した行数 N 未満しか返されない可能性があります。

**リスコアリング（再スコアリング）**


ClickHouse のスキップインデックスは一般的にグラニュールレベルでフィルタリングします。つまり、スキップインデックスでのルックアップは（内部的に）一致する可能性のあるグラニュールのリストを返し、その後のスキャンで読み取るデータ量を削減します。
これはスキップインデックス全般ではうまく機能しますが、ベクター類似性インデックスの場合には「粒度のミスマッチ」を引き起こします。
詳しく言うと、ベクター類似性インデックスは、ある参照ベクターに対して最も類似した N 個のベクターの行番号を決定しますが、その後これらの行番号をグラニュール番号に外挿する必要があります。
その後 ClickHouse はこれらのグラニュールをディスクから読み込み、これらのグラニュール内のすべてのベクターに対して距離計算を繰り返します。
このステップはリスコアリングと呼ばれます。理論的には精度を向上させることができます（ベクター類似性インデックスはあくまで*近似的な*結果しか返さないことを思い出してください）が、パフォーマンスの観点から最適ではないことは明らかです。

そのため ClickHouse では、リスコアリングを無効化し、インデックスから最も類似したベクターとその距離を直接返す最適化を提供しています。
この最適化はデフォルトで有効になっており、設定 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring) を参照してください。
概要としては、ClickHouse が最も類似したベクターとその距離を仮想カラム `_distances` として利用可能にします。
これを確認するには、`EXPLAIN header = 1` を付けてベクター検索クエリを実行します。

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
`vector_search_with_rescoring = 0` でリスコアリングを無効にし、かつ parallel replicas を有効にして実行したクエリでも、リスコアリングにフォールバックする場合があります。
:::


#### パフォーマンスチューニング \{#performance-tuning\}

**圧縮のチューニング**

ほぼすべてのユースケースで、基盤となる列内のベクトルは高密度であり、圧縮が効きにくくなります。
その結果、[圧縮](/sql-reference/statements/create/table.md#column_compression_codec) はベクトル列への挿入およびベクトル列からの読み取りを遅くします。
そのため、圧縮を無効にすることを推奨します。
そのためには、ベクトル列に対して次のように `CODEC(NONE)` を指定します。

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成のチューニング**

ベクトル類似度インデックスのライフサイクルは、パーツのライフサイクルに結び付いています。
言い換えると、ベクトル類似度インデックスが定義された新しいパーツが作成されるたびに、インデックスも作成されます。
これは通常、データが[挿入](https://clickhouse.com/docs/guides/inserting-data)されたとき、または[マージ](https://clickhouse.com/docs/merges)中に発生します。
残念ながら、HNSW はインデックス作成時間が長いことで知られており、INSERT やマージを大幅に遅くする可能性があります。
ベクトル類似度インデックスは、データが不変、またはほとんど変更されない場合にのみ使用するのが理想的です。

インデックス作成を高速化するために、次の手法を使用できます。

まず、インデックス作成は並列化できます。
インデックス作成スレッドの最大数は、サーバー設定 [max&#95;build&#95;vector&#95;similarity&#95;index&#95;thread&#95;pool&#95;size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) を使用して設定できます。
最適なパフォーマンスのためには、この設定値を CPU コア数に合わせて設定することを推奨します。

次に、INSERT 文を高速化するために、セッション設定 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) を使用して、新しく挿入されたパーツに対するスキップインデックスの作成を無効にすることができます。
そのようなパーツに対する SELECT クエリは、厳密検索にフォールバックします。
挿入されたパーツは、テーブル全体のサイズと比較して小さい傾向があるため、そのことによるパフォーマンスへの影響は無視できると想定されます。

第 3 に、マージを高速化するために、セッション設定 [materialize&#95;skip&#95;indexes&#95;on&#95;merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) を使用して、マージされたパーツに対するスキップインデックスの作成を無効にすることができます。
これは、ステートメント [ALTER TABLE [...] MATERIALIZE INDEX [...]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) と組み合わせることで、ベクトル類似度インデックスのライフサイクルを明示的に制御する手段を提供します。
たとえば、インデックス作成を、すべてのデータが取り込まれるまで、あるいは週末のようなシステム負荷の低い期間まで延期することができます。

**インデックス使用のチューニング**

SELECT クエリは、ベクトル類似度インデックスを利用するために、それらをメインメモリにロードする必要があります。
同じベクトル類似度インデックスが繰り返しメインメモリにロードされるのを避けるために、ClickHouse はそのようなインデックス用の専用インメモリキャッシュを提供します。
このキャッシュが大きいほど、不要なロードは少なくなります。
キャッシュの最大サイズは、サーバー設定 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) を使用して設定できます。
デフォルトでは、このキャッシュは最大 5 GB まで成長できます。

:::note
ベクトル類似度インデックスキャッシュは、ベクトルインデックスグラニュールを保存します。
個々のベクトルインデックスグラニュールがキャッシュサイズより大きい場合、それらはキャッシュされません。
したがって、「Estimating storage and memory consumption」に記載の式や [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) を基にベクトルインデックスサイズを計算し、それに応じてキャッシュサイズを設定するようにしてください。
:::

*ベクトルインデックスキャッシュを確認し、必要に応じて増加させることは、ベクトル検索クエリの低速化を調査する際に最初に行うべきステップであることを、ここで改めて強調します。*

ベクトル類似度インデックスキャッシュの現在のサイズは、[system.metrics](../../../operations/system-tables/metrics.md) に表示されます。

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

ある query&#95;id を持つクエリのキャッシュヒットおよびミスは、[system.query&#95;log](../../../operations/system-tables/query_log.md) から取得できます。

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

本番環境での利用においては、すべてのベクトルインデックスが常にメモリ上に保持されるよう、キャッシュを十分に大きく設定することを推奨します。

**量子化のチューニング**

[Quantization](https://huggingface.co/blog/embedding-quantization) は、ベクトルのメモリフットプリントや、ベクトルインデックスの構築・走査にかかる計算コストを削減するための手法です。
ClickHouse のベクトルインデックスは、次の量子化オプションをサポートしています。


| Quantization   | Name              | Storage per dimension |
| -------------- | ----------------- | --------------------- |
| f32            | 単精度               | 4 bytes               |
| f16            | 半精度               | 2 bytes               |
| bf16 (default) | 半精度 (brain float) | 2 bytes               |
| i8             | 4分の1精度            | 1 byte                |
| b1             | バイナリ              | 1 bit                 |

量子化は、元のフル精度の浮動小数点値 (`f32`) に対する検索と比較して、ベクトル検索の精度を低下させます。
しかし、ほとんどのデータセットでは、半精度 brain float 量子化 (`bf16`) による精度低下はごくわずかであるため、ベクトル類似度インデックスではこの量子化手法がデフォルトで使用されます。
4分の1精度 (`i8`) およびバイナリ (`b1`) 量子化は、ベクトル検索において無視できない精度低下を引き起こします。
これら 2 つの量子化は、ベクトル類似度インデックスのサイズが、利用可能な DRAM 容量を大きく上回る場合にのみ推奨されます。
このような場合は、精度向上のために再スコアリング（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）を有効にすることも推奨します。
バイナリ量子化は、1) 正規化済み埋め込み（すなわちベクトル長 = 1、OpenAI のモデルは通常正規化されている）、かつ 2) 距離関数としてコサイン距離を使用する場合にのみ推奨されます。
バイナリ量子化は内部的に Hamming 距離を用いて近傍グラフを構築および検索します。
再スコアリングのステップでは、テーブルに保存されている元のフル精度ベクトルを用いて、コサイン距離により最近傍を特定します。

**データ転送のチューニング**

ベクトル検索クエリの参照ベクトルはユーザーによって提供され、一般的には大規模言語モデル（LLM）を呼び出して取得されます。
ClickHouse でベクトル検索を実行する典型的な Python コードは、次のようになります。

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

埋め込みベクトル（上記スニペット中の `search_v`）は、非常に大きな次元数を持つ場合があります。
例えば、OpenAI は 1536 あるいは 3072 次元の埋め込みベクトルを生成するモデルを提供しています。
上記のコードでは、ClickHouse の Python ドライバーは埋め込みベクトルを人間が読める文字列に置き換え、その後 SELECT クエリ全体を文字列として送信します。
埋め込みベクトルが 1536 個の単精度浮動小数点値から構成されているとすると、送信される文字列長は 20 kB に達します。
これにより、トークナイズやパース、および数千回におよぶ文字列から浮動小数点値への変換で CPU 使用率が高くなります。
また、ClickHouse サーバーログファイルにかなりの領域が必要となり、`system.query_log` も肥大化します。

ほとんどの LLM モデルは、ネイティブな float のリストまたは NumPy 配列として埋め込みベクトルを返す点に注意してください。
そのため、Python アプリケーションでは、次のようなスタイルを用いて、参照ベクトルパラメータをバイナリ形式でバインドすることを推奨します。

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, reinterpret($search_v_binary$, 'Array(Float32)'))
    LIMIT 10"
    parameters = params)
```

この例では、参照ベクトルはバイナリ形式のまま送信され、サーバー側で float の配列として再解釈されます。
これによりサーバー側の CPU 時間を節約でき、サーバーログおよび `system.query_log` の肥大化も防止できます。


#### 管理と監視 \{#administration\}

ベクトル類似度インデックスのディスク上のサイズは、[system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) から取得できます。

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

出力例:

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```


#### 通常のスキッピングインデックスとの違い \{#differences-to-regular-skipping-indexes\}

通常の[スキッピングインデックス](/optimize/skipping-indexes)と同様に、ベクトル類似度インデックスはグラニュール単位で構築され、各インデックスブロックは `GRANULARITY = [N]` 個のグラニュールで構成されます（通常のスキッピングインデックスではデフォルトで `[N]` = 1）。
たとえば、テーブルのプライマリインデックスのグラニュラリティが 8192（`index_granularity = 8192` の設定）で `GRANULARITY = 2` の場合、各インデックスブロックには 16384 行が含まれます。
しかし、おおよその近傍検索のためのデータ構造とアルゴリズムは、本質的に行指向です。
これらは行の集合をコンパクトに表現して保存し、ベクトル検索クエリに対しても行を返します。
このため、ベクトル類似度インデックスの挙動は、通常のスキッピングインデックスと比べて、いくつか直感的ではない違いが生じます。

ユーザーがあるカラムにベクトル類似度インデックスを定義すると、ClickHouse は内部的に各インデックスブロックごとにベクトル類似度の「サブインデックス」を作成します。
サブインデックスは、そのインデックスブロックに含まれる行だけを認識しているという意味で「ローカル」です。
前述の例で、あるカラムが 65536 行を持つと仮定すると、8 個のグラニュールにまたがる 4 つのインデックスブロックと、それぞれのインデックスブロックに対応するベクトル類似度サブインデックスが得られます。
サブインデックスは理論的には、そのインデックスブロック内で最も近い N 個の点に対応する行を直接返すことができます。
しかし、ClickHouse はディスクからメモリへデータを読み込む際にグラニュールの粒度で処理するため、サブインデックスはマッチした行をグラニュール単位にまで拡張して扱います。
これは、インデックスブロックの粒度でデータをスキップする通常のスキッピングインデックスとは異なります。

`GRANULARITY` パラメータは、作成されるベクトル類似度サブインデックスの数を決定します。
`GRANULARITY` の値が大きいほどサブインデックスの数は少なくなりますが、それぞれのベクトル類似度サブインデックスは大きくなり、最終的にはカラム（またはカラムのデータパーツ）あたりサブインデックスが 1 つだけになる場合もあります。
その場合、サブインデックスはカラムの全行に対する「グローバル」な視点を持ち、関連する行を含むカラム（パーツ）のグラニュールをすべて直接返すことができます（そのようなグラニュールは最大でも `LIMIT [N]` 個です）。
第 2 段階として、ClickHouse はそれらのグラニュールをロードし、グラニュール内のすべての行に対して総当たりの距離計算を行うことで、実際に最も適した行を特定します。
`GRANULARITY` の値が小さい場合、各サブインデックスは最大で `LIMIT N` 個のグラニュールを返します。
その結果、より多くのグラニュールをロードし、後段でフィルタリングする必要が生じます。
どちらの場合でも検索精度は同等であり、異なるのは処理性能だけであることに注意してください。
一般的には、ベクトル類似度インデックスには大きな `GRANULARITY` を使用し、ベクトル類似度構造のメモリ使用量が過大になるなどの問題が発生した場合にのみ、より小さな `GRANULARITY` の値へ切り替えることが推奨されます。
ベクトル類似度インデックスに対して `GRANULARITY` が明示的に指定されていない場合、デフォルト値は 1 億です。

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

次の結果を返します。

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

近似ベクトル検索を利用する他のサンプルデータセット:

* [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
* [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
* [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
* [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)


### Quantized Bit (QBit) \{#approximate-nearest-neighbor-search-qbit\}

<BetaBadge/>

厳密なベクトル検索を高速化する一般的な方法の 1 つは、低精度の [浮動小数点数型 (float data type)](../../../sql-reference/data-types/float.md) を使用することです。
例えば、ベクトルを `Array(Float32)` ではなく `Array(BFloat16)` として保存すると、データサイズは半分になり、クエリ実行時間もそれに比例して短くなることが期待されます。
この手法は量子化と呼ばれます。計算は高速になりますが、すべてのベクトルを完全走査していても、結果の精度は低下する可能性があります。

従来の量子化では、検索時とデータ保存時の両方で精度が失われます。上記の例では、`Float32` の代わりに `BFloat16` を保存することになり、たとえ望んだとしても、後からより高精度な検索を実行することはできません。別のアプローチとして、量子化済みデータとフル精度のデータという 2 つのコピーを保存する方法があります。これは有効ですが、冗長なストレージが必要になります。例えば、元データが `Float64` であり、異なる精度 (16 ビット、32 ビット、フル 64 ビット) で検索を実行したいシナリオを考えてみましょう。この場合、データのコピーを 3 つ別々に保存する必要があります。

ClickHouse は、これらの制約を解決する Quantized Bit (`QBit`) データ型を提供しており、次のことを実現します:

1. 元のフル精度データを保存する。
2. クエリ時に量子化精度を指定できるようにする。

これは、データをビット単位にグループ化した形式（すべてのベクトルについて i 番目のビットをまとめて保存する形式）で格納することで実現されており、要求された精度レベルだけを読み取ることができます。これにより、量子化による I/O と計算の削減による高速化の恩恵を受けつつ、必要に応じて元のすべてのデータを利用できます。最大精度が選択された場合、検索は厳密なものになります。

:::note
`QBit` データ型とそれに関連する距離関数は Beta 機能です。有効化するには、`SET enable_qbit_type = 1` を実行してください。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

`QBit` 型のカラムを宣言するには、次の構文を使用します:

```sql
column_name QBit(element_type, dimension)
```

ここで:

* `element_type` – 各ベクトル要素の型。サポートされている型は `BFloat16`、`Float32`、`Float64` です
* `dimension` – 各ベクトル内の要素数です


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


#### `QBit` を使ったベクトル検索 \{#qbit-search\}

L2 距離を用いて、単語 &#39;lemon&#39; を表すベクトルに最も近い近傍を検索します。距離関数の第 3 引数ではビット単位の精度を指定します。値を大きくすると精度は向上しますが、計算コストも増加します。

`QBit` で使用可能なすべての距離関数は[こちら](../../../sql-reference/data-types/qbit.md#vector-search-functions)で確認できます。

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

**精度を落とした検索:**

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

12 ビット量子化では、クエリ実行を高速化しつつ、距離を良好に近似できていることに注目してください。相対的な順位付けは概ね維持されており、依然として &#39;apple&#39; が最も近い一致となっています。


#### パフォーマンス上の考慮事項 \{#qbit-performance\}

`QBit` のパフォーマンス上の利点は、より低い精度を使用した場合に、ストレージから読み取る必要のあるデータ量が減ることによる I/O 操作の削減から生じます。さらに、`QBit` に格納されているデータが `Float32` であり、`precision` パラメータが 16 以下の場合は、計算量が減ることによる追加のメリットも得られます。`precision` パラメータは、精度と速度のトレードオフを直接制御します。

- **精度が高い場合**（元のデータ幅に近い場合）: 結果はより正確だが、クエリは遅くなる
- **精度が低い場合**: 近似結果になるがクエリは高速になり、メモリ使用量も削減される

### 参考文献 \{#references\}

ブログ:

- [Vector Search with ClickHouse - Part 1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [Vector Search with ClickHouse - Part 2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
- [We built a vector search engine that lets you choose precision at query time](https://clickhouse.com/blog/qbit-vector-search)