---
'description': 'arrayJoin 関数に関するドキュメント'
'sidebar_label': 'arrayJoin'
'slug': '/sql-reference/functions/array-join'
'title': 'arrayJoin 関数'
'doc_type': 'reference'
---


# arrayJoin 関数

これは非常に珍しい関数です。

通常の関数は行のセットを変更するのではなく、各行の値を変更するだけです（マップ）。
集約関数は行のセットを圧縮します（フォールドまたはリデュース）。
`arrayJoin` 関数は、各行を取り、行のセットを生成します（アンフォールド）。

この関数は配列を引数として受け取り、配列の要素数に応じてソース行を複数の行に展開します。
この関数が適用されるカラムの値を除いて、すべてのカラムの値は単純にコピーされ、対応する配列の値に置き換えられます。

:::note
配列が空の場合、`arrayJoin` は行を生成しません。
配列型のデフォルト値を含む単一行を返すには、[emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) でラップすることができます。例えば: `arrayJoin(emptyArrayToSingle(...))`。
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

`arrayJoin` 関数は、クエリのすべてのセクションに影響を及ぼします。`WHERE` セクションを含みます。以下のクエリの結果が `2` になっていることに注意してください。サブクエリは1行を返しましたが。

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

クエリは複数の `arrayJoin` 関数を使用できます。この場合、変換は複数回行われ、行が掛け算されます。
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

同じ式で複数の `arrayJoin` を使用すると、共通の副式の排除により期待した結果が得られない場合があります。
そのような場合、結合結果に影響を与えない追加の操作で繰り返される配列式を修正することを検討してください。例えば、`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`

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

SELECT クエリの [`ARRAY JOIN`](../statements/select/array-join.md) 構文には、より広い可能性が提供されることに注意してください。
`ARRAY JOIN` を使用すると、同じ数の要素を持つ複数の配列を同時に変換できます。

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

または、[`Tuple`](../data-types/tuple.md) を使用できます。

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

ClickHouse における `arrayJoin` という名前は、単一行内の配列に適用された JOIN 操作との概念的な類似性から来ており、伝統的な JOIN は異なるテーブルからの行を結合するのに対し、`arrayJoin` は行内の配列の各要素を「結合」し、各配列要素に対して複数の行を生成し、他のカラムの値を複製します。また、ClickHouse はこの関係を伝統的な JOIN 操作に対してより明示的にする [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 句構文も提供しています。このプロセスは、配列を「アンフォールド」するとも呼ばれますが、「結合」という用語は関数名や句に使用され、配列要素とのテーブルを結合する様子を表し、JOIN 操作に類似した方法でデータセットを拡張します。
