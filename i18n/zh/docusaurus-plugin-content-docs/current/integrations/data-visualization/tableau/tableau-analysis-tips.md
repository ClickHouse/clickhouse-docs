---
'sidebar_label': '分析技巧'
'sidebar_position': 4
'slug': '/integrations/tableau/analysis-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': '使用 ClickHouse 官方连接器时的 Tableau 分析技巧。'
'title': '分析技巧'
'doc_type': 'guide'
---


# 分析提示
## MEDIAN() 和 PERCENTILE() 函数 {#median-and-percentile-functions}
- 在直播模式下，MEDIAN() 和 PERCENTILE() 函数（自连接器 v0.1.3 发布以来）使用 [ClickHouse quantile() 函数](/sql-reference/aggregate-functions/reference/quantile/)，这大大加快了计算速度，但使用了抽样。如果您想获得准确的计算结果，请使用函数 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()`（基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)）。
- 在提取模式下，您无法使用 MEDIAN_EXACT() 和 PERCENTILE_EXACT()，因为 MEDIAN() 和 PERCENTILE() 始终是准确的（且速度较慢）。
## 直播模式下计算字段的附加函数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse 具有大量可用于数据分析的函数 — 比 Tableau 支持的要多得多。为了方便用户，我们添加了一些新的函数，这些函数在创建计算字段时可在直播模式中使用。不幸的是，无法在 Tableau 界面中为这些函数添加描述，因此我们将在这里为它们添加描述。
- **[`-If` 聚合组合器](/sql-reference/aggregate-functions/combinators/#-if)** *(在 v0.2.3 中添加)* - 允许直接在聚合计算中使用行级过滤器。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 函数已被添加。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(在 v0.2.1 中添加)* — 忘掉无聊的条形图吧！改用 `BAR()` 函数（等同于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar)）。例如，这个计算字段返回漂亮的条形字符串：
```text
BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
```
```text
== BAR() ==
██████████████████▊  327.06 million
█████  88.02 million
███████████████  259.37 million
```
- **`COUNTD_UNIQ([my_field])`** *(在 v0.2.0 中添加)* — 计算参数不同值的近似数量。等同于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。比 `COUNTD()` 快得多。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(在 v0.2.1 中添加)* — 等同于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)。将日期或日期和时间向下舍入到给定的间隔，例如：
```text
== my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
   28.07.2004 06:54:50    |              21.07.2004 00:00:00
   17.07.2004 14:01:56    |              11.07.2004 00:00:00
   14.07.2004 07:43:00    |              11.07.2004 00:00:00
```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(在 v0.2.1 中添加)* — 返回带有后缀（千，百万，十亿等）的四舍五入数字，作为字符串。它方便人们阅读大数字。等同于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity)。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(在 v0.2.1 中添加)* — 接受以秒为单位的时间差。返回包含（年，月，日，小时，分钟，秒）的时间差作为字符串。`optional_max_unit` 是显示的最大单位。可接受的值：`seconds`，`minutes`，`hours`，`days`，`months`，`years`。等同于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta)。
- **`GET_SETTING([my_setting_name])`** *(在 v0.2.1 中添加)* — 返回自定义设置的当前值。等同于 [`getSetting()`](/sql-reference/functions/other-functions#getsetting)。
- **`HEX([my_string])`** *(在 v0.2.1 中添加)* — 返回包含参数十六进制表示的字符串。等同于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
- **`KURTOSIS([my_number])`** — 计算序列的样本峰度。等同于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
- **`KURTOSISP([my_number])`** — 计算序列的峰度。等同于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
- **`MEDIAN_EXACT([my_number])`** *(在 v0.1.3 中添加)* — 精确计算数值数据序列的中位数。等同于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`MOD([my_number_1], [my_number_2])`** — 计算除法后的余数。如果参数是浮点数，将通过去掉小数部分进行预先转换为整数。等同于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(在 v0.1.3 中添加)* — 精确计算数值数据序列的百分位。推荐的级别范围是 [0.01, 0.99]。等同于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`PROPER([my_string])`** *(在 v0.2.5 中添加)* - 转换文本字符串，使每个单词的首字母大写，其他字母为小写。空格和标点等非字母数字字符也作为分隔符。例如：
```text
PROPER("PRODUCT name") => "Product Name"
```
```text
PROPER("darcy-mae") => "Darcy-Mae"
```
- **`RAND()`** *(在 v0.2.1 中添加)* — 返回整数（UInt32）数字，例如 `3446222955`。等同于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
- **`RANDOM()`** *(在 v0.2.1 中添加)* — 非官方 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 函数，返回介于 0 和 1 之间的浮点数。
- **`RAND_CONSTANT([optional_field])`** *(在 v0.2.1 中添加)* — 生成带有随机值的常量列。类似于 `{RAND()}` 固定 LOD，但更快。等同于 [`randConstant()`](/sql-reference/functions/random-functions/#randconstant)。
- **`REAL([my_number])`** — 将字段转换为浮点数（Float64）。详细信息见 [`here`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** *(在 v0.2.1 中添加)* — 从字符串计算 SHA-256 哈希，并将生成的字节集作为字符串（FixedString）返回。与 `HEX()` 函数结合使用时非常方便，例如，`HEX(SHA256([my_string]))`。等同于 [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)。
- **`SKEWNESS([my_number])`** — 计算序列的样本偏度。等同于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
- **`SKEWNESSP([my_number])`** — 计算序列的偏度。等同于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
- **`TO_TYPE_NAME([field])`** *(在 v0.2.1 中添加)* — 返回包含传递参数的 ClickHouse 类型名称的字符串。等同于 [`toTypeName()`](/sql-reference/functions/other-functions#totypename)。
- **`TRUNC([my_float])`** — 与 `FLOOR([my_float])` 函数相同。等同于 [`trunc()`](/sql-reference/functions/rounding-functions#truncate)。
- **`UNHEX([my_string])`** *(在 v0.2.1 中添加)* — 执行 `HEX()` 的反操作。等同于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。
