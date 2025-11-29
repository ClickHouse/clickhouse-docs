---
description: 'RawBLOB 格式文档'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## 描述 {#description}

`RawBLOB` 格式会将所有输入数据读取为单个值。它只能用于解析仅包含一个 [`String`](/sql-reference/data-types/string.md) 类型或类似类型字段的表。
结果以二进制格式输出，没有分隔符也没有转义。如果输出了多个值，该格式将变得不明确，并且无法将数据读回。

### 原始格式对比 {#raw-formats-comparison}

下面是 `RawBLOB` 与 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 格式的比较。

`RawBLOB`：

* 数据以二进制格式输出，不进行转义；
* 值之间没有分隔符；
* 每个值的末尾没有换行符。

`TabSeparatedRaw`：

* 数据输出时不进行转义；
* 每一行中包含以制表符分隔的值；
* 每一行最后一个值之后有换行符。

下面是 `RawBLOB` 和 [RowBinary](./RowBinary/RowBinary.md) 格式的比较。

`RawBLOB`：

* String 字段输出时不会带有长度前缀。

`RowBinary`：

* String 字段表示为 varint 格式的长度（无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128)），后跟字符串的字节。

当向 `RawBLOB` 输入传递空数据时，ClickHouse 会抛出异常：

```text
代码：108. DB::Exception：无可插入的数据
```


## 使用示例 {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```


## 格式设置 {#format-settings}
