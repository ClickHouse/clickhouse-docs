---
'alias': []
'description': 'TSKV 格式的文档'
'input_format': true
'keywords':
- 'TSKV'
'output_format': true
'slug': '/interfaces/formats/TSKV'
'title': 'TSKV'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式类似，但以 `name=value` 格式输出值。 
名称的转义方式与 [`TabSeparated`](./TabSeparated.md) 格式相同，`=` 符号也会被转义。

```text
SearchPhrase=   count()=8267016
SearchPhrase=bathroom interior design    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014 spring fashion    count()=1549
SearchPhrase=freeform photos       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=photos of dog breeds    count()=1091
SearchPhrase=curtain designs        count()=1064
SearchPhrase=baku       count()=1000
```

```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
当有大量小列时，这种格式效率低下，通常没有使用它的理由。 
然而，在效率方面，它并不比 [`JSONEachRow`](../JSON/JSONEachRow.md) 格式差。
:::

解析时，支持不同列值的任何顺序。 
可以省略某些值，因为它们被视为等于其默认值。
在这种情况下，零和空行用作默认值。 
不支持作为默认值指定的复杂值。

解析允许添加一个额外字段 `tskv`，无需等号或值。该字段将被忽略。

在导入时，如果将 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 `1`，则会跳过未知名称的列。

[NULL](/sql-reference/syntax.md) 格式为 `\N`。

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用以下 tskv 文件，命名为 `football.tskv`：

```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.tskv' FORMAT TSKV;
```

### 读取数据 {#reading-data}

使用 `TSKV` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TSKV
```

输出将以制表符分隔的格式呈现，两行为列名和列类型的标题：

```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```

## 格式设置 {#format-settings}
