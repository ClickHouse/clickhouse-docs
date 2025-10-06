---
'slug': '/examples/aggregate-function-combinators/countResample'
'title': 'countResample'
'description': 'countを使用したResampleコンビネータの例'
'keywords':
- 'count'
- 'Resample'
- 'combinator'
- 'examples'
- 'countResample'
'sidebar_label': 'countResample'
'doc_type': 'reference'
---


# countResample {#countResample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、[`count`](/sql-reference/aggregate-functions/reference/count)
集約関数に適用することができ、指定されたキー列の値を 
固定数の間隔（`N`）でカウントします。

## Example usage {#example-usage}

### Basic example {#basic-example}

例を見てみましょう。従業員の`name`、`age`、および
`wage`を含むテーブルを作成し、データをいくつか挿入します：

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

年齢が`[30,60)` および `[60,75)` の範囲にあるすべての人をカウントしましょう。
年齢の整数表現を使用するため、`[30, 59]` および `[60,74]` の
範囲の年齢が得られます。そのためには、`count`に 
`Resample`コンビネータを適用します。

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
