---
description: 'Documentation for Exact and Approximate Nearest Neighbor Search'
keywords:
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
sidebar_label: 'Exact and Approximate Nearest Neighbor Search'
slug: '/engines/table-engines/mergetree-family/annindexes'
title: 'Exact and Approximate Nearest Neighbor Search'
---

import BetaBadge from '@theme/badges/BetaBadge';



# 正確および近似最近傍検索

与えられた点に対して多次元（ベクトル）空間内のN個の最も近い点を見つける問題は、[最近傍検索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)として知られています。
最近傍検索を解決するための2つの一般的なアプローチがあります：
- 正確な最近傍検索は、与えられた点とベクトル空間内のすべての点との距離を計算します。これにより、最高の精度、すなわち返された点が実際の最近傍であることが保証されます。ベクトル空間を徹底的に探索するため、正確な最近傍検索は実世界での使用には遅すぎる場合があります。
- 近似最近傍検索は、結果をはるかに速く計算する技術（例えば、グラフやランダムフォレストなどの特殊なデータ構造）を指します。結果の精度は通常、「実用的には十分な」レベルです。多くの近似技術は、結果の精度と検索時間の間のトレードオフを調整するためのパラメータを提供します。

最近傍検索（正確または近似）は、次のようにSQLで記述できます：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE句はオプションです
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内の点は、配列型のカラム `vectors` に格納されています。例えば、 [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) のいずれかです。
参照ベクトルは定数配列であり、共通テーブル式として与えられます。
`<DistanceFunction>` は、参照点とすべての格納された点との間の距離を計算します。
そのために使用できる [距離関数](/sql-reference/functions/distance-functions) のいずれかを使用できます。
`<N>` は、返されるべき隣接点の数を指定します。

## 正確な最近傍検索 {#exact-nearest-neighbor-search}

正確な最近傍検索は、上記のSELECTクエリをそのまま使用して実行できます。
そのようなクエリの実行時間は、一般に格納されたベクトルの数と次元、すなわち配列要素の数に比例します。
また、ClickHouseはすべてのベクトルをブルートフォーススキャンするため、実行時間はクエリによるスレッド数にも依存します（設定 [max_threads](../../../operations/settings/settings.md#max_threads) を参照）。

正確な最近傍検索を高速化するための一般的なアプローチの1つは、低精度の [floatデータ型](../../../sql-reference/data-types/float.md) を使用することです。
例えば、ベクトルが `Array(BFloat16)` として格納されている場合、`Array(Float32)` の代わりに、データサイズは半分にカットされ、クエリの実行時間も半分に減少すると予想されます。
この方法は量子化として知られており、すべてのベクトルの徹底的なスキャンにもかかわらず、結果の精度を低下させる可能性があります。
精度の損失が許容できるかどうかは使用ケースによりますが、通常は実験を要します。

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

は以下を返します：

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

## 近似最近傍検索 {#approximate-nearest-neighbor-search}

<BetaBadge/>

ClickHouseは、近似最近傍検索を実行するための特別な「ベクトル類似性」インデックスを提供します。

:::note
ベクトル類似性インデックスは現在実験的です。
それを有効にするには、最初に `SET allow_experimental_vector_similarity_index = 1` を実行してください。
問題が発生した場合は、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/issues) で問題を報告してください。
:::

### ベクトル類似性インデックスの作成 {#creating-a-vector-similarity-index}

新しいテーブルにベクトル類似性インデックスを作成するには、次のようにします：

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

既存のテーブルにベクトル類似性インデックスを追加するには：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

