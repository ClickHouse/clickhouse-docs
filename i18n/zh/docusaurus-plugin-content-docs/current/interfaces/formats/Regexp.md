---
alias: []
description: 'Regexp 格式文档'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`Regex` 格式会根据提供的正则表达式，对导入数据的每一行进行解析。

**用法**

来自 [format_regexp](/operations/settings/settings-formats.md/#format_regexp) 设置的正则表达式会应用到导入数据的每一行。正则表达式中的子模式数量必须等于导入数据集中列的数量。

导入数据的各行必须使用换行符 `'\n'` 或 DOS 风格的换行符 `"\r\n"` 分隔。

每个匹配到的子模式内容会根据 [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 设置，使用对应数据类型的解析方法进行解析。

如果正则表达式未能匹配某一行，并且 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 被设置为 1，则该行会被静默跳过。否则会抛出异常。

## 示例用法 {#example-usage}

假设有文件 `data.tsv`：

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

以及 `imp_regex_table` 表：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

我们将使用以下查询，把前面提到的文件中的数据插入到上述表中：

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

现在我们可以对表执行 `SELECT` 查询，查看 `Regex` 格式是如何解析文件中的数据的：

```sql title="Query"
SELECT * FROM imp_regex_table;
```

```text title="Response"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```

## 格式设置 {#format-settings}

在使用 `Regexp` 格式时，可以使用以下设置：

- `format_regexp` — [String](/sql-reference/data-types/string.md)。包含以 [re2](https://github.com/google/re2/wiki/Syntax) 语法编写的正则表达式。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。支持以下转义规则：

  - CSV（类似于 [CSV](/interfaces/formats/CSV)）
  - JSON（类似于 [JSONEachRow](/interfaces/formats/JSONEachRow)）
  - Escaped（类似于 [TSV](/interfaces/formats/TabSeparated)）
  - Quoted（类似于 [Values](/interfaces/formats/Values)）
  - Raw（按整体提取子模式，不应用任何转义规则，类似于 [TSVRaw](/interfaces/formats/TabSeparated)）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。用于指定当 `format_regexp` 表达式与导入数据不匹配时是否抛出异常。可设置为 `0` 或 `1`。
