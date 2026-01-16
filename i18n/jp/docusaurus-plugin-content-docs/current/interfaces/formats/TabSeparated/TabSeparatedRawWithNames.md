---
alias: ['TSVRawWithNames', 'RawWithNames']
description: 'TabSeparatedRawWithNames 形式に関するドキュメント'
input_format: true
keywords: ['TabSeparatedRawWithNames', 'TSVRawWithNames', 'RawWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedRawWithNames
title: 'TabSeparatedRawWithNames'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス                         |
|------|------|-----------------------------------|
| ✔    | ✔    | `TSVRawWithNames`, `RawWithNames` |

## 説明 \\{#description\\}

このフォーマットは、行がエスケープ処理されずに書き込まれるという点で、[`TabSeparatedWithNames`](./TabSeparatedWithNames.md) フォーマットとは異なります。

:::note
このフォーマットで解析する際、各フィールド内でタブや改行文字は使用できません。
:::

## 使用例 \\{#example-usage\\}

### データの挿入 \\{#inserting-data\\}

`football.tsv` という名前の次の `tsv` ファイルを使用します。

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

データを挿入する：

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNames;
```

### データの読み込み \\{#reading-data\\}

`TabSeparatedRawWithNames` 形式でデータを読み込みます。

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNames
```

出力は、1 行目がヘッダーのタブ区切り形式になります。

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## 書式設定 \\{#format-settings\\}