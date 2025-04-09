---
slug: /sql-reference/functions/array-join
sidebar_position: 15
sidebar_label: arrayJoin
---


# arrayJoin 関数

これは非常に珍しい関数です。

通常の関数は行のセットを変更することはなく、各行の値を変更するだけです（マップ）。
集約関数は行のセットを圧縮します（フォールドまたはリデュース）。
`arrayJoin` 関数は、各行を取り、行のセットを生成します（アンフォールド）。

この関数は配列を引数に取り、配列の要素の数に応じて元の行を複数の行に伝播させます。
すべてのカラムの値は単純にコピーされますが、この関数が適用されるカラムの値は、対応する配列の値に置き換えられます。

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

`arrayJoin` 関数は `WHERE` セクションを含むクエリのすべてのセクションに影響します。サブクエリが1行を返したにもかかわらず、結果は2です。

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

クエリは複数の `arrayJoin` 関数を使用できます。この場合、変換は複数回行われ、行は増加します。

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
### 注意事項！ {#important-note}
同じ式で複数の `arrayJoin` を使用すると、最適化により期待される結果が得られないことがあります。
その場合は、結合結果に影響を与えない追加の操作で繰り返される配列の式を変更することを検討してください - 例: `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

例:
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技術的に正しいが、結果セットを消去する
    arrayJoin(arrayConcat(dice, [])) as second_throw -- 再評価を強制するために意図的に式を変更
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```



SELECT クエリの [ARRAY JOIN](../statements/select/array-join.md) 構文に注意してください。これはより広い可能性を提供します。
`ARRAY JOIN` を使用すると、同じ数の要素を持つ複数の配列を同時に変換できます。

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

または、[Tuple](../data-types/tuple.md) を使用することもできます。

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
