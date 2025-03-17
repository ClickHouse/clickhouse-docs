---
slug: /engines/table-engines/mergetree-family/annindexes
sidebar_label: ベクトル類似性インデックス
description: ベクトル類似性インデックスを使用した近似最近傍探索
keywords: [ベクトル類似性探索, テキスト検索, ann, インデックス, インデックス, 最近傍]
title: "ベクトル類似性インデックスを使用した近似最近傍探索"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# ベクトル類似性インデックスを使用した近似最近傍探索

<ExperimentalBadge/>
<PrivatePreviewBadge/>

最近傍探索は、N次元ベクトル空間において、特定のベクトルに最も近いM個のベクトルを見つける問題です。この問題を解決するための最も簡単なアプローチは、参照ベクトルとベクトル空間内の他のすべての点との距離を計算する徹底的（ブルートフォース）な探索です。この方法は完全に正確な結果を保証しますが、実際のアプリケーションには通常遅すぎます。代替として、[近似アルゴリズム](https://github.com/erikbern/ann-benchmarks)は貪欲なヒューリスティックを使用して、M個の最も近いベクトルをはるかに速く見つけます。これにより、画像、曲、テキストの[埋め込み](https://cloud.google.com/architecture/overview-extracting-and-serving-feature-embeddings-for-machine-learning)のセマンティック検索がミリ秒単位で可能になります。

ブログ:
- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2)

SQLでの最近傍探索は以下のように表現できます：

``` sql
SELECT [...]
FROM table, [...]
ORDER BY DistanceFunction(vectors, reference_vector)
LIMIT N
```

