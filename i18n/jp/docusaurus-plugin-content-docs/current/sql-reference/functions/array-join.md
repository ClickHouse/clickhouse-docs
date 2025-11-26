---
description: 'arrayJoin 関数に関するドキュメント'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'arrayJoin 関数'
doc_type: 'reference'
---



# arrayJoin function

これは少し特殊な関数です。

通常の関数は、行の集合自体は変更せず、各行の値だけを変更します（map）。
集約関数は、行の集合を圧縮します（fold または reduce）。
`arrayJoin` 関数は、各行を取り、それを行の集合に展開します（unfold）。

この関数は引数として配列を受け取り、配列内の要素数分だけ元の行を複数の行に増やします。
この関数が適用される列以外の列の値は単純にコピーされ、その列の値のみが対応する配列要素の値に置き換えられます。

:::note
配列が空の場合、`arrayJoin` は行を一切生成しません。
配列型のデフォルト値を含む 1 行を返したい場合は、[emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) でラップします。例えば `arrayJoin(emptyArrayToSingle(...))` のようにします。
:::

例えば:

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

`arrayJoin` 関数は、`WHERE` 節を含むクエリ内のすべての節に影響します。次のクエリの結果は、サブクエリが 1 行しか返していないにもかかわらず `2` になっている点に注意してください。

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

1 つのクエリで複数の `arrayJoin` 関数を使用できます。この場合、変換は複数回行われ、行同士の組み合わせ分だけ増加します。
例えば次のとおりです。

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

### ベストプラクティス

同じ式に対して複数回 `arrayJoin` を使用すると、共通部分式の除去により意図しない結果になる場合があります。
そのような場合は、結合の結果に影響を与えない追加の処理を加えて、繰り返し利用される配列式を変更することを検討してください。例えば、`arrayJoin(arraySort(arr))` や `arrayJoin(arrayConcat(arr, []))` などです。

例:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技術的には正しいが、結果セットが消失する
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- 再評価を強制するため意図的に式を変更
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

SELECT クエリ内の [`ARRAY JOIN`](../statements/select/array-join.md) 構文に注目してください。これにより、より幅広い操作が可能になります。
`ARRAY JOIN` を使用すると、同じ要素数を持つ複数の配列を一度に展開できます。

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

または [`Tuple`](../data-types/tuple.md) を使用できます。

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

ClickHouse における `arrayJoin` という名称は、1 行内の配列に対して適用されるという点を除けば、JOIN 演算との概念的な類似性に由来しています。従来の JOIN が複数のテーブルから行を結合するのに対し、`arrayJoin` は 1 行内の配列の各要素を「結合」し、配列要素ごとに 1 行ずつ複数の行を生成し、その際に他の列の値は複製されます。ClickHouse には、[`ARRAY JOIN`](/sql-reference/statements/select/array-join) 句の構文も用意されており、なじみのある SQL の JOIN 用語を使うことで、従来の JOIN 操作との関係性をさらに明示的に表現しています。この処理は配列を「展開する」（unfolding）とも呼ばれますが、テーブルを配列要素と結合しているように見え、JOIN 操作と同様の形でデータセットを拡張するため、関数名と句の両方に「join」という用語が使用されています。
