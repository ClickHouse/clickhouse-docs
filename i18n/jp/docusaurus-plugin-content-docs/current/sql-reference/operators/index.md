---
description: '演算子に関するドキュメント'
sidebar_label: '演算子'
sidebar_position: 38
slug: /sql-reference/operators/
title: '演算子'
doc_type: 'reference'
---

# 演算子 {#operators}

ClickHouse は、クエリのパース段階で、演算子の優先度、優先順位、および結合性に従って、それらを対応する関数に変換します。

## アクセス演算子 {#access-operators}

`a[N]` – 配列の要素へのアクセス。`arrayElement(a, N)` 関数。

`a.N` – タプルの要素へのアクセス。`tupleElement(a, N)` 関数。

## 数値の符号反転演算子 {#numeric-negation-operator}

`-a` – `negate(a)` 関数。

タプルの符号反転: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate)。

## 乗算および除算演算子 {#multiplication-and-division-operators}

`a * b` – `multiply (a, b)` 関数。

タプルを数値で乗算する場合: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber)、スカラー積の場合: [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct)。

`a / b` – `divide(a, b)` 関数。

タプルを数値で除算する場合: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber)。

`a % b` – `modulo(a, b)` 関数。

## 加算および減算演算子 {#addition-and-subtraction-operators}

`a + b` – `plus(a, b)` 関数。

タプルの加算: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus)。

`a - b` – `minus(a, b)` 関数。

タプルの減算: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus)。

## 比較演算子 {#comparison-operators}

### equals 関数 {#equals-function}

`a = b` – `equals(a, b)` 関数と同じです。

`a == b` – `equals(a, b)` 関数と同じです。

### notEquals 関数 {#notequals-function}

`a != b` – `notEquals(a, b)` 関数。

`a <> b` – `notEquals(a, b)` 関数。

### lessOrEquals関数 {#lessorequals-function}

`a <= b` – `lessOrEquals(a, b)` 関数を表します。

### lessOrEquals関数 {#lessorequals-function}

`a >= b` – `greaterOrEquals(a, b)` 関数です。

### greaterOrEquals関数 {#less-function}

`a < b` – `less(a, b)` 関数。

### less関数 {#greater-function}

`a > b` – `less(a, b)` 関数。

### like関数 {#like-function}

`a LIKE b` – `like(a, b)` 関数です。

### notLike 関数 {#notlike-function}

`a LIKE b` – `like(a, b)`関数

### notLike関数 {#ilike-function}

`a NOT LIKE b` – `notLike(a, b)`関数。

### ilike関数 {#between-function}

`a BETWEEN b AND c` – `a >= b AND a <= c` と同じ意味です。

`a NOT BETWEEN b AND c` – `a < b OR a > c` と同じ意味です。

### is not distinct from 演算子 (`<=>`) {#is-not-distinct-from}

:::note
バージョン 25.10 以降では、`<=>` を他の演算子と同様に使用できます。
バージョン 25.10 より前では、次の例のように JOIN 式の中でのみ使用できました。

```sql
CREATE TABLE a (x String) ENGINE = Memory;
INSERT INTO a VALUES ('ClickHouse');

SELECT * FROM a AS a1 JOIN a AS a2 ON a1.x <=> a2.x;

┌─x──────────┬─a2.x───────┐
│ ClickHouse │ ClickHouse │
└────────────┴────────────┘
```

:::

`<=>` 演算子は `NULL` セーフな等価比較演算子であり、`IS NOT DISTINCT FROM` と同等です。
通常の等価演算子（`=`）と同様に動作しますが、`NULL` 値を互いに比較可能なものとして扱います。
2 つの `NULL` 値は等しいと見なされ、`NULL` と `NULL` 以外の値を比較した場合は、`NULL` ではなく 0（偽）を返します。

```sql
SELECT
  'ClickHouse' <=> NULL,
  NULL <=> NULL
```

```response
┌─isNotDistinc⋯use', NULL)─┬─isNotDistinc⋯NULL, NULL)─┐
│                        0 │                        1 │
└──────────────────────────┴──────────────────────────┘
```

## データセットを扱う演算子 {#operators-for-working-with-data-sets}

[IN 演算子](../../sql-reference/operators/in.md)および[EXISTS 演算子](../../sql-reference/operators/exists.md)を参照してください。

### in 関数 {#in-function}

`a IN ...` は `in(a, b)` 関数です。

### notIn 関数 {#notin-function}

`a NOT IN ...` – `notIn(a, b)` 関数に対応します。

### globalIn 関数 {#globalin-function}

`a GLOBAL IN ...` – `globalIn(a, b)` 関数です。

### globalNotIn 関数 {#globalnotin-function}

`a GLOBAL NOT IN ...` は `globalNotIn(a, b)` 関数です。

### in サブクエリ用関数 {#in-subquery-function}

`a = ANY (subquery)` – `in(a, subquery)` 関数です。  

### notIn サブクエリ関数 {#notin-subquery-function}

`a != ANY (subquery)` – `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)` と同じ意味になります。

### in subquery 関数 {#in-subquery-function-1}

`a = ALL (subquery)` は、`a IN (SELECT singleValueOrNull(*) FROM subquery)` と同じです。

### notIn サブクエリ関数 {#notin-subquery-function-1}

`a != ALL (subquery)` – `notIn(a, subquery)` 関数。

**例**

ALL を使用したクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

結果：

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

ANYを使用したクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

結果：

