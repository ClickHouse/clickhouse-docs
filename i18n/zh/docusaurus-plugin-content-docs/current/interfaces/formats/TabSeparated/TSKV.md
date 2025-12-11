---
alias: []
description: 'TSKV 格式文档'
input_format: true
keywords: ['TSKV']
output_format: true
slug: /interfaces/formats/TSKV
title: 'TSKV'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [`TabSeparated`](./TabSeparated.md) 格式，但以 `name=value` 格式输出值。
名称的转义方式与 [`TabSeparated`](./TabSeparated.md) 格式相同，且 `=` 符号也会被转义。

```text
SearchPhrase=   count()=8267016
SearchPhrase=卫生间室内设计    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014年春季时尚    count()=1549
SearchPhrase=自由形式照片       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=各种犬种的照片    count()=1091
SearchPhrase=窗帘设计        count()=1064
SearchPhrase=baku       count()=1000
```

```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
当存在大量列且每列数据量较小时，此格式效率低下，一般没有使用它的理由。
不过，就效率而言，它并不比 [`JSONEachRow`](../JSON/JSONEachRow.md) 格式更差。
:::

在解析时，不同列取值的顺序可以是任意的。
允许省略某些值，此时这些值将被视为其默认值。
在这种情况下，默认值为零和空字符串。
不能将本可以在表中指定的复杂值用作默认值。

在解析过程中，允许添加一个额外字段 `tskv`，该字段不带等号或值。该字段会被忽略。

在导入时，如果将设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设为 `1`，则具有未知名称的列将被跳过。

[NULL](/sql-reference/syntax.md) 会被格式化为 `\N`。

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用以下名为 `football.tskv` 的 tskv 文件：

```tsv
date=2022-04-30 season=2021     home_team=萨顿联队 away_team=布拉德福德城 home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=斯温登城 away_team=巴罗        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=特兰米尔流浪者       away_team=奥尔德姆竞技       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=波特拜尔     away_team=纽波特郡        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=索尔福德城  away_team=曼斯菲尔德城        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=巴罗        away_team=诺桑普顿镇      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=布拉德福德城 away_team=卡莱尔联       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=布里斯托尔流浪者        away_team=斯坎索普联     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=埃克塞特城   away_team=波特拜尔     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=哈罗盖特镇 A.F.C. away_team=萨顿联队 home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=哈特尔浦联     away_team=科尔切斯特联     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=莱顿东方 away_team=特兰米尔流浪者       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=曼斯菲尔德城        away_team=森林绿流浪者   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=纽波特郡        away_team=罗奇代尔      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=奥尔德姆竞技       away_team=克劳利城  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=史蒂文尼奇自治市     away_team=索尔福德城  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=沃尔索尔       away_team=斯温登城  home_team_goals=0       away_team_goals=3
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.tskv' FORMAT TSKV;
```

### 读取数据 {#reading-data}

以 `TSKV` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TSKV
```

输出将采用制表符分隔格式，并包含两行表头：第一行为列名，第二行为列类型：

```tsv
date=2022-04-30 season=2021     home_team=萨顿联队 away_team=布拉德福德城 home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=斯温登镇 away_team=巴罗        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=特兰米尔流浪者       away_team=奥尔德姆竞技       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=波特维尔     away_team=纽波特郡        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=索尔福德城  away_team=曼斯菲尔德镇        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=巴罗        away_team=北安普敦镇      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=布拉德福德城 away_team=卡莱尔联       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=布里斯托尔流浪者        away_team=斯肯索普联     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=埃克塞特城   away_team=波特维尔     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=哈罗盖特镇 A.F.C. away_team=萨顿联队 home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=哈特尔浦联     away_team=科尔切斯特联     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=莱顿东方 away_team=特兰米尔流浪者       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=曼斯菲尔德镇        away_team=森林绿流浪者   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=纽波特郡        away_team=罗奇代尔      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=奥尔德姆竞技       away_team=克劳利镇  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=斯蒂夫尼奇自治市     away_team=索尔福德城  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=沃尔索尔       away_team=斯温登镇  home_team_goals=0       away_team_goals=3
```

## 格式设置 {#format-settings}