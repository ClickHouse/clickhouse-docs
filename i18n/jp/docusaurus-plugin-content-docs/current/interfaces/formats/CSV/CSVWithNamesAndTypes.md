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

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes) と同様に、列名および型を含む2行のヘッダー行も出力します。



## 使用例

### データの挿入

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1 以降、ClickHouse は `CSV` フォーマットを使用する場合に CSV ファイル内のヘッダーを自動検出するため、`CSVWithNames` や `CSVWithNamesAndTypes` を使用する必要はありません。
:::

次の CSV ファイル（ファイル名: `football_types.csv`）を使用します。

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

`CSVWithNamesAndTypes` フォーマットを使用してデータを挿入します：

```sql
football に INTO INSERT FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```

### データの読み込み

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
"2022-04-30",2021,"サットン・ユナイテッド","ブラッドフォード・シティ",1,4
"2022-04-30",2021,"スウィンドン・タウン","バロウ",2,1
"2022-04-30",2021,"トランミア・ローヴァーズ","オールダム・アスレティック",2,0
"2022-05-02",2021,"ポート・ヴェイル","ニューポート・カウンティ",1,2
"2022-05-02",2021,"ソールズベリー・シティ","マンスフィールド・タウン",2,2
"2022-05-07",2021,"バロウ","ノーザンプトン・タウン",1,3
"2022-05-07",2021,"ブラッドフォード・シティ","カーライル・ユナイテッド",2,0
"2022-05-07",2021,"ブリストル・ローヴァーズ","スカンソープ・ユナイテッド",7,0
"2022-05-07",2021,"エクセター・シティ","ポート・ヴェイル",0,1
"2022-05-07",2021,"ハロゲート・タウンA.F.C.","サットン・ユナイテッド",0,2
"2022-05-07",2021,"ハートルプール・ユナイテッド","コルチェスター・ユナイテッド",0,2
"2022-05-07",2021,"レイトン・オリエント","トランミア・ローヴァーズ",0,1
"2022-05-07",2021,"マンスフィールド・タウン","フォレスト・グリーン・ローヴァーズ",2,2
"2022-05-07",2021,"ニューポート・カウンティ","ロッチデール",0,2
"2022-05-07",2021,"オールダム・アスレティック","クラウリー・タウン",3,3
"2022-05-07",2021,"スティーヴェネイジ・ボロ","ソールズベリー・シティ",4,2
"2022-05-07",2021,"ウォルソール","スウィンドン・タウン",0,3
```


## フォーマット設定 {#format-settings}

:::note
[input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` の場合、
入力データの列は名前に基づいてテーブルの列にマッピングされます。[input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` の場合、名前が未知の列はスキップされます。
それ以外の場合は、最初の行がスキップされます。
:::

:::note
[input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` の場合、
入力データの型はテーブルの対応する列の型と比較されます。そうでない場合は、2 行目がスキップされます。
:::