```text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

## 日付と時刻を扱う演算子 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

```sql
EXTRACT(part FROM date);
```

指定した日付から各部分を抽出します。たとえば、特定の日付から月を取得したり、時刻から秒を取得したりできます。

`part`パラメータは、どの部分を取得するかを指定します。指定可能な値は次のとおりです:

* `DAY` — 月の日付。指定可能な値: 1–31。
* `MONTH` — 月を表す番号。指定可能な値: 1–12。
* `YEAR` — 年。
* `SECOND` — 秒。指定可能な値: 0–59。
* `MINUTE` — 分。指定可能な値: 0–59。
* `HOUR` — 時。指定可能な値: 0–23。

`part`パラメータは大文字小文字を区別しません。

`date` パラメータは処理する日付または時刻を指定します。[Date](../../sql-reference/data-types/date.md) 型または [DateTime](../../sql-reference/data-types/datetime.md) 型を使用できます。

例:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

以下の例では、テーブルを作成し、`DateTime` 型の値を挿入します。

```sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

```sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

```sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

```text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

さらに多くの例については、[tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) を参照してください。

### INTERVAL {#interval}

[Date](../../sql-reference/data-types/date.md) 型および [DateTime](../../sql-reference/data-types/datetime.md) 型の値との算術演算で使用するための [Interval](../../sql-reference/data-types/special-data-types/interval.md) 型の値を作成します。

使用できる interval の種類:

* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

`INTERVAL` の値を設定する際には、文字列リテラルも使用できます。たとえば、`INTERVAL 1 HOUR` は `INTERVAL '1 hour'` や `INTERVAL '1' hour` と同じ意味になります。

:::tip
異なる型の interval は組み合わせられません。`INTERVAL 4 DAY 1 HOUR` のような式は使用できません。`INTERVAL 25 HOUR` のように、その interval の最小単位と同じか、それより小さい単位で指定してください。以下の例のように、演算を続けて適用することができます。
:::

例:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note
`INTERVAL` 構文または `addDays` 関数の使用を常に推奨します。単純な加算や減算（`now() + ...` のような構文）は、サマータイムなどの時間関連の設定を考慮しません。
:::

例:

```sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

```text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**関連項目**

* [Interval](../../sql-reference/data-types/special-data-types/interval.md) データ型
* [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 型変換関数

## 論理AND演算子 {#logical-and-operator}

構文 `SELECT a AND b` — 関数 [and](/sql-reference/functions/logical-functions#and) を用いて、`a` と `b` の論理積を計算します。

## 論理OR演算子 {#logical-or-operator}

構文 `SELECT a OR b` — 関数 [or](/sql-reference/functions/logical-functions#or) を使用して、`a` と `b` の論理和を計算します。

## 論理否定演算子 {#logical-negation-operator}

構文 `SELECT NOT a` — 関数 [not](/sql-reference/functions/logical-functions#not) により、`a` の論理否定を計算します。

## 条件演算子 {#conditional-operator}

`a ? b : c` – `if(a, b, c)` 関数です。

注記:

条件演算子は、b と c の値を計算した後、条件 a が満たされているかを確認し、該当する値を返します。`b` または `c` が [arrayJoin()](/sql-reference/functions/array-join) 関数である場合、条件 `a` に関係なく、各行が複製されます。

## 条件式 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

`x` が指定されている場合は、`transform(x, [a, ...], [b, ...], c)` 関数が使用されます。そうでない場合は、`multiIf(a, b, ..., c)` 関数が使用されます。

式に `ELSE c` 句がない場合、デフォルト値は `NULL` になります。

`transform` 関数は `NULL` を処理できません。

## 連結演算子 {#concatenation-operator}

`s1 || s2` – `concat(s1, s2)` 関数。

## Lambda 作成演算子 {#lambda-creation-operator}

`x -> expr` – `lambda(x, expr)` 関数です。

次の演算子は括弧として扱われるため、優先順位は定義されていません。

## 配列作成演算子 {#array-creation-operator}

`[x1, ...]` – `array(x1, ...)` 関数を表します。

## タプル作成演算子 {#tuple-creation-operator}

`(x1, x2, ...)` – `tuple(x1, x2, ...)` 関数。

## タプル生成演算子 {#associativity}

すべての二項演算子は左結合です。例えば、`1 + 2 + 3` は `plus(plus(1, 2), 3)` に変換されます。
場合によっては、これは期待どおりには動作しません。例えば、`SELECT 4 > 2 > 3` の結果は 0 になります。

効率のために、`and` および `or` は任意個数の引数を受け取る関数です。対応する `AND` および `OR` 演算子の連なりは、これらの関数の 1 回の呼び出しに変換されます。

## `NULL` のチェック {#checking-for-null}

ClickHouse は `IS NULL` および `IS NOT NULL` 演算子をサポートします。

### IS NULL {#is_null}

* [Nullable](../../sql-reference/data-types/nullable.md) 型の値に対しては、`IS NULL` 演算子は次の値を返します。
  * 値が `NULL` の場合は `1`
  * それ以外の場合は `0`
* Nullable 以外の値に対しては、`IS NULL` 演算子は常に `0` を返します。

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすると最適化できます。`optimize_functions_to_subcolumns = 1` の場合、この関数はカラム全体のデータを読み取って処理する代わりに、[null](../../sql-reference/data-types/nullable.md#finding-null) サブカラムだけを読み取ります。クエリ `SELECT n IS NULL FROM table` は `SELECT n.null FROM TABLE` に変換されます。

{/* */ }

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

* [Nullable](../../sql-reference/data-types/nullable.md) 型の値に対しては、`IS NOT NULL` 演算子は次を返します：
  * 値が `NULL` の場合は `0`
  * それ以外の場合は `1`
* それ以外の型の値に対しては、`IS NOT NULL` 演算子は常に `1` を返します。

{/* */ }

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) SETTING を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数はカラム全体のデータを読み取って処理するのではなく、[null](../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み込みます。クエリ `SELECT n IS NOT NULL FROM table` は `SELECT NOT n.null FROM TABLE` に変換されます。
