---
'alias': []
'description': 'JSONColumns 形式に関する Documentation'
'input_format': true
'keywords':
- 'JSONColumns'
'output_format': true
'slug': '/interfaces/formats/JSONColumns'
'title': 'JSONColumns'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

:::tip
JSONColumns* フォーマットの出力は、ClickHouse フィールド名と、そのフィールドの各行のコンテンツを提供します; 視覚的には、データは左に90度回転しています。
:::

このフォーマットでは、すべてのデータが単一の JSON オブジェクトとして表されます。

:::note
`JSONColumns` フォーマットはすべてのデータをメモリにバッファリングし、次に単一のブロックとして出力するため、高いメモリ消費につながる可能性があります。
:::

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

次のデータを含む JSON ファイル、`football.json` として名前を付けます:

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

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONColumns;
```

### データの読み取り {#reading-data}

`JSONColumns` フォーマットを使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT JSONColumns
```

出力は JSON フォーマットになります:

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

インポート中、未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。
ブロックに存在しないカラムはデフォルト値で埋められます（ここで [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定を使用できます）。
