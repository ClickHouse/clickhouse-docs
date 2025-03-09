---
title: Native
slug: /interfaces/formats/Native
keywords: ['Native']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Native` 格式是 ClickHouse 最高效的格式，因为它真正地“列式”，即它不将列转换为行。

在此格式中，数据以二进制格式由 [块](/development/architecture#block) 写入和读取。 
对于每个块，记录行数、列数、列名和类型，以及该块中列的部分。

这是在服务器之间交互、使用命令行客户端以及 C++ 客户端时使用的原生接口格式。

:::tip
您可以使用此格式快速生成仅可由 ClickHouse DBMS 读取的转储。 
自己使用此格式可能不太实际。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
