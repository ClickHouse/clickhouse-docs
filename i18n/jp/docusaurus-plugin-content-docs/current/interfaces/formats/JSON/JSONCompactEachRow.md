---
'alias': []
'description': 'JSONCompactEachRow フォーマットに関する Documentation'
'input_format': true
'keywords':
- 'JSONCompactEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRow'
'title': 'JSONCompactEachRow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データ行がオブジェクトではなく配列として出力される点が、[`JSONEachRow`](./JSONEachRow.md)との違いです。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

`football.json`という名前の次のデータを含むJSONファイルを使用します：

```json
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

データを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRow;
```

### データの読み込み {#reading-data}

`JSONCompactEachRow`形式を使用してデータを読み込みます：

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRow
```

出力はJSON形式になります：

```json
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

## 形式設定 {#format-settings}
