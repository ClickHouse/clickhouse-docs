---
'description': 'Exact and Approximate Vector Searchのドキュメント'
'keywords':
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
- 'vector search'
'sidebar_label': '正確なおよび近似ベクトル検索'
'slug': '/engines/table-engines/mergetree-family/annindexes'
'title': '正確なおよび近似ベクトル検索'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 正確および近似ベクトル検索

与えられた点に対して多次元（ベクトル）空間で最も近い N 個の点を見つける問題は、[最近傍検索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)として知られており、短く言うとベクトル検索です。
ベクトル検索を解決するための一般的なアプローチは2つあります。
- 正確なベクトル検索は、与えられた点とベクトル空間内のすべての点との間の距離を計算します。これにより、最も高い精度が保証され、返された点が実際の最近傍であることが保証されます。ベクトル空間が徹底的に探索されるため、正確なベクトル検索は実世界での使用には遅すぎる場合があります。
- 近似ベクトル検索は、特別なデータ構造（例えば、グラフやランダムフォレストのような）を使用する技術群を指し、正確なベクトル検索よりも遥かに高速に結果を計算します。結果の精度は通常、実用的な使用には「十分良い」です。多くの近似技術は、結果の精度と検索時間のトレードオフを調整するためのパラメータを提供します。

ベクトル検索（正確または近似）は、次のように SQL で記述できます：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内の点は、型が配列のカラム `vectors` に格納されます。例えば、[Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md)です。
参照ベクトルは定数配列であり、一般的なテーブル式として与えられます。
`<DistanceFunction>` は、参照点とすべての保存された点との距離を計算します。
そのためには、利用可能な任意の[距離関数](/sql-reference/functions/distance-functions)を使用できます。
`<N>` は、返すべき近傍の数を指定します。
## 正確なベクトル検索 {#exact-nearest-neighbor-search}

