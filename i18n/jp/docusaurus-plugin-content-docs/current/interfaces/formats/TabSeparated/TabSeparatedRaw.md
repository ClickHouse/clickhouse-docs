---
alias: ['TSVRaw', 'Raw']
description: 'TabSeparatedRaw フォーマットに関するドキュメント'
input_format: true
keywords: ['TabSeparatedRaw']
output_format: true
slug: /interfaces/formats/TabSeparatedRaw
title: 'TabSeparatedRaw'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス       |
|------|------|------------------|
| ✔    | ✔    | `TSVRaw`, `Raw`  |



## Description {#description}

[`TabSeparated`](/interfaces/formats/TabSeparated)形式とは異なり、行はエスケープ処理なしで書き込まれます。

:::note
この形式で解析する際、各フィールド内にタブや改行文字を含めることはできません。
:::

`TabSeparatedRaw`形式と`RawBlob`形式の比較については、[Raw形式の比較](../RawBLOB.md/#raw-formats-comparison)を参照してください。


## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下の`football.tsv`という名前のtsvファイルを使用します:

```tsv
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
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRaw;
```

### データの読み取り {#reading-data}

`TabSeparatedRaw`形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRaw
```

出力はタブ区切り形式になります:

```tsv
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
