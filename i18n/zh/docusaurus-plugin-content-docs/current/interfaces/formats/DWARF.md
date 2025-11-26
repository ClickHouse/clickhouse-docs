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
它与 `dwarfdump` 类似，但速度要快得多（数百 MB/s），并且支持 SQL。
它会为 `.debug_info` 区段中的每个调试信息条目（DIE，Debug Information Entry）生成一行记录，
并包括 DWARF 编码中用于在树形结构中终止子节点列表的“空”条目。

:::info
`.debug_info` 由若干 *unit* 组成，对应于编译单元（compilation unit）：

- 每个 unit 是一个由若干 *DIE* 构成的树，根节点是一个 `compile_unit` DIE。
- 每个 DIE 具有一个 *tag* 和一个属性（*attributes*）列表。
- 每个 attribute 具有 *name* 和 *value*（以及一个 *form*，用于指定该值的编码方式）。

这些 DIE 表示源代码中的实体，其 *tag* 指明了它代表的实体类型。例如，有：

- 函数（tag = `subprogram`）
- 类/结构体/枚举（`class_type`/`structure_type`/`enumeration_type`）
- 变量（`variable`）
- 函数参数（`formal_parameter`）。

树形结构反映了对应的源代码结构。例如，一个 `class_type` DIE 可以包含若干 `subprogram` DIE，用于表示该类的方法。
:::

`DWARF` 格式输出以下列：

- `offset` - DIE 在 `.debug_info` 区段中的位置
- `size` - 编码后的 DIE 所占的字节数（包括属性）
- `tag` - DIE 的类型；省略常规前缀 "DW_TAG_"
- `unit_name` - 包含此 DIE 的编译单元名称
- `unit_offset` - 包含此 DIE 的编译单元在 `.debug_info` 区段中的位置
- `ancestor_tags` - 当前 DIE 在树中的各级祖先节点的 tag 数组，从最内层到最外层依次排列
- `ancestor_offsets` - 各级祖先节点的 offset，与 `ancestor_tags` 一一对应
- 为了方便使用，从属性数组中复制出的若干常见属性：
  - `name`
  - `linkage_name` - 经重整（mangled）的完全限定名称；通常只有函数才有（但并非所有函数都有）
  - `decl_file` - 声明该实体的源代码文件名
  - `decl_line` - 声明该实体所在的源代码行号
- 使用并行数组描述属性：
  - `attr_name` - 属性名称；省略常规前缀 "DW_AT_"
  - `attr_form` - 属性的编码和解释方式；省略常规前缀 `DW_FORM_`
  - `attr_int` - 属性的整数值；如果该属性没有数值型值则为 0
  - `attr_str` - 属性的字符串值；如果该属性没有字符串值则为空

## 使用示例

`DWARF` 格式可用于查找函数定义数量最多的编译单元（包括模板实例化以及来自所包含头文件的函数）：

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

返回了 3 行。耗时：1.487 秒。处理了 1.3976 亿行，1.12 GB（9397 万行/秒，752.77 MB/秒）。
峰值内存使用：271.92 MiB。
```


## 格式设置 {#format-settings}