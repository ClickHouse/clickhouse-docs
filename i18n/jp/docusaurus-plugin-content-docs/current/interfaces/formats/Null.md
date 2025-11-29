---
alias: []
description: 'Null フォーマットのドキュメント'
input_format: false
keywords: ['Null', 'format']
output_format: true
slug: /interfaces/formats/Null
title: 'Null'
doc_type: 'reference'
---

| Input | Output | 別名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 説明 {#description}

`Null` フォーマットでは、何も出力されません。  
一見すると奇妙に思えるかもしれませんが、何も出力されない場合でもクエリ自体は処理されており、  
コマンドラインクライアントを使用している場合は、データがクライアントに送信される点に注意してください。

:::tip
`Null` フォーマットは、パフォーマンス測定や性能テストに役立ちます。
:::



## 使用例 {#example-usage}

### データの読み取り {#reading-data}

次のデータを含むテーブル `football` を例にします。

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

`Null` フォーマットを使用してデータを読み込みます：

```sql
SELECT *
FROM football
FORMAT Null
```

このクエリはデータを処理しますが、何も出力しません。

```response
0行のセット。経過時間: 0.154秒
```


## フォーマット設定 {#format-settings}
