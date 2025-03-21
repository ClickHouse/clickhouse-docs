---
title: RawBLOB
slug: /interfaces/formats/RawBLOB
keywords: ['RawBLOB']
---

## Description {#description}

`RawBLOB` 格式将所有输入数据读取为单个值。它仅能解析单字段类型为 [`String`](/sql-reference/data-types/string.md) 或类似类型的表。结果以二进制格式输出，没有分隔符和转义。如果输出多个值，格式将变得模糊，无法读取数据。

### Raw Formats Comparison {#raw-formats-comparison}

以下是 `RawBLOB` 和 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 格式的比较。

`RawBLOB`：
- 数据以二进制格式输出，无需转义；
- 值之间没有分隔符；
- 每个值的末尾没有换行符。

`TabSeparatedRaw`：
- 数据输出时不进行转义；
- 行中包含以制表符分隔的值；
- 每行最后一个值后有换行符。

以下是 `RawBLOB` 和 [RowBinary](./RowBinary/RowBinary.md) 格式的比较。

`RawBLOB`：
- 字符串字段输出时不带长度前缀。

`RowBinary`：
- 字符串字段以 varint 格式（无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128)）表示长度，随后是字符串的字节。

当将空数据传递给 `RawBLOB` 输入时，ClickHouse 会抛出异常：

```text
Code: 108. DB::Exception: No data to insert
```

## Example Usage {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```

## Format Settings {#format-settings}