ここで、
- `DistanceFunction`は2つのベクトル間の距離を計算します（例： [L2Distance](/sql-reference/functions/distance-functions#l2distance) または [cosineDistance](/sql-reference/functions/distance-functions#cosinedistance)）、
- `vectors`はタイプ[Array(Float64)](../../../sql-reference/data-types/array.md)または[Array(Float32)](../../../sql-reference/data-types/array.md)または[Array(BFloat16)](../../../sql-reference/data-types/array.md)のカラムで、通常は埋め込みを格納します、
- `reference_vector`は型[Array(Float64)](../../../sql-reference/data-types/array.md)または[Array(Float32)](../../../sql-reference/data-types/array.md)または[Array(BFloat16)](../../../sql-reference/data-types/array.md)のリテラルで、
- `N`は戻される結果の数を制限する定数整数です。

このクエリは、`reference_vector`に最も近い`N`個の`vectors`内の点を返します。

徹底的な探索は`reference_vector`と`vectors`内のすべてのベクトルとの距離を計算します。そのため、実行時間は格納されているベクトルの数に対して線形です。近似検索は、特別なデータ構造（例：グラフ、ランダムフォレストなど）に依存し、与えられた参照ベクトルに最も近いベクトルを迅速に見つけることができます（すなわち、サブリニア時間で）。ClickHouseは、"ベクトル類似性インデックス"という形でそのようなデータ構造を提供し、[スキッピングインデックス](mergetree.md#table_engine-mergetree-data_skipping-indexes)の一種です。


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
USearchインデックスは現在実験的です。使用するにはまず `SET allow_experimental_vector_similarity_index = 1` を実行する必要があります。
:::

インデックスは、[Array(Float64)](../../../sql-reference/data-types/array.md)または[Array(Float32)](../../../sql-reference/data-types/array.md)のタイプのカラムに基づいて構築できます。

インデックスのパラメータ：
- `method`: 現在サポートされているのは`hnsw`のみです。
- `distance_function`: `L2Distance`（[ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance): ユークリッド空間内の2点間の線の長さ）または`cosineDistance`（[コサイン距離](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance): 2つのゼロでないベクトル間の角度）。
- `quantization`: ベクトルを精度を下げて保存するための`f64`, `f32`, `f16`, `bf16`, または `i8`（オプション、デフォルト: `bf16`）。
- `hnsw_max_connections_per_layer`: HNSWグラフノードあたりの隣接点の数、[HNSW論文](https://doi.org/10.1109/TPAMI.2018.2889473)における`M`とも呼ばれます。オプション、デフォルト: `32`。値`0`はデフォルト値を使用することを意味します。
- `hnsw_candidate_list_size_for_construction`: HNSWグラフを構築する際の動的候補リストのサイズ、元の[HNSW論文](https://doi.org/10.1109/TPAMI.2018.2889473)における`ef_construction`とも呼ばれます。オプション、デフォルト: `128`。値0はデフォルト値を使用することを意味します。

正規化されたデータの場合、通常は`L2Distance`が最適な選択ですが、そうでない場合はスケールの補正に`cosineDistance`の使用が推奨されます。

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

すべての配列は同じ長さである必要があります。エラーを避けるために、例えば `CONSTRAINT constraint_name_1 CHECK length(vectors) = 256` のように[制約](/sql-reference/statements/create/table.md#constraints)を使用できます。空の`Arrays`とINSERT文の未指定の`Array`値（すなわちデフォルト値）はサポートされていません。

ベクトル類似性インデックスは[USearchライブラリ](https://github.com/unum-cloud/usearch)に基づいており、[HNSWアルゴリズム](https://arxiv.org/abs/1603.09320)を実装しています。これは、各ノードがベクトルを表し、ノード間のエッジが類似性を表す階層グラフです。このような階層構造は大規模コレクションで非常に効率的です。データセット全体から0.05%以下のデータを取得しつつ、99%の再現率を提供することがよくあります。これは、高次元ベクトルを扱う際に特に有用で、これらは読み込みと比較に高コストです。USearchは、現代のx86（AVX2およびAVX-512）およびARM（NEONおよびSVE）CPUにおいて距離計算を加速するためにSIMDも利用しています。

ベクトル類似性インデックスは列の挿入およびマージ中に構築されます。HNSWアルゴリズムは挿入が遅くなることが知られています。そのため、ベクトル類似性インデックスを持つテーブルに対する`INSERT`および`OPTIMIZE`文は、通常のテーブルよりも遅くなります。ベクトル類似性インデックスは、基本的に不変またはほとんど変更されないデータにのみ使用するのが理想的です。それは、読み取り要求が書き込み要求よりもはるかに多い場合です。インデックス作成をスピードアップするために推奨される3つの追加技術：
- インデックス作成は並行化できます。スレッドの最大数はサーバー設定[ max_build_vector_similarity_index_thread_pool_size](../../../operations/server-configuration-parameters/settings.md#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size)を使用して構成できます。
- 新たに挿入されたパーツでのインデックス作成は、設定 `materialize_skip_indexes_on_insert` を用いて無効にすることができます。そのようなパーツでの検索は正確な検索に戻りますが、挿入されたパーツは通常テーブル全体のサイズと比較して小さいため、パフォーマンスへの影響は無視できるものです。
- ClickHouseは、複数のパーツをバックグラウンドで段階的に大きなパーツにマージします。これらの新しいパーツは、さらに大きなパーツに後でマージされる可能性があります。各マージは出力パーツのベクトル類似性インデックス（および他のスキップインデックス）を毎回最初から再構築します。これにより、ベクトル類似性インデックスを作成するための作業が無駄になる可能性があります。それを避けるために、マージ時にベクトル類似性インデックスの作成を抑制することができ、これにはマージツリー設定[materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)を使用します。これにより、文[ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index)を組み合わせて使用することで、ベクトル類似性インデックスのライフサイクルを明示的に制御できます。たとえば、インデックス構築は負荷が低い（例：週末）期間に延期することや、大量のデータ取り込みの後に行うことができます。

ベクトル類似性インデックスは、このようなタイプのクエリをサポートします：

``` sql
WITH [...] AS reference_vector
SELECT *
FROM table
WHERE ...                       -- WHERE句はオプション
ORDER BY Distance(vectors, reference_vector)
LIMIT N
```

`hnsw_candidate_list_size_for_search`（デフォルト: 256）、元の[HNSW論文](https://doi.org/10.1109/TPAMI.2018.2889473)での`ef_search`としても知られるHNSWパラメータの異なる値を用いて検索するには、`SETTINGS hnsw_candidate_list_size_for_search = <value>`を付加して`SELECT`クエリを実行します。

ベクトル類似性インデックスからの繰り返し読み取りは、大きなスキippingインデックスキャッシュの恩恵を受けます。必要に応じて、サーバー設定[skipping_index_cache_size](../../../operations/server-configuration-parameters/settings.md#skipping_index_cache_size)を使用してデフォルトのキャッシュサイズを増やすことができます。

**制限事項**: 近似ベクトル探索アルゴリズムは制限を必要とするため、`LIMIT`句を使用しないクエリはベクトル類似性インデックスを利用できません。この制限は、設定`max_limit_for_ann_queries`（デフォルト: 100）よりも小さくなければなりません。

**通常のスキップインデックスとの違い** 通常の[スキップインデックス](/optimize/skipping-indexes)と同様に、ベクトル類似性インデックスはグラニュールに対して構築され、各インデックスブロックは`GRANULARITY = [N]`-多くのグラニュールで構成されます（通常のスキップインデックスの場合のデフォルトは`[N]` = 1）。たとえば、テーブルのプライマリインデックスのグラニュールが8192（設定 `index_granularity = 8192`）で、 `GRANULARITY = 2`の場合、各インデックスブロックには16384行が含まれます。しかし、近似近傍探索のデータ構造およびアルゴリズムは本質的に行指向です。これらは行のセットのコンパクトな表現を保存し、ベクトル検索クエリの行も返します。これにより、ベクトル類似性インデックスの動作が通常のスキップインデックスと比較して直感的でないいくつかの違いが生じます。

ユーザーがカラムにベクトル類似性インデックスを定義すると、ClickHouseは内部的に各インデックスブロックに対してベクトル類似性の "サブインデックス" を作成します。このサブインデックスは、包含するインデックスブロックの行にのみ関心があるため「ローカル」です。前述の例で、あるカラムに65536行があると仮定すると、4つのインデックスブロック（8つのグラニュールにまたがる）と各インデックスブロックに対するベクトル類似性サブインデックスが得られます。サブインデックスは理論的には、そのインデックスブロック内のN個の最も近い点を持つ行を直接返すことができます。しかし、ClickHouseはグラニュールの粒度でディスクからメモリへデータをロードするため、サブインデックスは一致する行をグラニュール粒度に外挿します。これは、インデックスブロックの粒度でデータをスキップする通常のスキップインデックスとは異なります。

`GRANULARITY`パラメータは、いくつのベクトル類似性サブインデックスが作成されるかを決定します。大きな`GRANULARITY`値は、より少ないが大きなベクトル類似性サブインデックスを意味し、最終的にはカラム（またはカラムのデータ部分）に単一のサブインデックスしかないところまで至ります。その場合、サブインデックスはすべてのカラム行の "グローバル" ビューを持ち、関連する行を持つカラム（部分）のすべてのグラニュールを直接返すことができます（最大で`LIMIT [N]`-多くのそのようなグラニュールがあります）。次のステップでは、ClickHouseはこれらのグラニュールをロードし、力任せの距離計算を行って実際の最良の行を特定します。小さな`GRANULARITY`値では、各サブインデックスは最大で`LIMIT N`-多くのグラニュールを返します。その結果、より多くのグラニュールをロードして事後フィルタリングする必要があります。この場合、検索精度は両方とも同様に良好であり、処理のパフォーマンスのみが異なります。一般的に、ベクトル類似性インデックスには大きな`GRANULARITY`を使用し、ベクトル類似性構造の過剰なメモリ消費のような問題が発生した場合のみ小さな`GRANULARITY`値に戻ることが推奨されます。ベクトル類似性インデックスに対して`GRANULARITY`が指定されていない場合、デフォルト値は1億です。
