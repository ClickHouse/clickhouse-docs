---
'alias': []
'description': '值格式的文档'
'input_format': true
'keywords':
- 'Values'
'output_format': true
'slug': '/interfaces/formats/Values'
'title': '值'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Values` 格式以括号打印每一行。

- 行之间用逗号分隔，最后一行后不加逗号。
- 括号内的值也用逗号分隔。
- 数字以不带引号的小数格式输出。
- 数组以方括号输出。
- 字符串、日期和带时间的日期以引号输出。
- 转义规则和解析方式类似于 [TabSeparated](TabSeparated/TabSeparated.md) 格式。

在格式化过程中不会插入额外的空格，但在解析时允许存在并会被跳过（除了数组值中的空格是不允许的）。
[`NULL`](/sql-reference/syntax.md) 表示为 `NULL`。

在以 `Values` 格式传递数据时，您需要转义的最小字符集：
- 单引号
- 反斜杠

这是用于 `INSERT INTO t VALUES ...` 的格式，但您也可以将其用于格式化查询结果。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                     | 描述                                                                                                                                                                                        | 默认值  |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 如果字段无法被流解析器解析，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。                                                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 如果字段无法被流解析器解析，则运行 SQL 解析器，推导 SQL 表达式的模板，尝试使用模板解析所有行，然后对所有行解释表达式。                                                               | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 在使用模板解析和解释表达式时，检查文字的实际类型以避免可能的溢出和精度问题。                                                                                                         | `true`  |
