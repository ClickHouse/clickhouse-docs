---
alias: []
description: 'JSONColumns フォーマットのドキュメント'
input_format: true
keywords: ['JSONColumns']
output_format: true
slug: /interfaces/formats/JSONColumns
title: 'JSONColumns'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

:::tip
JSONColumns\* フォーマットの出力は、ClickHouseのフィールド名と、そのフィールドに対するテーブル内の各行の内容を提供します。
視覚的には、データが左に90度回転した形になります。
:::

このフォーマットでは、すべてのデータが単一のJSONオブジェクトとして表現されます。

:::note
`JSONColumns` フォーマットは、すべてのデータをメモリにバッファリングしてから単一のブロックとして出力するため、メモリ消費量が大きくなる可能性があります。
:::


## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを含む`football.json`という名前のJSONファイルを使用します:

```json
{
  "date": [
    "2022-04-30",
    "2022-04-30",
    "2022-04-30",
    "2022-05-02",
    "2022-05-02",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07"
  ],
  "season": [
    2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021,
    2021, 2021, 2021, 2021, 2021
  ],
  "home_team": [
    "Sutton United",
    "Swindon Town",
    "Tranmere Rovers",
    "Port Vale",
    "Salford City",
    "Barrow",
    "Bradford City",
    "Bristol Rovers",
    "Exeter City",
    "Harrogate Town A.F.C.",
    "Hartlepool United",
    "Leyton Orient",
    "Mansfield Town",
    "Newport County",
    "Oldham Athletic",
    "Stevenage Borough",
    "Walsall"
  ],
  "away_team": [
    "Bradford City",
    "Barrow",
    "Oldham Athletic",
    "Newport County",
    "Mansfield Town",
    "Northampton Town",
    "Carlisle United",
    "Scunthorpe United",
    "Port Vale",
    "Sutton United",
    "Colchester United",
    "Tranmere Rovers",
    "Forest Green Rovers",
    "Rochdale",
    "Crawley Town",
    "Salford City",
    "Swindon Town"
  ],
  "home_team_goals": [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
  "away_team_goals": [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
}
```

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONColumns;
```

### データの読み取り {#reading-data}

`JSONColumns`形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT JSONColumns
```

出力はJSON形式になります:


```json
{
    "date": ["2022-04-30", "2022-04-30", "2022-04-30", "2022-05-02", "2022-05-02", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07"],
    "season": [2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021],
    "home_team": ["Sutton United", "Swindon Town", "Tranmere Rovers", "Port Vale", "Salford City", "Barrow", "Bradford City", "Bristol Rovers", "Exeter City", "Harrogate Town A.F.C.", "Hartlepool United", "Leyton Orient", "Mansfield Town", "Newport County", "Oldham Athletic", "Stevenage Borough", "Walsall"],
    "away_team": ["Bradford City", "Barrow", "Oldham Athletic", "Newport County", "Mansfield Town", "Northampton Town", "Carlisle United", "Scunthorpe United", "Port Vale", "Sutton United", "Colchester United", "Tranmere Rovers", "Forest Green Rovers", "Rochdale", "Crawley Town", "Salford City", "Swindon Town"],
    "home_team_goals": [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
    "away_team_goals": [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
}
```


## フォーマット設定 {#format-settings}

インポート時、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)設定が`1`に設定されている場合、未知の名前を持つカラムはスキップされます。
ブロックに存在しないカラムはデフォルト値で埋められます(ここでは[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)設定を使用できます)。
