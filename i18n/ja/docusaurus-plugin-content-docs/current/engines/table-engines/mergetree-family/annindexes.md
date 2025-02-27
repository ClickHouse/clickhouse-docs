---
slug: /engines/table-engines/mergetree-family/annindexes
sidebar_label: ベクトル類似性インデックス
description: ベクトル類似性インデックスを用いた近似最近傍探索
keywords: [ベクトル類似性検索, テキスト検索, ann, インデックス, インデックス, 最近傍]
title: "ベクトル類似性インデックスを用いた近似最近傍探索"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# ベクトル類似性インデックスを用いた近似最近傍探索

<ExperimentalBadge/>
<PrivatePreviewBadge/>

最近傍探索は、N次元ベクトル空間において、与えられたベクトルに最も近いM個のベクトルを見つける問題です。 この問題を解決するための最も簡単なアプローチは、参照ベクトルとベクトル空間内の他のすべての点との距離を計算する徹底的（ブルートフォース）な検索です。この方法は完全に正確な結果を保証しますが、実用的なアプリケーションには通常、あまりにも遅すぎます。代わりに、[近似アルゴリズム](https://github.com/erikbern/ann-benchmarks)は貪欲なヒューリスティックスを使用して、M個の最も近いベクトルをはるかに速く見つけます。これにより、画像、曲、テキストの[埋め込み](https://cloud.google.com/architecture/overview-extracting-and-serving-feature-embeddings-for-machine-learning)のセマンティック検索がミリ秒単位で可能になります。

ブログ:
- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2)

SQLの観点から、最近傍探索は次のように表現できます：

``` sql
SELECT [...]
FROM table, [...]
ORDER BY DistanceFunction(vectors, reference_vector)
LIMIT N
```

