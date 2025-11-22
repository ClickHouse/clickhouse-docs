---
description: '厳密ベクトル検索および近似ベクトル検索のドキュメント'
keywords: ['ベクトル類似検索', 'ann', 'knn', 'hnsw', 'インデックス（indices）', 'インデックス', '最近傍', 'ベクトル検索']
sidebar_label: '厳密および近似ベクトル検索'
slug: /engines/table-engines/mergetree-family/annindexes
title: '厳密および近似ベクトル検索'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 厳密ベクトル検索と近似ベクトル検索

多次元（ベクトル）空間において、ある 1 点に最も近い N 個の点を求める問題は、[最近傍探索](https://en.wikipedia.org/wiki/Nearest_neighbor_search)（nearest neighbor search）、あるいは短く言えばベクトル検索として知られています。
ベクトル検索を解く一般的なアプローチとしては、次の 2 つがあります。

* 厳密ベクトル検索は、与えられた点とベクトル空間内のすべての点との距離を計算します。これにより、可能な限り最高の精度が得られ、返される点が実際の最近傍点であることが保証されます。ただし、ベクトル空間を総当たりで探索するため、厳密ベクトル検索は実運用では遅すぎる場合があります。
* 近似ベクトル検索は、（グラフやランダムフォレストのような特殊なデータ構造などの）手法のグループを指し、厳密ベクトル検索よりもはるかに高速に結果を算出します。結果の精度は、実用上は「十分良い」水準であることが一般的です。多くの近似手法では、結果の精度と検索時間のトレードオフを調整するためのパラメータが提供されています。

ベクトル検索（厳密または近似）は、次のように SQL で記述できます。

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE 句は省略可能です
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ベクトル空間内の点は、配列型の `vectors` 列に格納されます。たとえば [Array(Float64)](../../../sql-reference/data-types/array.md)、[Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) です。
参照ベクトルは定数配列であり、共通テーブル式として与えられます。
`&lt;DistanceFunction&gt;` は、参照点と格納されているすべての点との距離を計算します。
この計算には、利用可能な任意の [距離関数](/sql-reference/functions/distance-functions) を使用できます。
`&lt;N&gt;` は、返す近傍点の数を指定します。


## 完全ベクトル検索 {#exact-nearest-neighbor-search}

完全ベクトル検索は、上記のSELECTクエリをそのまま使用して実行できます。
このようなクエリの実行時間は、一般的に保存されているベクトルの数とその次元数（配列要素の数）に比例します。
また、ClickHouseはすべてのベクトルに対してブルートフォーススキャンを実行するため、実行時間はクエリで使用されるスレッド数にも依存します（設定[max_threads](../../../operations/settings/settings.md#max_threads)を参照）。

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

結果:

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```


## 近似ベクトル検索 {#approximate-nearest-neighbor-search}

### ベクトル類似度インデックス {#vector-similarity-index}

ClickHouseは、近似ベクトル検索を実行するための特別な「ベクトル類似度」インデックスを提供しています。

:::note
ベクトル類似度インデックスは、ClickHouseバージョン25.8以降で利用可能です。
問題が発生した場合は、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/issues)でissueを作成してください。
:::

#### ベクトル類似度インデックスの作成 {#creating-a-vector-similarity-index}

ベクトル類似度インデックスは、次のように新しいテーブルに作成できます：

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

または、既存のテーブルにベクトル類似度インデックスを追加する場合：

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

ベクトル類似度インデックスは、特殊な種類のスキッピングインデックスです（[こちら](mergetree.md#table_engine-mergetree-data_skipping-indexes)および[こちら](../../../optimize/skipping-indexes)を参照）。
したがって、上記の`ALTER TABLE`文は、テーブルに挿入される将来の新しいデータに対してのみインデックスを構築します。
既存のデータに対してもインデックスを構築するには、マテリアライズする必要があります：

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

関数`<distance_function>`は次のいずれかである必要があります：

- `L2Distance`：[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)で、ユークリッド空間における2点間の線分の長さを表します
- `cosineDistance`：[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)で、2つの非ゼロベクトル間の角度を表します

正規化されたデータの場合、通常は`L2Distance`が最適な選択肢ですが、それ以外の場合はスケールを補正するために`cosineDistance`が推奨されます。

`<dimensions>`は、基礎となるカラムの配列のカーディナリティ（要素数）を指定します。
インデックス作成時にClickHouseが異なるカーディナリティの配列を検出した場合、インデックスは破棄されエラーが返されます。

オプションのGRANULARITYパラメータ`<N>`は、インデックスグラニュールのサイズを指します（[こちら](../../../optimize/skipping-indexes)を参照）。
デフォルト値の1億は、ほとんどのユースケースで適切に機能しますが、調整することも可能です。
調整は、自分が行っていることの影響を理解している上級ユーザーのみに推奨します（[以下](#differences-to-regular-skipping-indexes)を参照）。

ベクトル類似度インデックスは、異なる近似検索手法に対応できるという意味で汎用的です。
実際に使用される手法は、パラメータ`<type>`で指定されます。
現時点では、利用可能な手法はHNSW（[学術論文](https://arxiv.org/abs/1603.09320)）のみです。これは階層的近接グラフに基づく近似ベクトル検索の一般的かつ最先端の技術です。
HNSWがタイプとして使用される場合、ユーザーはオプションでさらにHNSW固有のパラメータを指定できます：

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

以下のHNSW固有のパラメータが利用可能です：

- `<quantization>`は、近接グラフ内のベクトルの量子化を制御します。指定可能な値は`f64`、`f32`、`f16`、`bf16`、`i8`、または`b1`です。デフォルト値は`bf16`です。このパラメータは、基礎となるカラムのベクトル表現には影響しないことに注意してください。
- `<hnsw_max_connections_per_layer>`は、グラフノードごとの近傍数を制御します。これはHNSWハイパーパラメータ`M`としても知られています。デフォルト値は`32`です。値`0`はデフォルト値を使用することを意味します。
- `<hnsw_candidate_list_size_for_construction>`は、HNSWグラフ構築時の動的候補リストのサイズを制御します。これはHNSWハイパーパラメータ`ef_construction`としても知られています。デフォルト値は`128`です。値`0`はデフォルト値を使用することを意味します。

すべてのHNSW固有のパラメータのデフォルト値は、大多数のユースケースで適切に機能します。
したがって、HNSW固有のパラメータのカスタマイズは推奨しません。


さらに以下の制限が適用されます:

- ベクトル類似性インデックスは、[Array(Float32)](../../../sql-reference/data-types/array.md)、[Array(Float64)](../../../sql-reference/data-types/array.md)、または[Array(BFloat16)](../../../sql-reference/data-types/array.md)型のカラムにのみ構築できます。`Array(Nullable(Float32))`や`Array(LowCardinality(Float32))`のようなnull許容型や低カーディナリティの浮動小数点数配列は使用できません。
- ベクトル類似性インデックスは単一のカラムに対して構築する必要があります。
- ベクトル類似性インデックスは計算式に対して構築することもできます(例: `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`)が、このようなインデックスは後で近似近傍探索には使用できません。
- ベクトル類似性インデックスでは、基礎となるカラムのすべての配列が`<dimension>`個の要素を持つ必要があります - これはインデックス作成時にチェックされます。この要件の違反をできるだけ早期に検出するために、ユーザーはベクトルカラムに対して[制約](/sql-reference/statements/create/table.md#constraints)を追加できます。例: `CONSTRAINT same_length CHECK length(vectors) = 256`
- 同様に、基礎となるカラムの配列値は空(`[]`)であってはならず、デフォルト値(同じく`[]`)を持つこともできません。

**ストレージとメモリ消費量の推定**

典型的なAIモデル(例: 大規模言語モデル、[LLM](https://en.wikipedia.org/wiki/Large_language_model))で使用するために生成されたベクトルは、数百から数千の浮動小数点値で構成されます。
したがって、単一のベクトル値は数キロバイトのメモリを消費する可能性があります。
テーブル内の基礎となるベクトルカラムに必要なストレージ、およびベクトル類似性インデックスに必要なメインメモリを推定したいユーザーは、以下の2つの式を使用できます:

テーブル内のベクトルカラムのストレージ消費量(非圧縮):

```text
ストレージ消費量 = ベクトル数 * 次元数 * カラムデータ型のサイズ
```

[dbpediaデータセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)の例:

```text
ストレージ消費量 = 100万 * 1536 * 4 (Float32の場合) = 6.1 GB
```

ベクトル類似性インデックスは、検索を実行するためにディスクからメインメモリに完全にロードされる必要があります。
同様に、ベクトルインデックスもメモリ内で完全に構築され、その後ディスクに保存されます。

ベクトルインデックスをロードするために必要なメモリ消費量:

```text
インデックス内のベクトル用メモリ (mv) = ベクトル数 * 次元数 * 量子化データ型のサイズ
インメモリグラフ用メモリ (mg) = ベクトル数 * hnsw_max_connections_per_layer * ノードIDあたりのバイト数 (= 4) * レイヤーノード繰り返し係数 (= 2)

メモリ消費量: mv + mg
```

[dbpediaデータセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)の例:

```text
インデックス内のベクトル用メモリ (mv) = 100万 * 1536 * 2 (BFloat16の場合) = 3072 MB
インメモリグラフ用メモリ (mg) = 100万 * 64 * 2 * 4 = 512 MB

メモリ消費量 = 3072 + 512 = 3584 MB
```

上記の式は、事前割り当てバッファやキャッシュなどのランタイムデータ構造を割り当てるためにベクトル類似性インデックスが必要とする追加メモリを考慮していません。

#### ベクトル類似性インデックスの使用 {#using-a-vector-similarity-index}

:::note
ベクトル類似性インデックスを使用するには、設定[compatibility](../../../operations/settings/settings.md)が`''`(デフォルト値)、または`'25.1'`以降である必要があります。
:::

ベクトル類似性インデックスは、次の形式のSELECTクエリをサポートします:

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- WHERE句はオプションです
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouseのクエリオプティマイザは、上記のクエリテンプレートに一致させ、利用可能なベクトル類似性インデックスを使用しようとします。
クエリがベクトル類似性インデックスを使用できるのは、SELECTクエリ内の距離関数がインデックス定義の距離関数と同じ場合のみです。

上級ユーザーは、検索中の候補リストのサイズを調整するために、設定[hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)(HNSWハイパーパラメータ「ef_search」としても知られる)にカスタム値を指定できます(例: `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`)。
デフォルト値の256は、大多数のユースケースで適切に機能します。
設定値を高くすると、パフォーマンスが低下する代わりに精度が向上します。


クエリでベクトル類似度インデックスを使用可能な場合、ClickHouse は SELECT クエリで指定された LIMIT `<N>` が妥当な範囲内かどうかを確認します。
より具体的には、`<N>` が設定 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries) の値（デフォルト値は 100）より大きい場合、エラーが返されます。
過度に大きな LIMIT の値は検索を遅くし、通常は誤った使い方の兆候です。

SELECT クエリがベクトル類似度インデックスを使用しているかどうかを確認するには、クエリの先頭に `EXPLAIN indexes = 1` を付けて実行します。

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
 1. │ Expression (プロジェクト名)                                                                      │
 2. │   Limit (予備的LIMIT (OFFSETなし))                                                    │
 3. │     Sorting (ORDER BYのソート)                                                              │
 4. │       Expression ((ORDER BY前 + (射影 + カラム名をカラム識別子に変更))) │
 5. │         ReadFromMergeTree (default.tab)                                                         │
 6. │         インデックス:                                                                                │
 7. │           プライマリキー                                                                            │
 8. │             条件: true                                                                     │
 9. │             パート: 1/1                                                                          │
10. │             グラニュール: 575/575                                                                   │
11. │           スキップ                                                                                  │
12. │             名前: idx                                                                           │
13. │             説明: vector_similarity GRANULARITY 100000000                                │
14. │             パート: 1/1                                                                          │
15. │             グラニュール: 10/575                                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この例では、[dbpedia データセット](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)内の 100 万個のベクトル（各ベクトルの次元は 1536）が 575 個のグラニュールに格納されています。つまり、グラニュールあたり 1.7k 行です。
クエリは 10 個の近傍を要求し、ベクトル類似度インデックスはこれら 10 個の近傍を 10 個の別々のグラニュール内から検索します。
クエリ実行中にはこれら 10 個のグラニュールが読み取られます。

出力に `Skip` とベクトルインデックスの名前と型（この例では `idx` と `vector_similarity`）が含まれている場合、ベクトル類似度インデックスが使用されます。
この場合、ベクトル類似度インデックスは 4 個のグラニュールのうち 2 個をスキップしました。つまりデータの 50% が除外されました。
スキップできるグラニュールが多いほど、インデックスの効果は高くなります。

:::tip
インデックスの使用を強制するには、設定 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) を指定して SELECT クエリを実行できます（設定値としてインデックス名を指定します）。
:::

**ポストフィルタリングとプリフィルタリング**

ユーザーはオプションとして、SELECT クエリに対して追加のフィルタ条件を含む `WHERE` 句を指定できます。
ClickHouse は、ポストフィルタリングまたはプリフィルタリング戦略を用いてこれらのフィルタ条件を評価します。
要するに、どちらの戦略もフィルタが評価される順序を決定します。

* ポストフィルタリングでは、まずベクトル類似度インデックスが評価され、その後に ClickHouse が `WHERE` 句で指定された追加フィルタを評価します。
* プリフィルタリングでは、フィルタの評価順序がその逆になります。

これらの戦略には異なるトレードオフがあります。

* ポストフィルタリングには、`LIMIT <N>` 句で要求された行数より少ない行数しか返せない場合があるという一般的な問題があります。この状況は、ベクトル類似度インデックスが返した結果行の一部または全部が追加フィルタを満たさないときに発生します。
* プリフィルタリングは一般的には未解決の問題です。特定の専門的なベクトルデータベースはいくつかのプリフィルタリングアルゴリズムを提供しますが、ほとんどのリレーショナルデータベース（ClickHouse を含む）は厳密な近傍探索、すなわちインデックスを用いない総当たりスキャンにフォールバックします。

どの戦略が使用されるかは、フィルタ条件に依存します。

*追加フィルタがパーティションキーの一部である場合*

追加フィルタ条件がパーティションキーの一部である場合、ClickHouse はパーティションプルーニングを適用します。
例として、テーブルが列 `year` でレンジパーティションされており、次のクエリが実行されるとします。

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse は、2025 のパーティション以外をすべてプルーニングします。

*追加のフィルタをインデックスで評価できない場合があります*

追加のフィルタ条件をインデックス（primary key index、skipping index）で評価できない場合、ClickHouse はポストフィルタリングを適用します。


*追加のフィルタはプライマリキーインデックスを用いて評価できる*

追加のフィルタ条件が [プライマリキー](mergetree.md#primary-key) を用いて評価可能な場合（つまり、プライマリキーのプレフィックスを構成している場合）で、

* フィルタ条件によってパーツ内で少なくとも 1 行が除外される場合、ClickHouse はそのパーツ内の「生き残った」範囲に対してプリフィルタリングに切り替えます。
* フィルタ条件によってパーツ内の行が 1 行も除外されない場合、ClickHouse はそのパーツに対してポストフィルタリングを実行します。

実際の利用ケースでは、後者のケースはあまり発生しません。

*追加のフィルタはスキッピングインデックスを用いて評価できる*

追加のフィルタ条件が [スキッピングインデックス](mergetree.md#table_engine-mergetree-data_skipping-indexes)（minmax インデックス、set インデックスなど）を用いて評価可能な場合、ClickHouse はポストフィルタリングを行います。
このような場合、他のスキッピングインデックスと比べて最も多くの行を除外できると想定されるため、ベクトル類似度インデックスが最初に評価されます。

ポストフィルタリングとプリフィルタリングをより細かく制御するには、次の 2 つの設定を使用できます。

[vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy) 設定（デフォルト: 上記のヒューリスティクスを実装する `auto`）は `prefilter` に設定できます。
これは、追加のフィルタ条件が非常に選択的な場合に、プリフィルタリングを強制したいときに有用です。
例として、次のクエリはプリフィルタリングの恩恵を受ける可能性があります。

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('古代アジア帝国に関する書籍'))
LIMIT 10
```

2ドル未満の本がごく少数しか存在しないと仮定すると、ベクトルインデックスから返される上位10件の類似結果がすべて2ドル以上の価格である可能性があり、その場合ポストフィルタリングでは行が1件も返されないことがあります。
プリフィルタリングを強制するには（クエリに `SETTINGS vector_search_filter_strategy = 'prefilter'` を追加）、ClickHouse はまず価格が2ドル未満のすべての本を抽出し、その後、それらの本に対して総当たりのベクトル検索を実行します。

上記の問題を解決する別のアプローチとして、[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)（デフォルト: `1.0`、最大: `1000.0`）を `1.0` より大きい値（例えば `2.0`）に設定する方法があります。
ベクトルインデックスから取得される最近傍の数は、この設定値を掛け合わせた数となり、そのうえで、それらの行に対して追加のフィルタが適用され、LIMIT で指定された件数の行が返されます。
例として、乗数を `3.0` にして再度クエリを実行することができます:

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse は各パートのベクトルインデックスから 3.0 x 10 = 30 個の最も近い近傍を取得し、その後に追加のフィルタを評価します。
返されるのは最も近い 10 個の近傍だけです。
`vector_search_index_fetch_multiplier` を設定することでこの問題を軽減できますが、極端なケース（非常に選択度の高い WHERE 条件）の場合には、要求した行数 N より少ない行しか返されない可能性があります。

**再スコアリング**

ClickHouse の skip index（スキップインデックス）は一般的にグラニュール（granule）単位でフィルタリングを行います。
つまり、skip index でのルックアップ（内部的には）は、マッチする可能性のあるグラニュールのリストを返し、その結果として後続のスキャンで読み出すデータ量を削減します。
これは skip index 全般ではうまく機能しますが、ベクトル類似度インデックスの場合には「粒度の不整合（granularity mismatch）」を引き起こします。
もう少し詳しく述べると、ベクトル類似度インデックスは、与えられた参照ベクトルに対して最も類似した N 個のベクトルの行番号を決定しますが、その後これらの行番号からグラニュール番号を導出しなければなりません。
その後 ClickHouse はこれらのグラニュールをディスクから読み込み、そのグラニュール内のすべてのベクトルに対して距離計算を再実行します。
このステップは再スコアリング（rescoring）と呼ばれ、理論的には精度を向上させることができます（ベクトル類似度インデックスは *近似的な* 結果しか返さないことを思い出してください）が、パフォーマンスの観点からは最適とは言えません。

そのため ClickHouse では、再スコアリングを無効化し、最も類似したベクトルとその距離をインデックスから直接返す最適化を提供しています。
この最適化はデフォルトで有効になっており、設定 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring) を参照してください。
大まかな動作としては、ClickHouse は最も類似したベクトルとその距離を仮想カラム `_distances` として利用可能にします。
これを確認するには、`EXPLAIN header = 1` を付けてベクトル検索クエリを実行します：


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
リスコアリングなし（`vector_search_with_rescoring = 0`）で実行され、並列レプリカが有効になっているクエリは、リスコアリングにフォールバックする場合があります。
:::

#### パフォーマンスチューニング {#performance-tuning}

**圧縮のチューニング**

ほぼすべてのユースケースにおいて、基礎となる列のベクトルは密であり、圧縮効果が低くなります。
その結果、[圧縮](/sql-reference/statements/create/table.md#column_compression_codec)はベクトル列への挿入と読み取りを遅くします。
したがって、圧縮を無効にすることを推奨します。
これを行うには、次のようにベクトル列に`CODEC(NONE)`を指定します:

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**インデックス作成のチューニング**

ベクトル類似性インデックスのライフサイクルは、パートのライフサイクルに紐付いています。
つまり、ベクトル類似性インデックスが定義された新しいパートが作成されるたびに、インデックスも作成されます。
これは通常、データが[挿入](https://clickhouse.com/docs/guides/inserting-data)されるときや[マージ](https://clickhouse.com/docs/merges)中に発生します。
残念ながら、HNSWはインデックス作成時間が長いことで知られており、挿入とマージを大幅に遅くする可能性があります。
ベクトル類似性インデックスは、データが不変であるか、ほとんど変更されない場合にのみ使用することが理想的です。

インデックス作成を高速化するために、以下の手法を使用できます:

第一に、インデックス作成を並列化できます。
インデックス作成スレッドの最大数は、サーバー設定[max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size)を使用して構成できます。
最適なパフォーマンスを得るには、設定値をCPUコア数に合わせて構成する必要があります。

第二に、INSERT文を高速化するために、セッション設定[materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert)を使用して、新しく挿入されたパートでのスキップインデックスの作成を無効にできます。
このようなパートに対するSELECTクエリは、完全検索にフォールバックします。
挿入されたパートはテーブル全体のサイズと比較して小さい傾向があるため、パフォーマンスへの影響は無視できる程度と予想されます。

第三に、マージを高速化するために、セッション設定[materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)を使用して、マージされたパートでのスキップインデックスの作成を無効にできます。
これは、文[ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index)と組み合わせることで、ベクトル類似性インデックスのライフサイクルを明示的に制御できます。
たとえば、すべてのデータが取り込まれるまで、または週末などのシステム負荷が低い期間まで、インデックス作成を延期できます。

**インデックス使用のチューニング**


`SELECT` クエリでは、ベクトル類似性インデックスを使用するために、インデックスをメインメモリに読み込む必要があります。
同じベクトル類似性インデックスが何度もメインメモリに読み込まれることを防ぐために、ClickHouse はそのようなインデックス専用のインメモリキャッシュを提供します。
このキャッシュが大きいほど、不要な読み込みの回数が減少します。
キャッシュの最大サイズは、サーバー設定 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size) で設定できます。
デフォルトでは、このキャッシュは最大 5 GB まで使用できます。

:::note
ベクトル類似性インデックスキャッシュには、ベクトルインデックスのグラニュールが格納されます。
個々のベクトルインデックスグラニュールがキャッシュサイズより大きい場合、それらはキャッシュされません。
したがって、「Estimating storage and memory consumption」にある式、または [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices) に基づいてベクトルインデックスサイズを算出し、それに応じてキャッシュサイズを設定してください。
:::

現在のベクトル類似性インデックスキャッシュのサイズは、[system.metrics](../../../operations/system-tables/metrics.md) で確認できます。

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

ある `query_id` を持つクエリに対するキャッシュのヒットおよびミスは、[system.query&#95;log](../../../operations/system-tables/query_log.md) から確認できます。

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

本番環境でのユースケースでは、すべてのベクトルインデックスが常にメモリ上に保持されるように、キャッシュサイズを十分に大きく設定することを推奨します。

**量子化のチューニング**

[量子化](https://huggingface.co/blog/embedding-quantization)は、ベクトルのメモリ使用量と、ベクトルインデックスの構築および走査にかかる計算コストを削減するための手法です。
ClickHouse のベクトルインデックスは、次の量子化オプションをサポートしています:

| Quantization   | Name                         | Storage per dimension |
| -------------- | ---------------------------- | --------------------- |
| f32            | Single precision             | 4 bytes               |
| f16            | Half precision               | 2 bytes               |
| bf16 (default) | Half precision (brain float) | 2 bytes               |
| i8             | Quarter precision            | 1 byte                |
| b1             | Binary                       | 1 bit                 |

量子化を行うと、元の単精度浮動小数点値（`f32`）を使用した検索と比べて、ベクトル検索の精度は低下します。
しかし、多くのデータセットでは、半精度の brain float 量子化（`bf16`）による精度低下はごくわずかであるため、ベクトル類似度インデックスはデフォルトでこの量子化手法を使用します。
4 分の 1 精度（`i8`）およびバイナリ（`b1`）量子化は、ベクトル検索において無視できない精度低下を引き起こします。
これら 2 種類の量子化は、ベクトル類似度インデックスのサイズが、利用可能な DRAM（メインメモリ）のサイズを大きく上回る場合にのみ推奨します。
このような場合、精度を向上させるために、リスコアリング（[vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier), [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)）を有効にすることも推奨します。
バイナリ量子化は、1) 正規化された埋め込み（すなわちベクトル長 = 1、OpenAI のモデルは通常正規化済み）、かつ 2) 距離関数としてコサイン距離を使用する場合にのみ推奨されます。
バイナリ量子化は内部的にハミング距離を用いて近傍グラフを構築・検索します。
リスコアリングのステップでは、テーブルに保存されている元のフル精度（`f32`）ベクトルを使用して、コサイン距離により最近傍を特定します。

**データ転送のチューニング**

ベクトル検索クエリで使用される参照ベクトルはユーザーから提供され、一般的には大規模言語モデル (LLM) への API 呼び出しによって取得されます。
ClickHouse でベクトル検索を実行する典型的な Python コードは、次のようになります。

```python
search_v = openai_client.embeddings.create(input = "[良書]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```


埋め込みベクトル(上記のスニペットでは`search_v`)は非常に大きな次元数を持つ可能性があります。
例えば、OpenAIは1536次元または3072次元の埋め込みベクトルを生成するモデルを提供しています。
上記のコードでは、ClickHouse Pythonドライバーが埋め込みベクトルを人間が読める文字列に置き換え、その後SELECTクエリ全体を文字列として送信します。
埋め込みベクトルが1536個の単精度浮動小数点値で構成されていると仮定すると、送信される文字列の長さは20 kBに達します。
これにより、トークン化、解析、および数千回の文字列から浮動小数点への変換を実行するために高いCPU使用率が発生します。
また、ClickHouseサーバーのログファイルに大量のスペースが必要となり、`system.query_log`の肥大化も引き起こします。

ほとんどのLLMモデルは、埋め込みベクトルをネイティブ浮動小数点のリストまたはNumPy配列として返すことに注意してください。
したがって、Pythonアプリケーションでは、以下のスタイルを使用して参照ベクトルパラメータをバイナリ形式でバインドすることを推奨します:

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, (SELECT reinterpret($search_v_binary$, 'Array(Float32)')))
    LIMIT 10"
    parameters = params)
