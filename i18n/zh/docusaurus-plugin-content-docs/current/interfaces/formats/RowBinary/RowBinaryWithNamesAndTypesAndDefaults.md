---
alias: []
description: 'RowBinaryWithNamesAndTypesAndDefaults 格式文档'
input_format: true
keywords: ['RowBinaryWithNamesAndTypesAndDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithNamesAndTypesAndDefaults
title: 'RowBinaryWithNamesAndTypesAndDefaults'
doc_type: '参考'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✗  |    |

## 描述 \{#description\}

与 [`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md) 格式类似，但每个单元前都会额外添加一个字节，用于指示是否应使用该列的 `DEFAULT` 值——这一点与 [`RowBinaryWithDefaults`](./RowBinaryWithDefaults.md) 格式完全相同。两者结合后可支持 schema 演进中的 `INSERT`：写入方可以在请求头中省略某些列 (这些列将采用目标列的 `DEFAULT` 值) ；而对于实际发送的列，则可以将其中的单个单元标记为“使用该列的 `DEFAULT`”，且不会与 `NULL` 混淆。

此格式仅支持输入。

## 传输格式 \{#wire-format\}

请求头与 [`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md) 相同：

1. 一个 `VarUInt`，表示列数 `N`。
2. `N` 个带长度前缀的 `String`，表示列名。
3. `N` 个列类型——可以是文本名称，也可以是紧凑的二进制编码，由 `output_format_binary_encode_types_in_binary_format` / `input_format_binary_decode_types_in_binary_format` 设置控制。

请求头之后，每一行由 `N` 个单元组成。对于每个单元：

* 一个 `UInt8` 标记字节。
  * `0x01` — 使用目标列的 `DEFAULT` 表达式。后面不再有值字节。
  * `0x00` — 后面跟随一个值，并使用该列类型的 `RowBinary` 序列化器进行序列化。对于 `Nullable(T)`，值字节以 `Nullable` 的空标记字节开头 (`0` 表示非空，`1` 表示 NULL) ；如果非空，后面再跟内部值。

## 默认值与 NULL \{#defaults-vs-null\}

每个单元的默认标记与 `Nullable` 内置的 null 字节是彼此独立的。对于 `Nullable(UInt32) DEFAULT 42` 列，每一行可以用三种不同的方式发送：

| Bytes     | Meaning                           |
| --------- | --------------------------------- |
| `01`      | 使用 `DEFAULT 42`。                  |
| `00 01`   | 走值路径，然后通过 `Nullable` 类型表示 `NULL`。 |
| `00 00 …` | 走值路径，然后是一个非 null 的内部值。            |

## schema 演进 \{#schema-evolution\}

| 情况                    | 行为                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| 列完全未出现在文件请求头中           | 通过 `insertDefaultsForNotSeenColumns` 在目标端补默认值；受 `defaults_for_omitted_fields` 控制。                      |
| 列出现在文件请求头中，单元标记为 `0x01` | 对每一行执行 `insertDefault`。                                                                                |
| 列出现在文件请求头中，单元标记为 `0x00` | 正常解析该值。                                                                                                |
| 文件请求头中有额外的列，但目标表中不存在    | 当 `input_format_skip_unknown_fields = 1` 时，会静默丢弃 (先读取该标记；如果是 `0x01`，则不再做其他处理；如果是 `0x00`，则解析该类型化值后丢弃) 。 |

## 使用示例 \{#example-usage\}

```sql title="Query"
SELECT * FROM format(
    'RowBinaryWithNamesAndTypesAndDefaults',
    'x Nullable(UInt32) DEFAULT 42',
    unhex('01' || '0178' || '10' || hex('Nullable(UInt32)') || '01')
);
```

```response title="Response"
┌──x─┐
│ 42 │
└────┘
```

* 请求头包含一列，列名为 `x`，类型为 `Nullable(UInt32)`。
* 该单元使用标记 `0x01`，表示 &quot;使用 `DEFAULT 42`&quot;。

## 格式设置 \{#format-settings\}

<RowBinaryFormatSettings />