---
'description': '包含完整聚合函数列表的主页'
'sidebar_position': 36
'slug': '/sql-reference/aggregate-functions/reference/'
'title': '聚合函数'
'toc_folder_title': 'Reference'
'toc_hidden': true
---

# 聚合函数

ClickHouse 支持所有标准 SQL 聚合函数 ([sum](../reference/sum.md), [avg](../reference/avg.md), [min](../reference/min.md), [max](../reference/max.md), [count](../reference/count.md))，以及广泛的其他聚合函数。

<!-- 此页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 自动生成
来自 YAML 前置字段：slug，description，title。

如果您发现错误，请编辑页面本身的 YML 前置字段。
-->| 页面 | 描述 |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | 计算所有范围（数值轴上的段）合并的总长度。 |
| [median](/sql-reference/aggregate-functions/reference/median) | `median*` 函数是相应 `quantile*` 函数的别名。它们计算数值数据样本的中位数。 |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | 对来自两个总体的样本应用 Welch 的 t 检验。 |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | 计算输入值的移动和。 |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | 计算位图列的 AND，返回 UInt64 类型的基数，如果加上后缀 -State，那么返回一个位图对象。 |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | 返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排序（而不是按值本身）。此外，还考虑了值的权重。 |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | 计算存储在 JSON 列中不同路径的列表。 |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | 对来自两个总体的样本应用 Kolmogorov-Smirnov 检验。 |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | 使用线性插值计算数值数据序列的分位数，考虑每个元素的权重。 |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | 对输入数据应用 Largest-Triangle-Three-Buckets 算法。 |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | 返回指定列中大约最常见值及其计数的数组。 |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | 计算 `Σ((x - x̅)(y - y̅)) / (n - 1)` 的值 |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | 计算位图列的 OR，返回 UInt64 类型的基数，如果加上后缀 -State，那么返回一个位图对象。它等同于 `groupBitmapMerge`。 |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | 计算数据集的样本方差。 |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | 计算 Cramer 的 V，但使用偏差修正。 |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | 选择列中最后遇到的值。 |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | 计算 Pearson 相关系数，但使用数值稳定算法。 |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | 结果等于 varPop 的平方根。与 stddevPop 不同，此函数使用数值稳定算法。 |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | 聚合函数计算交集次数最多的区间组的次数（如果所有区间至少交集一次）。 |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | 聚合函数通过堆栈跟踪列表构建火焰图。 |
| [min](/sql-reference/aggregate-functions/reference/min) | 聚合函数计算一组值中的最小值。 |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | 根据 `key` 数组中指定的键对 `value` 数组进行求和。返回两个数组的元组：按排序顺序排列的键，以及相应键的和。与 sumMap 函数不同，它在溢出时进行求和。 |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | 计算参数的不同值的近似数量。 |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | 使用 t-digest 算法计算数值数据序列的近似分位数。 |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | 计算输入值的移动平均值。 |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | 计算秩相关系数。 |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | 类似于 covarSamp，但工作较慢，同时提供更低的计算误差。 |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | 计算加权算术平均值。 |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | 计算序列的样本偏度。 |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | 将值插入指定位置的数组中。 |
| [array_concat_agg](/sql-reference/aggregate-functions/reference/array_concat_agg) | array_concat_agg 函数的文档 |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | 计算列值的 Shannon 熵。 |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | 使用 Theta Sketch 框架计算不同参数值的近似数量。 |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | 计算数值数据序列的近似分位数。 |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | 执行简单（单维）线性回归。 |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | 计算总体协方差 |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | 计算位图列的 XOR，返回 UInt64 类型的基数，如果加上后缀 -State，那么它返回一个位图对象 |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | 根据 `key` 数组中指定的键计算 `value` 数组中的最大值。 |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | 返回总体方差。与 varPop 不同，此函数使用数值稳定算法。它工作较慢，但提供较低的计算误差。 |
| [avg](/sql-reference/aggregate-functions/reference/avg) | 计算算术平均值。 |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | 计算序列的峰度。 |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | 该函数可用于测试异常安全性。将以指定概率在创建时抛出异常。 |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | 计算最小 `val` 值的 `arg` 值。如果有多行的 `val` 相同且为最大，则返回的关联 `arg` 不是确定性的。 |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | 它是任何的别名，但为了与窗口函数兼容而引入，有时需要处理 `NULL` 值（默认情况下，所有 ClickHouse 聚合函数忽略 NULL 值）。 |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | 使用 Kahan 补偿求和算法计算数字的和 |
| [count](/sql-reference/aggregate-functions/reference/count) | 计算行数或非 NULL 值的数量。 |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | 添加连续行之间的差。如果差是负的，则被忽略。 |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | 对来自两个总体的样本应用学生 t 检验。 |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | 使用与输入参数相同的数据类型计算数字的和。如果总和超过此数据类型的最大值，则使用溢出进行计算。 |
| [sum](/sql-reference/aggregate-functions/reference/sum) | 计算总和。仅适用于数字。 |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | 聚合函数计算一组值中最左侧和最右侧点之间的斜率。 |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | 计算不同参数值的确切数量。 |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | 返回时间序列在时刻 `t` 的累计指数衰减。 |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | 计算数字的总和，并同时计数行数。该函数由 ClickHouse 查询优化器使用：如果查询中有多个 `sum`，`count` 或 `avg` 函数，它们可以被替换为单个 `sumCount` 函数以重用计算。通常不需要显式使用该函数。 |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | 计算数据集的样本方差。与 `varSamp` 不同，此函数使用数值稳定算法。它工作较慢，但提供较低的计算误差。 |
| [topK](/sql-reference/aggregate-functions/reference/topk) | 返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排序（而不是按值本身）。 |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | 聚合函数计算 maxIntersections 函数的出现位置。 |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | 结果等于 varSamp 的平方根。与此函数使用数值稳定算法。 |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | 计算总体方差。 |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | 精确计算数值数据序列的分位数，考虑每个元素的权重。 |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | 返回 N 个变量的总体协方差矩阵。 |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | 该函数绘制值 `x` 的频率直方图及这些值在区间 `[min_x, max_x]` 的重复率 `y`。 |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | `contingency` 函数计算应急系数，这是一个度量表中两列之间关系的值。计算方式类似于 `cramersV` 函数，但根号中的分母不同。 |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | 此函数实现随机线性回归。它支持自定义参数用于学习率、L2 正则化系数、迷你批量大小，并提供几种更新权重的方法（Adam、简单 SGD、动量、Nesterov）。 |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | 提供单向方差分析 (ANOVA) 检验的统计测试。它是在几组正态分布观察值上进行的测试，以查看所有组是否具有相同的均值。 |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | 从一组字符串计算连接字符串，可选择用分隔符分隔，并可选择限制元素的最大数量。 |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | 返回在时刻 `t` 计算的指数平滑移动平均的最大值，与 `t-1` 进行比较。 |
| [any](/sql-reference/aggregate-functions/reference/any) | 选择列中第一次遇到的值。 |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | 返回 N 个变量的样本协方差矩阵。 |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | 创建一个最后参数值的数组。 |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | 聚合函数 `singleValueOrNull` 用于实现子查询操作符，如 `x = ALL (SELECT ...)`。它检查数据中是否只有一个唯一的非 NULL 值。 |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | `theilsU` 函数计算 Theils' U 不确定系数，这是一个度量表中两列之间关系的值。 |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | `cramersV` 函数的结果范围从 0（对应于变量之间没有关系）到 1，只有当每个值完全由另一个值决定时，才能达到 1。它可以被视为两个变量之间的关系占其最大变化的百分比。 |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | 选择最后遇到的值，类似于 `anyLast`，但可以接受 NULL。 |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | 在确定的精度下计算数值数据序列的分位数。 |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | 从无符号整数列进行位图或聚合计算，返回 UInt64 类型的基数，如果加上后缀 -State，则返回一个位图对象。 |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | 根据 `key` 数组中指定的键计算 `value` 数组中的最小值。 |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | 返回时刻 `t` 时间序列值的指数平滑加权移动平均。 |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | 计算序列的偏度。 |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | 对来自两个总体的样本应用 Mann-Whitney 秩检验。 |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | 使用 Greenwald-Khanna 算法计算数值数据序列的分位数。 |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | 返回给定数组的交集（返回所有在给定数组中都存在的数组项）。 |
| [estimateCompressionRatio](/sql-reference/aggregate-functions/reference/estimateCompressionRatio) | 在不压缩的情况下估计给定列的压缩比。 |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | 创建样本参数值的数组。结果数组的大小限制为 `max_size` 个元素。参数值是随机选择并添加到数组中的。 |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | 结果等于 varSamp 的平方根。 |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | 计算数值数据序列的近似分位数。 |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | 创建参数值的数组。值可以以任意（不确定）顺序添加到数组中。 |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | 返回在时刻 `t` 指数平滑移动平均值的总和。 |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | 计算每个类别的值 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 。 |
| [corr](/sql-reference/aggregate-functions/reference/corr) | 计算 Pearson 相关系数。 |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | 返回指定列中大约最常见值及其计数的数组。 |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | 计算 N 个变量的相关矩阵。 |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | 计算具有相对误差保证的样本的近似分位数。 |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | 使用重头算法选择频繁出现的值。如果每个查询执行线程中有一个值超过一半的案例，该值将被返回。通常，结果是不确定的。 |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | 计算由 bfloat16 数字组成的样本的近似分位数。 |
| [max](/sql-reference/aggregate-functions/reference/max) | 聚合函数计算一组值中的最大值。 |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | 对数字系列应用按位 `XOR`。 |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | 在确定的精度下，根据每个序列成员的权重计算数值数据序列的分位数。 |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | 使用线性插值计算数值数据序列的分位数，考虑每个元素的权重。 |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | 结果等于 varPop 的平方根。 |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | 计算不同参数值的近似数量。 |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | 计算总体协方差的值 |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | 计算最大 `val` 值对应的 `arg` 值。 |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | 对数字系列应用按位 `OR`。 |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | 使用 t-digest 算法计算数值数据序列的近似分位数。 |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | 计算存储在动态列中的不同数据类型的列表。 |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | 根据 `key` 数组中指定的键对 `value` 数组进行求和。返回两个数组的元组：按排序顺序排列的键，以及相应键的和，不会发生溢出。 |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | 计算序列的样本峰度。 |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | 此函数实现随机逻辑回归。它可用于二元分类问题，支持与 stochasticLinearRegression 相同的自定义参数并以相同方式工作。 |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | 计算确定时间的值的指数移动平均。 |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | 计算不同参数值的近似数量。它与 uniqCombined 相同，但对所有数据类型使用 64 位哈希，而不仅仅是字符串数据类型。 |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | 对来自两个总体的样本应用均值 z 检验。 |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | 使用 HyperLogLog 算法计算不同参数值的近似数量。 |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | 将数组聚合为包含这些数组的更大数组。 |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | 从不同参数值创建一个数组。 |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | 对数字系列应用按位 `AND`。 |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | 计算连续行之间的算术差之和。 |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | 返回前 N 项以升序排列的数组。 |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive 函数 |