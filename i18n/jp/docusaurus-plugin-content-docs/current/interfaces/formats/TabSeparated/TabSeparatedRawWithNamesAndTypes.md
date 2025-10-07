---
'alias':
- 'TSVRawWithNamesAndTypes'
- 'RawWithNamesAndTypes'
'description': 'TabSeparatedRawWithNamesAndTypesフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'TabSeparatedRawWithNamesAndTypes'
- 'TSVRawWithNamesAndTypes'
- 'RawWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/TabSeparatedRawWithNamesAndTypes'
'title': 'TabSeparatedRawWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias                                             |
|-------|--------|---------------------------------------------------|
| ✔     | ✔      | `TSVRawWithNamesAndNames`, `RawWithNamesAndNames` |

## 説明 {#description}

[`TabSeparatedWithNamesAndTypes`](./TabSeparatedWithNamesAndTypes.md) フォーマットと異なり、行がエスケープなしで書き込まれます。

:::note
このフォーマットで解析する場合、各フィールドにタブまたは改行は許可されていません。
:::

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

`football.tsv` という名前の以下の tsv ファイルを使用します:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
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

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNamesAndTypes;
```

### データの読み取り {#reading-data}

`TabSeparatedRawWithNamesAndTypes` フォーマットを使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNamesAndTypes
```

出力は、カラム名とタイプのための2つのヘッダー行を持つタブ区切りのフォーマットになります:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
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

## フォーマット設定 {#format-settings}
