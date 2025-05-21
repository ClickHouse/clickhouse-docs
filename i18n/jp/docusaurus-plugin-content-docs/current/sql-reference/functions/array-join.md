description: 'arrayJoin関数のドキュメンテーション'
sidebar_label: 'arrayJoin'
sidebar_position: 15
slug: /sql-reference/functions/array-join
title: 'arrayJoin関数'
```


# arrayJoin関数

これは非常に珍しい関数です。

通常の関数は行のセットを変更せず、各行の値を変更するだけです（マップ）。
集約関数は行のセットを圧縮します（フォールドまたはリデュース）。
`arrayJoin`関数は、各行を取り、行のセットを生成します（アンフォールド）。

この関数は配列を引数として受け取り、ソース行を配列内の要素の数に応じて複数の行に伝播させます。
列内のすべての値は単純にコピーされ、関数が適用される列の値だけが対応する配列の値に置き換えられます。

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

`arrayJoin`関数は、クエリのすべてのセクションに影響を与えます。`WHERE`セクションも含まれます。サブクエリが1行を返したにもかかわらず、結果が2になっていることに注意してください。

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

クエリは複数の`arrayJoin`関数を使用できます。この場合、変換は複数回行われ、行が倍増します。

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
### 重要な注意事項! {#important-note}
同じ式の複数の`arrayJoin`を使用すると、最適化のために期待される結果が得られない場合があります。
その場合、結合結果に影響を与えない追加の操作で繰り返し配列式を変更することを検討してください - 例: `arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`

例:
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技術的には正しいが、結果セットを消失させる
    arrayJoin(arrayConcat(dice, [])) as second_throw -- 再評価を強制するために意図的に式を変更
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```

SELECTクエリ内の[ARRAY JOIN](../statements/select/array-join.md)構文に注意してください。これはより広範な可能性を提供します。
`ARRAY JOIN`を使用すると、同じ数の要素を持つ複数の配列を同時に変換できます。

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

または[Tuple](../data-types/tuple.md)を使用することもできます。

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
