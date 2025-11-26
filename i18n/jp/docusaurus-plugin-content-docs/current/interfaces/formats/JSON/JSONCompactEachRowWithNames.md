---
alias: []
description: 'JSONCompactEachRowWithNames 形式に関するドキュメント'
input_format: true
keywords: ['JSONCompactEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNames
title: 'JSONCompactEachRowWithNames'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 形式とは異なり、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 形式と同様に、列名を含むヘッダー行も出力します。



## 使用例

### データの挿入

次のデータを含む JSON ファイル `football.json` を用意します。

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "サットン・ユナイテッド", "ブラッドフォード・シティ", 1, 4]
["2022-04-30", 2021, "スウィンドン・タウン", "バロー", 2, 1]
["2022-04-30", 2021, "トランメア・ローヴァーズ", "オールダム・アスレティック", 2, 0]
["2022-05-02", 2021, "ポート・ヴェイル", "ニューポート・カウンティ", 1, 2]
["2022-05-02", 2021, "ソールズベリー・シティ", "マンスフィールド・タウン", 2, 2]
["2022-05-07", 2021, "バロー", "ノーサンプトン・タウン", 1, 3]
["2022-05-07", 2021, "ブラッドフォード・シティ", "カーライル・ユナイテッド", 2, 0]
["2022-05-07", 2021, "ブリストル・ローヴァーズ", "スカンソープ・ユナイテッド", 7, 0]
["2022-05-07", 2021, "エクセター・シティ", "ポート・ヴェイル", 0, 1]
["2022-05-07", 2021, "ハロゲイト・タウン A.F.C.", "サットン・ユナイテッド", 0, 2]
["2022-05-07", 2021, "ハートルプール・ユナイテッド", "コルチェスター・ユナイテッド", 0, 2]
["2022-05-07", 2021, "レイトン・オリエント", "トランメア・ローヴァーズ", 0, 1]
["2022-05-07", 2021, "マンスフィールド・タウン", "フォレスト・グリーン・ローヴァーズ", 2, 2]
["2022-05-07", 2021, "ニューポート・カウンティ", "ロッチデール", 0, 2]
["2022-05-07", 2021, "オールダム・アスレティック", "クロウリー・タウン", 3, 3]
["2022-05-07", 2021, "スティーヴネイジ・ボロウ", "ソールズベリー・シティ", 4, 2]
["2022-05-07", 2021, "ウォルソール", "スウィンドン・タウン", 0, 3]
```

データを挿入する:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNames;
```

### データの読み込み

`JSONCompactEachRowWithNames` 形式を使用してデータを読み込みます：

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNames
```

出力は JSON 形式です。


```json
["日付", "シーズン", "ホームチーム", "アウェイチーム", "ホームチーム得点数", "アウェイチーム得点数"]
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
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 設定が 1 に設定されている場合、
入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされ、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が 1 に設定されている場合は、不明な名前のカラムはスキップされます。
それ以外の場合は、最初の行がスキップされます。
:::
