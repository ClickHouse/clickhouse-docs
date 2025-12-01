---
alias: []
description: 'Values 格式文档'
input_format: true
keywords: ['Values']
output_format: true
slug: /interfaces/formats/Values
title: 'Values'
doc_type: 'guide'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

`Values` 格式会将每一行数据打印在一对括号中。 

- 各行之间使用逗号分隔，最后一行后面没有逗号。 
- 括号中的各个值也使用逗号分隔。 
- 数字以十进制格式输出且不带引号。 
- 数组以方括号形式输出。 
- 字符串、日期以及带时间的日期以带引号的形式输出。 
- 转义规则和解析方式与 [TabSeparated](TabSeparated/TabSeparated.md) 格式类似。

在格式化输出时，不会插入多余的空格；在解析输入时，允许出现空格并会被跳过（数组值内部的空格除外，不被允许）。 
[`NULL`](/sql-reference/syntax.md) 表示为 `NULL`。

在以 `Values` 格式传递数据时，需要转义的最小字符集合为： 
- 单引号
- 反斜杠

这是在 `INSERT INTO t VALUES ...` 语句中使用的格式，但你也可以用它来格式化查询结果。



## 使用示例 {#example-usage}



## 格式设置 {#format-settings}

| 设置                                                                                                                                                        | 说明                                                                                                                                                                                          | 默认值  |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 如果字段无法被流式解析器解析，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。                                                                              | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 如果字段无法被流式解析器解析，则运行 SQL 解析器，推断 SQL 表达式模板，尝试使用该模板解析所有行，然后对所有行的表达式进行解释。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 使用模板解析并解释表达式时，检查字面量的实际类型，以避免可能的溢出和精度问题。                                                                           | `true`  |
