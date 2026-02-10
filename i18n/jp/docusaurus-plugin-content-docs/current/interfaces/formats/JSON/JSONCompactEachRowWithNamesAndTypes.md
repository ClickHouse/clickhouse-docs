---
alias: []
description: 'JSONCompactEachRowWithNamesAndTypes フォーマットに関するドキュメント'
input_format: true
keywords: ['JSONCompactEachRowWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNamesAndTypes
title: 'JSONCompactEachRowWithNamesAndTypes'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 形式とは異なり、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 形式と同様に、列名とデータ型を含むヘッダー 2 行も出力します。

## 使用例 \{#example-usage\}

### データの挿入 \{#inserting-data\}

以下のデータを含む JSON ファイル `football.json` を用意します。

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["Date", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
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

データを挿入する：

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNamesAndTypes;
```

### データの読み込み \{#reading-data\}

`JSONCompactEachRowWithNamesAndTypes` 形式を使用してデータを読み込みます。

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNamesAndTypes
```

出力は JSON 形式です:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["Date", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
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

## フォーマット設定 \{#format-settings\}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは名前に基づいてテーブルのカラムにマッピングされます。[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、不明な名前のカラムはスキップされます。
それ以外の場合は、最初の行がスキップされます。
[`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データの型はテーブル内の対応するカラムの型と比較されます。そうでない場合は、2 行目がスキップされます。
:::