ベクトル類似性インデックスは、特別な種類のスキッピングインデックスです（[こちら](mergetree.md#table_engine-mergetree-data_skipping-indexes) および [こちら](../../../optimize/skipping-indexes)を参照）。 
そのため、上記の `ALTER TABLE` 文は、テーブルに新しく挿入されたデータに対してのみインデックスを作成します。
既存のデータのインデックスを作成するには、それをマテリアライズする必要があります：

```sql
ALTER TABLE table MATERIALIZE <index_name> SETTINGS mutations_sync = 2;
```

関数 `<distance_function>` は次のものでなければなりません：
- `L2Distance` 、[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)で、ユークリッド空間内の二つの点間の直線の長さを表します、または
- `cosineDistance` 、[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)で、二つの非零ベクトル間の角度を表します。

正規化されたデータの場合、`L2Distance`が通常の最適選択です。そうでない場合は、スケールを補正するために`cosineDistance`を推奨します。

`<dimensions>`は、基になるカラムにおける配列の基数（要素の数）を指定します。
ClickHouseがインデックス作成中に異なる基数の配列を見つけた場合、インデックスは破棄され、エラーが返されます。

オプションのGRANULARITYパラメータ `<N>` は、インデックス粒度のサイズを指します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値は1億で、ほとんどの使用ケースでは合理的にうまく機能しますが、調整も可能です。
高度なユーザーのみが調整することをお勧めします。調整の影響を理解しているユーザーのみが行うべきです（[以下](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似性インデックスは、異なる近似検索方法に対応できる汎用性を持っています。
実際に使用される方法は、パラメータ `<type>` で指定されます。
現在のところ、唯一の利用可能な方法はHNSW（[学術論文](https://arxiv.org/abs/1603.09320)）、階層的近接グラフに基づく近似ベクトル検索のための人気のあり、最先端の技術です。
タイプとしてHNSWが使用される場合、ユーザーはさらにHNSW専用のパラメータを任意で指定できます：

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

これらのHNSW専用パラメータは次のものがあります：
- `<quantization>` は、近接グラフ内のベクトルの量子化を制御します。可能な値は `f64`、`f32`、`f16`、`bf16`、または `i8` です。デフォルト値は `bf16` です。このパラメータは基盤となるカラム内のベクトルの表現に影響を与えません。
- `<hnsw_max_connections_per_layer>` は、グラフノードごとの隣接点の数を制御します。これはHNSWのハイパーパラメータ `M` でも知られています。デフォルト値は `32` です。値 `0` はデフォルト値を使用することを意味します。
- `<hnsw_candidate_list_size_for_construction>` は、HNSWグラフ構築時の動的候補リストのサイズを制御します。これはHNSWのハイパーパラメータ `ef_construction` でも知られています。デフォルト値は `128` です。値 `0` はデフォルト値を使用することを意味します。

すべてのHNSW専用パラメータのデフォルト値は、ほとんどの使用ケースで合理的にうまく機能します。
したがって、HNSW専用パラメータをカスタマイズすることはお勧めしません。

さらに、以下の制限が適用されます：
- ベクトル類似性インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のカラムでのみ作成できます。`Array(Nullable(Float32))` や `Array(LowCardinality(Float32))` のようなNullableや低基数のfloatの配列は許可されていません。
- ベクトル類似性インデックスは、単一のカラムにのみ作成する必要があります。
- ベクトル類似性インデックスは計算式で作成できます（例：`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`）、ただし、そのようなインデックスは後で近似隣接検索に使用できません。
- ベクトル類似性インデックスは、基になるカラムのすべての配列が `<dimension>` 多くの要素を持っている必要があります - これはインデックス作成時に確認されます。この要件の違反を早く検出するために、ユーザーはベクトルカラムに制約を追加できます。例えば、`CONSTRAINT same_length CHECK length(vectors) = 256` のようにします。
- 同様に、基になるカラムの配列値は空（`[]`）であってはならず、デフォルト値（同じく `[]`）を持つこともできません。

### ベクトル類似性インデックスの使用 {#using-a-vector-similarity-index}

:::note
ベクトル類似性インデックスを使用するには、設定 [compatibility](../../../operations/settings/settings.md) を `''`（デフォルト値）または `'25.1'` 以上にする必要があります。
:::

ベクトル類似性インデックスは、次の形式のSELECTクエリをサポートしています：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE句はオプションです
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouseのクエリオプティマイザは、上記のクエリテンプレートに一致させ、利用可能なベクトル類似性インデックスを使用しようとします。
クエリは、SELECTクエリの距離関数がインデックス定義内の距離関数と同じである場合にのみ、ベクトル類似性インデックスを使用できます。

高度なユーザーは、設定 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)（HNSWのハイパーパラメータ「ef_search」としても知られています）に対するカスタム値を提供して、検索中の候補リストのサイズを調整することができます（例：`SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
デフォルト値の設定256はほとんどの使用ケースでうまく機能します。
設定値を大きくするほど、パフォーマンスが遅くなる代わりに精度が向上します。

クエリがベクトル類似性インデックスを使用できる場合、ClickHouseはSELECTクエリで提供されたLIMIT `<N>` が合理的な範囲内であることを確認します。
具体的には、LIMIT `<N>` がデフォルト値100の設定 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) よりも大きい場合、エラーが返されます。
過度に大きなLIMIT値は検索を遅くし、通常は使用エラーを示します。

SELECTクエリがベクトル類似性インデックスを使用しているかどうかを確認するには、クエリの先頭に `EXPLAIN indexes = 1` を追加します。

例えば、クエリ

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

は次のように返される場合があります：

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

この例では、[dbpediaデータセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) に含まれる100万のベクトルが、各1536次元で575のグラニュールに格納されています。クエリは10個の近傍を求めており、ベクトル類似性インデックスはこれら10個の近傍を10個の異なるグラニュールで見つけます。
これら10のグラニュールは、クエリ実行中に読み込まれます。

出力に `Skip` とベクトルインデックスの名前とタイプ（この例では `idx` と `vector_similarity`）が含まれている場合、ベクトル類似性インデックスが使用されたことを示します。
この場合、ベクトル類似性インデックスは4つのグラニュールのうち2つをスキップしました。すなわち、データの50％を削減しました。
より多くのグラニュールを削除できるほど、インデックスの使用が効果的になります。

:::tip
インデックスの使用を強制するには、設定 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) を使用してSELECTクエリを実行できます（設定値としてインデックス名を指定してください）。
:::

**ポストフィルタリングおよびプレフィルタリング**

ユーザーは、SELECTクエリに追加のフィルタ条件を指定するために `WHERE` 句をオプションで指定できます。
ClickHouseはこれらのフィルタ条件をポストフィルタリングまたはプレフィルタリング戦略を使用して評価します。
簡単に言えば、両方の戦略は、フィルタが評価される順序を決定します：
- ポストフィルタリングは、最初にベクトル類似性インデックスが評価され、その後ClickHouseが `WHERE` 句で指定された追加のフィルタを評価します。
- プレフィルタリングは、フィルタ評価の順序がその逆になります。

これらの戦略には異なるトレードオフがあります：
- ポストフィルタリングには、`LIMIT <N>` 句で要求された行数未満を返す可能性があるという一般的な問題があります。この状況は、ベクトル類似性インデックスによって返された1つ以上の結果行が追加フィルタを満たさないときに発生します。
- プレフィルタリングは、一般的に未解決の問題です。特定の専門化されたベクトルデータベースは、プレフィルタリングアルゴリズムを提供しますが、ほとんどのリレーショナルデータベース（ClickHouseを含む）は、正確な隣接検索、すなわちインデックスなしのブルートフォーススキャンに戻ります。

使用される戦略は、フィルタ条件によって決まります。

*追加のフィルタはパーティションキーの一部*

追加のフィルタ条件がパーティションキーの一部である場合、ClickHouseはパーティションプルーニングを適用します。
例えば、テーブルが列 `year` で範囲パーティションされていて、次のクエリが実行される場合を考えます：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouseは2025年のパーティションを除いてすべてのパーティションをプルーニングします。

*追加のフィルタはインデックスを使用して評価できません*

追加のフィルタ条件がインデックス（主キーインデックス、スキッピングインデックス）を使用して評価できない場合、ClickHouseはポストフィルタリングを適用します。

*追加のフィルタは主キーインデックスを使用して評価できます*

追加のフィルタ条件が[主キー](mergetree.md#primary-key)を使用して評価できる場合（つまり、主キーのプレフィックスを形成する場合）、
- フィルタ条件がパート内の少なくとも1行を除外する場合、ClickHouseはパート内の「生き残った」範囲に対してプレフィルタリングに戻ります。
- フィルタ条件がパート内に行を除外しない場合、ClickHouseはそのパートに対してポストフィルタリングを実行します。

実際の使用ケースでは、後者のケースは相当考えにくいです。

*追加のフィルタはスキッピングインデックスを使用して評価できます*

追加のフィルタ条件が[スキッピングインデックス](mergetree.md#table_engine-mergetree_data_skipping_indexes)を使用して評価できる場合（最小最大インデックス、セットインデックスなど）、Clickhouseはポストフィルタリングを実行します。
そのような場合、ベクトル類似性インデックスは、他のスキッピングインデックスと比較して最も多くの行を削除すると期待されるため、最初に評価されます。

ポストフィルタリングとプレフィルタリングの細かな制御には、2つの設定が使用できます：

設定 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy)（デフォルト：`auto`、上記のヒューリスティックスを実装）は `prefilter` に設定できます。
これは、追加のフィルタ条件が非常に選択的な場合、プレフィルタリングを強制するために便利です。
例えば、次のクエリはプレフィルタリングから利益を得る可能性があります：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

もし2ドル未満の本が非常に少数しか存在しないと仮定すると、ポストフィルタリングは結果としてゼロ行を返す可能性があります。なぜなら、ベクトルインデックスが返す上位10の一致がすべて2ドル以上の価格だった可能性があるからです。
プレフィルタリングを強制することで（クエリに`SETTINGS vector_search_filter_strategy = 'prefilter'`を追加）、ClickHouseは価格が2ドル未満のすべての本をまず見つけ、その後で発見した本に対してブルートフォースベクトル検索を実行します。

上記の問題を解決するための別のアプローチとして、設定 [vector_search_postfilter_multiplier](../../../operations/settings/settings.md#vector_search_postfilter_multiplier)（デフォルト：`1.0`）を `1.0` より大きい値に設定することができます（例：`2.0`）。
ベクトルインデックスから取得する最近傍の数が設定値で乗算され、その後、それらの行に追加フィルタが適用されてLIMIT多くの行が返されます。
例えば、もう一度クエリを実行して、乗算子を `3.0` に設定してみましょう：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_postfilter_multiplier = 3.0;
```

ClickHouseは各パートから3.0 x 10 = 30の最近傍をベクトルインデックスから取得し、その後に追加のフィルタを評価します。
最も近い10の隣接点のみが返されます。
`vector_search_postfilter_multiplier` 設定は問題を軽減できますが、極端なケース（非常に選択的なWHERE条件）では、返される行数がN未満である可能性が依然として残ります。

### パフォーマンス調整 {#performance-tuning}

**圧縮の調整**

ほとんどの使用ケースでは、基盤となるカラム内のベクトルは密であり、圧縮しづらいです。
その結果、[圧縮](/sql-reference/statements/create/table.md#column_compression_codec)は、ベクトルカラムへの挿入や読み込みを遅くします。
したがって、圧縮を無効にすることをお勧めします。
そのためには、ベクトルカラムに `CODEC(NONE)` を指定します：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成の調整**

ベクトル類似性インデックスのライフサイクルは、パーツのライフサイクルに関連しています。
言い換えれば、定義されたベクトル類似性インデックスがある新しいパートが作成されるたびに、そのインデックスも作成されます。
これは通常、データが[挿入](https://clickhouse.com/docs/guides/inserting-data)されたときや、[マージ](https://clickhouse.com/docs/merges)中に発生します。
残念ながら、HNSWは長いインデックス作成時間で知られており、これが挿入やマージを著しく遅くすることがあります。
ベクトル類似性インデックスは、データが不変またはめったに変更されない場合にのみ理想的に使用されるべきです。

インデックス作成を高速化するために、次の技術を使用できます：

まず、インデックス作成を並列化できます。
インデックス作成スレッドの最大数は、サーバーの設定 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) を使用して構成できます。
最適なパフォーマンスを得るには、設定値をCPUコア数に構成することが推奨されます。

次に、INSERT文の速度向上のために、セッション設定 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert) を使用して新しく挿入されたパーツでのスキッピングインデックスの作成を無効にできます。
そのようなパーツに対するSELECTクエリは、正確な検索に戻ります。
挿入されたパーツは通常、テーブル全体に対して小さいため、その影響は微小であると予想されます。

第三に、マージを高速化するために、セッション設定 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)を使用してマージされたパーツでのスキッピングインデックスの作成を無効にできます。
これは、ステートメント [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) と組み合わせることで、ベクトル類似性インデックスのライフサイクルを明示的に制御します。
例えば、インデックス作成をすべてのデータが取り込まれるまで、またはシステムの負荷が少ない期間（土曜日など）まで延期できます。

**インデックスの使用調整**

SELECTクエリは、ベクトル類似性インデックスを使用するために、それをメインメモリにロードする必要があります。
同じベクトル類似性インデックスが繰り返しメインメモリにロードされないようにするため、ClickHouseはそのようなインデックス用の専用インメモリキャッシュを提供しています。
このキャッシュのサイズが大きいほど、不要なロードは少なくなります。
最大キャッシュサイズは、サーバー設定 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) を使用して構成できます。
デフォルトでは、キャッシュは最大5GBに成長できます。

