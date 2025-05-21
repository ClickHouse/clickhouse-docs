---
description: 'Documentation for Exact and Approximate Nearest Neighbor Search'
keywords: ['vector similarity search', 'ann', 'knn', 'hnsw', 'indices', 'index', 'nearest neighbor']
sidebar_label: 'Exact and Approximate Nearest Neighbor Search'
slug: /engines/table-engines/mergetree-family/annindexes
title: 'Exact and Approximate Nearest Neighbor Search'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Exact および Approximate 最近傍検索

与えられたポイントの N 個の最も近いポイントを多次元（ベクトル）空間で見つける問題は [最近傍検索](https://en.wikipedia.org/wiki/Nearest_neighbor_search) として知られています。
最近傍検索を解決するための一般的なアプローチは二つあります：
- Exact 最近傍検索は、与えられたポイントとベクトル空間内のすべてのポイントとの距離を計算します。これにより、可能な限り最高の精度が保証され、すなわち返されるポイントは実際に最も近い隣人であることが保証されます。ベクトル空間が徹底的に探索されるため、Exact 最近傍検索は実際の使用にはあまりにも遅すぎることがあります。
- Approximate 最近傍検索は、特別なデータ構造（グラフやランダムフォレストなど）を用いて、Exact 最近傍検索よりもはるかに高速に結果を計算します。結果の精度は、実用的な使用には「十分良い」ことが一般的です。多くの近似技術は、結果の精度と検索時間のトレードオフを調整するためのパラメータを提供します。

最近傍検索（Exact または Approximate）は、SQL で次のように記述できます：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE 句はオプション
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内のポイントは、配列型のカラム `vectors` に格納されています。例としては、[Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) などがあります。
参照ベクトルは定数配列であり、共通テーブル式として与えられます。
`<DistanceFunction>` は、参照ポイントとすべての格納されたポイントとの距離を計算します。
この目的のために、利用可能な [距離関数](/sql-reference/functions/distance-functions) のいずれかを使用できます。
`<N>` は、返される隣人の数を指定します。

## Exact 最近傍検索 {#exact-nearest-neighbor-search}

Exact 最近傍検索は、上記の SELECT クエリをそのまま使用して実行できます。
そのようなクエリの実行時間は、一般に格納されたベクトルの数とその次元、すなわち配列要素の数に比例します。
さらに、ClickHouse はすべてのベクトルのブルートフォーススキャンを実行するため、実行時間はクエリによって使用されるスレッド数にも依存します（設定 [max_threads](../../../operations/settings/settings.md#max_threads) を参照）。

Exact 最近傍検索を高速化する一般的なアプローチの一つは、低精度の [float データ型](../../../sql-reference/data-types/float.md) を使用することです。
例えば、ベクトルが `Array(BFloat16)` として保存されている場合、`Array(Float32)` よりもデータサイズが半分に削減されるため、クエリの実行時間も半分に減少することが期待されます。
この方法は量子化として知られ、すべてのベクトルを徹底的にスキャンするにもかかわらず、結果の精度が低下する可能性があります。
精度の損失が許容されるかどうかはユースケースによって異なり、通常は実験が必要です。

### 例 {#exact-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

返される結果は次のとおりです：

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

## Approximate 最近傍検索 {#approximate-nearest-neighbor-search}

<BetaBadge/>

ClickHouse は Approximate 最近傍検索を実行するための特別な「ベクトル類似」インデックスを提供しています。

:::note
ベクトル類似インデックスは現在実験段階にあります。
これを有効にするには、まず `SET allow_experimental_vector_similarity_index = 1` を実行してください。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues)に問題を報告してください。
:::

### ベクトル類似インデックスの作成 {#creating-a-vector-similarity-index}

新しいテーブルにベクトル類似インデックスを次のように作成できます：

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

既存のテーブルにベクトル類似インデックスを追加するには：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

ベクトル類似インデックスは、特別な種類のスキッピングインデックスです（[ここ](mergetree.md#table_engine-mergetree-data_skipping-indexes)および [こちら](../../../optimize/skipping-indexes)を参照）。
これにより、上記の `ALTER TABLE` ステートメントは、今後テーブルに挿入される新しいデータに対してのみインデックスの作成を引き起こします。
既存のデータに対してもインデックスを構築するには、それを具現化する必要があります：

```sql
ALTER TABLE table MATERIALIZE <index_name> SETTINGS mutations_sync = 2;
```

関数 `<distance_function>` は次のものでなければなりません：
- `L2Distance`、[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)で、ユークリッド空間内の二つのポイント間の直線の長さを表します。または
- `cosineDistance`、[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)で、二つの非ゼロベクトル間の角度を表します。

正規化されたデータに対しては、通常 `L2Distance` が最良の選択肢です。それ以外の場合は、スケールを補うために `cosineDistance` が推奨されます。

`<dimensions>` は、基盤となるカラム内の配列の要素数を指定します。
ClickHouse がインデックス作成中に異なるカーディナリティを持つ配列を見つけた場合、インデックスは破棄され、エラーが返されます。

オプションの GRANULARITY パラメータ `<N>` は、インデックスのグラニュールサイズを指します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値は 1 億で、ほとんどのユースケースでは reasonably well 機能しますが、調整も可能です。
調整は、実行していることの意味を理解している上級ユーザーのみにお勧めします（[以下](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似インデックスは、異なる近似検索メソッドを格納できる一般的なものであり、実際に使用されるメソッドはパラメータ `<type>` で指定されます。
現在のところ、利用可能な唯一のメソッドは HNSW です（[学術論文](https://arxiv.org/abs/1603.09320)）、階層的近接グラフに基づく近似ベクトル検索のための人気かつ最先端の技術です。
HNSW がタイプとして使用される場合、ユーザーはさらに HNSW 特有のパラメータを指定することができます：

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

これらの HNSW 特有のパラメータは次の通りです：
- `<quantization>` は、近接グラフ内のベクトルの量子化を制御します。可能な値は `f64`、`f32`、`f16`、`bf16`、または `i8` です。デフォルト値は `bf16` です。このパラメータは、基盤となるカラム内のベクトルの表現には影響しないことに注意してください。
- `<hnsw_max_connections_per_layer>` は、グラフノードごとの隣接点の数、すなわち HNSW ハイパーパラメータ `M` を制御します。デフォルト値は `32` です。値 `0` はデフォルト値を使用することを意味します。
- `<hnsw_candidate_list_size_for_construction>` は、HNSW グラフの構築中に動的候補リストのサイズを制御します、これは HNSW ハイパーパラメータ `ef_construction` としても知られています。デフォルト値は `128` です。値 `0` はデフォルト値を使用することを意味します。

すべての HNSW 特有のパラメータのデフォルト値は、ほとんどのユースケースで reasonably well 機能します。
したがって、HNSW 特有のパラメータのカスタマイズはお勧めしません。

追加の制限も適用されます：
- ベクトル類似インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のカラムにのみ構築できます。`Array(Nullable(Float32))` や `Array(LowCardinality(Float32))` のような nullable およびローカーディナリティ float の配列は許可されていません。
- ベクトル類似インデックスは、単一のカラム上に構築されなければなりません。
- ベクトル類似インデックスは、計算式に基づいて構築することもできます（例えば、`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`）が、そのようなインデックスは後で近似隣接検索に使用することはできません。
- ベクトル類似インデックスは、基盤となるカラム内のすべての配列が `<dimension>` の要素を持っていることを要します - これはインデックス作成時にチェックされます。この要件の違反を早期に検出するために、ユーザーはベクトルカラムのために制約 [constraints](/sql-reference/statements/create/table.md#constraints) を追加できます。例えば、`CONSTRAINT same_length CHECK length(vectors) = 256` などです。
- 同様に、基盤となるカラム内の配列値は空であってはならず（`[]`）また、デフォルト値（`[]`）であってはなりません。

### ベクトル類似インデックスの使用 {#using-a-vector-similarity-index}

:::note
ベクトル類似インデックスを使用するには、設定 [compatibility](../../../operations/settings/settings.md) を `''`（デフォルト値）または `'25.1'` 以上に設定する必要があります。
:::

ベクトル類似インデックスは、次の形式の SELECT クエリをサポートします：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE 句はオプション
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse のクエリオプティマイザは、上記のクエリテンプレートに一致させ、利用可能なベクトル類似インデックスを使用しようとします。
クエリは、SELECT クエリ内の距離関数がインデックス定義内の距離関数と同じである場合にのみ、ベクトル類似インデックスを使用できます。

上級ユーザーは、設定 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（HNSW ハイパーパラメータ「ef_search」としても知られています）用にカスタム値を提供することができ、検索中の候補リストのサイズを調整できます（例：`SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
この設定のデフォルト値は 256 で、ほとんどのユースケースで良好に機能します。
設定値が高いほど、精度は向上しますが、パフォーマンスは低下します。

クエリがベクトル類似インデックスを使用できる場合、ClickHouse は SELECT クエリ内で提供された LIMIT `<N>` が適切な範囲内であるかを確認します。
具体的には、デフォルト値 100 の設定 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) の値よりも `<N>` が大きい場合、エラーが返されます。
LIMIT 値が大きすぎると、検索が遅くなり、通常は使用エラーを示します。

SELECT クエリがベクトル類似インデックスを使用しているかを確認するには、クエリの先頭に `EXPLAIN indexes = 1` を追加します。

例として、クエリ

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

は次のような結果を返す可能性があります：

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

この例では、[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 内の 100 万ベクトルが、次元 1536 で 575 のグラニュールに格納されており、すなわち 1.7k 行が各グラニュールにあります。
クエリは 10 個の隣人を要求し、ベクトル類似インデックスはこれら 10 個の隣人を 10 の異なるグラニュールで見つけます。
クエリ実行中にこれらの 10 グラニュールが読み込まれます。

出力が `Skip` を含む場合、ベクトル類似インデックスが使用されており、インデックスの名前とタイプ（この場合は `idx` および `vector_similarity`）が表示されます。
この場合、ベクトル類似インデックスは 4 つのグラニュールのうち 2 つをスキップしたことを示しており、すなわちデータの 50% です。
より多くのグラニュールをスキップできるほど、インデックスの使用はより効果的になります。

:::tip
インデックスの使用を強制するために、設定 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) でインデックス名を設定値として提供して SELECT クエリを実行できます。
:::

**ポストフィルタリングとプレフィルタリング**

ユーザーは、SELECT クエリに追加のフィルター条件を含む `WHERE` 句を指定することもできます。
ClickHouse は、ポストフィルタリングまたはプレフィルタリング戦略を使用してこれらのフィルター条件を評価します。
要約すると、両方の戦略はフィルターが評価される順序を決定します：
- ポストフィルタリングは、最初にベクトル類似インデックスが評価され、その後に ClickHouse が `WHERE` 句で指定された追加のフィルターを評価します。
- プレフィルタリングは、フィルター評価の順序が逆になります。

これらの戦略には異なるトレードオフがあります：
- ポストフィルタリングには、`LIMIT <N>` 句で要求された行数よりも少ない行が返される一般的な問題があります。この状況は、ベクトル類似インデックスによって返された結果の 1 行またはそれ以上が追加のフィルターを満たさなかった場合に発生します。
- プレフィルタリングは一般的には未解決の問題です。特定の専門のベクトルデータベースはプレフィルタリングアルゴリズムを提供していますが、ほとんどのリレーショナルデータベース（ClickHouse を含む）は、Exact 最近傍検索、すなわちインデックスなしでのブルートフォーススキャンにフォールバックします。

どの戦略が使用されるかはフィルター条件に依存します。

*追加のフィルターがパーティションキーの一部である場合*

追加のフィルター条件がパーティションキーの一部である場合、ClickHouse はパーティションプルーニングを適用します。
たとえば、テーブルが `year` カラムで範囲パーティション化されていて、次のクエリが実行されるとします：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse は 2025 年を除くすべてのパーティションをプルーニングします。

*追加のフィルターはインデックスで評価できない*

追加のフィルター条件がインデックスを使用して評価できない場合（プライマリーキーインデックス、スキッピングインデックスなど）、ClickHouse はポストフィルタリングを適用します。

*追加のフィルターはプライマリーキーインデックスで評価できる*

追加のフィルター条件が [プライマリーキー](mergetree.md#primary-key) を使用して評価できる場合（すなわち、それらがプライマリーキーのプレフィックスを形成する場合）で、
- フィルター条件がパート内の少なくとも 1 行を排除する場合、ClickHouse は残った範囲に対してプレフィルタリングにフォールバックします。
- フィルター条件がパート内の行を排除しない場合、ClickHouse はそのパートに対してポストフィルタリングを実行します。

実際のユースケースでは、後者の場合は非常に稀です。

*追加のフィルターはスキッピングインデックスで評価できる*

追加のフィルター条件が [スキッピングインデックス](mergetree.md#table_engine-mergetree_data_skipping_indexes)（最小最大インデックス、セットインデックスなど）を使用して評価できる場合、ClickHouse はポストフィルタリングを実行します。
この場合、ベクトル類似インデックスが最初に評価されるため、他のスキッピングインデックスに対して相対的に最も行を削除すると期待されます。

ポストフィルタリングとプレフィルタリングのより細かい制御には、2 つの設定を使用できます：

設定 [vector_search_filter_strategy](../../../operations/settings/settings.md#vector_search_filter_strategy) （デフォルト：`auto` は上記のヒューリスティクスを実装）を `prefilter` に設定できます。
これは、追加のフィルター条件が非常に選択的な場合にプレフィルタリングを強制するのに便利です。
例えば、次のクエリはプレフィルタリングから恩恵を受ける可能性があります：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

もし 2 ドル未満の本が非常に少ない場合、ポストフィルタリングは返される行数がゼロになるかもしれません。なぜなら、ベクトルインデックスによって返された上位 10 件の一致はすべて 2 ドルを超えている可能性があるためです。
プレフィルタリングを強制することで（`SETTINGS vector_search_filter_strategy = 'prefilter'` をクエリに追加すると）、ClickHouse は最初に 2 ドル未満のすべての本を見つけ、その後見つけた本のためにブルートフォースベクトル検索を実行します。

上記の問題を解決するための代替アプローチとして、設定 [vector_search_postfilter_multiplier](../../../operations/settings/settings.md#vector_search_postfilter_multiplier) （デフォルト：`1.0`）は、`1.0` より大きい値に設定できます（例えば、`2.0`）。 
ベクトルインデックスから取得する最近傍の数は設定値で乗算され、これらの行に追加のフィルターが適用されて LIMIT の数を返します。
もう一度クエリを実行しますが、乗算子を `3.0` に設定します：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_postfilter_multiplier = 3.0;
```

ClickHouse は各パートから 3.0 x 10 = 30 の最近傍をベクトルインデックスから取得し、その後追加のフィルターを評価します。
最終的には、最も近い 10 の行のみが返されます。
設定 `vector_search_postfilter_multiplier` は問題を緩和することができますが、極端な場合には（非常に選択的な WHERE 条件）、要求された行数よりも少ない行が返される可能性があることに注意してください。

### パフォーマンスチューニング {#performance-tuning}

**圧縮の調整**

ほとんどのユースケースでは、基盤となるカラム内のベクトルは密であり、うまく圧縮されません。
その結果、[圧縮](/sql-reference/statements/create/table.md#column_compression_codec) がベクトルカラムへの挿入と読み取りを遅くします。
したがって、圧縮を無効にすることをお勧めします。
それを行うには、ベクトルカラムに対して次のように `CODEC(NONE)` を指定します：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成の調整**

ベクトル類似インデックスのライフサイクルは、パートのライフサイクルに関連しています。
言い換えれば、定義されたベクトル類似インデックスを持つ新しいパートが作成されるたびに、インデックスも作成されます。
これは通常、データが [挿入された](https://clickhouse.com/docs/guides/inserting-data) 時か、[統合中](https://clickhouse.com/docs/merges) に発生します。
残念ながら、HNSW は長いインデックス作成時間が知られており、挿入と統合を大幅に遅くする可能性があります。
ベクトル類似インデックスは、データが不変であるか、めったに変更されない場合に理想的に使用されます。

インデックス作成を高速化するために、次の技術を使用できます：

まず、インデックス作成を並列化できます。
インデックス作成スレッドの最大数は、サーバー設定 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) を使用して構成できます。
最適なパフォーマンスのために、設定値は CPU コアの数に設定する必要があります。

次に、INSERT 文を高速化するために、ユーザーは新しく挿入されたパートに対するスキッピングインデックスの作成を無効にすることができます。この場合、セッション設定 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) を使用します。
そのようなパートの SELECT クエリは、Exact 検索にフォールバックします。
挿入されたパートは、テーブル全体のサイズと比較して小さい傾向があるため、そのパフォーマンスへの影響は無視できると期待されます。

三つ目に、マージを高速化するために、ユーザーはマージされたパートに対するスキッピングインデックスの作成を無効にすることができます。これは、セッション設定 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) を使用します。
これにより、[ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) ステートメントと組み合わせて、ベクトル類似インデックスのライフサイクルについて明示的な制御が可能となります。
例えば、すべてのデータが取り込まれるまで、または週末のようなシステム負荷が低い期間までインデックス作成を延期することができます。

**インデックス使用の調整**

SELECT クエリは、ベクトル類似インデックスを使用するために、それをメインメモリにロードする必要があります。
同じベクトル類似インデックスが繰り返しメインメモリにロードされるのを防ぐために、ClickHouse はそのようなインデックス用の専用インメモリキャッシュを提供します。
このキャッシュが大きいほど、不要なロードが減るでしょう。
最大キャッシュサイズは、サーバー設定 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) を使用して構成できます。
デフォルトでは、キャッシュは最大 5 GB まで成長可能です。

現在のベクトル類似インデックスキャッシュのサイズは [system.metrics](../../../operations/system-tables/metrics.md) に表示されます：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheSize'
```

クエリに対するキャッシュヒットとミスは [system.query_log](../../../operations/system-tables/query_log.md) から取得できます：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

プロダクションユースケースでは、すべてのベクトルインデックスが常にメモリに残るように、キャッシュサイズを十分に大きくすることをお勧めします。

### 管理と監視 {#administration}

ベクトル類似インデックスのディスク上のサイズは次のクエリで取得できます [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices)：

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

### 通常のスキッピングインデックスとの違い {#differences-to-regular-skipping-indexes}

すべての通常の [スキッピングインデックス](/optimize/skipping-indexes) と同様に、ベクトル類似インデックスはグラニュールに基づいて構築され、各インデックスブロックは `GRANULARITY = [N]` のグラニュール数で構成されます（通常のスキッピングインデックスのデフォルトは `[N]` = 1 です）。
たとえば、テーブルのプライマリーインデックスのグラニュールサイズが 8192（設定 `index_granularity = 8192`）で、`GRANULARITY = 2` の場合、各インデックスブロックは 16384 行を含むことになります。
ただし、近似隣接検索のためのデータ構造とアルゴリズムは固有に行指向です。
それらは行のセットの圧縮表現を保存し、ベクトル検索クエリのために行を返します。
このため、ベクトル類似インデックスの振る舞いは通常のスキッピングインデックスとはいくつかの直感に反する違いを生じます。

ユーザーがカラム上にベクトル類似インデックスを定義すると、ClickHouse は内部的に各インデックスブロックのためのベクトル類似「サブインデックス」を作成します。
サブインデックスは、その含まれるインデックスブロックの行のみを認識する「ローカル」なものです。
前述の例で、カラムに 65536 行があると仮定すると、4 つのインデックスブロック（8 グラニュールを spanning）と、それぞれのインデックスブロックに対するベクトル類似サブインデックスが取得されます。
理論的には、サブインデックスは、そのインデックスブロック内の N 個の最も近いポイントを持つ行を直接返すことができます。
しかし、ClickHouse はグラニュール単位でディスクからメモリにデータをロードするため、サブインデックスは一致する行をグラニュールのサイズに外挿します。
これは、通常のスキッピングインデックスがインデックスブロックのグラニュール単位でデータをスキップするのとは異なります。

`GRANULARITY` パラメータは、いくつのベクトル類似サブインデックスが作成されるかを決定します。
大きな `GRANULARITY` 値は、少ないが大きなベクトル類似サブインデックスを意味し、最終的にカラム（またはカラムのデータパート）が単一のサブインデックスのみを持つことになります。
その場合、サブインデックスはすべてのカラムの行を直接返す「グローバル」なビューを持ち、関連する行を持つカラム（パート）のすべてのグラニュールを返すことができます（最大で `LIMIT [N]` のグラニュール数です）。
次のステップで、ClickHouse はこれらのグラニュールを読み込んで、グラニュールのすべての行に対してブルートフォース距離計算を実行することで、実際に最も優れた行を特定します。
小さな `GRANULARITY` 値の場合、各サブインデックスは `LIMIT N` に関連する最大数のグラニュールを返します。
その結果、より多くのグラニュールをロードし、ポストフィルタリングを行う必要があります。
検索の精度は、いずれの場合も同様に高く、処理性能のみが異なります。
一般的には、ベクトル類似インデックス用に大きな `GRANULARITY` を使用し、ベクトル類似構造のメモリ消費が過剰な場合などの問題があった場合にのみ、小さな `GRANULARITY` 値にフォールバックすることが推奨されます。
ベクトル類似インデックスに対して `GRANULARITY` が指定されていない場合、デフォルト値は 1 億です。

### 例 {#approximate-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

返される結果は次のとおりです：

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

## 参考文献 {#references}

ブログ:
- [ClickHouseによるベクトル検索 - 第1部](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouseによるベクトル検索 - 第2部](https://clickhouse.com/blog/vector-search-clickhouse-p2)
