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
'description': '在使用ClickHouse官方连接器时的Tableau分析技巧。'
'title': '分析技巧'
---




# 分析提示
## MEDIAN() 和 PERCENTILE() 函数 {#median-and-percentile-functions}
- 在实时模式下，MEDIAN() 和 PERCENTILE() 函数（自 connector v0.1.3 发布以来）使用 [ClickHouse 的 quantile()() 函数](/sql-reference/aggregate-functions/reference/quantile/)，这显著加快了计算速度，但使用了采样。如果您想获得准确的计算结果，请使用函数 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()`（基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)）。
- 在提取模式下，您无法使用 MEDIAN_EXACT() 和 PERCENTILE_EXACT()，因为 MEDIAN() 和 PERCENTILE() 总是准确的（但速度较慢）。

## 实时模式下计算字段的附加函数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse 有大量可以用于数据分析的函数——远超过 Tableau 支持的数量。为方便用户，我们添加了可以在创建计算字段时在实时模式下使用的新函数。不幸的是，无法在 Tableau 界面中为这些函数添加描述，因此我们将在此处添加描述。
- **[`-If` 聚合组合器](/sql-reference/aggregate-functions/combinators/#-if)** *(添加于 v0.2.3)* - 允许在聚合计算中直接使用行级过滤器。新增了 `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 函数。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(添加于 v0.2.1)* — 不再使用乏味的条形图！使用 `BAR()` 函数（相当于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar)）。例如，计算字段返回漂亮的条形作为字符串：
```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
```
```text
    == BAR() ==
    ██████████████████▊  327.06 million
    █████  88.02 million
    ███████████████  259.37 million
```
- **`COUNTD_UNIQ([my_field])`** *(添加于 v0.2.0)* — 计算参数的不同值的近似数量。相当于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。比 `COUNTD()` 快得多。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(添加于 v0.2.1)* — 相当于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval)。将日期或日期时间向下舍入到给定的区间，例如：
```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(添加于 v0.2.1)* — 返回带有后缀（千，百万，十亿等）的四舍五入数字作为字符串。对于人类阅读大数字很有用。相当于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity)。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(添加于 v0.2.1)* — 接受以秒为单位的时间差。返回带有（年，月，日，时，分，秒）的时间间隔作为字符串。`optional_max_unit` 是要显示的最大单位。可接受值：`seconds`，`minutes`，`hours`，`days`，`months`，`years`。相当于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta)。
- **`GET_SETTING([my_setting_name])`** *(添加于 v0.2.1)* — 返回自定义设置的当前值。相当于 [`getSetting()`](/sql-reference/functions/other-functions#getsetting)。
- **`HEX([my_string])`** *(添加于 v0.2.1)* — 返回包含参数的十六进制表示的字符串。相当于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
- **`KURTOSIS([my_number])`** — 计算序列的样本峰度。相当于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
- **`KURTOSISP([my_number])`** — 计算序列的峰度。相当于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
- **`MEDIAN_EXACT([my_number])`** *(添加于 v0.1.3)* — 精确计算数值数据序列的中位数。相当于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`MOD([my_number_1], [my_number_2])`** — 计算除法后的余数。如果参数是浮点数，则将其预先转换为整数，去掉小数部分。相当于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(添加于 v0.1.3)* — 精确计算数值数据序列的百分位数。推荐的级别范围是 [0.01, 0.99]。相当于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`PROPER([my_string])`** *(添加于 v0.2.5)* - 将文本字符串转换为每个单词的首字母大写，其余字母小写。空格和标点等非字母数字字符也作为分隔符。例如：
```text
    PROPER("PRODUCT name") => "Product Name"
```
```text
    PROPER("darcy-mae") => "Darcy-Mae"
```
- **`RAND()`** *(添加于 v0.2.1)* — 返回整数 (UInt32) 数字，例如 `3446222955`。相当于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
- **`RANDOM()`** *(添加于 v0.2.1)* — 非官方 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 函数，返回 0 和 1 之间的浮点数。
- **`RAND_CONSTANT([optional_field])`** *(添加于 v0.2.1)* — 生成一个具有随机值的常量列。类似于 `{RAND()}` 固定 LOD，但更快。相当于 [`randConstant()`](/sql-reference/functions/random-functions/#randconstant)。
- **`REAL([my_number])`** — 将字段转换为浮点数 (Float64)。详细信息请参见 [`here`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** *(添加于 v0.2.1)* — 计算字符串的 SHA-256 哈希并以字符串（FixedString）返回结果字节集。便于与 `HEX()` 函数一起使用，例如 `HEX(SHA256([my_string]))`。相当于 [`SHA256()`](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256)。
- **`SKEWNESS([my_number])`** — 计算序列的样本偏度。相当于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
- **`SKEWNESSP([my_number])`** — 计算序列的偏度。相当于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
- **`TO_TYPE_NAME([field])`** *(添加于 v0.2.1)* — 返回一个字符串，包含传递参数的 ClickHouse 类型名称。相当于 [`toTypeName()`](/sql-reference/functions/other-functions#totypename)。
- **`TRUNC([my_float])`** — 与 `FLOOR([my_float])` 函数相同。相当于 [`trunc()`](/sql-reference/functions/rounding-functions#truncate)。
- **`UNHEX([my_string])`** *(添加于 v0.2.1)* — 执行 `HEX()` 的相反操作。相当于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。
