---
'slug': '/examples/aggregate-function-combinators/groupArrayResample'
'title': 'groupArrayResample'
'description': 'groupArray を使用した Resample 組み合わせ子の例'
'keywords':
- 'groupArray'
- 'Resample'
- 'combinator'
- 'examples'
- 'groupArrayResample'
'sidebar_label': 'groupArrayResample'
'doc_type': 'reference'
---


# groupArrayResample {#grouparrayresample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用して、
指定されたキー列の範囲を固定数の区間 (`N`) に分割し、
それぞれの区間に含まれるデータポイントから最小のキーに対応する
1つの代表値を選択することで、結果の配列を構築します。
すべての値を集めるのではなく、データのダウンサンプリングされたビューを作成します。

## Example usage {#example-usage}

例を見てみましょう。`name`、`age`、および
`wage` を含むテーブルを作成し、データを挿入します：

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

`[30,60)` および `[60,75)` の区間に年齢が含まれる人々の名前を取得しましょう。
整数表現を使用して年齢を取得するため、`[30, 59]` および `[60,74]` の区間の年齢を取得します。

名前を配列に集約するために、`groupArray` 集約関数を使用します。
1つの引数を取ります。私たちの場合、それは名前の列です。`groupArrayResample`
関数は、年齢によって名前を集約するために年齢列を使用する必要があります。
必要な区間を定義するために、`30`、`75`、`30` を `groupArrayResample`
関数に引数として渡します：

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
