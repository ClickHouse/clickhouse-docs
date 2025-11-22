---
description: 'arrayJoin 関数に関するドキュメント'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'arrayJoin 関数'
doc_type: 'reference'
---



# arrayJoin関数

これは非常に特殊な関数です。

通常の関数は行の集合を変更せず、各行の値のみを変更します（マップ）。
集約関数は行の集合を圧縮します（畳み込みまたは縮約）。
`arrayJoin`関数は各行を受け取り、行の集合を生成します（展開）。

この関数は配列を引数として受け取り、配列内の要素数分だけソース行を複数の行に展開します。
この関数が適用される列の値を除き、すべての列の値は単純にコピーされます。適用される列の値は対応する配列の値に置き換えられます。

:::note
配列が空の場合、`arrayJoin`は行を生成しません。
配列型のデフォルト値を含む単一の行を返すには、[emptyArrayToSingle](./array-functions.md#emptyArrayToSingle)でラップすることができます。例：`arrayJoin(emptyArrayToSingle(...))`
:::

例：

```sql title="クエリ"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="結果"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin`関数は`WHERE`句を含むクエリのすべてのセクションに影響します。以下のクエリでは、サブクエリが1行を返したにもかかわらず、結果が`2`になることに注意してください。

```sql title="クエリ"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="結果"
┌─impressions─┐
│           2 │
└─────────────┘
```

クエリは複数の`arrayJoin`関数を使用できます。この場合、変換が複数回実行され、行が乗算されます。
例：

```sql title="クエリ"
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="結果"
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Babruysk │ Chrome  │
│           1 │ Babruysk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### ベストプラクティス {#important-note}

同じ式で複数の`arrayJoin`を使用すると、共通部分式の除去により期待した結果が得られない場合があります。
そのような場合は、結合結果に影響を与えない追加の操作で繰り返される配列式を変更することを検討してください。例：`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`

例：

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技術的には正しいが、結果セットを消失させる
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- 再評価を強制するために意図的に式を変更
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

SELECTクエリの[`ARRAY JOIN`](../statements/select/array-join.md)構文に注目してください。これはより広範な可能性を提供します。
`ARRAY JOIN`を使用すると、同じ要素数を持つ複数の配列を同時に変換できます。

例：

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
ARRAY JOIN
    cities AS city,
    browsers AS browser
GROUP BY
    2,
    3
```


```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

または [`Tuple`](../data-types/tuple.md) を利用することもできます。

例：

```sql title="Query"
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Row"
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

ClickHouse における `arrayJoin` という名前は、JOIN 演算との概念的な類似性に由来していますが、1 行内の配列に対して適用される点が異なります。従来の JOIN が異なるテーブル間の行を結合するのに対し、`arrayJoin` は行内の配列の各要素を「結合」して、配列要素ごとに 1 行ずつ複数の行を生成し、その際に他の列の値は複製されます。ClickHouse には、この関係性をさらに明示するために、なじみのある SQL JOIN 用語を用いた [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 句の構文も用意されています。この処理は配列を「展開する」と呼ばれることもありますが、テーブルを配列要素と結合しているように見え、JOIN 演算と同様の形でデータセットを拡張する処理であるため、関数名と句の両方で「join」という用語が使用されています。
