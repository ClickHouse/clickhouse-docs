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



## 描述 {#description}

`Values` 格式将每一行打印在括号中。

- 行之间用逗号分隔,最后一行后不加逗号。
- 括号内的值也用逗号分隔。
- 数字以十进制格式输出,不带引号。
- 数组用方括号输出。
- 字符串、日期和带时间的日期用引号输出。
- 转义规则和解析方式与 [TabSeparated](TabSeparated/TabSeparated.md) 格式类似。

格式化时不会插入额外的空格,但解析时允许空格并会跳过(数组值内部的空格除外,不允许)。
[`NULL`](/sql-reference/syntax.md) 表示为 `NULL`。

在 `Values` 格式中传递数据时需要转义的最小字符集:

- 单引号
- 反斜杠

这是 `INSERT INTO t VALUES ...` 中使用的格式,但您也可以用它来格式化查询结果。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

| 设置                                                                                                                                                     | 描述                                                                                                                                                                                   | 默认值 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 如果流式解析器无法解析字段,则运行 SQL 解析器并尝试将其解释为 SQL 表达式。                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 如果流式解析器无法解析字段,则运行 SQL 解析器,推导 SQL 表达式模板,尝试使用该模板解析所有行,然后对所有行解释表达式。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 使用模板解析和解释表达式时,检查字面量的实际类型,以避免可能的溢出和精度问题。                                                       | `true`  |
