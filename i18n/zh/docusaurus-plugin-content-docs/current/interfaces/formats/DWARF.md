---
alias: []
description: 'DWARF 格式文档'
input_format: true
keywords: ['DWARF']
output_format: false
slug: /interfaces/formats/DWARF
title: 'DWARF'
doc_type: 'reference'
---

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✔     | ✗       |       |



## 描述 {#description}

`DWARF` 格式用于从 ELF 文件（可执行文件、库或目标文件）中解析 DWARF 调试符号。  
它类似于 `dwarfdump`，但速度要快得多（每秒数百 MB），并且支持 SQL。  
它会为 `.debug_info` 段中的每个 Debug Information Entry（DIE）生成一行，
并包含 DWARF 编码用于在树中终止子节点列表的 “null” 条目。

:::info
`.debug_info` 由若干 *unit* 组成，对应于编译单元：
- 每个 unit 是一个由 *DIE* 构成的树，以一个 `compile_unit` DIE 作为其根。 
- 每个 DIE 具有一个 *tag* 和一个 *attribute* 列表。 
- 每个 attribute 具有一个 *name* 和一个 *value*（以及一个 *form*，用于指定该值的编码方式）。 

DIE 表示源代码中的实体，其 *tag* 指出它是哪一种实体。例如，有：

- 函数（tag = `subprogram`）
- 类 / 结构体 / 枚举（`class_type` / `structure_type` / `enumeration_type`）
- 变量（`variable`）
- 函数参数（`formal_parameter`）。

树结构反映了对应的源代码结构。例如，一个 `class_type` DIE 可以包含表示该类方法的 `subprogram` DIE。
:::

`DWARF` 格式输出如下列：

- `offset` - DIE 在 `.debug_info` 段中的位置
- `size` - 编码后的 DIE 所占字节数（包括属性）
- `tag` - DIE 的类型；省略传统的 "DW_TAG_" 前缀
- `unit_name` - 包含该 DIE 的编译单元名称
- `unit_offset` - 包含该 DIE 的编译单元在 `.debug_info` 段中的位置
- `ancestor_tags` - 当前 DIE 在树中所有祖先节点的 tag 组成的数组，按从内到外的顺序排列
- `ancestor_offsets` - 祖先的 offset，与 `ancestor_tags` 一一对应
- 为方便起见，从属性数组中复制的一些常见属性：
  - `name`
  - `linkage_name` - 经过重整（mangled）的完全限定名；通常只有函数才有（且并非所有函数都有）
  - `decl_file` - 声明该实体的源代码文件名
  - `decl_line` - 声明该实体的源代码行号
- 描述属性的并行数组：
  - `attr_name` - 属性名称；省略传统的 "DW_AT_" 前缀
  - `attr_form` - 属性的编码和解释方式；省略传统的 DW_FORM_ 前缀
  - `attr_int` - 属性的整数值；如果该属性没有数值，则为 0
  - `attr_str` - 属性的字符串值；如果该属性没有字符串值，则为空



## 示例用法

`DWARF` 格式可用于查找函数定义数量最多的编译单元（包括模板实例化以及来自包含头文件中的函数）：

```sql title="Query"
SELECT
    unit_name,
    count() AS c
FROM file('programs/clickhouse', DWARF)
WHERE tag = 'subprogram' AND NOT has(attr_name, 'declaration')
GROUP BY unit_name
ORDER BY c DESC
LIMIT 3
```

```text title="Response"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

返回 3 行。用时:1.487 秒。已处理 1.3976 亿行,1.12 GB(9397 万行/秒,752.77 MB/秒)。
内存峰值:271.92 MiB。
```


## 格式设置 {#format-settings}
