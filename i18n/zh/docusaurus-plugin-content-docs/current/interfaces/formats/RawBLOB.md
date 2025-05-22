---
'description': 'RawBLOB 格式的文档'
'keywords':
- 'RawBLOB'
'slug': '/interfaces/formats/RawBLOB'
'title': 'RawBLOB'
---

## 描述 {#description}

`RawBLOB` 格式将所有输入数据读取为单个值。只能解析具有单个 [`String`](/sql-reference/data-types/string.md) 类型字段或类似类型的表。
结果以无分隔符和无转义的二进制格式输出。如果输出多个值，则格式将变得模糊，无法将数据重新读取。

### 原始格式比较 {#raw-formats-comparison}

以下是 `RawBLOB` 和 [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 格式的比较。

`RawBLOB`:
- 数据以二进制格式输出，无转义；
- 值之间没有分隔符；
- 每个值的末尾没有换行符。

`TabSeparatedRaw`:
- 数据以无转义的形式输出；
- 行包含由制表符分隔的值；
- 每行的最后一个值后有换行符。

以下是 `RawBLOB` 和 [RowBinary](./RowBinary/RowBinary.md) 格式的比较。

`RawBLOB`:
- 字符串字段输出时不带长度前缀。

`RowBinary`:
- 字符串字段以 varint 格式的长度表示（无符号 [LEB128] (https://en.wikipedia.org/wiki/LEB128)），后面跟随字符串的字节。

当空数据传递给 `RawBLOB` 输入时，ClickHouse 会抛出异常：

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
