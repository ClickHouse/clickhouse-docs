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



## Description {#description}

`Regex` 格式根据提供的正则表达式解析导入数据的每一行。

**用法**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 设置中的正则表达式会应用于导入数据的每一行。正则表达式中的子模式数量必须与导入数据集中的列数相等。

导入数据的各行必须使用换行符 `'\n'` 或 DOS 风格的换行符 `"\r\n"` 进行分隔。

每个匹配子模式的内容会根据 [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 设置,按照相应数据类型的方法进行解析。

如果正则表达式与某行不匹配,且 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 设置为 1,则该行会被静默跳过。否则会抛出异常。


## 使用示例 {#example-usage}

假设有文件 `data.tsv`:

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

以及表 `imp_regex_table`:

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

我们将使用以下查询将上述文件中的数据插入到上面的表中:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

现在我们可以从表中 `SELECT` 数据,查看 `Regex` 格式如何解析文件中的数据:

```sql title="查询"
SELECT * FROM imp_regex_table;
```

```text title="响应"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```


## 格式设置 {#format-settings}

使用 `Regexp` 格式时,可以使用以下设置:

- `format_regexp` — [String](/sql-reference/data-types/string.md)。包含 [re2](https://github.com/google/re2/wiki/Syntax) 格式的正则表达式。
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md)。支持以下转义规则:
  - CSV(类似于 [CSV](/interfaces/formats/CSV))
  - JSON(类似于 [JSONEachRow](/interfaces/formats/JSONEachRow))
  - Escaped(类似于 [TSV](/interfaces/formats/TabSeparated))
  - Quoted(类似于 [Values](/interfaces/formats/Values))
  - Raw(将子模式作为整体提取,无转义规则,类似于 [TSVRaw](/interfaces/formats/TabSeparated))

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md)。定义当 `format_regexp` 表达式与导入的数据不匹配时是否抛出异常。可设置为 `0` 或 `1`。