ここで
- `DistanceFunction`は2つのベクトル間の距離を計算します（例： [L2Distance](../../../sql-reference/functions/distance-functions.md#L2Distance)や [cosineDistance](../../../sql-reference/functions/distance-functions.md#cosineDistance)）、
- `vectors`は[Array(Float64)](../../../sql-reference/data-types/array.md) または [Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のカラムで、通常は埋め込みを保存します，
- `reference_vector`は[Array(Float64)](../../../sql-reference/data-types/array.md) または [Array(Float32)](../../../sql-reference/data-types/array.md)、または [Array(BFloat16)](../../../sql-reference/data-types/array.md) 型のリテラルで、
- `N`は返される結果の数を制限する定数整数です。

このクエリは、`reference_vector`に対して`vectors`内の最も近い`N`の点を返します。

徹底的な検索は、`reference_vector`と`vectors`内のすべてのベクトルとの距離を計算します。そのため、実行時間は保存されたベクトルの数に対して線形です。近似検索は、特別なデータ構造（例：グラフ、ランダムフォレストなど）に依存し、指定された参照ベクトルに最も近いベクトルを迅速に見つけることができます（すなわち、サブ線形時間で）。ClickHouseは、このようなデータ構造を「ベクトル類似性インデックス」の形で提供しており、[スキッピングインデックス](mergetree.md#table_engine-mergetree-data_skipping-indexes)の一種です。

# ベクトル類似性インデックスの作成と使用

ベクトル類似性インデックスを作成するための構文：

```sql
CREATE TABLE table
(
  id Int64,
  vectors Array(Float32),
  INDEX index_name vectors TYPE vector_similarity(method, distance_function[, quantization, hnsw_max_connections_per_layer, hnsw_candidate_list_size_for_construction]) [GRANULARITY N]
)
ENGINE = MergeTree
ORDER BY id;
```

:::note
USearch インデックスは現在実験的ですので、使用するには最初に `SET allow_experimental_vector_similarity_index = 1` を実行する必要があります。
:::

インデックスは、[Array(Float64)](../../../sql-reference/data-types/array.md) または [Array(Float32)](../../../sql-reference/data-types/array.md) 型のカラムに対して構築できます。

インデックスパラメータ：
- `method`: 現在は `hnsw` のみがサポートされています。
- `distance_function`: `L2Distance`（[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)：ユークリッド空間内の2点間の直線の長さ）または `cosineDistance`（[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)：2つの非ゼロベクトル間の角度）。
- `quantization`: `f64`、`f32`、`f16`、`bf16`、または `i8` のいずれかで、精度を下げたベクトルを保存します（オプション、デフォルト: `bf16`）。
- `hnsw_max_connections_per_layer`: HNSWグラフノードごとの近接点の数、[HNSW論文](https://doi.org/10.1109/TPAMI.2018.2889473) の `M` とも呼ばれる。オプション、デフォルト: `32`。値`0`はデフォルト値を使用することを意味します。
- `hnsw_candidate_list_size_for_construction`: HNSWグラフを構築する時の動的候補リストのサイズ、元の[HNSW論文](https://doi.org/10.1109/TPAMI.2018.2889473)の `ef_construction`としても知られています。オプション、デフォルト: `128`。値 0 はデフォルト値を意味します。

正規化されたデータに対しては、通常 `L2Distance` が最適な選択ですが、スケールを補うために `cosineDistance` を推奨します。

例：

```sql
CREATE TABLE table
(
  id Int64,
  vectors Array(Float32),
  INDEX idx vectors TYPE vector_similarity('hnsw', 'L2Distance') -- 代替構文: TYPE vector_similarity(hnsw, L2Distance)
)
ENGINE = MergeTree
ORDER BY id;
```

すべての配列は同じ長さでなければなりません。エラーを回避するために、[制約](/sql-reference/statements/create/table.md#constraints) を使用することができます。たとえば、 `CONSTRAINT constraint_name_1 CHECK length(vectors) = 256` のように。

空の `Arrays` と、INSERT 文における未指定の `Array` 値（すなわち、デフォルト値）はサポートされていません。

ベクトル類似性インデックスは、[USearchライブラリ](https://github.com/unum-cloud/usearch) に基づいており、[HNSWアルゴリズム](https://arxiv.org/abs/1603.09320) を実装しています。これは、各ノードがベクトルを表し、ノード間のエッジが類似性を表す階層グラフです。このような階層構造は、大規模コレクションに対して非常に効率的です。それらは通常、全体のデータセットから 0.05% 以下のデータを取得しながら、99% のリコールを提供します。これは、読み込みと比較が高コストの高次元ベクトルに対して特に有用です。USearchはまた、SIMDを活用して、現代のx86（AVX2およびAVX-512）およびARM（NEONおよびSVE）CPU上での距離計算を加速します。

ベクトル類似性インデックスは、カラムの挿入とマージの間に作成されます。HNSWアルゴリズムは挿入が遅くなることが知られています。その結果、ベクトル類似性インデックスを持つテーブルに対する `INSERT` および `OPTIMIZE` 文は、通常のテーブルよりも遅くなります。ベクトル類似性インデックスは、理想的には変更されない不変データや、読み取りリクエストが書き込みリクエストよりもはるかに多い場合にのみ使用されるべきです。インデックス作成を加速するための3つの追加技術が推奨されます：
- インデックス作成は並列化できます。スレッドの最大数は、サーバー設定 [max_build_vector_similarity_index_thread_pool_size](../../../operations/server-configuration-parameters/settings.md#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size) を使用して構成できます。
- 新しく挿入されたパーツに対するインデックス作成は、設定 `materialize_skip_indexes_on_insert` を使用して無効にすることができます。そうしたパーツの検索は、正確な検索に戻ることになりますが、挿入されたパーツは通常、テーブル全体のサイズに比べて小さいため、パフォーマンスへの影響は無視できる程度です。
- ClickHouseは、複数のパーツをバックグラウンドで段階的により大きなパーツにマージします。これらの新しいパーツは、さらに大きなパーツに後でマージされる可能性があります。各マージは、出力パーツ（および他のスキップインデックス）に対して毎回、ベクトル類似性インデックスを最初から再構築します。これにより、ベクトル類似性インデックスの作成のための作業が無駄になる可能性があります。それを回避するために、マージ中にベクトル類似性インデックスの作成を抑制することが可能です。設定は、[materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge) を使用します。これは、ステートメント [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index) と組み合わせて、ベクトル類似性インデックスのライフサイクルに対する明示的な制御を提供します。たとえば、インデックスの構築を負荷の低い期間（たとえば週末）に遅らせたり、大規模なデータ取り込み後に遅らせたりすることができます。

ベクトル類似性インデックスは、次のようなクエリをサポートします：

``` sql
WITH [...] AS reference_vector
SELECT *
FROM table
WHERE ...                       -- WHERE節はオプションです
ORDER BY Distance(vectors, reference_vector)
LIMIT N
```

`hnsw_candidate_list_size_for_search` の異なる値を使用して検索するには（デフォルト：256）、`SETTINGS hnsw_candidate_list_size_for_search = <value>` を使用して `SELECT` クエリを実行します。

ベクトル類似性インデックスからの繰り返し読み取りは、大きなスキッピングインデックスキャッシュの恩恵を受けます。必要に応じて、サーバー設定 [skipping_index_cache_size](../../../operations/server-configuration-parameters/settings.md#skipping_index_cache_size) を使用してデフォルトのキャッシュサイズを増やすことができます。

**制約**：近似ベクトル検索アルゴリズムには制限が必要です。したがって、`LIMIT` 節のないクエリはベクトル類似性インデックスを利用できません。制限は、設定 `max_limit_for_ann_queries`（デフォルト：100）よりも小さくする必要があります。

**通常のスキップインデックスとの違い**：通常の[スキップインデックス](/optimize/skipping-indexes) に類似して、ベクトル類似性インデックスはグラニュール上に構築され、各インデックスブロックは `GRANULARITY = [N]` 個のグラニュールから成ります（通常のスキップインデックスの場合、`[N]` はデフォルトで 1 です）。たとえば、テーブルの主インデックスのグラニュラリティが 8192（設定が `index_granularity = 8192` の場合）で、`GRANULARITY = 2` の場合、各インデックスブロックには 16384 行が含まれます。ただし、近似最近傍検索のためのデータ構造とアルゴリズムは、本質的に行指向です。これらは行のセットのコンパクトな表現を保存し、ベクトル検索クエリの行も返します。これにより、ベクトル類似性インデックスの挙動は、通常のスキップインデックスとはやや直感的ではない違いが生じます。

ユーザーがカラムにベクトル類似性インデックスを定義すると、ClickHouseは内部的に各インデックスブロックごとにベクトル類似性「サブインデックス」を作成します。このサブインデックスは、その含むインデックスブロックの行のみについて知っているという意味で「ローカル」です。前の例で、カラムに 65536 行があると仮定すると、4つのインデックスブロック（8つのグラニュールにまたがる）が得られ、各インデックスブロックに対するベクトル類似性サブインデックスが作成されます。サブインデックスは理論的には、インデックスブロック内でN個の最も近いポイントを持つ行を直接返すことができます。ただし、ClickHouseはデータをグラニュールの粒度でディスクからメモリに読み込むため、サブインデックスは一致する行をグラニュールの粒度に外挿します。これは、インデックスブロックの粗さでデータをスキップする通常のスキップインデックスとは異なります。

`GRANULARITY` パラメータは、どれだけの数のベクトル類似性サブインデックスが作成されるかを決定します。大きな `GRANULARITY` 値は、より少ないがより大きなベクトル類似性サブインデックスを意味し、ついにはカラム（またはカラムのデータ部分）が単一のサブインデックスだけを持つ点に達します。その場合、サブインデックスはすべてのカラムの行の「グローバル」ビューを持ち、関連する行とともにカラム（部分）のすべてのグラニュールを直接返すことができます（最大で `LIMIT [N]` 個のグラニュールがあります）。次のステップで、ClickHouseはこれらのグラニュールを読み込み、すべての行に対してブルートフォース距離計算を実行することによって実際に最良の行を特定します。小さな `GRANULARITY` 値では、各サブインデックスが最大 `LIMIT N` 個のグラニュールを返します。その結果、より多くのグラニュールが読み込まれ、後処理が必要です。検索精度は両方の場合で等しく良好ですが、処理性能が異なります。一般的に、ベクトル類似性インデックスでは大きな `GRANULARITY` を使用し、ベクトル類似性構造の過度なメモリ消費といった問題が発生した場合にのみ、小さな `GRANULARITY` 値に戻ることが推奨されます。ベクトル類似性インデックスの `GRANULARITY` が指定されていない場合、デフォルト値は 1 億です。
