---
'alias': []
'description': '原生格式的文档'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': '原生'
---



| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Native` 格式是 ClickHouse 中最有效的格式，因为它确实是“列式”的，因为它不将列转换为行。

在此格式中，数据以二进制格式通过 [块](/development/architecture#block) 写入和读取。对于每个块，记录行数、列数、列名称和类型，以及该块中列的部分内容，依次进行记录。

这是在服务器之间进行交互的本地接口、使用命令行客户端和 C++ 客户端时所使用的格式。

:::tip
您可以使用此格式快速生成仅可由 ClickHouse DBMS 读取的转储。您自己使用这种格式可能不太实际。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
