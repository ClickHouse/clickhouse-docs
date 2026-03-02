---
description: '条件付き関数に関するドキュメント'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件付き関数'
doc_type: 'リファレンス'
---

# 条件付き関数 \{#conditional-functions\}

## 概要 \{#overview\}

### 条件式の結果を直接使用する \{#using-conditional-results-directly\}

条件式は常に `0`、`1`、または `NULL` を返します。そのため、次のように条件式の結果を直接使用できます。

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```


### 条件式における NULL 値 \{#null-values-in-conditionals\}

条件式に `NULL` が含まれている場合、その評価結果も `NULL` になります。

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

そのため、型が `Nullable` の場合はクエリを慎重に構築する必要があります。

次の例は、`multiIf` に等値条件を追加しなかったために失敗するケースを示しています。

```sql
SELECT
    left,
    right,
    multiIf(left < right, '左の方が小さい', left > right, '右の方が小さい', '両方とも等しい') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ 両方とも等しい       │
│    1 │     3 │ 左の方が小さい  │
│    2 │     2 │ 両方とも等しい       │
│    3 │     1 │ 右の方が小さい │
│    4 │  ᴺᵁᴸᴸ │ 両方とも等しい       │
└──────┴───────┴──────────────────┘
```


### CASE ステートメント \{#case-statement\}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件付きロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は 2 つの形式の CASE をサポートしています：

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   この形式は柔軟に記述でき、内部的には [multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を使用して実装されています。各条件は独立して評価され、式には非定数値を含めることができます。

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- 以下のように変換されます
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   このよりコンパクトな形式は、定数値との比較に最適化されており、内部的には `caseWithExpression()` を使用します。

例えば、次の記述は有効です。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- 次のように変換されます

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3行のセット。経過時間: 0.002秒。
```

この形式でも、戻り値式を定数にする必要はありません。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- 以下のように変換されます

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 rows in set. Elapsed: 0.001 sec.
```


#### 注意点 \{#caveats\}

ClickHouse は、CASE 式（`multiIf` などの内部的に同等な式を含む）について、条件を評価する前の段階で結果の型を決定します。これは、戻り値の式同士で型が異なる場合（異なるタイムゾーンや数値型など）に重要になります。

* 結果の型は、すべての分岐の中で互換性のある型のうち最も「大きい」型に基づいて選択されます。
* 一度この型が選択されると、他のすべての分岐は、その条件が実行時に決して真にならない場合でも、暗黙的にこの型へキャストされます。
* DateTime64 のように、タイムゾーンが型シグネチャの一部になっている型では、これが予期しない挙動につながることがあります。最初に見つかったタイムゾーンがすべての分岐で使用されてしまい、他の分岐で異なるタイムゾーンを指定していてもそれが反映されない場合があります。

例えば、以下では、すべての行が最初にマッチした分岐のタイムゾーン、つまり `Asia/Kolkata` でタイムスタンプを返します。

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 rows in set. Elapsed: 0.011 sec.
```

ここでは、ClickHouse は複数の `DateTime64(3, <timezone>)` の戻り値型を検出します。最初に見つかったものに基づき、共通の型を `DateTime64(3, 'Asia/Kolkata'` と推論し、他の分岐も暗黙的にこの型へキャストします。

これは、意図したタイムゾーンの書式を保持するために文字列に変換することで対処できます。

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 rows in set. Elapsed: 0.002 sec.
```

{/* 
    以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
    system.functions から生成されるドキュメントに置き換えられます。タグを変更または削除しないでください。
    詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }


## clamp \{#clamp\}

導入バージョン: v24.5.0

指定された最小値と最大値の範囲に収まるように値を制限します。

値が最小値より小さい場合は最小値を返します。値が最大値より大きい場合は最大値を返します。それ以外の場合は、その値自体を返します。

すべての引数は互いに比較可能な型である必要があります。結果の型は、すべての引数の中で互換性のある型のうち、もっとも大きい型になります。

**構文**

```sql
clamp(value, min, max)
```

**引数**

* `value` — クランプ対象の値。 - `min` — 最小値。 - `max` — 最大値。

**戻り値**

値を [min, max] の範囲内に制限して返します。

**例**

**基本的な使用例**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**最小値を下回る値**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**最大値より大きい値**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```


## greatest \{#greatest\}

導入バージョン: v1.1.0

