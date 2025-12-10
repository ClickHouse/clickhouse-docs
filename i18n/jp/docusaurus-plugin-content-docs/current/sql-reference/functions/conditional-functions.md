---
description: '条件付き関数のドキュメント'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件付き関数'
doc_type: 'reference'
---

# 条件付き関数 {#conditional-functions}

## 概要 {#overview}

### 条件式の結果を直接利用する {#using-conditional-results-directly}

条件式は常に `0`、`1`、または `NULL` を返します。そのため、次のように条件式の結果をそのまま利用できます。

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

### 条件式における NULL 値 {#null-values-in-conditionals}

条件式に `NULL` 値が含まれている場合、その評価結果も `NULL` になります。

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

そのため、型が `Nullable` の場合には、クエリを慎重に記述する必要があります。

次の例は、`multiIf` に等値条件を追加していないために失敗することを示しています。

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

### CASE ステートメント {#case-statement}

ClickHouse の CASE 式は、SQL の CASE 演算子と同様の条件付きロジックを提供します。条件を評価し、最初に一致した条件に基づいて値を返します。

ClickHouse は CASE 式の 2 つの形式をサポートします:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   この形式は柔軟性が高く、内部的には [multiIf](/sql-reference/functions/conditional-functions#multiIf) 関数を使って実装されています。各条件は独立して評価され、式には非定数値を含めることができます。

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
   このよりコンパクトな形式は定数値の一致に最適化されており、内部的には `caseWithExpression()` を使用します。

たとえば、次のような記述は有効です:

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
```

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 行の結果。経過時間: 0.002 秒。

````

この形式では、返り値の式を定数にする必要はありません。

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

-- 次のように変換されます

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

3行のセット。経過時間: 0.001秒。
````

#### 注意事項 {#caveats}

ClickHouse は、CASE 式（または `multiIf` のような、内部で同等の役割を果たすもの）の結果型を、どの条件も評価する前に決定します。これは、戻り値の式の型が異なる場合（異なるタイムゾーンや数値型など）に重要になります。

* 結果型は、すべてのブランチの中で互換性のある「最大」の型に基づいて選択されます。
* いったんこの型が選択されると、他のすべてのブランチは暗黙的にその型へキャストされます — たとえそのブランチの条件が実行時に一度も真にならない場合でも同様です。
* DateTime64 のように、タイムゾーンが型シグネチャの一部になっている型においては、これが意外な動作につながることがあります。最初に出現したタイムゾーンが、他のブランチで異なるタイムゾーンを指定していても、すべてのブランチに対して使用されてしまう場合があります。

たとえば、以下の例では、すべての行で最初にマッチしたブランチのタイムゾーン、すなわち `Asia/Kolkata` でのタイムスタンプが返されます。

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

-- 次のように変換されます

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

3行のセット。経過時間: 0.011秒。
```

ここで、ClickHouse は複数の `DateTime64(3, <timezone>)` の戻り値の型を認識します。最初に見つかったものとして共通型を `DateTime64(3, 'Asia/Kolkata'` と推論し、他の分岐も暗黙的にこの型にキャストします。

これは、意図したタイムゾーン表記を保持するために文字列に変換することで対処できます。

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
```

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 行の結果。経過時間: 0.002 秒.

```

<!-- 
以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
system.functions から生成されたドキュメントで置き換えられます。タグの変更や削除は行わないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```

{/*AUTOGENERATED_START*/ }

## clamp {#clamp}

導入バージョン: v24.5

値を指定された最小値と最大値の範囲内に制限します。

値が最小値より小さい場合は最小値を返します。値が最大値より大きい場合は最大値を返します。それ以外の場合は、元の値を返します。

すべての引数は相互に比較可能な型でなければなりません。結果の型は、すべての引数の中で互換性のある型のうち最も幅の広い型になります。

**構文**

```sql
clamp(value, min, max)
```

**引数**

* `value` — クランプする値。 - `min` — 最小値。 - `max` — 最大値。

**戻り値**

値を `[min, max]` の範囲に収まるようにして返します。

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

**最小値未満**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**最大値を超えた値**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```

## greatest {#greatest}

導入されたバージョン: v1.1

引数の中で最も大きい値を返します。
`NULL` の引数は無視されます。

* 配列の場合、辞書順で最も大きい配列を返します。
* `DateTime` 型の場合、結果の型は最も大きい型に昇格されます（例: `DateTime32` と混在する場合は `DateTime64`）。

:::note `NULL` の挙動を変更するには設定 `least_greatest_legacy_null_behavior` を使用する
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では後方互換性のない変更が導入され、`NULL` 値が無視されるようになりました。以前は、引数のいずれかが `NULL` の場合は `NULL` を返していました。
以前の挙動を維持するには、設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を `true` に設定してください。
:::

**構文**

```sql
greatest(x1[, x2, ...])
```

**引数**

* `x1[, x2, ...]` — 比較する 1 つ以上の値。すべての引数は互いに比較可能な型である必要があります。[`Any`](/sql-reference/data-types)

**返り値**

引数の中で最大の値を返し、その値は互換性のある型のうち最大の型に昇格されます。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返される型はFloat64です。比較のためにUInt8を64ビットに昇格する必要があるためです。
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
-- 返される型はDateTime64です。比較のためにDateTime32を64ビットに昇格する必要があるためです。
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```

## if {#if}

導入バージョン: v1.1

条件分岐を行います。

* 条件 `cond` が 0 以外の値に評価される場合、関数は式 `then` の結果を返します。
* `cond` が 0 または NULL に評価される場合、`else` 式の結果を返します。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) によって、ショートサーキット評価を使用するかどうかを制御できます。

有効にすると、`then` 式は `cond` が true の行でのみ評価され、`else` 式は `cond` が false の行でのみ評価されます。

例えば、ショートサーキット評価が有効な場合、次のクエリを実行してもゼロ除算の例外はスローされません。

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` と `else` は同種の型でなければなりません。

**構文**

```sql
if(cond, then, else)
```

**引数**

* `cond` — 評価対象の条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
* `then` — `cond` が true の場合に返される式。`else` — `cond` が false または `NULL` の場合に返される式。

**戻り値**

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

## least {#least}

導入バージョン: v1.1

引数の中で最も小さい値を返します。
`NULL` の引数は無視されます。

* 配列の場合、辞書順で最小の配列を返します。
* DateTime 型の場合、結果の型はより大きい型に昇格します（例: DateTime32 と混在する場合は DateTime64）。

:::note `NULL` の動作を変更するには設定 `least_greatest_legacy_null_behavior` を使用する
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では、後方互換性のない変更として、`NULL` 値が無視されるようになりました。以前は、引数のいずれかが `NULL` の場合は `NULL` を返していました。
以前の動作を維持するには、設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を `true` に設定してください。
:::

**構文**

```sql
least(x1[, x2, ...])
```

**引数**

* `x1[, x2, ...]` — 比較する 1 つ以上の値。すべての引数は比較可能な型でなければなりません。[`Any`](/sql-reference/data-types)

**返される値**

引数の中で最小の値を返し、その値は互換性のある型のうち最も広い型に昇格されます。[`Any`](/sql-reference/data-types)

**例**

**数値型**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返される型はFloat64です。比較のためにUInt8を64ビットに昇格する必要があるためです。
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
-- 返される型はDateTime64です。比較のためにDateTime32を64ビットに昇格する必要があるためです。
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```

## multiIf {#multiIf}

導入バージョン: v1.1

クエリ内で [`CASE`](/sql-reference/operators#conditional-expression) 演算子をより簡潔に記述できるようにします。
条件を順番に評価し、最初に真（ゼロ以外かつ `NULL` でない）になった条件に対応するブランチ値を返します。
いずれの条件も真にならない場合は、`else` の値を返します。

設定 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) によって、
短絡評価（ショートサーキット評価）を使用するかどうかを制御します。有効にすると、`then_i` 式は
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` が真となる行でのみ評価されます。

たとえば、短絡評価が有効な場合、次のクエリを実行してもゼロ除算の例外は発生しません。

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

すべての分岐および `else` 式は、共通の上位型を持つ必要があります。`NULL` 条件は false として扱われます。

**構文**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**別名**: `caseWithoutExpression`, `caseWithoutExpr`

**引数**

* `cond_N` — `then_N` が返されるかどうかを制御する N 番目の条件。[`UInt8`](/sql-reference/data-types/int-uint) または [`Nullable(UInt8)`](/sql-reference/data-types/nullable) または [`NULL`](/sql-reference/syntax#null)
* `then_N` — `cond_N` が true の場合に関数が返す結果。`else` — いずれの条件も true でない場合に関数が返す結果。

**返される値**

一致する `cond_N` に対する `then_N` の結果を返し、それ以外の場合は `else` の結果を返します。

**例**

**使用例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'leftの方が小さい', left > right, 'leftの方が大きい', left = right, '両方とも等しい', 'NULL値') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null値          │
│    1 │     3 │ leftが小さい    │
│    2 │     2 │ 両方とも等しい  │
│    3 │     1 │ leftが大きい    │
│    4 │  ᴺᵁᴸᴸ │ Null値          │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