ベクトル類似性インデックスキャッシュの現在のサイズは、[system.metrics](../../../operations/system-tables/metrics.md) で表示されます：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheSize'
```

特定のクエリIDに対するクエリのキャッシュヒットおよびミスは、[system.query_log](../../../operations/system-tables/query_log.md) から取得できます：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

本番使用ケースでは、すべてのベクトルインデックスが常にメモリ内に保持されるようにキャッシュのサイズを大きくすることをお勧めします。

### 管理と監視 {#administration}

ディスク上のベクトル類似性インデックスのサイズは、[system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) から取得できます：

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

すべての通常の[スキッピングインデックス](/optimize/skipping-indexes)と同様に、ベクトル類似性インデックスはグラニュールに対して構築され、各インデックスブロックは `GRANULARITY = [N]` のグラニュールから構成されています（通常のスキッピングインデックスのデフォルトは `[N] = 1`）。
例えば、テーブルの主インデックス粒度が8192（設定 `index_granularity = 8192`）で、`GRANULARITY = 2` の場合、各インデックスブロックは16384行を含みます。
しかし、近似隣接検索のためのデータ構造やアルゴリズムは本質的に行指向です。
それらは行のセットのコンパクトな表現を格納し、またベクトル検索クエリのために行を返します。
これは、通常のスキッピングインデックスに比べて、ベクトル類似性インデックスの動作にいくつかの非常に直感的でない違いを引き起こします。

ユーザーがカラムにベクトル類似性インデックスを定義すると、ClickHouseは内部的に各インデックスブロックに対してベクトル類似性「サブインデックス」を作成します。
サブインデックスは、その含まれるインデックスブロック内の行についてのみ知識を持つ「ローカル」なものです。
前述の例で、カラムが65536行を有する場合、4つのインデックスブロック（8つのグラニュールをまたがっています）が得られ、各インデックスブロックに対してベクトル類似性サブインデックスが作成されます。
サブインデックスは理論上、そのインデックスブロック内で最も近いN個のポイントを直接返すことができます。
しかし、ClickHouseはグラニュールの粒度でディスクからメモリにデータをロードするため、サブインデックスは一致する行をグラニュールの粒度まで外挿します。
これは、インデックスブロックの粒度でデータをスキップする通常のスキッピングインデックスとは異なります。

`GRANULARITY` パラメータは、どのくらいの数のベクトル類似性サブインデックスが作成されるかを決定します。
大きな `GRANULARITY` 値は、ベクトル類似性サブインデックスの数を減らし、逆に大きくします。
その結果、サブインデックスが1つしか持たなくなるまでになります。そうすると、そのサブインデックスは全てのカラム行に対して「グローバル」な見方を持つことになり、関連する行を持つカラム（部分）の全グラニュールを直接返すことができます（関連する行を持つグラニュールはせいぜい `LIMIT [N]` までです）。
次のステップでは、ClickHouseがこれらのグラニュールをロードし、グラニュール内のすべての行に対してブルートフォース距離計算を実行し、実際に最も良い行を特定します。
小さな `GRANULARITY` 値では、各サブインデックスが最大 `LIMIT N` 個のグラニュールを返します。
その結果、より多くのグラニュールをロードして、ポストフィルタリングを実行する必要があります。
両ケースで検索精度は同等に良好ですが、処理性能が異なります。
近似検索には一般的に大きな `GRANULARITY` を使用することが推奨され、ベクトル類似性構造体が過剰にメモリを消費する場合にのみ小さな `GRANULARITY` 値に戻ります。
ベクトル類似性インデックスに対して `GRANULARITY` が指定されていない場合、デフォルト値は1億です。

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

は以下を返します：

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

## 参考文献 {#references}

ブログ：
- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
