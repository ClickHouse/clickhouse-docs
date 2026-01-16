---
alias: ['TSVWithNames']
description: 'TabSeparatedWithNames 格式文档'
input_format: true
keywords: ['TabSeparatedWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedWithNames
title: 'TabSeparatedWithNames'
doc_type: 'reference'
---

| 输入 | 输出 | 别名                          |
|-------|--------|--------------------------------|
|     ✔    |     ✔     | `TSVWithNames`, `RawWithNames` |

## 描述 \\{#description\\}

与 [`TabSeparated`](./TabSeparated.md) 格式的区别在于，第一行写入了列名。

在解析时，预期第一行包含列名。可以使用列名来确定它们的位置，并检查其是否正确。

:::note
如果将设置项 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 设置为 `1`，
则会根据名称将输入数据中的列映射到表中的列；如果将设置项 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 `1`，则会跳过名称未知的列。
否则，将跳过第一行。
:::

## 示例用法 \\{#example-usage\\}

### 插入数据 \\{#inserting-data\\}

使用以下名为 `football.tsv` 的 TSV 文件：

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedWithNames;
```

### 读取数据 \\{#reading-data\\}

以 `TabSeparatedWithNames` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNames
```

输出将为制表符分隔格式：

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## 格式设置 \\{#format-settings\\}