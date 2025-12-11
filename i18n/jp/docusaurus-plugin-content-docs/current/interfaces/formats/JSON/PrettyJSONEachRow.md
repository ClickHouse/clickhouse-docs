---
alias: ['PrettyJSONLines', 'PrettyNDJSON']
description: 'PrettyJSONLines 形式に関するドキュメント'
input_format: false
keywords: ['PrettyJSONEachRow', 'PrettyJSONLines', 'PrettyNDJSON']
output_format: true
slug: /interfaces/formats/PrettyJSONEachRow
title: 'PrettyJSONEachRow'
doc_type: 'guide'
---

| 入力 | 出力 | 別名                             |
|------|------|-----------------------------------|
| ✗    | ✔    | `PrettyJSONLines`, `PrettyNDJSON` |

## 説明 {#description}

[JSONEachRow](./JSONEachRow.md) と異なる点は、JSON が改行区切りおよび 4 つのスペースによるインデントを付けて整形されていることだけです。

## 使用例 {#example-usage}
### データの挿入 {#inserting-data}

次のデータを含む JSON ファイル `football.json` を用意します。

```json
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Sutton United",
    "away_team": "Bradford City",
    "home_team_goals": 1,
    "away_team_goals": 4
}
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Swindon Town",
    "away_team": "Barrow",
    "home_team_goals": 2,
    "away_team_goals": 1
}
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Tranmere Rovers",
    "away_team": "Oldham Athletic",
    "home_team_goals": 2,
    "away_team_goals": 0
}
{
    "date": "2022-05-02",
    "season": 2021,
    "home_team": "Port Vale",
    "away_team": "Newport County",
    "home_team_goals": 1,
    "away_team_goals": 2
}
{
    "date": "2022-05-02",
    "season": 2021,
    "home_team": "Salford City",
    "away_team": "Mansfield Town",
    "home_team_goals": 2,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Barrow",
    "away_team": "Northampton Town",
    "home_team_goals": 1,
    "away_team_goals": 3
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Bradford City",
    "away_team": "Carlisle United",
    "home_team_goals": 2,
    "away_team_goals": 0
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Bristol Rovers",
    "away_team": "Scunthorpe United",
    "home_team_goals": 7,
    "away_team_goals": 0
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Exeter City",
    "away_team": "Port Vale",
    "home_team_goals": 0,
    "away_team_goals": 1
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Harrogate Town A.F.C.",
    "away_team": "Sutton United",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Hartlepool United",
    "away_team": "Colchester United",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Leyton Orient",
    "away_team": "Tranmere Rovers",
    "home_team_goals": 0,
    "away_team_goals": 1
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Mansfield Town",
    "away_team": "Forest Green Rovers",
    "home_team_goals": 2,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Newport County",
    "away_team": "Rochdale",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Oldham Athletic",
    "away_team": "Crawley Town",
    "home_team_goals": 3,
    "away_team_goals": 3
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Stevenage Borough",
    "away_team": "Salford City",
    "home_team_goals": 4,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Walsall",
    "away_team": "Swindon Town",
    "home_team_goals": 0,
    "away_team_goals": 3
}
```

データを挿入する:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT PrettyJSONEachRow;
```

### データの読み取り {#reading-data}

`PrettyJSONEachRow` フォーマットを使用してデータを読み込みます：

```sql
SELECT *
FROM football
FORMAT PrettyJSONEachRow
```

出力は JSON 形式です。

```json
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Sutton United",
    "away_team": "Bradford City",
    "home_team_goals": 1,
    "away_team_goals": 4
}
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Swindon Town",
    "away_team": "Barrow",
    "home_team_goals": 2,
    "away_team_goals": 1
}
{
    "date": "2022-04-30",
    "season": 2021,
    "home_team": "Tranmere Rovers",
    "away_team": "Oldham Athletic",
    "home_team_goals": 2,
    "away_team_goals": 0
}
{
    "date": "2022-05-02",
    "season": 2021,
    "home_team": "Port Vale",
    "away_team": "Newport County",
    "home_team_goals": 1,
    "away_team_goals": 2
}
{
    "date": "2022-05-02",
    "season": 2021,
    "home_team": "Salford City",
    "away_team": "Mansfield Town",
    "home_team_goals": 2,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Barrow",
    "away_team": "Northampton Town",
    "home_team_goals": 1,
    "away_team_goals": 3
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Bradford City",
    "away_team": "Carlisle United",
    "home_team_goals": 2,
    "away_team_goals": 0
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Bristol Rovers",
    "away_team": "Scunthorpe United",
    "home_team_goals": 7,
    "away_team_goals": 0
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Exeter City",
    "away_team": "Port Vale",
    "home_team_goals": 0,
    "away_team_goals": 1
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Harrogate Town A.F.C.",
    "away_team": "Sutton United",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Hartlepool United",
    "away_team": "Colchester United",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Leyton Orient",
    "away_team": "Tranmere Rovers",
    "home_team_goals": 0,
    "away_team_goals": 1
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Mansfield Town",
    "away_team": "Forest Green Rovers",
    "home_team_goals": 2,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Newport County",
    "away_team": "Rochdale",
    "home_team_goals": 0,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Oldham Athletic",
    "away_team": "Crawley Town",
    "home_team_goals": 3,
    "away_team_goals": 3
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Stevenage Borough",
    "away_team": "Salford City",
    "home_team_goals": 4,
    "away_team_goals": 2
}
{
    "date": "2022-05-07",
    "season": 2021,
    "home_team": "Walsall",
    "away_team": "Swindon Town",
    "home_team_goals": 0,
    "away_team_goals": 3
}
```



## 形式設定 {#format-settings}
