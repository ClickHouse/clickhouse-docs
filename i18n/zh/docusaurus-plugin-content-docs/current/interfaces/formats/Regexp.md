---
title: Regexp
slug: /interfaces/formats/Regexp
keywords: ['Regexp']
input_format: true
output_format: false
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`Regex` 格式根据提供的正则表达式解析每一行导入的数据。

**使用方法**

来自 [format_regexp](/operations/settings/settings-formats.md/#format_regexp) 设置的正则表达式适用于每一行导入的数据。正则表达式中的子模式数量必须与导入数据集中的列数相等。

导入数据的行必须由换行符 `'\n'` 或 DOS 风格的换行符 `"\r\n"` 分隔。

每个匹配的子模式的内容将根据 [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 设置，使用对应数据类型的方法进行解析。

如果正则表达式与行不匹配，并且 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 设置为 1，则该行将被静默跳过。否则，将抛出异常。

## 示例用法 {#example-usage}

考虑文件 `data.tsv`：

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```
以及表 `imp_regex_table`：

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

我们将使用以下查询将上述文件中的数据插入到表中：

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

现在我们可以 `SELECT` 表中的数据，以查看 `Regex` 格式如何解析文件中的数据：

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

- `format_regexp` — [String](/sql-reference/data-types/string.md)。包含 [re2](https://github.com/google/re2/wiki/Syntax) 格式的正则表达式。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。支持以下转义规则：

  - CSV（类似于 [CSV](/interfaces/formats/CSV)）
  - JSON（类似于 [JSONEachRow](/interfaces/formats/JSONEachRow)）
  - Escaped（类似于 [TSV](/interfaces/formats/TabSeparated)）
  - Quoted（类似于 [Values](/interfaces/formats/Values)）
  - Raw（整体提取子模式，无转义规则，类似于 [TSVRaw](/interfaces/formats/TabSeparated)）

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。定义在 `format_regexp` 表达式与导入数据不匹配的情况下是否需要抛出异常。可以设置为 `0` 或 `1`。
