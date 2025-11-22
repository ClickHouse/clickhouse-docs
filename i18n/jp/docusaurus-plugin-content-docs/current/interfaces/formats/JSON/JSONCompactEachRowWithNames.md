---
alias: []
description: 'JSONCompactEachRowWithNames 形式のドキュメント'
input_format: true
keywords: ['JSONCompactEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNames
title: 'JSONCompactEachRowWithNames'
doc_type: 'reference'
---

| Input | Output | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md)フォーマットとは異なり、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md)フォーマットと同様に、列名を含むヘッダー行も出力します。


## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを含む`football.json`という名前のJSONファイルを使用します:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNames;
```

### データの読み取り {#reading-data}

`JSONCompactEachRowWithNames`形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNames
```

出力はJSON形式になります:


```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```


## フォーマット設定 {#format-settings}

:::note
設定[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header)が1に設定されている場合、
入力データのカラムは名前によってテーブルのカラムにマッピングされます。設定[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)が1に設定されている場合、未知の名前を持つカラムはスキップされます。
それ以外の場合、最初の行がスキップされます。
:::
