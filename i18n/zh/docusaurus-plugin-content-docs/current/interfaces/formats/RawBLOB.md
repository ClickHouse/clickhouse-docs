---
'description': 'RawBLOB 格式的文档'
'keywords':
- 'RawBLOB'
'slug': '/interfaces/formats/RawBLOB'
'title': 'RawBLOB'
'doc_type': 'reference'
---

## 描述 {#description}

`RawBLOB` 格式将所有输入数据读取为一个单一值。可以解析的仅是单字段类型为 [`String`](/sql-reference/data-types/string.md) 或类似类型的表。结果以无分隔符和转义的二进制格式输出。如果输出多个值，格式将变得模糊，并且将无法重新读取数据。

### 原始格式比较 {#raw-formats-comparison}

以下是 `RawBLOB` 和 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 格式的比较。

`RawBLOB`：
- 数据以二进制格式输出，无转义；
- 值之间没有分隔符；
- 每个值末尾没有换行符。

`TabSeparatedRaw`：
- 数据输出时没有转义；
- 行中的值由制表符分隔；
- 每行最后一个值后有换行符。

以下是 `RawBLOB` 和 [RowBinary](./RowBinary/RowBinary.md) 格式的比较。

`RawBLOB`：
- 字符串字段的输出没有长度前缀。

`RowBinary`：
- 字符串字段以 Varint 格式表示长度（无符号 [LEB128] (https://en.wikipedia.org/wiki/LEB128)），后跟字符串的字节。

当传递空数据到 `RawBLOB` 输入时，ClickHouse 会抛出异常：

```text
Code: 108. DB::Exception: No data to insert
```

## 示例用法 {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```

## 格式设置 {#format-settings}
