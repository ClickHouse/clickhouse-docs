---
'alias': []
'description': '本地格式的文档'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': '本地'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

`Native` 格式是 ClickHouse 最有效的格式，因为它是真正的“列式”格式，实际上并没有将列转换成行。

在此格式中，数据是以二进制格式由 [blocks](/development/architecture#block) 写入和读取的。
对于每个块，记录行数、列数、列名称和类型，以及块中列的部分，依次记录。

这是在服务器之间进行交互、使用命令行客户端以及 C++ 客户端时所使用的原生接口格式。

:::tip
您可以使用此格式快速生成只能被 ClickHouse DBMS 读取的转储。
自己使用此格式可能并不实际。
:::

## Example Usage {#example-usage}

## Format Settings {#format-settings}
