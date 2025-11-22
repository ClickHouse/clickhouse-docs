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

`DWARF` 格式从 ELF 文件(可执行文件、库或目标文件)中解析 DWARF 调试符号。
它类似于 `dwarfdump`,但速度更快(数百 MB/s)且支持 SQL。
它为 `.debug_info` 段中的每个调试信息条目(DIE)生成一行,
并包含 DWARF 编码用于终止树中子节点列表的"空"条目。

:::info
`.debug_info` 由 _单元_ 组成,这些单元对应于编译单元:

- 每个单元是一个 *DIE* 树,以 `compile_unit` DIE 作为根节点。
- 每个 DIE 都有一个 _标签_ 和一个 _属性_ 列表。
- 每个属性都有一个 _名称_ 和一个 _值_(以及一个 _形式_,用于指定值的编码方式)。

DIE 表示源代码中的元素,其 _标签_ 表明它是什么类型的元素。例如:

- 函数(标签 = `subprogram`)
- 类/结构体/枚举(`class_type`/`structure_type`/`enumeration_type`)
- 变量(`variable`)
- 函数参数(`formal_parameter`)。

树结构映射了相应的源代码结构。例如,一个 `class_type` DIE 可以包含表示该类方法的 `subprogram` DIE。
:::

`DWARF` 格式输出以下列:

- `offset` - DIE 在 `.debug_info` 段中的位置
- `size` - 编码的 DIE 的字节数(包括属性)
- `tag` - DIE 的类型;省略了常规的 "DW*TAG*" 前缀
- `unit_name` - 包含此 DIE 的编译单元的名称
- `unit_offset` - 包含此 DIE 的编译单元在 `.debug_info` 段中的位置
- `ancestor_tags` - 树中当前 DIE 的祖先标签数组,按从最内层到最外层的顺序排列
- `ancestor_offsets` - 祖先的偏移量,与 `ancestor_tags` 对应
- 为方便起见,从属性数组中复制的一些常见属性:
  - `name`
  - `linkage_name` - 修饰后的完全限定名称;通常只有函数具有此属性(但并非所有函数都有)
  - `decl_file` - 声明此实体的源代码文件名称
  - `decl_line` - 源代码中声明此实体的行号
- 描述属性的并行数组:
  - `attr_name` - 属性的名称;省略了常规的 "DW*AT*" 前缀
  - `attr_form` - 属性的编码和解释方式;省略了常规的 DW*FORM* 前缀
  - `attr_int` - 属性的整数值;如果属性没有数值,则为 0
  - `attr_str` - 属性的字符串值;如果属性没有字符串值,则为空


## 使用示例 {#example-usage}

`DWARF` 格式可用于查找包含最多函数定义的编译单元(包括模板实例化和头文件中的函数):

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

```text title="结果"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```


## 格式设置 {#format-settings}
