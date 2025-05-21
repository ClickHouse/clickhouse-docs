---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'groupArrayを使用したResampleコンビネータの例'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
---


# groupArrayResample {#grouparrayresample}

## 説明 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用でき、
指定されたキー列の範囲を固定数の区間（`N`）に分割し、
各区間に含まれるデータポイントから最小キーに対応する代表値を選択することにより、
結果として得られる配列を構築します。
これはすべての値を収集するのではなく、データのダウンサンプルされたビューを作成します。

## 使用例 {#example-usage}

例を見てみましょう。従業員の`name`、`age`、および`wage`を含むテーブルを作成し、
いくつかのデータを挿入します：

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

年齢が`[30,60)`と`[60,75)`の区間にある人々の名前を取得しましょう。
整数で年齢を表すため、`[30, 59]`および`[60,74]`の区間の年齢を取得します。

名前を配列に集約するには、`groupArray`集約関数を使用します。
これは1つの引数を取ります。この場合は、名前のカラムです。`groupArrayResample`
関数は年齢のカラムを使用して年齢別に名前を集約する必要があります。  
必要な区間を定義するために、`30`、`75`、`30`を`groupArrayResample`
関数に引数として渡します：

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## その他 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resampleコンビネータ`](/sql-reference/aggregate-functions/combinators#-resample)
