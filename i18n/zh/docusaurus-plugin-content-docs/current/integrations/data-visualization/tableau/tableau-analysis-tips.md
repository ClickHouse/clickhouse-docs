---
'sidebar_label': '分析提示'
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
'description': '使用ClickHouse官方连接器时的Tableau分析提示。'
'title': '分析提示'
---


# 分析提示
## MEDIAN() 和 PERCENTILE() 函数 {#median-and-percentile-functions}
- 在实时模式下，MEDIAN() 和 PERCENTILE() 函数（自连接器 v0.1.3 发布以来）使用 [ClickHouse 的 quantile()() 函数](/sql-reference/aggregate-functions/reference/quantile/)，这显著加快了计算速度，但使用了采样。如果您想要获得准确的计算结果，请使用函数 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()`（基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)）。
- 在提取模式下，您无法使用 MEDIAN_EXACT() 和 PERCENTILE_EXACT()，因为 MEDIAN() 和 PERCENTILE() 始终是准确的（但速度较慢）。
## 实时模式中计算字段的附加函数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse 有大量可以用于数据分析的函数——远超过 Tableau 支持的函数。为了方便用户，我们添加了在创建计算字段时可以在实时模式中使用的新函数。不幸的是，无法在 Tableau 界面中添加这些函数的描述，因此我们在此添加这些函数的描述。
- **[`-If` 聚合组合器](/sql-reference/aggregate-functions/combinators/#-if)** *(在 v0.2.3 中添加)* - 允许在聚合计算中直接使用行级过滤器。新增了 `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 函数。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(在 v0.2.1 中添加)* — 不再使用乏味的条形图！使用 `BAR()` 函数代替（等效于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar)）。例如，这个计算字段返回漂亮的条形图作为字符串：
```text
BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
```
```text
== BAR() ==
██████████████████▊  327.06 million
█████  88.02 million
███████████████  259.37 million
```
- **`COUNTD_UNIQ([my_field])`** *(在 v0.2.0 中添加)* — 计算参数的不同值的近似数量。等效于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。比 `COUNTD()` 快得多。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(在 v0.2.1 中添加)* — 等效于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval)。将日期或日期时间向下舍入到给定的间隔，例如：
```text
== my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
   28.07.2004 06:54:50    |              21.07.2004 00:00:00
   17.07.2004 14:01:56    |              11.07.2004 00:00:00
   14.07.2004 07:43:00    |              11.07.2004 00:00:00
```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(在 v0.2.1 中添加)* — 返回带有后缀（千、百万、十亿等）的四舍五入数字，作为字符串。这对于人类读取大数字非常有用。等效于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity)。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(在 v0.2.1 中添加)* — 接受以秒为单位的时间差。返回一个字符串形式的时间差（年、月、日、小时、分钟、秒）。 `optional_max_unit` 是最大显示单位。可接受的值：`seconds`, `minutes`, `hours`, `days`, `months`, `years`。等效于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta)。
- **`GET_SETTING([my_setting_name])`** *(在 v0.2.1 中添加)* — 返回当前自定义设置的值。等效于 [`getSetting()`](/sql-reference/functions/other-functions#getsetting)。
- **`HEX([my_string])`** *(在 v0.2.1 中添加)* — 返回包含参数的十六进制表示的字符串。等效于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
- **`KURTOSIS([my_number])`** — 计算序列的样本峰度。等效于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
- **`KURTOSISP([my_number])`** — 计算序列的峰度。等效于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
- **`MEDIAN_EXACT([my_number])`** *(在 v0.1.3 中添加)* — 精确计算数值数据序列的中位数。等效于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`MOD([my_number_1], [my_number_2])`** — 计算除法后的余数。如果参数是浮点数，则它们会被预先转换为整数，去掉小数部分。等效于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(在 v0.1.3 中添加)* — 精确计算数值数据序列的百分位数。推荐的级别范围是 [0.01, 0.99]。等效于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`PROPER([my_string])`** *(在 v0.2.5 中添加)* - 将文本字符串转换为每个单词的首字母大写，其余字母小写。空格和非字母数字字符（如标点符号）也作为分隔符。举个例子：
```text
PROPER("PRODUCT name") => "Product Name"
```
```text
PROPER("darcy-mae") => "Darcy-Mae"
```
- **`RAND()`** *(在 v0.2.1 中添加)* — 返回整数 (UInt32) 数字，例如 `3446222955`。等效于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
- **`RANDOM()`** *(在 v0.2.1 中添加)* — 非官方的 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 函数，返回介于 0 到 1 之间的浮点数。
- **`RAND_CONSTANT([optional_field])`** *(在 v0.2.1 中添加)* — 生成一个具有随机值的常量列。类似于 `{RAND()}` 的固定 LOD，但更快。等效于 [`randConstant()`](/sql-reference/functions/random-functions/#randconstant)。
- **`REAL([my_number])`** — 将字段转换为浮点数 (Float64)。详情见 [`here`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** *(在 v0.2.1 中添加)* — 从字符串计算 SHA-256 哈希，并将结果字节集作为字符串返回 (FixedString)。与 `HEX()` 函数一起使用非常方便，例如，`HEX(SHA256([my_string]))`。等效于 [`SHA256()`](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256)。
- **`SKEWNESS([my_number])`** — 计算序列的样本偏度。等效于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
- **`SKEWNESSP([my_number])`** — 计算序列的偏度。等效于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
- **`TO_TYPE_NAME([field])`** *(在 v0.2.1 中添加)* — 返回一个字符串，包含传入参数的 ClickHouse 类型名称。等效于 [`toTypeName()`](/sql-reference/functions/other-functions#totypename)。
- **`TRUNC([my_float])`** — 它与 `FLOOR([my_float])` 函数相同。等效于 [`trunc()`](/sql-reference/functions/rounding-functions#truncate)。
- **`UNHEX([my_string])`** *(在 v0.2.1 中添加)* — 执行 `HEX()` 的相反操作。等效于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。
