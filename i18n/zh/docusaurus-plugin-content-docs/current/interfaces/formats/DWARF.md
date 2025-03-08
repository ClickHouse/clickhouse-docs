---
title: 'DWARF'
slug: '/interfaces/formats/DWARF'
keywords: ['DWARF']
input_format: true
output_format: false
alias: []
---

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✔     | ✗       |       |

## 描述 {#description}

`DWARF` 格式解析来自 ELF 文件（可执行文件、库或对象文件）的 DWARF 调试符号。 
它与 `dwarfdump` 类似，但速度更快（每秒数百 MB）且支持 SQL。 
它为 `.debug_info` 部分中每个调试信息条目（DIE）生成一行，并包括 DWARF 编码用于终止树中子项列表的“null”条目。

:::info
`.debug_info` 由与编译单元对应的 *units* 组成： 
- 每个单元是 *DIE* 的树，其根是 `compile_unit` DIE。 
- 每个 DIE 具有一个 *tag* 和一个 *attributes* 列表。 
- 每个属性都有一个 *name* 和一个 *value*（还有一个 *form*，指定值的编码方式）。 

DIE 表示源代码中的事物，其 *tag* 告诉你它是什么类型的事物。例如，有：

- 函数（tag = `subprogram`）
- 类/结构体/枚举（`class_type`/`structure_type`/`enumeration_type`）
- 变量（`variable`）
- 函数参数（`formal_parameter`）。

树结构与相应的源代码镜像。例如，`class_type` DIE 可以包含 `subprogram` DIE，表示该类的方法。
:::

`DWARF` 格式输出以下列：

- `offset` - DIE 在 `.debug_info` 部分中的位置
- `size` - 编码的 DIE 中的字节数（包括属性）
- `tag` - DIE 的类型；省略常规的 "DW_TAG_" 前缀
- `unit_name` - 包含该 DIE 的编译单元名称
- `unit_offset` - 包含该 DIE 的编译单元在 `.debug_info` 部分中的位置
- `ancestor_tags` - 当前 DIE 在树中父项的标签数组，按从内到外的顺序
- `ancestor_offsets` - 与 `ancestor_tags` 平行的父项偏移量
- 为方便起见，从属性数组中重复的几个常见属性：
    - `name`
    - `linkage_name` - 加工过的完整限定名；通常只有函数具有它（但不是所有函数）
    - `decl_file` - 声明此实体的源代码文件名称
    - `decl_line` - 声明此实体的源代码中的行号
- 描述属性的平行数组：
    - `attr_name` - 属性名称；省略常规的 "DW_AT_" 前缀
    - `attr_form` - 属性的编码和解释方式；省略常规 DW_FORM_ 前缀
    - `attr_int` - 属性的整数值；如果属性没有数值，则为 0
    - `attr_str` - 属性的字符串值；如果属性没有字符串值，则为空

## 示例用法 {#example-usage}

`DWARF` 格式可用于查找具有最多函数定义的编译单元（包括模板实例和来自包含头文件的函数）：

```sql title="查询"
SELECT
    unit_name,
    count() AS c
FROM file('programs/clickhouse', DWARF)
WHERE tag = 'subprogram' AND NOT has(attr_name, 'declaration')
GROUP BY unit_name
ORDER BY c DESC
LIMIT 3
```
```text title="响应"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```

## 格式设置 {#format-settings}
