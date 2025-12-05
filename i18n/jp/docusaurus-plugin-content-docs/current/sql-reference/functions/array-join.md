---
description: 'arrayJoin 関数に関するドキュメント'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'arrayJoin 関数'
doc_type: 'reference'
---

# arrayJoin 関数 {#arrayjoin-function}

これは非常に特殊な関数です。

通常の関数は行の集合を変更せず、各行内の値だけを変更します（map）。
集約関数は行の集合を圧縮します（fold または reduce）。
`arrayJoin` 関数は各行を受け取り、行の集合を生成します（unfold）。

この関数は配列を引数に取り、その配列の要素数だけ元の行を複数行に展開します。
この関数が適用されるカラム以外のすべてのカラムの値は単純にコピーされ、そのカラムの値は対応する配列の要素で置き換えられます。

:::note
配列が空の場合、`arrayJoin` は行を一切生成しません。
配列型のデフォルト値を含む 1 行を返すには、例えば次のように [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) でラップします：`arrayJoin(emptyArrayToSingle(...))`。
:::

例えば：

```sql title="Query"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="Response"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 関数は、`WHERE` 節を含むクエリ内のすべての節に影響します。以下のクエリの結果は `2` になっていることに注意してください。サブクエリは 1 行しか返していないにもかかわらず、このような結果になります。

```sql title="Query"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="Response"
┌─impressions─┐
│           2 │
└─────────────┘
```

クエリでは複数の `arrayJoin` 関数を使用できます。この場合、変換は複数回実行され、行数が掛け合わされます。
例えば：

```sql title="Query"
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

```text title="Response"
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

同じ式に対して複数回 `arrayJoin` を使用すると、共通部分式の除去により期待する結果にならない場合があります。
そのような場合には、結合結果に影響を与えない追加の演算を挿入して、繰り返し使用される配列式を変更することを検討してください。例えば、`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))` などです。

例：

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- is technically correct, but will annihilate result set
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- intentionally changed expression to force re-evaluation
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

SELECT クエリ内の [`ARRAY JOIN`](../statements/select/array-join.md) 構文に注意してください。これにより、より幅広い操作が可能になります。
`ARRAY JOIN` を使用すると、同じ要素数を持つ複数の配列を一度に変換できます。

例えば：

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

または [`Tuple`](../data-types/tuple.md) を使用できます

例えば：

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

ClickHouse における `arrayJoin` という名称は、1 行内の配列に対して適用されるという点を除けば JOIN 操作と概念的に類似していることに由来します。従来の JOIN が異なるテーブル間で行を結合するのに対し、`arrayJoin` は 1 つの行の配列内の各要素を「結合」し、配列要素ごとに 1 行ずつ複数の行を生成しつつ、他のカラム値を複製します。ClickHouse には [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 句構文も用意されており、なじみのある SQL JOIN 用語を使用することで、従来の JOIN 操作との関係性をさらに明示的にしています。この処理は配列を「展開する」と表現されることもありますが、テーブルと配列要素を結合してデータセットを JOIN 操作と同様の形で拡張するイメージに近いことから、関数名と句の両方で「join」という用語が使用されています。