正確なベクトル検索は、上記の SELECT クエリをそのまま使用して実行できます。
そのようなクエリの実行時間は、一般的に保存されたベクトルの数とその次元、つまり配列の要素数に比例します。
また、ClickHouse はすべてのベクトルをブルートフォーススキャンするため、実行時間はクエリによるスレッドの数にも依存します（設定 [max_threads](../../../operations/settings/settings.md#max_threads) を参照）。
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

returns

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```
## 近似ベクトル検索 {#approximate-nearest-neighbor-search}
### ベクトル類似インデックス {#vector-similarity-index}

ClickHouse は、近似ベクトル検索を行うための特別な「ベクトル類似」インデックスを提供します。

:::note
ベクトル類似インデックスは、ClickHouse バージョン 25.8 以上で利用可能です。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues)で問題を開いてください。
:::
#### ベクトル類似インデックスの作成 {#creating-a-vector-similarity-index}

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

ベクトル類似インデックスは、特別なタイプのスキッピングインデックスです（[こちら](mergetree.md#table_engine-mergetree-data_skipping-indexes)および[こちら](../../../optimize/skipping-indexes)を参照）。
したがって、上記の `ALTER TABLE` 文は、テーブルに挿入された将来の新しいデータのためにインデックスを構築するだけです。
既存のデータのインデックスを構築するには、マテリアライズする必要があります：

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

関数 `<distance_function>` は次のものでなければなりません。
- `L2Distance`、[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)で、ユークリッド空間における2点間の直線の長さを表します。
または
- `cosineDistance`、[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)で、2つのゼロでないベクトル間の角度を表します。

正規化されたデータの場合、通常は `L2Distance` が最良の選択ですが、そうでない場合は `cosineDistance` がスケールを補うために推奨されます。

`<dimensions>` は、基になるカラムにおける配列のカーディナリティ（要素の数）を指定します。
ClickHouse がインデックス作成中に異なるカーディナリティの配列を見つけた場合、インデックスは破棄され、エラーが返されます。

オプションの GRANULARITY パラメータ `<N>` は、インデックスのグラニュールのサイズを示します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値 1 億は、ほとんどのユースケースで合理的に機能するはずですが、調整することもできます。
調整は、実行していることの影響を理解している上級者のみが行うことをお勧めします（[以下](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似インデックスは、異なる近似検索方法に対応できる一般的なものである。
実際に使用される方法は、パラメータ `<type>` によって指定されます。
現在のところ、利用可能な唯一の方法は HNSW です（[学術論文](https://arxiv.org/abs/1603.09320)）、これは階層 proximity グラフに基づく近似ベクトル検索のための人気のある最先端技術です。
HNSW がタイプとして使用される場合、ユーザーは追加の HNSW 特有のパラメータを指定することができます：

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

これらの HNSW 特有のパラメータは次のとおりです：
- `<quantization>` は、近接グラフ内のベクトルの量子化を制御します。可能な値は `f64`、`f32`、`f16`、`bf16`、`i8`、または `b1` です。デフォルト値は `bf16` です。このパラメータは、基になるカラム内のベクトルの表現には影響を与えませんので注意してください。
- `<hnsw_max_connections_per_layer>` は、グラフノードごとの隣接数、HNSW ハイパーパラメータ `M` とも呼ばれます。デフォルト値は `32` です。値 `0` はデフォルト値を使用することを意味します。
- `<hnsw_candidate_list_size_for_construction>` は、HNSW グラフの構築中の動的候補リストのサイズを制御します。HNSW ハイパーパラメータ `ef_construction` とも呼ばれます。デフォルト値は `128` です。値 `0` はデフォルト値を使用することを意味します。

すべての HNSW 特有のパラメータのデフォルト値は、ほとんどのユースケースで合理的に良好に機能します。
したがって、HNSW 特有のパラメータをカスタマイズすることはお勧めしません。

さらに制限があります：
- ベクトル類似インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のカラムにのみ構築できます。`Array(Nullable(Float32))` や `Array(LowCardinality(Float32))` のような Nullable と低カーディナリティの浮動小数点の配列は許可されていません。
- ベクトル類似インデックスは、単一のカラム上に構築する必要があります。
- ベクトル類似インデックスは、計算式（例：`INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`）上に作成できますが、そのようなインデックスは後で近似近傍検索に使用できません。
- ベクトル類似インデックスは、基になるカラム内のすべての配列が `<dimension>` 個の要素を持つ必要があります - これはインデックス作成中に確認されます。この要件の違反をできるだけ早く検出するには、ユーザーはベクトルカラムに対して[制約](/sql-reference/statements/create/table.md#constraints)を追加できます。例えば、`CONSTRAINT same_length CHECK length(vectors) = 256`のように。
- 同様に、基になるカラム内の配列値は空であってはならず（`[]`）、デフォルト値を持ってはいけません（同様に `[]`）。

**ストレージとメモリ消費の見積もり**

典型的な AI モデル（例：大規模言語モデル、[LLMs](https://en.wikipedia.org/wiki/Large_language_model)）で使用されるベクトルは、数百または数千の浮動小数点値で構成されています。
そのため、単一のベクトル値は、複数キロバイトのメモリ消費を持つ可能性があります。
ユーザーは、テーブル内の基になるベクトルカラムに必要なストレージを見積もるために、以下の2つの公式を使用できます：

テーブル内のベクトルカラムのストレージ消費（非圧縮）：

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)の例：

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

ベクトル類似インデックスは、検索を行うためにディスクからメインメモリに完全に読み込む必要があります。
同様に、ベクトルインデックスもメモリ内に完全に構築されてからディスクに保存されます。

ベクトルインデックスを読み込むのに必要なメモリ消費：

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)の例：

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

上記の公式は、ベクトル類似インデックスがランタイムデータ構造（プレアロケートバッファやキャッシュなど）を割り当てるために必要な追加のメモリを考慮していません。
#### ベクトル類似インデックスの使用 {#using-a-vector-similarity-index}

:::note
ベクトル類似インデックスを使用するには、設定 [compatibility](../../../operations/settings/settings.md) が `''`（デフォルト値）、または `'25.1'` 以上である必要があります。
:::

ベクトル類似インデックスは、この形式の SELECT クエリをサポートします：

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse のクエリオプティマイザは、上記のクエリテンプレートと対応し、利用可能なベクトル類似インデックスを利用しようとします。
クエリは、SELECT クエリ内の距離関数がインデックス定義内の距離関数と同じである場合にのみ、ベクトル類似インデックスを使用できます。

上級ユーザーは、検索中に候補リストのサイズを調整するために設定 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search) のカスタム値を提供できます（HNSW ハイパーパラメータ「ef_search」とも呼ばれます）（例：`SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`）。
設定のデフォルト値 256 は、ほとんどのユースケースでうまく機能します。
設定値を高くすると、性能が遅くなることを代償に、より良い精度が得られます。

クエリがベクトル類似インデックスを使用できる場合、ClickHouse は SELECT クエリ内に提供された LIMIT `<N>` が合理的な範囲内にあることを確認します。
より具体的には、エラーは `<N>` が設定 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) の値（デフォルト値 100）を超える場合に返されます。
大きすぎる LIMIT 値は検索を遅くし、通常は使用エラーを示します。

SELECT クエリがベクトル類似インデックスを使用しているかどうかをチェックするには、クエリに `EXPLAIN indexes = 1` をプレフィックスとして付加できます。

例えば、クエリ

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

may return

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

この例では、[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)に1百万のベクトルがあり、各ベクトルの次元は1536で、575のグラニュールに格納されています。すなわち、各グラニュールには1.7k行があります。
このクエリは10個の近傍を求め、ベクトル類似インデックスはこれらの10個の近傍を10の異なるグラニュールで見つけます。
これらの10のグラニュールは、クエリ実行中に読み取られます。

出力に `Skip` とベクトルインデックスの名前とタイプ（この例では `idx` と `vector_similarity`）が含まれている場合、ベクトル類似インデックスが使用されています。
この場合、ベクトル類似インデックスは4つのグラニュールのうち2つをドロップしました。つまり、50%のデータです。
ドロップされるグラニュールが多いほど、インデックスの使用が効果的になります。

:::tip
インデックスの使用を強制するには、設定 [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) を使用して SELECT クエリを実行できます（インデックス名を設定値として提供します）。
:::

**ポストフィルタリングとプレフィルタリング**

ユーザーは、SELECT クエリに追加のフィルタ条件を指定する `WHERE` 句をオプションで指定できます。
ClickHouse は、ポストフィルタリングまたはプレフィルタリング戦略を使用して、これらのフィルタ条件を評価します。
簡単に言うと、両方の戦略はフィルタが評価される順序を決定します：
- ポストフィルタリングは、最初にベクトル類似インデックスが評価され、その後に ClickHouse が `WHERE` 句で指定された追加のフィルタを評価することを意味します。
- プレフィルタリングは、フィルタ評価の順序が逆になることを意味します。

これらの戦略には異なるトレードオフがあります：
- ポストフィルタリングには、一般的な問題として `LIMIT <N>` 句で要求された行数よりも少ない行を返す可能性があります。この状況は、ベクトル類似インデックスによって返された1つ以上の結果行が、追加のフィルタを満たさない場合に発生します。
- プレフィルタリングは、一般的に未解決の問題です。特定の専門のベクトルデータベースはプレフィルタリングアルゴリズムを提供しますが、ほとんどのリレーショナルデータベース（ClickHouseを含む）は、正確な近傍検索、すなわちインデックスなしのブルートフォーススキャンに戻ります。

どの戦略が使われるかはフィルタ条件によります。

*追加のフィルタがパーティションキーの一部である場合*

追加のフィルタ条件がパーティションキーの一部である場合、ClickHouse はパーティションプルーニングを適用します。
例えば、テーブルが `year` カラムで範囲パーティションされていて、次のクエリが実行されるとします：

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse は2025年以外のすべてのパーティションをプルーニングします。

*追加のフィルタがインデックスを使用して評価できない場合*

追加のフィルタ条件がインデックス（主キーインデックス、スキッピングインデックス）を使用して評価できない場合、ClickHouse はポストフィルタリングを適用します。

*追加のフィルタが主キーインデックスを使用して評価できる場合*

追加のフィルタ条件が[主キー](mergetree.md#primary-key)（つまり、主キーの接頭辞を形成する場合）を使用して評価できる場合、
- フィルタ条件が部分内の少なくとも1行を排除する場合、ClickHouse は部分内の「生き残った」範囲に対してプレフィルタリングに戻ります。
- フィルタ条件が部分内の行を排除しない場合、ClickHouse は部分に対してポストフィルタリングを実行します。

実用的なユースケースでは、後者の場合はかなりまれです。

*追加のフィルタがスキッピングインデックスを使用して評価できる場合*

追加のフィルタ条件が[スキッピングインデックス](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax インデックス、set インデックスなど）を使用して評価できる場合、Clickhouse はポストフィルタリングを実行します。
この場合、ベクトル類似インデックスが最初に評価され、他のスキッピングインデックスに対して相対的に最も多くの行を削除すると期待されます。

ポストフィルタリングとプレフィルタリングに対して細かな制御を行うには、次の2つの設定を使用できます：

設定 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy)（デフォルト：`auto` は上記のヒューリスティクスを実装しています）は、`prefilter` に設定できます。
これは、追加のフィルタ条件が非常に選択的なケースでプレフィルタリングを強制するのに役立ちます。
例えば、次のクエリはプレフィルタリングから利益を得られるかもしれません：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

例えば、2ドル未満で販売されている書籍が非常に少数でしかないと仮定すると、ポストフィルタリングは、ベクトルインデックスによって返された上位10の一致がすべて2ドルを超えている可能性があるため、0行を返すことがあります。
プレフィルタリングを強制することによって（`SETTINGS vector_search_filter_strategy = 'prefilter'`をクエリに追加）、ClickHouse は最初に2ドル未満の価格のすべての書籍を見つけ、その後見つかった書籍に対してブルートフォースベクトル検索を実行します。

この問題を解決する別のアプローチとして、設定 [vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（デフォルト：`1.0`、最大：`1000.0`）を `1.0` より高い値（例えば `2.0`）に設定できます。
ベクトルインデックスから取得される最近傍の数は設定値によって乗算され、その後これらの行に適用される追加のフィルタが適用されてLIMIT多くの行が返されます。
例えば、もう一度クエリをすることができますが、乗算器 `3.0` を使用して：

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse は、各部分から3.0 x 10 = 30の最近傍をベクトルインデックスから取得し、その後追加のフィルタを評価します。
最も近い10の近傍のみが返されます。
設定 `vector_search_index_fetch_multiplier` は問題を緩和できますが、極端なケース（非常に選択的な WHERE 条件）では、N リクエストされた行数未満が返されることがあります。

**再スコアリング**

ClickHouse のスキップインデックスは、通常、グラニュールレベルでフィルタリングを行います。つまり、スキップインデックスでのルックアップ（内部的に）は、次のスキャンで読み取られるデータの数を減らす潜在的に一致するグラニュールのリストを返します。
これは一般的なスキップインデックスにはうまく機能しますが、ベクトル類似インデックスの場合、「グラニュラリティミスマッチ」を引き起こします。
より詳細には、ベクトル類似インデックスは、与えられた参照ベクトルに対して最も類似している N のベクトルの行番号を決定しますが、その後、これらの行番号をグラニュール番号に推定する必要があります。
ClickHouse はその後、これらのグラニュールをディスクから読み込み、これらのグラニュール内のすべてのベクトルに対して距離計算を繰り返します。
この手順は再スコアリングと呼ばれ、理論的には精度を向上させることができますが、ベクトル類似インデックスが返すのは _近似_ 結果に過ぎないことを考慮すると、パフォーマンスに関して最適ではないことは明らかです。

したがって、ClickHouse は、再スコアリングを無効にし、インデックスから直接最も類似したベクトルとその距離を返す最適化を提供します。
この最適化はデフォルトで有効です。設定 [vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring) を参照してください。
高レベルでの動作は、ClickHouse が最も類似したベクトルとその距離を仮想カラム `_distances` として提供するというものです。
これを確認するには、`EXPLAIN header = 1` を用いてベクトル検索クエリを実行してください：

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
再スコアリングなしで（`vector_search_with_rescoring = 0`）実行されたクエリは、平行なレプリカが有効になっている場合、再スコアリングに戻ることがあります。
:::
#### パフォーマンスチューニング {#performance-tuning}

**圧縮の調整**

ほとんどのユースケースにおいて、基になるカラム内のベクトルは密であり、うまく圧縮されません。
その結果、[圧縮](/sql-reference/statements/create/table.md#column_compression_codec)は、ベクトルカラムへの挿入および読み取りを遅くします。
したがって、圧縮を無効にすることをお勧めします。
そのためには、次のようにベクトルカラムに `CODEC(NONE)` を指定します：

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成の調整**

ベクトル類似インデックスのライフサイクルは、パーツのライフサイクルに関連付けられています。
つまり、定義されたベクトル類似インデックスで新しいパートが作成されるたびに、インデックスも作成されます。
これは通常、データが[挿入](https://clickhouse.com/docs/guides/inserting-data)されたり、[マージ](https://clickhouse.com/docs/merges)されているときに発生します。
残念ながら、HNSWは長いインデックス作成時間で知られており、挿入やマージを著しく遅らせることがあります。
ベクトル類似インデックスは、理想的にはデータが不変であるか、またはまれに変更される場合のみ使用されます。

インデックス作成を迅速化するために、次のテクニックが使用できます。

まず、インデックス作成を並行化できます。
インデックス作成スレッドの最大数は、サーバー設定 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size) を使用して構成できます。
最適なパフォーマンスのために、設定値は CPU コアの数に設定する必要があります。

次に、INSERT 文の速度を上げるために、ユーザーは新しく挿入されたパーツに対してスキッピングインデックスの作成を無効にすることができます。セッション設定 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert)を使用します。
そのようなパーツのSELECTクエリは正確検索に戻ります。
挿入されたパーツは、テーブル全体のサイズと比較して小さい傾向があるため、この影響は無視できると見込まれます。

3つ目は、マージの速度を上げるために、マージされたパーツに対してスキッピングインデックスの作成を無効にすることができます。セッション設定 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)を使用します。
これは、ステートメント [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) と組み合わせて、ベクトル類似インデックスのライフサイクルを明示的に制御します。
例えば、インデックス作成はすべてのデータが取り込まれた後、または週末のようなシステムロードの低い時期まで延期できます。

**インデックス使用の調整**

SELECT クエリは、ベクトル類似インデックスを使用するためにメインメモリに読み込む必要があります。
同じベクトル類似インデックスが繰り返しメインメモリに読み込まれないように、ClickHouse はそのようなインデックスの専用のメモリ内キャッシュを提供します。
このキャッシュが大きいほど、無駄な読み込みが少なくなります。
最大キャッシュサイズは、サーバー設定 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) を使用して構成できます。
デフォルトでは、キャッシュは最大5GBまで成長します。

ベクトル類似インデックスキャッシュの現在のサイズは、[system.metrics](../../../operations/system-tables/metrics.md) に表示されます：

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

クエリIDを持つクエリに対するキャッシュヒットとミスは、[system.query_log](../../../operations/system-tables/query_log.md) から取得できます：

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

プロダクションユースケースにおいて、キャッシュはすべてのベクトルインデックスが常にメモリに残るように十分大きくすべきと推奨します。

**量子化の調整**

[量子化](https://huggingface.co/blog/embedding-quantization)は、ベクトルのメモリフットプリントおよびベクトルインデックスの構築と遍歴の計算コストを削減するための技術です。
ClickHouse ベクトルインデックスは、次の量子化オプションをサポートします。

| 量子化       | 名称                          | 次元あたりのストレージ |
|--------------|-------------------------------|----------------------- |
| f32          | 単精度                       | 4 バイト              |
| f16          | 半精度                       | 2 バイト              |
| bf16 (デフォルト) | 半精度 (ブレインフロート)   | 2 バイト              |
| i8           | 四分の一精度                 | 1 バイト              |
| b1           | バイナリ                       | 1 ビット              |

量子化は、元のフル精度の浮動小数点値（`f32`）を検索するのと比較して、ベクトル検索の精度を低下させます。
ただし、ほとんどのデータセットでは、半精度のブレインフロート量子化（`bf16`）は無視できる精度損失を引き起こすため、ベクトル類似インデックスはデフォルトでこの量子化技術を使用します。
四分の一精度（`i8`）やバイナリ（`b1`）の量子化は、ベクトル検索の著しい精度損失を引き起こします。
したがって、ベクトル類似インデックスのサイズが利用可能なDRAMサイズよりもかなり大きい場合にのみ、これらの両方の量子化を推奨します。
この場合、精度を向上させるために再スコアリングを有効にすることも推奨します（[vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)、[vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）。
バイナリ量子化は、1) 正規化された埋め込み（すなわち、ベクトル長 = 1、OpenAI モデルは通常正規化されている）に対してのみ推奨され、2) コサイン距離が距離関数として使用される場合にのみ推奨されます。
バイナリ量子化は内部でハミング距離を使用して近接グラフを構築および検索します。
再スコアリングステップでは、最近傍を特定するためにテーブルに保存された元のフル精度ベクトルを使用します。

**データ転送の調整**

ベクトル検索クエリの参照ベクトルは、ユーザーによって提供され、一般的には大規模言語モデル（LLM）を呼び出すことによって取得されます。
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

埋め込みベクトル（上記のスニペットでの `search_v`）は、非常に大きな次元を持つ可能性があります。
例えば、OpenAI は 1536 や 3072 次元の埋め込みベクトルを生成するモデルを提供しています。
上記のコードでは、ClickHouse Python ドライバーが人間が読める文字列に埋め込みベクトルを置き換え、SELECT クエリ全体を文字列として送信します。
埋め込みベクトルが 1536 の単精度浮動小数点値で構成されていると仮定すると、送信された文字列の長さは 20 kB に達します。
これにより、トークン化、解析、および数千の文字列から浮動小数点への変換を行う際に CPU 使用率が高くなります。
また、ClickHouse サーバーログファイルには大きなスペースが必要になり、`system.query_log` の肥大化を引き起こします。

ほとんどの LLM モデルは、埋め込みベクトルをネイティブ浮動小数点のリストや NumPy 配列として返すことに注意してください。
したがって、Python アプリケーションは次のスタイルを使用して参照ベクトルパラメータをバイナリ形式でバインドすることをお勧めします：

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, (SELECT reinterpret($search_v_binary$, 'Array(Float32)')))
    LIMIT 10"
    parameters = params)
```

この例では、参照ベクトルはそのままバイナリ形式で送信され、サーバー上で浮動小数点の配列として再解釈されます。
これにより、サーバー側の CPU 時間が節約され、サーバーログや `system.query_log` の肥大化を避けることができます。
#### 管理と監視 {#administration}

ベクトル類似インデックスのディスク上のサイズは、[system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) から取得できます：

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
#### 通常のスキッピングインデックスとの違い {#differences-to-regular-skipping-indexes}

すべての通常の[スキッピングインデックス](/optimize/skipping-indexes)と同様に、ベクトル類似インデックスはグラニュールの上に構築され、各インデックスブロックは `GRANULARITY = [N]` 個のグラニュールから構成されています（通常のスキッピングインデックスの場合、`[N]` = 1 です）。
例えば、テーブルの主インデックスのグラニュラリティが8192（設定 `index_granularity = 8192`）で、`GRANULARITY = 2` の場合、各インデックスブロックは16384行を含みます。
ただし、近似近傍検索用のデータ構造とアルゴリズムは本質的に行指向です。
これらは行のセットのコンパクト表現を保存し、ベクトル検索クエリのために行を返します。
これにより、通常のスキッピングインデックスと比較して、ベクトル類似インデックスの動作にいくつかの直感に反する違いが生じます。

ユーザーがカラムにベクトル類似インデックスを定義すると、ClickHouse は内部的に各インデックスブロックのためのベクトル類似「サブインデックス」を作成します。
サブインデックスは「ローカル」であり、その含まれるインデックスブロックの行のみを知っています。
前述の例では、カラムが65536行を持っていると仮定すると、4つのインデックスブロック（8つのグラニュールにまたがる）と各インデックスブロックに対するベクトル類似サブインデックスが得られます。
サブインデックスは理論的には、そのインデックスブロック内で最も近いN個のポイントの行を直接返すことができます。
ただし、ClickHouse はグラニュールの粒度でメモリにデータを読み込むため、サブインデックスは整合する行をグラニュールの粒度に推測します。
これは、インデックスブロックの粒度でデータをスキップする通常のスキッピングインデックスとは異なります。

`GRANULARITY` パラメータは、作成されるベクトル類似サブインデックスの数を決定します。
大きな `GRANULARITY` 値は、少ないが大きなベクトル類似サブインデックスを意味し、カラム（またはカラムのデータパート）が単一のサブインデックスのみである場合まで大きくなることがあります。
その場合、サブインデックスはすべてのカラム行の「グローバル」ビューを持ち、関係する行を持つ列（パート）のすべてのグラニュールを直接返すことができます（そのようなグラニュールは最大で `LIMIT [N]` 個です）。
第二のステップで、ClickHouse はこれらのグラニュールを読み込み、グラニュールのすべての行に対してブルートフォース距離計算を実行することによって、実際に最良の行を特定します。
小さな `GRANULARITY` 値では、各サブインデックスが最大で `LIMIT N` 個のグラニュールを返します。
その結果、より多くのグラニュールを読み込んでポストフィルタリングする必要があります。
検索精度は両方のケースで同等に良いですが、処理パフォーマンスが異なります。
一般的に、ベクトル類似インデックスには大きな `GRANULARITY` を使用し、メモリ消費過多のような問題が発生した場合にのみ小さな `GRANULARITY` 値に戻ることが推奨されます。
ベクトル類似インデックスに対して `GRANULARITY` が指定されていない場合、デフォルト値は1億です。
#### 例 {#approximate-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

returns

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

近似ベクトル検索を使用する他の例データセット：
- [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
- [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
- [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
- [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)
### Quantized Bit (QBit) {#approximate-nearest-neighbor-search-qbit}

<ExperimentalBadge/>

正確なベクトル検索を高速化する一般的なアプローチは、低精度の [float データ型](../../../sql-reference/data-types/float.md) を使用することです。例えば、ベクトルを `Array(BFloat16)` として保存する代わりに `Array(Float32)` と保存すると、データサイズが半分に減少し、クエリの実行時間は比例して短縮されると予想されます。この方法は量子化として知られています。この方法は計算を加速しますが、すべてのベクトルを徹底的にスキャンしているにもかかわらず、結果の精度が低下する可能性があります。

従来の量子化では、検索中およびデータの保存中に精度を失います。上記の例では、`Float32` の代わりに `BFloat16` を保存することになるため、たとえより正確な検索を望んでも、その後は実行できなくなります。一つの代替アプローチは、データを量子化されたものと完全精度の二つのコピーで保存することです。この方法は機能しますが、冗長なストレージが必要です。元のデータが `Float64` で、異なる精度（16ビット、32ビット、または完全な64ビット）で検索を実行したい場合、データの三つの別々のコピーを保存する必要があります。

ClickHouse は、これらの制限に対処する Quantized Bit (`QBit`) データ型を提供しています。具体的には：
1. 元の完全精度のデータを保存します。
2. クエリ実行時に量子化の精度を指定できるようにします。

これは、データをビットグループ形式で保存することによって実現されます（つまり、すべてのベクトルの i 番目のビットが一緒に保存されます）、これにより要求された精度レベルで読み取ることができます。量子化による I/O の削減から得られる速度のメリットを享受しながら、必要に応じて元のデータをすべて利用可能にしておきます。最大精度が選択された場合、検索は正確になります。

:::note
`QBit` データ型とその関連する距離関数は現在実験段階です。これを有効にするには、`SET allow_experimental_qbit_type = 1` を実行してください。問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues) で問題を報告してください。
:::

`QBit` 型のカラムを宣言するための構文は次の通りです：

```sql
column_name QBit(element_type, dimension)
```

ここで：
* `element_type` – 各ベクトル要素のタイプ。サポートされているタイプは `BFloat16`、`Float32`、および `Float64` です。
* `dimension` – 各ベクトル内の要素の数です。
#### `QBit` テーブルの作成とデータの追加 {#qbit-create}

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
#### `QBit` を使用したベクトル検索 {#qbit-search}

L2 距離を使用して、単語「lemon」を表すベクトルに最も近い隣接点を見つけましょう。距離関数の第三のパラメータはビット単位の精度を指定します - 高い値はより正確な結果を提供しますが、より多くの計算を必要とします。

利用可能なすべての距離関数は `QBit` の [こちら](../../../sql-reference/data-types/qbit.md#vector-search-functions) を参照してください。

**完全精度検索 (64 ビット)：**

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

**削減された精度の検索：**

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

12 ビットの量子化で、距離の良い近似値が得られ、クエリ実行が迅速であることに注意してください。相対的な順序はほぼ一貫しており、「apple」が依然として最も近い一致です。

:::note
現在の状態では、スピードアップは I/O の削減によるもので、より少ないデータを読み取ることによります。元のデータが広い、例えば `Float64` の場合、低い精度を選択すると、データの幅は同じ幅のまま – ただし精度は減ります。
:::
#### パフォーマンスに関する考慮事項 {#qbit-performance}

`QBit` の性能メリットは、低精度を使用しているときに読み込む必要があるデータ量が減ることで得られる I/O 操作の削減から来ています。精度パラメータは、精度と速度のトレードオフを直接制御します：

- **高い精度**（元のデータ幅に近い）：より正確な結果、遅いクエリ
- **低い精度**：おおよその結果でより速いクエリ、メモリ使用量の削減

:::note
現在、速度の改善は計算の最適化によるものではなく、I/O の削減から来ています。低精度の値を使用する際、距離の計算は依然として元のデータ幅で行われます。
:::
### 参考文献 {#references}

ブログ：
- [ClickHouse によるベクトル検索 - 第 1 部](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouse によるベクトル検索 - 第 2 部](https://clickhouse.com/blog/vector-search-clickhouse-p2)
