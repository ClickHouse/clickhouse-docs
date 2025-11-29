---
alias: []
description: 'CSVWithNamesAndTypes 形式に関するドキュメント'
input_format: true
keywords: ['CSVWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/CSVWithNamesAndTypes
title: 'CSVWithNamesAndTypes'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes) と同様に、列名と型が記載されたヘッダー行を 2 行出力します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1 以降では、ClickHouse は `CSV` フォーマットを使用する際に CSV ファイル内のヘッダーを自動検出するため、`CSVWithNames` や `CSVWithNamesAndTypes` を使用する必要はありません。
:::

以下の内容の CSV ファイル（`football_types.csv` という名前）を使用します。

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

テーブルを作成する:

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

`CSVWithNamesAndTypes` 形式を使用してデータを挿入します：

```sql
INSERT INTO football FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```


### データの読み込み {#reading-data}

`CSVWithNamesAndTypes` 形式を使用してデータを読み込みます。

```sql
SELECT *
FROM football
FORMAT CSVWithNamesAndTypes
```

出力は、列名と型を表す 2 行のヘッダー行を持つ CSV になります。

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
[input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 設定が `1` の場合、
入力データの列は名前に基づいてテーブルの列にマッピングされます。[input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` の場合、名前が不明な列はスキップされます。
それ以外の場合は、最初の行がスキップされます。
:::

:::note
[input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 設定が `1` の場合、
入力データの型は、テーブル内の対応する列の型と比較されます。そうでない場合は、2 行目がスキップされます。
:::