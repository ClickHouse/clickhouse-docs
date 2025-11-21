---
sidebar_label: '分析技巧'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器进行 Tableau 分析的技巧。'
title: '分析技巧'
doc_type: 'guide'
---



# 分析技巧

## MEDIAN() 和 PERCENTILE() 函数 {#median-and-percentile-functions}

- 在 Live 模式下,MEDIAN() 和 PERCENTILE() 函数(自连接器 v0.1.3 版本起)使用 [ClickHouse quantile()() 函数](/sql-reference/aggregate-functions/reference/quantile/),这显著加快了计算速度,但使用了采样。如果您需要获得精确的计算结果,请使用 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()` 函数(基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/))。
- 在 Extract 模式下,您不能使用 MEDIAN_EXACT() 和 PERCENTILE_EXACT(),因为 MEDIAN() 和 PERCENTILE() 始终是精确的(但速度较慢)。

## Live 模式下计算字段的附加函数 {#additional-functions-for-calculated-fields-in-live-mode}

ClickHouse 拥有大量可用于数据分析的函数——远超 Tableau 所支持的数量。为了方便用户,我们添加了新函数,可在 Live 模式下创建计算字段时使用。遗憾的是,无法在 Tableau 界面中为这些函数添加描述,因此我们将在此处为它们提供说明。

- **[`-If` 聚合组合器](/sql-reference/aggregate-functions/combinators/#-if)** _(在 v0.2.3 中添加)_ - 允许在聚合计算中直接使用行级过滤器。已添加 `SUM_IF()、AVG_IF()、COUNT_IF()、MIN_IF() 和 MAX_IF()` 函数。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** _(在 v0.2.1 中添加)_ — 忘掉枯燥的条形图吧!改用 `BAR()` 函数(相当于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar))。例如,此计算字段以字符串形式返回美观的条形图:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
- **`COUNTD_UNIQ([my_field])`** _(在 v0.2.0 中添加)_ — 计算参数不同值的近似数量。相当于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。比 `COUNTD()` 快得多。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** _(在 v0.2.1 中添加)_ — 相当于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)。将日期或日期时间向下舍入到给定的间隔,例如:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** _(在 v0.2.1 中添加)_ — 返回带有后缀(千、百万、十亿等)的舍入数字字符串。便于人类阅读大数字。相当于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** _(在 v0.2.1 中添加)_ — 接受以秒为单位的时间差。返回包含(年、月、日、时、分、秒)的时间差字符串。`optional_max_unit` 是要显示的最大单位。可接受的值:`seconds`、`minutes`、`hours`、`days`、`months`、`years`。相当于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)。
- **`GET_SETTING([my_setting_name])`** _(在 v0.2.1 中添加)_ — 返回自定义设置的当前值。相当于 [`getSetting()`](/sql-reference/functions/other-functions#getSetting)。
- **`HEX([my_string])`** _(在 v0.2.1 中添加)_ — 返回包含参数十六进制表示的字符串。相当于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
- **`KURTOSIS([my_number])`** — 计算序列的样本峰度。相当于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
- **`KURTOSISP([my_number])`** — 计算序列的峰度。相当于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
- **`MEDIAN_EXACT([my_number])`** _(在 v0.1.3 中添加)_ — 精确计算数值数据序列的中位数。相当于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`MOD([my_number_1], [my_number_2])`** — 计算除法后的余数。如果参数是浮点数,则通过删除小数部分将其预先转换为整数。相当于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
- **`PERCENTILE_EXACT([my_number], [level_float])`** _(在 v0.1.3 中添加)_ — 精确计算数值数据序列的百分位数。建议的级别范围是 [0.01, 0.99]。相当于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`PROPER([my_string])`** _(在 v0.2.5 中添加)_ - 转换文本字符串,使每个单词的首字母大写,其余字母小写。空格和非字母数字字符(如标点符号)也充当分隔符。例如:
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
- **`RAND()`** _(在 v0.2.1 中添加)_ — 返回整数(UInt32)数字,例如 `3446222955`。相当于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
- **`RANDOM()`** _(在 v0.2.1 中添加)_ — 非官方的 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 函数,返回 0 到 1 之间的浮点数。
- **`RAND_CONSTANT([optional_field])`** _(在 v0.2.1 中添加)_ — 生成具有随机值的常量列。类似于 `{RAND()}` 固定 LOD,但速度更快。相当于 [`randConstant()`](/sql-reference/functions/random-functions/#randConstant)。
- **`REAL([my_number])`** — 将字段转换为浮点数(Float64)。详细信息请参见[此处](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** _(在 v0.2.1 中添加)_ — 从字符串计算 SHA-256 哈希值,并将结果字节集作为字符串(FixedString)返回。便于与 `HEX()` 函数一起使用,例如 `HEX(SHA256([my_string]))`。相当于 [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)。
- **`SKEWNESS([my_number])`** — 计算序列的样本偏度。相当于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
- **`SKEWNESSP([my_number])`** — 计算序列的偏度。相当于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
- **`TO_TYPE_NAME([field])`** _(在 v0.2.1 中添加)_ — 返回包含传递参数的 ClickHouse 类型名称的字符串。相当于 [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName)。
- **`TRUNC([my_float])`** — 与 `FLOOR([my_float])` 函数相同。相当于 [`trunc()`](/sql-reference/functions/rounding-functions#trunc)。
- **`UNHEX([my_string])`** _(在 v0.2.1 中添加)_ — 执行 `HEX()` 的相反操作。相当于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。
