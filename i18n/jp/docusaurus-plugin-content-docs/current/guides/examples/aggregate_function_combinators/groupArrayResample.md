---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'groupArrayをResampleコンビネータと共に使用する例'
keywords:
- 'groupArray'
- 'Resample'
- 'combinator'
- 'examples'
- 'groupArrayResample'
sidebar_label: 'groupArrayResample'
---




# groupArrayResample {#grouparrayresample}

## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、指定されたキー列の範囲を固定数の間隔 (`N`) に分割し、各間隔に該当するデータポイントから最小のキーに対応する代表値を選択して結果の配列を構築するために、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用できます。
これにより、すべての値を収集するのではなく、データのダウンサンプルされたビューが作成されます。

## 使用例 {#example-usage}

例を見てみましょう。従業員の `name`、`age`、`wage` を含むテーブルを作成し、いくつかのデータを挿入します:

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

年齢が `[30,60)` と `[60,75)` の間にある人々の名前を取得しましょう。
年齢を整数値で表現するため、`[30, 59]` と `[60,74]` の間隔になります。

名前を配列で集約するために、`groupArray` 集約関数を使用します。
これは1つの引数を取ります。私たちの場合、それは名前の列です。`groupArrayResample`
関数は年齢列を使用して年齢ごとに名前を集約する必要があります。必要な間隔を定義するために、`30`、`75`、`30` を `groupArrayResample`
関数に引数として渡します：

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## さらに見る {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
