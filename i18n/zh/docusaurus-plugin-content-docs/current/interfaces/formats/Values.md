---
title: '值'
slug: /interfaces/formats/Values
keywords: ['值']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

`Values` 格式将每一行打印在括号中。

- 行之间用逗号分隔，最后一行后不加逗号。
- 括号内的值也是用逗号分隔。
- 数字以不带引号的小数格式输出。
- 数组以方括号输出。
- 字符串、日期和带时间的日期以引号输出。
- 转义规则和解析与 [TabSeparated](TabSeparated/TabSeparated.md) 格式相似。

在格式化时，不会插入额外的空格，但在解析时是允许的并会跳过（数组值内的空格不允许）。

[`NULL`](/sql-reference/syntax.md) 表示为 `NULL`。

在使用 `Values` 格式传递数据时，您需要转义的最小字符集：
- 单引号
- 反斜杠

这是用于 `INSERT INTO t VALUES ...` 的格式，但您也可以将其用于格式化查询结果。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                       | 描述                                                                                                                                                                                      | 默认   |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 如果字段无法通过流解析器解析，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。                                                                                                         | `true` |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 如果字段无法通过流解析器解析，则运行 SQL 解析器，推断 SQL 表达式的模板，尝试使用模板解析所有行，然后为所有行解释表达式。                                                         | `true` |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 在使用模板解析和解释表达式时，检查文字的实际类型，以避免可能的溢出和精度问题。                                                                                                     | `true` |
