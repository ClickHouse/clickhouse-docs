---
'alias': []
'description': 'CSVWithNamesAndTypes フォーマットに関するドキュメント'
'input_format': true
'keywords':
- 'CSVWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CSVWithNamesAndTypes'
'title': 'CSVWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットは、[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes) のように、カラム名とタイプを含む2つのヘッダー行も印刷します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1以降、ClickHouseは`CSV`フォーマットを使用する際にCSVファイル内のヘッダーを自動的に検出しますので、`CSVWithNames`や`CSVWithNamesAndTypes`を使用する必要はありません。
:::

`football_types.csv`という名前の次のCSVファイルを使用します:

```csv
date,season,home_team,away_team,home_team_goals,away_team_goals
Date,Int16,LowCardinality(String),LowCardinality(String),Int8,Int8
2022-04-30,2021,Sutton United,Bradford City,1,4
2022-04-30,2021,Swindon Town,Barrow,2,1
2022-04-30,2021,Tranmere Rovers,Oldham Athletic,2,0
2022-05-02,2021,Salford City,Mansfield Town,2,2
2022-05-02,2021,Port Vale,Newport County,1,2
2022-05-07,2021,Barrow,Northampton Town,1,3
2022-05-07,2021,Bradford City,Carlisle United,2,0
2022-05-07,2021,Bristol Rovers,Scunthorpe United,7,0
2022-05-07,2021,Exeter City,Port Vale,0,1
2022-05-07,2021,Harrogate Town A.F.C.,Sutton United,0,2
2022-05-07,2021,Hartlepool United,Colchester United,0,2
2022-05-07,2021,Leyton Orient,Tranmere Rovers,0,1
2022-05-07,2021,Mansfield Town,Forest Green Rovers,2,2
2022-05-07,2021,Newport County,Rochdale,0,2
2022-05-07,2021,Oldham Athletic,Crawley Town,3,3
2022-05-07,2021,Stevenage Borough,Salford City,4,2
2022-05-07,2021,Walsall,Swindon Town,0,3
```

テーブルを作成します:

```sql
CREATE TABLE football
(
    `date` Date,
    `season` Int16,
    `home_team` LowCardinality(String),
    `away_team` LowCardinality(String),
    `home_team_goals` Int8,
    `away_team_goals` Int8
)
ENGINE = MergeTree
ORDER BY (date, home_team);
```

`CSVWithNamesAndTypes`フォーマットを使用してデータを挿入します:

```sql
INSERT INTO football FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```

### データの読み込み {#reading-data}

`CSVWithNamesAndTypes`フォーマットを使用してデータを読み込みます:

```sql
SELECT *
FROM football
FORMAT CSVWithNamesAndTypes
```

出力は、カラム名とタイプのための2つのヘッダー行を含むCSVになります:

```csv
"date","season","home_team","away_team","home_team_goals","away_team_goals"
"Date","Int16","LowCardinality(String)","LowCardinality(String)","Int8","Int8"
"2022-04-30",2021,"Sutton United","Bradford City",1,4
"2022-04-30",2021,"Swindon Town","Barrow",2,1
"2022-04-30",2021,"Tranmere Rovers","Oldham Athletic",2,0
"2022-05-02",2021,"Port Vale","Newport County",1,2
"2022-05-02",2021,"Salford City","Mansfield Town",2,2
"2022-05-07",2021,"Barrow","Northampton Town",1,3
"2022-05-07",2021,"Bradford City","Carlisle United",2,0
"2022-05-07",2021,"Bristol Rovers","Scunthorpe United",7,0
"2022-05-07",2021,"Exeter City","Port Vale",0,1
"2022-05-07",2021,"Harrogate Town A.F.C.","Sutton United",0,2
"2022-05-07",2021,"Hartlepool United","Colchester United",0,2
"2022-05-07",2021,"Leyton Orient","Tranmere Rovers",0,1
"2022-05-07",2021,"Mansfield Town","Forest Green Rovers",2,2
"2022-05-07",2021,"Newport County","Rochdale",0,2
"2022-05-07",2021,"Oldham Athletic","Crawley Town",3,3
"2022-05-07",2021,"Stevenage Borough","Salford City",4,2
"2022-05-07",2021,"Walsall","Swindon Town",0,3
```

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムはテーブルのカラムと名前でマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
