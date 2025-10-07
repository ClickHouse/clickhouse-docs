---
'alias': []
'description': 'Values 格式的文档'
'input_format': true
'keywords':
- 'Values'
'output_format': true
'slug': '/interfaces/formats/Values'
'title': '值'
'doc_type': 'guide'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Values` 格式将每一行打印在方括号中。

- 行之间用逗号分隔，最后一行后没有逗号。
- 方括号内的值也用逗号分隔。
- 数字以十进制格式输出，不带引号。
- 数组以方括号输出。
- 字符串、日期和带时间的日期输出时带引号。
- 转义规则和解析方式类似于 [TabSeparated](TabSeparated/TabSeparated.md) 格式。

在格式化过程中，不会插入额外的空格，但在解析时，允许存在空格并进行跳过（数组值内的空格是不允许的）。
[`NULL`](/sql-reference/syntax.md) 表示为 `NULL`。

在使用 `Values` 格式传递数据时，必须转义的最小字符集：
- 单引号
- 反斜杠

这是在 `INSERT INTO t VALUES ...` 中使用的格式，但也可以用于格式化查询结果。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                     | 描述                                                                                                                                                                                   | 默认值 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 如果字段无法通过流解析器解析，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 如果字段无法通过流解析器解析，则运行 SQL 解析器，推导 SQL 表达式的模板，尝试利用该模板解析所有行，然后为所有行解释表达式。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 在使用模板解析和解释表达式时，检查文字的实际类型，以避免可能的溢出和精度问题。                                                       | `true`  |
