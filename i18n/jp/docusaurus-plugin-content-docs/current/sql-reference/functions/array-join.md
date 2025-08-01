---
description: 'Documentation for arrayJoin function'
sidebar_label: 'arrayJoin'
sidebar_position: 15
slug: '/sql-reference/functions/array-join'
title: 'arrayJoin function'
---




# arrayJoin 関数

これは非常に珍しい関数です。

通常の関数は行のセットを変更することはなく、各行の値のみを変更します（マップ）。集約関数は行のセットを圧縮します（フォールドまたはリデュース）。`arrayJoin` 関数は各行を取り、行のセットを生成します（アンフォールド）。

この関数は配列を引数として受け取り、配列内の要素の数に応じてソース行を複数の行に伝播させます。この関数が適用されるカラム以外のすべての値は単純にコピーされ、そのカラムの値は対応する配列の値に置き換えられます。

例:

```sql
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 関数はクエリのすべてのセクションに影響を与え、`WHERE` セクションも含みます。サブクエリが 1 行を返しているにもかかわらず、結果が 2 であることに注意してください。

例:

```sql
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Bobruisk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text
┌─impressions─┐
│           2 │
└─────────────┘
```

クエリは複数の `arrayJoin` 関数を使用できます。この場合、変換は複数回行われ、行が増加します。

例:

```sql
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Bobruisk │ Chrome  │
│           1 │ Bobruisk │ Firefox │
└─────────────┴──────────┴─────────┘
```
### 重要な注意点! {#important-note}
同じ式で複数の `arrayJoin` を使用すると、最適化のために期待した結果が得られない可能性があります。その場合は、結合結果に影響を与えない追加の操作で繰り返し配列式を修正することを検討してください。たとえば、`arrayJoin(arraySort(arr))` や `arrayJoin(arrayConcat(arr, []))` などです。

例:
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技術的には正しいが、結果セットを無効にする
    arrayJoin(arrayConcat(dice, [])) as second_throw -- 再評価を強制するために式を意図的に変更した
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```

SELECT クエリでの [ARRAY JOIN](../statements/select/array-join.md) 構文に注意してください。これにより、より広範な可能性が提供されます。`ARRAY JOIN` を使用すると、同じ数の要素を持つ複数の配列を一度に変換できます。

例:

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
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
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

あるいは [Tuple](../data-types/tuple.md) を使用することもできます。

例:

```sql
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```
