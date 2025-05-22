---
'description': '聚合函数的登录页面，包含完整的聚合函数列表'
'sidebar_position': 36
'slug': '/sql-reference/aggregate-functions/reference/'
'title': '聚合函数'
'toc_folder_title': 'Reference'
'toc_hidden': true
---


# 聚合函数

ClickHouse 支持所有标准 SQL 聚合函数 ([sum](../reference/sum.md), [avg](../reference/avg.md), [min](../reference/min.md), [max](../reference/max.md), [count](../reference/count.md))，以及各种其他聚合函数。

<!-- 该页面的目录表是由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 自动生成的，来自 YAML 前言字段：slug、description、title。

如果您发现错误，请编辑页面本身的 YML 前言。 -->
| 页面 | 描述 |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | 计算所有范围（数值轴上的片段）联合的总长度。 |
| [median](/sql-reference/aggregate-functions/reference/median) | `median*` 函数是对应 `quantile*` 函数的别名。它们计算数值数据样本的中位数。 |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | 对两个种群的样本应用 Welch 的 t 检验。 |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | 计算输入值的移动和。 |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | 计算位图列的与运算，返回类型为 UInt64 的基数，如果添加后缀 -State，则返回一个位图对象。 |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | 返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。此外，值的权重也会被考虑。 |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | 计算存储在 JSON 列中的不同路径的列表。 |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | 对两个种群的样本应用 Kolmogorov-Smirnov 检验。 |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | 计算数值数据序列的量化，使用线性插值，考虑每个元素的权重。 |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | 对输入数据应用 Largest-Triangle-Three-Buckets 算法。 |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | 返回指定列中大约最常见值及其计数的数组。 |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | 计算 `Σ((x - x̅)(y - y̅)) / (n - 1)` 的值 |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | 计算位图列的或运算，返回类型为 UInt64 的基数，如果添加后缀 -State，则返回一个位图对象。这等价于 `groupBitmapMerge`。 |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | 计算数据集的样本方差。 |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | 计算 Cramer's V，但使用偏差校正。 |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | 选择列中最后一次遇到的值。 |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | 计算 Pearson 相关系数，但使用数值稳定算法。 |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | 结果等于 varPop 的平方根。与 stddevPop 不同，此函数使用数值稳定算法。 |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | 聚合函数，计算一组区间相互交叉的最大次数（如果所有区间至少交叉一次）。 |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | 聚合函数，使用堆栈跟踪列表构建火焰图。 |
| [min](/sql-reference/aggregate-functions/reference/min) | 聚合函数，计算一组值中的最小值。 |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | 根据 `key` 数组中指定的键对 `value` 数组求和。返回两个数组的元组：以排序顺序排列的键以及为相应键求和的值。与 sumMap 函数不同，它在溢出情况下进行求和。 |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | 计算参数的不同值的近似数量。 |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | 使用 t-digest 算法计算数值数据序列的近似量化。 |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | 计算输入值的移动平均。 |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | 计算秩相关系数。 |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | 类似于 covarSamp，但速度较慢，同时提供较低的计算误差。 |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | 计算加权算术平均值。 |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | 计算序列的样本偏度。 |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | 在指定位置插入一个值到数组中。 |
| [array_concat_agg](/sql-reference/aggregate-functions/reference/array_concat_agg) | array_concat_agg 函数的文档 |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | 计算一列值的 Shannon 熵。 |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | 使用 Theta Sketch 框架计算不同参数值的近似数量。 |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | 计算数值数据序列的近似量化。 |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | 执行简单（单维）线性回归。 |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | 计算总体协方差 |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | 计算位图列的异或运算，返回类型为 UInt64 的基数，如果与后缀 -State 一起使用，则返回位图对象 |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | 根据 `key` 数组中指定的键计算 `value` 数组中的最大值。 |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | 返回总体方差。与 varPop 不同，此函数使用数值稳定算法。它速度较慢，但提供较低的计算误差。 |
| [avg](/sql-reference/aggregate-functions/reference/avg) | 计算算术平均值。 |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | 计算序列的峰度。 |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | 此函数用于测试异常安全性。它将在创建时以指定概率引发异常。 |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | 计算最小 `val` 值的 `arg` 值。如果有多行相等的 `val` 为最大值，则返回的相关 `arg` 不具备确定性。 |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | 它是任何的别名，但引入是为了与窗口函数兼容，在某些情况下需要处理 `NULL` 值（默认情况下，所有 ClickHouse 聚合函数会忽略 NULL 值）。 |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | 使用 Kahan 补偿求和算法计算数字的总和 |
| [count](/sql-reference/aggregate-functions/reference/count) | 计算行数或非 NULL 值的数量。 |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | 添加连续行之间的差异。如果差异为负，则将其忽略。 |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | 对两个种群的样本应用学生 t 检验。 |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | 计算数字的总和，结果的数据类型与输入参数相同。如果总和超过该数据类型的最大值，则会计算溢出。 |
| [sum](/sql-reference/aggregate-functions/reference/sum) | 计算总和。只适用于数字。 |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | 聚合函数，计算一组值中最左边和最右边点之间的斜率。 |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | 计算不同参数值的确切数量。 |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | 返回时间序列在时间点 `t` 的累计指数衰减。 |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | 计算数字的总和并同时计算行数。此函数由 ClickHouse 查询优化器使用：如果查询中有多个 `sum`、`count` 或 `avg` 函数，则可以替换为单个 `sumCount` 函数以重用计算。此函数很少需要显式使用。 |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | 计算数据集的样本方差。与 `varSamp` 不同，此函数使用数值稳定算法。它速度较慢，但提供较低的计算误差。 |
| [topK](/sql-reference/aggregate-functions/reference/topk) | 返回指定列中大约最常见值的数组。结果数组按值的近似频率降序排列（而不是按值本身）。 |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | 聚合函数，计算 maxIntersections 函数出现位置。 |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | 结果等于 varSamp 的平方根。与此函数使用数值稳定算法。 |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | 计算总体方差。 |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | 精确计算数值数据序列的量化，考虑每个元素的权重。 |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | 返回 N 个变量的总体协方差矩阵。 |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | 该函数绘制值 `x` 和这些值的重复率 `y` 在区间 `[min_x, max_x]` 的频率直方图。 |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | `contingency` 函数计算交叉系数，该值衡量表中两列之间的关联。计算类似于 `cramersV` 函数，但平方根中的分母不同。 |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | 此函数实现随机线性回归。它支持学习率、L2 正则化系数、迷你批次大小的自定义参数，并具有几种更新权重的方法（Adam、简单 SGD、动量、Nesterov）。 |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | 提供单向方差分析（ANOVA 测试）的统计检验。此检验针对几组正态分布的观察结果，以查明所有组的均值是否相同。 |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | 从字符串组计算一个拼接字符串，选项上通过分隔符分隔，并可以限定最大元素数。 |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | 返回在时间点 `t` 计算的指数平滑移动平均的最大值。 |
| [any](/sql-reference/aggregate-functions/reference/any) | 选择列中首次遇到的值。 |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | 返回 N 个变量的样本协方差矩阵。 |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | 创建一个数组，其中包含最后一个参数值。 |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | 聚合函数 `singleValueOrNull` 用于实现子查询运算符，例如 `x = ALL (SELECT ...)`。它检查数据中是否仅存在一个唯一的非 NULL 值。 |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | `theilsU` 函数计算 Theils' U 不确定性系数，这是一个衡量表中两列之间关联的值。 |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | `cramersV` 函数的结果范围从 0（对应变量之间没有关联）到 1，只有当每个值完全由另一个值确定时才能达到 1。可以将其视为两个变量之间的关联占它们最大可能变异的百分比。 |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | 选择最后一次遇到的值，类似于 `anyLast`，但可以接受 NULL。 |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | 以确定的精度计算数值数据序列的量化。 |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | 从无符号整数列进行位图或聚合计算，返回类型为 UInt64 的基数，如果添加后缀 -State，则返回位图对象。 |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | 根据 `key` 数组中指定的键计算 `value` 数组中的最小值。 |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | 返回时间序列在时间点 `t` 的指数平滑加权移动平均值。 |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | 计算序列的偏度。 |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | 对两个种群的样本应用 Mann-Whitney 排名检验。 |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | 使用 Greenwald-Khanna 算法计算数值数据序列的量化。 |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | 返回给定数组的交集（返回所有在所有给定数组中存在的数组项）。 |
| [estimateCompressionRatio](/sql-reference/aggregate-functions/reference/estimateCompressionRatio) | 估算给定列的压缩比，而不进行压缩。 |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | 创建一个样本参数值的数组。结果数组的大小限制为 `max_size` 元素。参数值随机选择并添加到数组中。 |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | 结果等于 varSamp 的平方根。 |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | 计算数值数据序列的近似量化。 |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | 创建一个参数值的数组。值可以以任何（不确定）顺序添加到数组中。 |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | 返回指数平滑移动平均值的总和在时间点 `t` 的时间序列。 |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | 计算每个类别的值 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 。 |
| [corr](/sql-reference/aggregate-functions/reference/corr) | 计算 Pearson 相关系数。 |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | 返回指定列中大约最常见值及其计数的数组。 |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | 计算 N 个变量的相关矩阵。 |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | 计算具有相对误差保证的样本的近似量化。 |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | 使用重击手算法选择频繁出现的值。如果每个查询执行线程中存在一个值的出现次数超过一半，则返回该值。通常，结果是不确定的。 |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | 计算由 bfloat16 数字组成的样本的近似量化。 |
| [max](/sql-reference/aggregate-functions/reference/max) | 聚合函数，计算一组值中的最大值。 |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | 对一系列数字应用按位异或。 |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | 以确定的精度根据每个序列成员的权重计算数值数据序列的量化。 |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | 使用线性插值计算数值数据序列的量化，考虑每个元素的权重。 |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | 结果等于 varPop 的平方根。 |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | 计算参数值的不同数量的近似值。 |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | 计算总体协方差的值 |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | 计算最大 `val` 值的 `arg` 值。 |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | 对一系列数字应用按位或。 |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | 使用 t-digest 算法计算数值数据序列的近似量化。 |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | 计算存储在动态列中的不同数据类型的列表。 |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | 根据 `key` 数组中指定的键对 `value` 数组求和。返回两个数组的元组：以排序顺序排列的键及对应键的求和值，没有溢出。 |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | 计算序列的样本峰度。 |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | 此函数实现随机逻辑回归。可用于二分类问题，支持与随机线性回归相同的自定义参数，并以相同的方式工作。 |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | 计算确定时间的值的指数移动平均。 |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | 计算不同参数值的近似数量。它与 uniqCombined 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对 String 数据类型。 |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | 对两个种群的样本应用均值 z 检验。 |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | 使用 HyperLogLog 算法计算不同参数值的近似数量。 |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | 将数组聚合到更大的数组中。 |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | 从不同的参数值中创建数组。 |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | 对一系列数字应用按位与。 |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | 求连续行之间的算术差值的总和。 |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | 返回前 N 个升序排列的项目数组。 |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive 函数 |
