---
description: '集約関数のランディングページで、すべての集約関数の完全なリストを示します'
sidebar_position: 36
slug: /sql-reference/aggregate-functions/reference/
title: '集約関数'
toc_folder_title: 'リファレンス'
toc_hidden: true
---


# 集約関数

ClickHouseは、すべての標準SQL集約関数（[sum](../reference/sum.md)、[avg](../reference/avg.md)、[min](../reference/min.md)、[max](../reference/max.md)、[count](../reference/count.md)）をサポートしており、他にもさまざまな集約関数が搭載されています。

<!-- このページの目次テーブルは自動生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title.

エラーを発見した場合は、ページ自体のYMLフロントマターを編集してください。
-->| Page | Description |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | すべての範囲（数値軸のセグメント）の共通長を計算します。 |
| [median](/sql-reference/aggregate-functions/reference/median) | `median*`関数は、対応する`quantile*`関数のエイリアスです。数値データサンプルの中央値を計算します。 |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | 2つの母集団からのサンプルにWelchのtテストを適用します。 |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | 入力値の移動合計を計算します。 |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | ビットマップカラムのANDを計算し、UInt64型の基数を返します。サフィックス-Stateを追加すると、ビットマップオブジェクトを返します。 |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | 指定したカラムで約最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、推定頻度の降順にソートされます。さらに、値の重みも考慮されます。 |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | JSONカラムに格納された異なるパスのリストを計算します。 |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | 2つの母集団からのサンプルにKolmogorov-Smirnovテストを適用します。 |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | 各要素の重みを考慮しつつ、線形補間を使用して数値データシーケンスの分位数を計算します。 |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | 入力データにLargest-Triangle-Three-Bucketsアルゴリズムを適用します。 |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | 指定したカラムで約最も頻繁に出現する値とそのカウントの配列を返します。 |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | `Σ((x - x̅)(y - y̅)) / (n - 1)`の値を計算します。 |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | ビットマップカラムのORを計算し、UInt64型の基数を返します。サフィックス-Stateを追加すると、ビットマップオブジェクトが返されます。これは`groupBitmapMerge`と同等です。 |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | データセットの標本分散を計算します。 |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | Cramer's Vを計算しますが、バイアス補正を使用します。 |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | カラムの最後に出現した値を選択します。 |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | ピアソンの相関係数を計算しますが、数値的に安定したアルゴリズムを使用します。 |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | 結果はvarPopの平方根に等しく、stddevPopとは異なります。この関数は数値的に安定したアルゴリズムを使用します。 |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | グループの間で最大の交差数を計算する集約関数です（すべての間隔が少なくとも1回交差している場合）。 |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | スタックトレースのリストを使用してフレームグラフを構築する集約関数です。 |
| [min](/sql-reference/aggregate-functions/reference/min) | グループの値の最小値を計算する集約関数です。 |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | `key`配列で指定されたキーに基づいて`value`配列の合計を計算します。ソート順のキーと、対応するキーの合計値の2つの配列を返します。オーバーフローを伴う合計を行う点でsumMap関数と異なります。 |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | 引数の異なる値のおおよその数を計算します。 |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | t-digestアルゴリズムを使用して数値データシーケンスの近似分位数を計算します。 |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | 入力値の移動平均を計算します。 |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | 順位相関係数を計算します。 |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | covarSampに似ていますが、より遅く動作し、計算誤差が小さくて済みます。 |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | 重み付き算術平均を計算します。 |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | シーケンスの標本歪度を計算します。 |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | 指定した位置に値を配列に挿入します。 |
| [array_concat_agg](/sql-reference/aggregate-functions/reference/array_concat_agg) | array_concat_agg関数のドキュメントです |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | 値のカラムのシャノンエントロピーを計算します。 |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | Theta Sketch Frameworkを使用して、異なる引数値のおおよその数を計算します。 |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | 数値データシーケンスの近似分位数を計算します。 |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | 単純（一次元）線形回帰を実行します。 |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | 母集団の共分散を計算します。 |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | ビットマップカラムのXORを計算し、UInt64型の基数を返します。サフィックス-Stateを使用するとビットマップオブジェクトを返します。 |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | `key`配列で指定されたキーに基づいて`value`配列の最大値を計算します。 |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | 母集団分散を返します。varPopとは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作は遅いですが、計算誤差が小さいです。 |
| [avg](/sql-reference/aggregate-functions/reference/avg) | 算術平均を計算します。 |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | シーケンスの尖度を計算します。 |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | この関数は例外の安全性をテストする目的で使用できます。指定された確率で生成時に例外をスローします。 |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | 最小`val`値に対応する`arg`値を計算します。同じ`val`を持つ行が複数ある場合、どの関連する`arg`が返されるかは決定的ではありません。 |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | これはanyのエイリアスですが、ウィンドウ関数との互換性のために導入されました。時折NULL値を処理する必要があります（デフォルトでは、すべてのClickHouse集約関数はNULL値を無視します）。 |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | Kahan補正加算アルゴリズムを使用して数値の合計を計算します。 |
| [count](/sql-reference/aggregate-functions/reference/count) | 行またはNULLでない値の数をカウントします。 |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | 連続する行の差を加えます。差が負であれば、無視されます。 |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | 2つの母集団からのサンプルに対して学生のtテストを適用します。 |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | 数値の合計を計算し、結果のデータ型が入力パラメーターと同じようにします。このデータ型の最大値を超える合計がある場合は、オーバーフローで計算されます。 |
| [sum](/sql-reference/aggregate-functions/reference/sum) | 合計を計算します。数値にのみ使用されます。 |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | グループ全体の最も左と最も右の点の間の傾斜を計算する集約関数です。 |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | 異なる引数値の正確な数を計算します。 |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | インデックス`t`における時系列の累積指数減衰を返します。 |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | 数値の合計を計算し、同時に行数をカウントします。この関数はClickHouseクエリオプティマイザによって使用されます。クエリに複数の`sum`、`count`、または`avg`関数が存在する場合、これらは計算を再利用するために1つの`sumCount`関数に置き換えられることがあります。この関数は明示的に使用されることはめったにありません。 |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | データセットの標本分散を計算します。`varSamp`とは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作は遅いですが、計算誤差が小さいです。 |
| [topK](/sql-reference/aggregate-functions/reference/topk) | 指定したカラムで約最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、推定頻度の降順にソートされます。 |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | maxIntersections関数の出現位置を計算する集約関数です。 |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | 結果はvarSampの平方根に等しく、数値的に安定したアルゴリズムを使用します。 |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | 母集団分散を計算します。 |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | 各要素の重みを考慮し、数値データシーケンスの分位数を正確に計算します。 |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | N変数に対する母集団共分散行列を返します。 |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | 値`x`とこれらの値の繰り返し率`y`の頻度ヒストグラムをプロットします。範囲`[min_x, max_x]`で。 |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | `contingency`関数は、テーブル内の2つのカラム間の関連を測定する値であるコンティンジェンシー係数を計算します。計算は`cramersV`関数に似ていますが、平方根の分母が異なります。 |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | この関数は確率的線形回帰を実装します。学習率、L2正則化係数、ミニバッチサイズなどのカスタムパラメータをサポートし、重みの更新方法（Adam、シンプルSGD、モメンタム、ネステロフ）があります。 |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | 一元配置分散分析（ANOVAテスト）の統計テストを提供します。これは、正規分布した観測値の複数のグループに対するテストで、すべてのグループが同じ平均を持つかどうかを確認します。 |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | ストリングのグループから結合された文字列を計算し、オプションで区切り文字で区切り、オプションで最大要素数によって制限します。 |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | 時間`t`における計算された指数的に滑らかな移動平均の最大値を返します。 |
| [any](/sql-reference/aggregate-functions/reference/any) | カラムの最初に出現した値を選択します。 |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | N変数に対する標本共分散行列を返します。 |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | 最後の引数値の配列を作成します。 |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | 集約関数`singleValueOrNull`は、`x = ALL (SELECT ...)`などのサブクエリ演算子を実装するために使用されます。データに一意な非NULL値が1つだけ存在するかどうかを確認します。 |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | `theilsU`関数は、テーブル内の2つのカラムの関連を測定するTheilsのU不確実性係数を計算します。 |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | `cramersV`関数の結果は0（変数間に関連がないことに対応）から1の範囲であり、すべての値が他の値によって完全に決定される場合のみ1に達します。これは、2つの変数の関連をその最大可能変動の割合として見ることができます。 |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | 最後に出現した値を選択し、`anyLast`に似ていますが、NULLを受け入れることができます。 |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | 定められた精度で数値データシーケンスの分位数を計算します。 |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | 符号なし整数カラムからのビットマップまたは集約計算を行い、UInt64型の基数を返します。サフィックス-Stateを追加すると、ビットマップオブジェクトが返されます。 |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | `key`配列で指定されたキーに基づいて`value`配列の最小値を計算します。 |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | 時間`t`における時系列の指数的に滑らかな重み付き移動平均の値を返します。 |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | シーケンスの歪度を計算します。 |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | 2つの母集団のサンプルにマン・ホイットニー順位検定を適用します。 |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | Greenwald-Khannaアルゴリズムを使用して数値データシーケンスの分位数を計算します。 |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | 指定された配列の交差を返します（すべての指定された配列に含まれている配列のすべてのアイテムを返します）。 |
| [estimateCompressionRatio](/sql-reference/aggregate-functions/reference/estimateCompressionRatio) | 列を圧縮せずに圧縮率を推定します。 |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | サンプル引数値の配列を作成します。結果の配列のサイズは`max_size`要素に制限されます。引数値はランダムに選択され、配列に追加されます。 |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | 結果はvarSampの平方根に等しくなります。 |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | 数値データシーケンスの近似分位数を計算します。 |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | 引数値の配列を作成します。値は任意の（確定できない）順序で配列に追加できます。 |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | 時間`t`における時系列の指数的に滑らかな移動平均値の合計を返します。 |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | 各カテゴリについて`(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))`の値を計算します。 |
| [corr](/sql-reference/aggregate-functions/reference/corr) | ピアソンの相関係数を計算します。 |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | 指定したカラムで約最も頻繁に出現する値とそのカウントの配列を返します。 |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | N変数に対する相関行列を計算します。 |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | 相対誤差保証を持つサンプルの近似分位数を計算します。 |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | ヘビーヒッターアルゴリズムを使用して頻繁に出現する値を選択します。各クエリ実行スレッドで半分以上のケースで出現する値があれば、この値が返されます。通常、結果は決定的ではありません。 |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | bfloat16数値のサンプルの近似分位数を計算します。 |
| [max](/sql-reference/aggregate-functions/reference/max) | グループの値の最大値を計算する集約関数です。 |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | 数字のシーケンスに対してビット単位の`XOR`を適用します。 |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | 定められた精度で、各シーケンスメンバーの重みに応じて数値データシーケンスの分位数を計算します。 |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | 各要素の重みを考慮して線形補間を使用して数値データシーケンスの分位数を計算します。 |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | 結果はvarPopの平方根に等しくなります。 |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | 異なる引数値のおおよその数を計算します。 |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | 母集団共分散の値を計算します。 |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | 最大`val`値に対応する`arg`値を計算します。 |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | 数字のシリーズにビット単位の`OR`を適用します。 |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | t-digestアルゴリズムを使用して数値データシーケンスの近似分位数を計算します。 |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | 動的カラムに格納された異なるデータ型のリストを計算します。 |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | `key`配列で指定されたキーに基づいて`value`配列の合計を計算します。オーバーフローなしで、対応するキーの合計値が入った2つの配列を返します。 |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | シーケンスの標本尖度を計算します。 |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | この関数は確率的ロジスティック回帰を実装します。2値分類問題に使用でき、stochasticLinearRegressionのカスタムパラメータをサポートし、同様の方法で動作します。 |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | 定められた時間の値の指数移動平均を計算します。 |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | 異なる引数値のおおよその数を計算します。これはuniqCombinedと同じですが、Stringデータ型のためだけでなく、すべてのデータ型のために64ビットハッシュを使用します。 |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | 2つの母集団からのサンプルに均一Zテストを適用します。 |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | HyperLogLogアルゴリズムを使用して異なる引数値のおおよその数を計算します。 |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | 配列をこれらの配列の大きな配列に集約します。 |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | 異なる引数値から配列を作成します。 |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | 数字のシリーズにビット単位の`AND`を適用します。 |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | 連続する行の算術差を合計します。 |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | 昇順で最初のNアイテムを含む配列を返します。 |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive関数 |

