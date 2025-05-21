---
'alias': []
'description': 'DWARF格式文档'
'input_format': true
'keywords':
- 'DWARF'
'output_format': false
'slug': '/interfaces/formats/DWARF'
'title': 'DWARF'
---



| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✔     | ✗       |       |

## 描述 {#description}

`DWARF` 格式解析 ELF 文件（可执行文件、库或目标文件）中的 DWARF 调试符号。它类似于 `dwarfdump`，但速度更快（数百 MB/s）且支持 SQL。它为 `.debug_info` 部分中的每个调试信息条目（DIE）生成一行，并包含 DWARF 编码用于终止树中子项列表的“null”条目。

:::info
`.debug_info` 由 *单元* 组成，单元对应于编译单元：
- 每个单元是 *DIE* 的树，以 `compile_unit` DIE 为根节点。
- 每个 DIE 有一个 *标签* 和一组 *属性*。
- 每个属性都有一个 *名称* 和一个 *值*（还有一个 *形式*，它指定值的编码方式）。

这些 DIE 表示源代码中的事物，它们的 *标签* 告诉你它是什么类型的事物。例如，有：

- 函数（标签 = `subprogram`）
- 类/结构/枚举 (`class_type`/`structure_type`/`enumeration_type`)
- 变量 (`variable`)
- 函数参数 (`formal_parameter`)。

树形结构镜像相应的源代码。例如，一个 `class_type` DIE 可以包含表示类方法的 `subprogram` DIE。
:::

`DWARF` 格式输出以下列：

- `offset` - DIE 在 `.debug_info` 部分中的位置
- `size` - 编码 DIE 的字节数（包括属性）
- `tag` - DIE 的类型；省略常规的 "DW_TAG_" 前缀
- `unit_name` - 包含此 DIE 的编译单元的名称
- `unit_offset` - 包含此 DIE 的编译单元在 `.debug_info` 部分中的位置
- `ancestor_tags` - 当前 DIE 在树中祖先的标签数组，顺序从最内层到最外层
- `ancestor_offsets` - 祖先的偏移量，与 `ancestor_tags` 平行
- 从属性数组中复制的一些常见属性，方便使用：
    - `name`
    - `linkage_name` - 修饰的全限定名称；通常只有函数有它（但并非所有函数都有）
    - `decl_file` - 声明此实体的源代码文件名称
    - `decl_line` - 声明此实体的源代码中的行号
- 描述属性的平行数组：
    - `attr_name` - 属性的名称；省略常规的 "DW_AT_" 前缀
    - `attr_form` - 属性的编码和解释方式；省略常规的 DW_FORM_ 前缀
    - `attr_int` - 属性的整数值；如果属性没有数值则为 0
    - `attr_str` - 属性的字符串值；如果属性没有字符串值则为空

## 示例用法 {#example-usage}

`DWARF` 格式可以用于查找具有最多函数定义的编译单元（包括模板实例化和来自包含头文件的函数）：

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

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```

## 格式设置 {#format-settings}