引数の中で最も大きい値を返します。
`NULL` の引数は無視されます。

* 配列に対しては、辞書式（lexicographical）順序で最も大きい配列を返します。
* `DateTime` 型に対しては、結果の型はより大きい型に昇格します（例: `DateTime32` と混在している場合は `DateTime64`）。

:::note `NULL` の挙動を変更するには設定 `least_greatest_legacy_null_behavior` を使用する
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では後方互換性のない変更が導入され、`NULL` 値が無視されるようになりました。以前は、引数のいずれかが `NULL` の場合は `NULL` を返していました。
以前の挙動を維持するには、設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を `true` に設定してください。
:::

**構文**

```sql
greatest(x1[, x2, ...])
```

**引数**

* `x1[, x2, ...]` — 比較する 1 つ以上の値。すべての引数は比較可能な型でなければなりません。[`Any`](/sql-reference/data-types)

**戻り値**

引数の中で最大の値を返し、その値の型は互換性のある型の中で最も広い型に昇格されます。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**配列**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**DateTime 型**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```


## if \{#if\}

導入バージョン: v1.1.0

条件分岐を行います。

* 条件 `cond` が 0 以外の値に評価される場合、関数は式 `then` の結果を返します。
* `cond` が 0 または NULL に評価される場合、`else` 式の結果が返されます。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) は、ショートサーキット評価を使用するかどうかを制御します。

有効な場合、`then` 式は `cond` が true の行に対してのみ評価され、`else` 式は `cond` が false の行に対してのみ評価されます。

例えば、ショートサーキット評価が有効な場合、次のクエリを実行しても 0 除算の例外は発生しません。

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` と `else` は同じ型、または互換性のある型でなければなりません。

**構文**

```sql
if(cond, then, else)
```

**引数**

* `cond` — 評価対象の条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
* `then` — `cond` が true の場合に返される式。- `else` — `cond` が false または `NULL` の場合に返される式。

**返される値**

条件 `cond` に応じて、`then` または `else` のいずれかの式の結果が返されます。

**例**

**使用例**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```


## least \{#least\}

導入バージョン: v1.1.0

引数の中で最小の値を返します。
`NULL` 引数は無視されます。

* 配列に対しては、辞書順で最小の配列を返します。
* DateTime 型に対しては、結果の型は最大の型に昇格します（例: DateTime32 と混在する場合は DateTime64）。

:::note 設定 `least_greatest_legacy_null_behavior` を使用して `NULL` の挙動を変更する
[24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) バージョンでは後方互換性のない変更が導入され、`NULL` 値が無視されるようになりました。以前は、引数の一つが `NULL` の場合は `NULL` を返していました。
以前の挙動を維持するには、設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を `true` にします。
:::

**構文**

```sql
least(x1[, x2, ...])
```

**引数**

* `x1[, x2, ...]` — 比較する 1 つ以上の値。すべての引数は互いに比較可能な型でなければなりません。[`Any`](/sql-reference/data-types)

**戻り値**

引数の中で最小の値を返します。値は互換性のある型のうち最も広い型に昇格されます。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**配列**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**DateTime 型**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```


## multiIf \{#multiIf\}

導入されたバージョン: v1.1.0

クエリ内で [`CASE`](/sql-reference/operators#conditional-expression) 演算子をより簡潔に記述できるようにします。
各条件を順番に評価します。最初に真（ゼロ以外かつ `NULL` でない）になった条件に対して、その条件に対応する分岐の値を返します。
いずれの条件も真でない場合は、`else` の値を返します。

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 設定により、
短絡評価（short-circuit evaluation）を使用するかどうかを制御できます。有効な場合、`then_i` 式は
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` が真となる行でのみ評価されます。

例えば、短絡評価が有効な場合、次のクエリを実行してもゼロ除算の例外はスローされません。

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

すべての分岐式および else 式は、共通のスーパータイプを持つ必要があります。`NULL` 条件は false として扱われます。

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**別名**: `caseWithoutExpression`, `caseWithoutExpr`

**引数**

* `cond_N` — `then_N` を返すかどうかを制御する N 番目に評価される条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
* `then_N` — `cond_N` が true のときに関数が返す結果。- `else` — いずれの条件も true にならない場合に関数が返す結果。

**戻り値**

一致する `cond_N` がある場合は対応する `then_N` の結果を返し、それ以外の場合は `else` の結果を返します。

**例**

**使用例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
