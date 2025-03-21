---
slug: '/sql-reference/aggregate-functions/reference/'
toc_folder_title: 'リファレンス'
sidebar_position: 36
toc_hidden: true
---


# 集約関数

ClickHouseは、すべての標準SQL集約関数（[sum](../reference/sum.md)、[avg](../reference/avg.md)、[min](../reference/min.md)、[max](../reference/max.md)、[count](../reference/count.md)）をサポートしており、さらにさまざまな他の集約関数も利用できます。

<!-- このページの目次テーブルは、自動的に次のスクリプトから生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title.

エラーを見つけた場合は、該当するページのYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | すべての範囲（数値軸上のセグメント）の和を計算します。 |
| [median](/sql-reference/aggregate-functions/reference/median) | `median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データサンプルの中央値を計算します。 |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | 2つの母集団からのサンプルにWelchのt検定を適用します。 |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | 入力値の移動合計を計算します。 |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | ビットマップカラムのANDを計算し、UInt64型の基数を返します。サフィックス -State を追加した場合は、ビットマップオブジェクトを返します。 |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | 指定されたカラムの約最頻値の配列を返します。結果の配列は、値自体ではなく、値の近似度順にソートされています。さらに、値の重みも考慮されます。 |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | JSONカラムに保存されている異なるパスのリストを計算します。 |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | 2つの母集団からのサンプルにKolmogorov-Smirnov検定を適用します。 |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | 各要素の重みを考慮して、線形補間を使用して数値データシーケンスの分位数を計算します。 |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | 入力データにLargest-Triangle-Three-Bucketsアルゴリズムを適用します。 |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | 指定されたカラムの約最頻値とそのカウントの配列を返します。 |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | `Σ((x - x̅)(y - y̅)) / (n - 1)` の値を計算します。 |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | ビットマップカラムのORを計算し、UInt64型の基数を返します。サフィックス -State を追加した場合はビットマップオブジェクトを返します。これは `groupBitmapMerge` と等価です。 |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | データセットの標本分散を計算します。 |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | Cramer's Vを計算しますが、バイアス補正を使用します。 |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | カラムの最後に出現した値を選択します。 |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | ピアソン相関係数を計算しますが、数値的に安定したアルゴリズムを使用します。 |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | 結果はvarPopの平方根に等しいです。stddevPopとは異なり、この関数は数値的に安定したアルゴリズムを使用します。 |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | 集約関数で、インターバルのグループが互いに交差する最大回数を計算します（すべてのインターバルが少なくとも一度交差する場合）。 |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | スタックトレースのリストを使用してフレームグラフを構築する集約関数です。 |
| [min](/sql-reference/aggregate-functions/reference/min) | 値のグループに対して最小値を計算する集約関数です。 |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | `key` 配列で指定されたキーに従って `value` 配列を合計します。並べ替えられた順序のキーと、対応するキーの合計値の2つの配列のタプルを返します。合計オーバーフローを行うため、sumMap関数とは異なります。 |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | 引数の異なる値の数を近似的に計算します。 |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | t-digestアルゴリズムを使用して、数値データシーケンスの近似分位数を計算します。 |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | 入力値の移動平均を計算します。 |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | ランク相関係数を計算します。 |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | covarSampに似ていますが、計算エラーが小さくなりますが動作は遅くなります。 |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | 加重算術平均を計算します。 |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | シーケンスの標本歪度を計算します。 |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | 指定された位置に値を配列に挿入します。 |
| [](/sql-reference/aggregate-functions/reference/array_concat_agg) |  |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | 値のカラムのシャノンエントロピーを計算します。 |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | Theta Sketch Frameworkを使用し、異なる引数値の近似数を計算します。 |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | 数値データシーケンスの近似分位数を計算します。 |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | 単純（一次元）線形回帰を実行します。 |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | 母集団の共分散を計算します。 |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | ビットマップカラムのXORを計算し、UInt64型の基数を返します。サフィックス -State を追加した場合は、ビットマップオブジェクトを返します。 |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | `key` 配列に指定されたキーに従って、`value` 配列から最大値を計算します。 |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | 母集団分散を返します。varPopとは違い、この関数は数値的に安定したアルゴリズムを使用します。動作は遅くなりますが、計算誤差は小さくなります。 |
| [avg](/sql-reference/aggregate-functions/reference/avg) | 算術平均を計算します。 |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | シーケンスの尖度を計算します。 |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | この関数は、例外安全性をテストする目的で使用できます。指定した確率で作成時に例外をスローします。 |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | 最小の`val`値のための `arg` 値を計算します。同じ `val` が最大の行が複数ある場合、関連付けられた `arg` のどれが返されるかは決定論的ではありません。 |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | `any` に対するエイリアスですが、ウィンドウ関数との互換性のために導入されました。時には `NULL` 値を処理する必要があるからです（デフォルトではすべてのClickHouse集約関数はNULL値を無視します）。 |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | Kahan補正合計アルゴリズムを使用して数値の合計を計算します。 |
| [count](/sql-reference/aggregate-functions/reference/count) | 行または非NULL値の数をカウントします。 |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | 連続する行の差を加えます。差が負の場合は無視されます。 |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | 2つの母集団からのサンプルに対してStudentのt検定を適用します。 |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | 数の合計を計算し、結果のデータ型は入力パラメータと同じ型になります。合計がこのデータ型の最大値を超えた場合は、オーバーフローで計算されます。 |
| [sum](/sql-reference/aggregate-functions/reference/sum) | 合計を計算します。数値にのみ機能します。 |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | 集約関数で、値のグループ間の最左ポイントと最右ポイントの間の傾きを計算します。 |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | 異なる引数値の正確な数を計算します。 |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | 時間インデックス`t`における時間シリーズの累積指数減衰を返します。 |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | 数の合計を計算し、同時に行の数もカウントします。この関数はClickHouseクエリオプティマイザによって使用されます。クエリに複数の `sum`、`count`、または `avg` 関数がある場合、計算を再利用するために単一の `sumCount` 関数に置き換えられます。この関数は明示的に使用されることは稀です。 |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | データセットの標本分散を計算します。`varSamp`とは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作は遅くなりますが、計算誤差は小さくなります。 |
| [topK](/sql-reference/aggregate-functions/reference/topk) | 指定されたカラムの約最頻値の配列を返します。結果の配列は値の近似度順に降順でソートされます（値自体ではなく）。 |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | maxIntersections関数の出現位置を計算する集約関数です。 |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | 結果はvarSampの平方根に等しいです。数値的に安定したアルゴリズムをこの関数は使用します。 |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | 母集団分散を計算します。 |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | 各要素の重みを考慮して、数値データシーケンスの分位数を正確に計算します。 |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | N変数にわたる母集団共分散行列を返します。 |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | この関数は、値 `x` の頻度ヒストグラムと、これらの値の繰り返し頻度 `y` を `[min_x, max_x]` の間でプロットします。 |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | `contingency` 関数は、2つのテーブルのカラム間の関連性を測定する値であるコンティンジェンシー係数を計算します。計算は `cramersV` 関数に類似していますが、平方根で使用される分母が異なります。 |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートしており、重みを更新するためのいくつかのメソッド（Adam、単純SGD、モーメンタム、ネステロフ）があります。 |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | 一元配置分散分析（ANOVA検定）のための統計的検定を提供します。通常分布した複数のグループの観察結果について、すべてのグループが同じ平均値を持つかどうかを調べるテストです。 |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | グループの文字列から改行区切りの文字列を計算し、必要に応じて区切り記号で分け、最大要素数で制限できます。 |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | 時点`t`における指標 `t-1` での計算された指数移動平均の最大値を返します。 |
| [any](/sql-reference/aggregate-functions/reference/any) | カラムの最初に出現した値を選択します。 |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | N変数にわたる標本共分散行列を返します。 |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | 最後の引数値の配列を作成します。 |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | 集約関数 `singleValueOrNull` は、サブクエリ演算子（例えば `x = ALL (SELECT ...)`）を実装するために使用されます。データ内に一意の非NULL値が1つだけあるかどうかを確認します。 |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | `theilsU` 関数は、テーブル内の2つのカラム間の関連性を測定する値であるテイルのU不確実性係数を計算します。 |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | `cramersV` 関数の結果は0から1の範囲で変動し、変数間に関連性がない場合は0、完全に決定されている場合は1になります。これは、二つの変数間の関連性をその最大の可能な変動の割合で示すことができます。 |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | 最後に出現した値を選択します。これは `anyLast` と似ていますが、NULLも受け入れることができます。 |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | 決定された精度で数値データシーケンスの分位数を計算します。 |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | 符号なし整数カラムからのビットマップまたは集約計算を行い、UInt64型の基数を返します。サフィックス -State を追加した場合はビットマップオブジェクトを返します。 |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | `key` 配列に指定されたキーに従って、`value` 配列から最小値を計算します。 |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | 時点`t`における時間系列の値の指数移動平均の重み付き合計を返します。 |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | シーケンスの歪度を計算します。 |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | 2つの母集団についてマン・ホイットニー順位検定を適用します。 |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | Greenwald-Khannaアルゴリズムを使用して数値データシーケンスの分位数を計算します。 |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | 指定された配列の交差を返します（すべての指定された配列に含まれる配列のすべての項目を返します）。 |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | 引数値のサンプル配列を作成します。結果として得られる配列のサイズは `max_size` 要素に制限されています。引数値はランダムに選択され、配列に追加されます。 |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | 結果はvarSampの平方根に等しいです。 |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | 数値データシーケンスの近似分位数を計算します。 |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | 引数値の配列を作成します。値は任意の（不確定な）順序で配列に追加できます。 |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | 時点`t`における時間シリーズの指数移動平均値の合計を返します。 |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | 各カテゴリーに対して `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。 |
| [corr](/sql-reference/aggregate-functions/reference/corr) | ピアソン相関係数を計算します。 |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | 指定されたカラムの約最頻値とそのカウントの配列を返します。 |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | N変数にわたる相関行列を計算します。 |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | 相対誤差保証を持つサンプルの近似分位数を計算します。 |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | ヘビーヒッターアルゴリズムを使用して頻繁に発生する値を選択します。クエリの実行スレッドの各々で半分以上のケースで発生する値があれば、その値が返されます。通常、結果は非決定論的です。 |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | bfloat16数から構成されるサンプルの近似分位数を計算します。 |
| [max](/sql-reference/aggregate-functions/reference/max) | 値のグループに対して最大値を計算する集約関数です。 |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | 数値のシリーズに対してビット単位の `XOR` を適用します。 |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | 決定された精度で、各シーケンスメンバーの重みに基づいて数値データシーケンスの分位数を計算します。 |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | 線形補間を使用して数値データシーケンスの分位数を計算し、各要素の重みを考慮します。 |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | 結果はvarPopの平方根に等しいです。 |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | 異なる引数値の近似数を計算します。 |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | 母集団の共分散の値を計算します。 |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | 最大の `val` 値のための `arg` 値を計算します。 |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | 数値のシリーズに対してビット単位の `OR` を適用します。 |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | t-digestアルゴリズムを使用して、数値データシーケンスの近似分位数を計算します。 |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | Dynamicカラムに保存されている異なるデータ型のリストを計算します。 |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | `key` 配列に指定されたキーに従って `value` 配列を合計します。オーバーフローなしで、対応するキーに対して合計された値を持つ2つの配列のタプルを返します。 |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | シーケンスの標本尖度を計算します。 |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | この関数は確率的ロジスティック回帰を実装しています。バイナリ分類問題に使用でき、確率的線形回帰と同じカスタムパラメータをサポートし、同じ方法で動作します。 |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | 決定された時間の値の指数移動平均を計算します。 |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | 異なる引数値の近似数を計算します。これはuniqCombinedと同じですが、Stringデータタイプだけではなく、すべてのデータタイプに対して64ビットハッシュを使用します。 |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | 2つの母集団のサンプルに対して平均z検定を適用します。 |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | HyperLogLogアルゴリズムを使用して異なる引数値の近似数を計算します。 |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | 配列をこれらの配列のより大きな配列に集約します。 |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | 異なる引数値から配列を作成します。 |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | 数値のシリーズに対してビット単位の `AND` を適用します。 |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | 連続する行間の算術の差を合計します。 |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | 最初のN項目を昇順で持つ配列を返します。 |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive 関数 |

