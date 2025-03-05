---
slug: /sql-reference/aggregate-functions/reference/
toc_folder_title: Reference
sidebar_position: 36
toc_hidden: true
---


# 集約関数

ClickHouseはすべての標準SQL集約関数（[sum](../reference/sum.md), [avg](../reference/avg.md), [min](../reference/min.md), [max](../reference/max.md), [count](../reference/count.md)）をサポートしており、その他の多くの集約関数も提供しています。

<!-- このページの目次テーブルは自動的に生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLのフロントマターのフィールドから: slug, description, title。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [intervalLengthSum](/docs/sql-reference/aggregate-functions/reference/intervalLengthSum) | 全ての範囲の結合の合計長を計算します（数値軸上のセグメント）。 |
| [median](/docs/sql-reference/aggregate-functions/reference/median) | `median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データサンプルの中央値を計算します。 |
| [welchTTest](/docs/sql-reference/aggregate-functions/reference/welchttest) | 2つの母集団からのサンプルにWelchのt検定を適用します。 |
| [groupArrayMovingSum](/docs/sql-reference/aggregate-functions/reference/grouparraymovingsum) | 入力値の移動合計を計算します。 |
| [groupBitmapAnd](/docs/sql-reference/aggregate-functions/reference/groupbitmapand) | ビットマップカラムのANDを計算し、UInt64型の基数を返します。サフィックス -State を追加すると、ビットマップオブジェクトを返します。 |
| [topKWeighted](/docs/sql-reference/aggregate-functions/reference/topkweighted) | 指定されたカラムで、おおよその最頻出値の配列を返します。結果の配列は、値自身ではなく、値の近似頻度の降順でソートされます。加えて、値の重みも考慮されます。 |
| [distinctJSONPaths](/docs/sql-reference/aggregate-functions/reference/distinctjsonpaths) | JSONカラムに保存された異なるパスのリストを計算します。 |
| [kolmogorovSmirnovTest](/docs/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | 2つの母集団からのサンプルにKolmogorov-Smirnov検定を適用します。 |
| [quantileExactWeightedInterpolated](/docs/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | 各要素の重みを考慮し、線形補間を使用して数値データ列の分位数を計算します。 |
| [largestTriangleThreeBuckets](/docs/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | 入力データにLargest-Triangle-Three-Bucketsアルゴリズムを適用します。 |
| [approx_top_sum](/docs/sql-reference/aggregate-functions/reference/approxtopsum) | 指定されたカラムでのおおよその最頻出値とそのカウントの配列を返します。 |
| [covarSamp](/docs/sql-reference/aggregate-functions/reference/covarsamp) | `Σ((x - x̅)(y - y̅)) / (n - 1)` の値を計算します。 |
| [groupBitmapOr](/docs/sql-reference/aggregate-functions/reference/groupbitmapor) | ビットマップカラムのORを計算し、UInt64型の基数を返します。サフィックス -State を追加すると、ビットマップオブジェクトを返します。これは `groupBitmapMerge` に相当します。 |
| [varSamp](/docs/sql-reference/aggregate-functions/reference/varSamp) | データセットの標本分散を計算します。 |
| [cramersVBiasCorrected](/docs/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | Cramer's Vを計算しますが、バイアス修正を使用します。 |
| [quantiles Functions](/docs/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/docs/sql-reference/aggregate-functions/reference/anylast) | カラムの最後に遭遇した値を選択します。 |
| [corrStable](/docs/sql-reference/aggregate-functions/reference/corrstable) | ピアソン相関係数を計算しますが、数値的に安定したアルゴリズムを使用します。 |
| [stddevPopStable](/docs/sql-reference/aggregate-functions/reference/stddevpopstable) | 結果はvarPopの平方根と等しくなります。stddevPopとは異なり、この関数は数値的に安定したアルゴリズムを使用します。 |
| [maxIntersections](/docs/sql-reference/aggregate-functions/reference/maxintersections) | 集約関数で、間隔のグループが互いに交差する最大回数を計算します（すべての間隔が少なくとも1回交差している場合）。 |
| [flameGraph](/docs/sql-reference/aggregate-functions/reference/flame_graph) | スタックトレースのリストを使用してフレームグラフを構築する集約関数です。 |
| [min](/docs/sql-reference/aggregate-functions/reference/min) | 一群の値の中で最小値を計算する集約関数です。 |
| [sumMapWithOverflow](/docs/sql-reference/aggregate-functions/reference/summapwithoverflow) | `key` 配列で指定されたキーに従って `value` 配列の合計を計算します。順序にソートされたキーと、それに対応するキーの合計値の2つの配列のタプルを返します。合計のオーバーフローで合計を行う点で、sumMap関数とは異なります。 |
| [uniq](/docs/sql-reference/aggregate-functions/reference/uniq) | 引数の異なる値の数を近似計算します。 |
| [quantileTDigest](/docs/sql-reference/aggregate-functions/reference/quantiletdigest) | t-digestアルゴリズムを使用して数値データ列の近似分位数を計算します。 |
| [groupArrayMovingAvg](/docs/sql-reference/aggregate-functions/reference/grouparraymovingavg) | 入力値の移動平均を計算します。 |
| [rankCorr](/docs/sql-reference/aggregate-functions/reference/rankCorr) | 階級相関係数を計算します。 |
| [covarSampStable](/docs/sql-reference/aggregate-functions/reference/covarsampstable) | covarSampと似ていますが、計算誤差が小さい分、動作が遅くなります。 |
| [avgWeighted](/docs/sql-reference/aggregate-functions/reference/avgweighted) | 加重算術平均を計算します。 |
| [skewSamp](/docs/sql-reference/aggregate-functions/reference/skewsamp) | 数列の標本歪度を計算します。 |
| [groupArrayInsertAt](/docs/sql-reference/aggregate-functions/reference/grouparrayinsertat) | 指定された位置に値を配列に挿入します。 |
| [](/docs/sql-reference/aggregate-functions/reference/array_concat_agg) |  |
| [entropy](/docs/sql-reference/aggregate-functions/reference/entropy) | 値のカラムに対するシャノンエントロピーを計算します。 |
| [uniqTheta](/docs/sql-reference/aggregate-functions/reference/uniqthetasketch) | Theta Sketch Frameworkを使用して、異なる引数値の近似数を計算します。 |
| [quantileDeterministic](/docs/sql-reference/aggregate-functions/reference/quantiledeterministic) | 数値データ列の近似分位数を計算します。 |
| [simpleLinearRegression](/docs/sql-reference/aggregate-functions/reference/simplelinearregression) | 単純（一次元）線形回帰を行います。 |
| [covarPop](/docs/sql-reference/aggregate-functions/reference/covarpop) | 母集団共分散を計算します。 |
| [groupBitmapXor](/docs/sql-reference/aggregate-functions/reference/groupbitmapxor) | ビットマップカラムのXORを計算し、UInt64型の基数を返します。サフィックス -State を使用すると、ビットマップオブジェクトを返します。 |
| [maxMap](/docs/sql-reference/aggregate-functions/reference/maxmap) | `key` 配列で指定されたキーに従って、`value` 配列の最大値を計算します。 |
| [varPopStable](/docs/sql-reference/aggregate-functions/reference/varpopstable) | 母集団分散を返します。varPopとは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作が遅くなりますが、計算誤差が小さくなります。 |
| [avg](/docs/sql-reference/aggregate-functions/reference/avg) | 算術平均を計算します。 |
| [kurtPop](/docs/sql-reference/aggregate-functions/reference/kurtpop) | 数列の尖度を計算します。 |
| [aggThrow](/docs/sql-reference/aggregate-functions/reference/aggthrow) | この関数は例外安全性をテストするために使用されます。指定された確率で作成時に例外を投げます。 |
| [argMin](/docs/sql-reference/aggregate-functions/reference/argmin) | 最小の `val` 値に対する `arg` 値を計算します。同じ `val` が最大である行が複数ある場合、どの関連する `arg` が返されるかは決定論的ではありません。 |
| [first_value](/docs/sql-reference/aggregate-functions/reference/first_value) | これはanyのエイリアスですが、ウィンドウ関数との互換性のために導入されました。通常、 ClickHouseの集約関数はNULL値を無視しますが、NULL値を処理する必要がある場合があります。 |
| [sumKahan](/docs/sql-reference/aggregate-functions/reference/sumkahan) | Kahan補正加算アルゴリズムを使用して数値の合計を計算します。 |
| [count](/docs/sql-reference/aggregate-functions/reference/count) | 行数または非NULL値の数をカウントします。 |
| [deltaSumTimestamp](/docs/sql-reference/aggregate-functions/reference/deltasumtimestamp) | 連続した行の差を加算します。差が負の場合は無視されます。 |
| [studentTTest](/docs/sql-reference/aggregate-functions/reference/studentttest) | 2つの母集団からのサンプルにStudentのt検定を適用します。 |
| [sumWithOverflow](/docs/sql-reference/aggregate-functions/reference/sumwithoverflow) | 数値の合計を計算し、相関関係のある入力パラメータのデータ型と同じデータ型を結果に使用します。このデータ型の最大値を超える場合、オーバーフローで計算されます。 |
| [sum](/docs/sql-reference/aggregate-functions/reference/sum) | 合計を計算します。数値に対してのみ動作します。 |
| [boundingRatio](/docs/sql-reference/aggregate-functions/reference/boundingRatio) | 集約関数で、値のグループ内の左端点と右端点間の傾斜を計算します。 |
| [uniqExact](/docs/sql-reference/aggregate-functions/reference/uniqexact) | 異なる引数値の正確な数を計算します。 |
| [exponentialTimeDecayedCount](/docs/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | 時系列のインデックス`t`での累積指数減衰を返します。 |
| [sumCount](/docs/sql-reference/aggregate-functions/reference/sumcount) | 数値の合計を計算し、同時に行数をカウントします。この関数はClickHouseのクエリ最適化器によって使用されます。クエリ内の複数の `sum`, `count` または `avg` 関数がある場合、それらは単一の `sumCount` 関数に置き換えられ、計算を再利用できます。この関数は明示的に使用する必要があることはめったにありません。 |
| [varSampStable](/docs/sql-reference/aggregate-functions/reference/varsampstable) | データセットの標本分散を計算します。`varSamp` とは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作が遅くなりますが、計算誤差が小さくなります。 |
| [topK](/docs/sql-reference/aggregate-functions/reference/topk) | 指定されたカラムでのおおよその最頻出値の配列を返します。結果の配列は、値自身ではなく、値の近似頻度の降順でソートされます。 |
| [maxIntersectionsPosition](/docs/sql-reference/aggregate-functions/reference/maxintersectionsposition) | maxIntersections関数の出現位置を計算する集約関数です。 |
| [stddevSampStable](/docs/sql-reference/aggregate-functions/reference/stddevsampstable) | 結果はvarSampの平方根と等しくなります。この関数は数値的に安定したアルゴリズムを使用します。 |
| [varPop](/docs/en/sql-reference/aggregate-functions/reference/varPop) | 母集団分散を計算します。 |
| [quantileExactWeighted](/docs/sql-reference/aggregate-functions/reference/quantileexactweighted) | 各要素の重みを考慮して数値データ列の分位数を正確に計算します。 |
| [covarPopMatrix](/docs/sql-reference/aggregate-functions/reference/covarpopmatrix) | N変数にわたる母集団共分散行列を返します。 |
| [sparkbar](/docs/sql-reference/aggregate-functions/reference/sparkbar) | この関数は、値 `x` とその値の繰り返し率 `y` に対して頻度ヒストグラムをプロットします、インターバル `[min_x, max_x]` にわたる。 |
| [contingency](/docs/sql-reference/aggregate-functions/reference/contingency) | `contingency` 関数は、2つのカラム間の関連性を測る値である偶然係数を計算します。この計算は `cramersV` 関数に似ていますが、平方根の分母が異なります。 |
| [stochasticLinearRegression](/docs/sql-reference/aggregate-functions/reference/stochasticlinearregression) | この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズのカスタムパラメータをサポートし、重みの更新方法（Adam、シンプルSGD、モーメンタム、ネステロフ）もいくつか提供しています。 |
| [analysisOfVariance](/docs/sql-reference/aggregate-functions/reference/analysis_of_variance) | 一元配置分散分析（ANOVAテスト）のための統計的テストを提供します。複数の正規分布観測群間で、すべての群が同じ平均を持つかどうかを調べます。 |
| [groupConcat](/docs/sql-reference/aggregate-functions/reference/groupconcat) | 文字列の群から結合された文字列を計算し、オプションでデリミタで分け、オプションで最大要素数を制限します。 |
| [exponentialTimeDecayedMax](/docs/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | 時間での指数平滑移動平均の最大を、`t` インデックスで計算し、`t-1` での値との比較を行います。 |
| [any](/docs/sql-reference/aggregate-functions/reference/any) | カラムの最初に遭遇した値を選択します。 |
| [covarSampMatrix](/docs/sql-reference/aggregate-functions/reference/covarsampmatrix) | N変数にわたる標本共分散行列を返します。 |
| [groupArrayLast](/docs/sql-reference/aggregate-functions/reference/grouparraylast) | 最後の引数値の配列を作成します。 |
| [singleValueOrNull](/docs/sql-reference/aggregate-functions/reference/singlevalueornull) | 集約関数 `singleValueOrNull` は、サブクエリオペレーターを実装するために使用されます。データにユニークの非NULL値が1つだけ存在するかどうかをチェックします。 |
| [theilsU](/docs/sql-reference/aggregate-functions/reference/theilsu) | `theilsU` 関数は、2つのカラム間の関連性を測るTheilのU不確実性係数を計算します。 |
| [cramersV](/docs/sql-reference/aggregate-functions/reference/cramersv) | `cramersV` 関数の結果は0から1の範囲で、変数間の関連性がない場合は0に、完全に他方によって決定されている場合だけで1に達します。これは、2つの変数間の最大の変動に対する関連性をパーセンテージとして見ることができます。 |
| [last_value](/docs/sql-reference/aggregate-functions/reference/last_value) | 最後に遭遇した値を選択します。`anyLast` に似ていますが、NULLを受け入れることができます。 |
| [quantileTiming](/docs/sql-reference/aggregate-functions/reference/quantiletiming) | 定められた精度で数値データ列の分位数を計算します。 |
| [groupBitmap](/docs/sql-reference/aggregate-functions/reference/groupbitmap) | 符号なし整数カラムからのビットマップまたは集約計算を行い、UInt64型の基数を返します。サフィックス -State を追加すると、ビットマップオブジェクトを返します。 |
| [minMap](/docs/sql-reference/aggregate-functions/reference/minmap) | `key` 配列で指定されたキーに従って、`value` 配列の最小値を計算します。 |
| [exponentialTimeDecayedAvg](/docs/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | 時間の点 `t` における、時系列の値の指数平滑加重移動平均を返します。 |
| [skewPop](/docs/sql-reference/aggregate-functions/reference/skewpop) | 数列の歪度を計算します。 |
| [mannWhitneyUTest](/docs/sql-reference/aggregate-functions/reference/mannwhitneyutest) | 2つの母集団からのサンプルにマン・ホイットニー順位検定を適用します。 |
| [quantileGK](/docs/sql-reference/aggregate-functions/reference/quantileGK) | グリーンワルド・カンナアルゴリズムを使用して数値データ列の分位数を計算します。 |
| [groupArrayIntersect](/docs/sql-reference/aggregate-functions/reference/grouparrayintersect) | 指定された配列の交差を返します（与えられた配列すべてに存在するアイテムを返します）。 |
| [groupArraySample](/docs/sql-reference/aggregate-functions/reference/grouparraysample) | 引数値のサンプルの配列を作成します。生成された配列のサイズは `max_size` 要素に制限されます。引数値はランダムに選択されて配列に追加されます。 |
| [stddevSamp](/docs/sql-reference/aggregate-functions/reference/stddevsamp) | 結果はvarSampの平方根と等しくなります。 |
| [quantile](/docs/sql-reference/aggregate-functions/reference/quantile) | 数値データ列の近似分位数を計算します。 |
| [groupArray](/docs/sql-reference/aggregate-functions/reference/grouparray) | 引数値の配列を作成します。値は任意の（不確定）順序で配列に追加できます。 |
| [exponentialTimeDecayedSum](/docs/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | 時間のインデックス`t`における時系列の指数平滑移動平均値の合計を返します。 |
| [categoricalInformationValue](/docs/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | 各カテゴリに対して `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。 |
| [corr](/docs/sql-reference/aggregate-functions/reference/corr) | ピアソン相関係数を計算します。 |
| [approx_top_k](/docs/sql-reference/aggregate-functions/reference/approxtopk) | 指定されたカラムでのおおよその最頻出値とそのカウントの配列を返します。 |
| [corrMatrix](/docs/sql-reference/aggregate-functions/reference/corrmatrix) | N変数にわたる相関行列を計算します。 |
| [quantileDD](/docs/sql-reference/aggregate-functions/reference/quantileddsketch) | 相対誤差保証を持つサンプルの近似分位数を計算します。 |
| [anyHeavy](/docs/sql-reference/aggregate-functions/reference/anyheavy) | ヘビーヒッターアルゴリズムを使用して頻繁に出現する値を選択します。クエリの実行スレッドの各スレッドで半分以上出現する値がある場合、その値が返されます。通常、結果は決定論的ではありません。 |
| [quantileBFloat16](/docs/sql-reference/aggregate-functions/reference/quantilebfloat16) | bfloat16数から成るサンプルの近似分位数を計算します。 |
| [max](/docs/sql-reference/aggregate-functions/reference/max) | 一群の値の中で最大値を計算する集約関数です。 |
| [groupBitXor](/docs/sql-reference/aggregate-functions/reference/groupbitxor) | 数の列に対してビット単位の `XOR` を適用します。 |
| [quantileTimingWeighted](/docs/sql-reference/aggregate-functions/reference/quantiletimingweighted) | 定められた精度で、各列メンバーの重みを考慮して数値データ列の分位数を計算します。 |
| [quantileInterpolatedWeighted](/docs/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | 各要素の重みを考慮し、線形補間を用いて数値データ列の分位数を計算します。 |
| [stddevPop](/docs/sql-reference/aggregate-functions/reference/stddevpop) | 結果はvarPopの平方根と等しくなります。 |
| [uniqCombined](/docs/sql-reference/aggregate-functions/reference/uniqcombined) | 異なる引数値の近似数を計算します。 |
| [covarPopStable](/docs/sql-reference/aggregate-functions/reference/covarpopstable) | 母集団共分散の値を計算します。 |
| [argMax](/docs/sql-reference/aggregate-functions/reference/argmax) | 最大の `val` 値に対する `arg` 値を計算します。 |
| [groupBitOr](/docs/sql-reference/aggregate-functions/reference/groupbitor) | 数の列に対してビット単位の `OR` を適用します。 |
| [quantileTDigestWeighted](/docs/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | t-digestアルゴリズムを使用して数値データ列の近似分位数を計算します。 |
| [distinctDynamicTypes](/docs/sql-reference/aggregate-functions/reference/distinctdynamictypes) | Dynamicカラムに保存された異なるデータ型のリストを計算します。 |
| [sumMap](/docs/sql-reference/aggregate-functions/reference/summap) | `key` 配列で指定されたキーに従って `value` 配列の合計を計算します。オーバーフローなしで、そのキーに対する合計値を含むソートされたキーの2つの配列のタプルを返します。 |
| [kurtSamp](/docs/sql-reference/aggregate-functions/reference/kurtsamp) | 数列の標本尖度を計算します。 |
| [stochasticLogisticRegression](/docs/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | この関数は確率的ロジスティック回帰を実装します。二項分類問題に使用でき、確率的線形回帰と同じカスタムパラメータをサポートし、同様に機能します。 |
| [exponentialMovingAverage](/docs/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | 定められた時間の値に対する指数移動平均を計算します。 |
| [uniqCombined64](/docs/sql-reference/aggregate-functions/reference/uniqcombined64) | 異なる引数値の近似数を計算します。これはuniqCombinedと同じですが、Stringデータ型だけでなくすべてのデータ型に対して64ビットハッシュを使用します。 |
| [meanZTest](/docs/sql-reference/aggregate-functions/reference/meanztest) | 2つの母集団からのサンプルに対して平均z検定を適用します。 |
| [uniqHLL12](/docs/sql-reference/aggregate-functions/reference/uniqhll12) | HyperLogLogアルゴリズムを使用して、異なる引数値の近似数を計算します。 |
| [groupArrayArray](/docs/sql-reference/aggregate-functions/reference/grouparrayarray) | 配列をそれらの配列のより大きな配列に集約します。 |
| [groupUniqArray](/docs/sql-reference/aggregate-functions/reference/groupuniqarray) | 異なる引数値から配列を作成します。 |
| [groupBitAnd](/docs/sql-reference/aggregate-functions/reference/groupbitand) | 数の列に対してビット単位の `AND` を適用します。 |
| [deltaSum](/docs/sql-reference/aggregate-functions/reference/deltasum) | 連続した行の算術的差を合計します。 |
| [groupArraySorted](/docs/sql-reference/aggregate-functions/reference/grouparraysorted) | 昇順で最初のNアイテムを含む配列を返します。 |
| [quantileExact Functions](/docs/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive 関数 |

