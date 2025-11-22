---
description: 'RawBLOB 格式的文档'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## Description {#description}

`RawBLOB` 格式将所有输入数据读取为单个值。它只能解析具有单个 [`String`](/sql-reference/data-types/string.md) 类型字段或类似类型字段的表。
结果以二进制格式输出,不带分隔符和转义。如果输出多个值,格式将变得不明确,无法将数据读回。

### Raw 格式比较 {#raw-formats-comparison}

以下是 `RawBLOB` 和 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 格式的比较。

`RawBLOB`:

- 数据以二进制格式输出,无转义;
- 值之间没有分隔符;
- 每个值的末尾没有换行符。

`TabSeparatedRaw`:

- 数据输出时不进行转义;
- 行中包含由制表符分隔的值;
- 每行最后一个值之后有换行符。

以下是 `RawBLOB` 和 [RowBinary](./RowBinary/RowBinary.md) 格式的比较。

`RawBLOB`:

- String 字段输出时不带长度前缀。

`RowBinary`:

- String 字段表示为 varint 格式的长度(无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128)),后跟字符串的字节。

当空数据传递给 `RawBLOB` 输入时,ClickHouse 会抛出异常:

```text
Code: 108. DB::Exception: No data to insert
```


## 使用示例 {#example-usage}

```bash title="查询"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="响应"
f9725a22f9191e064120d718e26862a9  -
```


## 格式设置 {#format-settings}