```

この例では、参照ベクトルはバイナリ形式でそのまま送信され、サーバー上で浮動小数点の配列として再解釈されます。
これにより、サーバー側のCPU時間が節約され、サーバーログと`system.query_log`の肥大化が回避されます。

#### 管理と監視 {#administration}

ベクトル類似性インデックスのディスク上のサイズは、[system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices)から取得できます:

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

#### 通常のスキッピングインデックスとの違い {#differences-to-regular-skipping-indexes}

すべての通常の[スキッピングインデックス](/optimize/skipping-indexes)と同様に、ベクトル類似性インデックスはグラニュール上に構築され、各インデックスブロックは`GRANULARITY = [N]`個のグラニュールで構成されます(通常のスキッピングインデックスではデフォルトで`[N]` = 1)。
例えば、テーブルのプライマリインデックスのグラニュラリティが8192(`index_granularity = 8192`の設定)で、`GRANULARITY = 2`の場合、各インデックスブロックには16384行が含まれます。
しかし、近似近傍探索のためのデータ構造とアルゴリズムは本質的に行指向です。
これらは行のセットのコンパクトな表現を格納し、ベクトル検索クエリに対して行を返します。
これにより、ベクトル類似性インデックスの動作が通常のスキッピングインデックスと比較してやや直感的でない違いが生じます。

ユーザーがカラムにベクトル類似性インデックスを定義すると、ClickHouseは内部的に各インデックスブロックに対してベクトル類似性「サブインデックス」を作成します。
サブインデックスは、それを含むインデックスブロックの行のみを認識するという意味で「ローカル」です。
前の例で、カラムが65536行を持つと仮定すると、4つのインデックスブロック(8つのグラニュールにまたがる)と各インデックスブロックに対するベクトル類似性サブインデックスが得られます。
サブインデックスは理論的には、そのインデックスブロック内でN個の最も近い点を持つ行を直接返すことができます。
しかし、ClickHouseはグラニュールの粒度でディスクからメモリにデータをロードするため、サブインデックスは一致する行をグラニュールの粒度に外挿します。
これは、インデックスブロックの粒度でデータをスキップする通常のスキッピングインデックスとは異なります。


`GRANULARITY`パラメータは、作成されるベクトル類似性サブインデックスの数を決定します。
`GRANULARITY`の値が大きいほど、ベクトル類似性サブインデックスの数は少なくなりますが、各サブインデックスのサイズは大きくなります。最終的には、カラム(またはカラムのデータパート)が単一のサブインデックスのみを持つ状態になります。
この場合、サブインデックスはすべてのカラム行の「グローバル」ビューを持ち、関連する行を含むカラム(パート)のすべてのグラニュールを直接返すことができます(このようなグラニュールは最大で`LIMIT [N]`個存在します)。
次のステップでは、ClickHouseはこれらのグラニュールをロードし、グラニュールのすべての行に対してブルートフォース距離計算を実行することで、実際に最適な行を特定します。
`GRANULARITY`の値が小さい場合、各サブインデックスは最大`LIMIT N`個のグラニュールを返します。
その結果、より多くのグラニュールをロードして後処理でフィルタリングする必要があります。
なお、どちらの場合も検索精度は同等であり、処理性能のみが異なります。
一般的には、ベクトル類似性インデックスには大きな`GRANULARITY`を使用することが推奨されており、ベクトル類似性構造の過度なメモリ消費などの問題が発生した場合にのみ、より小さな`GRANULARITY`値を使用することが推奨されます。
ベクトル類似性インデックスに`GRANULARITY`が指定されていない場合、デフォルト値は1億です。

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

結果:

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

近似ベクトル検索を使用するその他のサンプルデータセット:

- [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
- [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
- [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
- [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)

### 量子化ビット(QBit) {#approximate-nearest-neighbor-search-qbit}

<ExperimentalBadge />

正確なベクトル検索を高速化する一般的なアプローチの1つは、低精度の[浮動小数点データ型](../../../sql-reference/data-types/float.md)を使用することです。
たとえば、ベクトルを`Array(Float32)`の代わりに`Array(BFloat16)`として保存すると、データサイズが半分に削減され、クエリの実行時間も比例して減少することが期待されます。
この手法は量子化として知られています。計算を高速化する一方で、すべてのベクトルに対して網羅的なスキャンを実行しているにもかかわらず、結果の精度が低下する可能性があります。

従来の量子化では、検索時とデータ保存時の両方で精度が失われます。上記の例では、`Float32`の代わりに`BFloat16`を保存することになり、後でより正確な検索を実行したくても実行できないことを意味します。代替アプローチの1つは、量子化されたデータと完全精度のデータの2つのコピーを保存することです。これは機能しますが、冗長なストレージが必要になります。元のデータとして`Float64`があり、異なる精度(16ビット、32ビット、または完全な64ビット)で検索を実行したい場合を考えてみましょう。データの3つの個別のコピーを保存する必要があります。

ClickHouseは、これらの制限に対処する量子化ビット(`QBit`)データ型を提供しています:

1. 元の完全精度データを保存します。
2. クエリ時に量子化精度を指定できるようにします。


これは、データをビットグループ形式で保存することで実現されます（すべてのベクトルのi番目のビットがまとめて保存されます）。これにより、要求された精度レベルでのみ読み取りが可能になります。量子化によるI/Oと計算量の削減による速度向上の恩恵を受けながら、必要に応じてすべての元のデータを利用できます。最大精度が選択された場合、検索は完全一致になります。

:::note
`QBit`データ型とそれに関連する距離関数は現在実験的機能です。これらを有効にするには、`SET allow_experimental_qbit_type = 1`を実行してください。
問題が発生した場合は、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/issues)でissueを作成してください。
:::

`QBit`型のカラムを宣言するには、次の構文を使用します：

```sql
column_name QBit(element_type, dimension)
```

ここで：

- `element_type` – 各ベクトル要素の型。サポートされている型は`BFloat16`、`Float32`、`Float64`です
- `dimension` – 各ベクトルの要素数

#### `QBit`テーブルの作成とデータの追加 {#qbit-create}

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

#### `QBit`を使用したベクトル検索 {#qbit-search}

L2距離を使用して、単語'lemon'を表すベクトルの最近傍を見つけてみましょう。距離関数の3番目のパラメータはビット単位の精度を指定します - 値が大きいほど精度が高くなりますが、より多くの計算が必要になります。

`QBit`で利用可能なすべての距離関数は[こちら](../../../sql-reference/data-types/qbit.md#vector-search-functions)で確認できます。

**完全精度検索（64ビット）：**

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

**低精度検索：**

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


12ビット量子化を使用すると、クエリ実行が高速化され、距離の良好な近似値が得られることに注意してください。相対的な順序はほぼ一貫しており、'apple'が依然として最も近い一致となります。

:::note
現在の実装では、読み取るデータ量が少なくなることによるI/Oの削減により高速化が実現されています。元のデータが`Float64`のように幅広い場合、より低い精度を選択しても、同じ幅のデータで距離計算が行われます。ただし、精度は低下します。
:::

#### パフォーマンスに関する考慮事項 {#qbit-performance}

`QBit`のパフォーマンス上の利点は、低精度を使用する際にストレージから読み取る必要があるデータ量が少なくなることによる、I/O操作の削減から得られます。さらに、`QBit`が`Float32`データを含む場合、精度パラメータが16以下であれば、計算量の削減による追加の利点が得られます。精度パラメータは、精度と速度のトレードオフを直接制御します:

- **高精度**（元のデータ幅に近い）: より正確な結果が得られるが、クエリは低速
- **低精度**: 近似結果によりクエリが高速化され、メモリ使用量が削減される

### 参考資料 {#references}

ブログ:

- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
