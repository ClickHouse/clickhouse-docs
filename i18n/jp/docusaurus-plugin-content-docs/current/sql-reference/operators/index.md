---
description: '演算子のドキュメント'
sidebar_label: '演算子'
sidebar_position: 38
slug: /sql-reference/operators/
title: '演算子'
doc_type: 'reference'
---

# 演算子

ClickHouse はクエリの構文解析段階で、演算子をその優先度、優先順位、および結合性に従って対応する関数へと変換します。

## アクセス演算子 \{#access-operators\}

`a[N]` – 配列の要素へのアクセス。`arrayElement(a, N)` 関数。

`a.N` – タプルの要素へのアクセス。`tupleElement(a, N)` 関数。

## 数値の否定演算子 \{#numeric-negation-operator\}

`-a` – `negate(a)` 関数。

タプルを否定する場合は、[tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate) を参照してください。

## 乗算および除算演算子 \{#multiplication-and-division-operators\}

`a * b` – `multiply(a, b)` 関数。

タプルと数値の乗算については [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber)、内積については [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct) を参照してください。

`a / b` – `divide(a, b)` 関数。

タプルを数値で除算する場合は [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber) を参照してください。

`a % b` – `modulo(a, b)` 関数。

## 加算および減算演算子 \{#addition-and-subtraction-operators\}

`a + b` – `plus(a, b)` 関数。

タプルに対する加算は [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus) を参照。

`a - b` – `minus(a, b)` 関数。

タプルに対する減算は [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus) を参照。

## 比較演算子 \{#comparison-operators\}

### equals 関数 \{#equals-function\}

`a = b` – `equals(a, b)` 関数と同等。

`a == b` – `equals(a, b)` 関数と同等。

### notEquals 関数 \{#notequals-function\}

`a != b` – `notEquals(a, b)` 関数を表します。

`a <> b` – `notEquals(a, b)` 関数を表します。

### lessOrEquals 関数 \{#lessorequals-function\}

`a <= b` – `lessOrEquals(a, b)` 関数。

### greaterOrEquals 関数 \{#greaterorequals-function\}

`a >= b` – `greaterOrEquals(a, b)` 関数です。

### less 関数 \{#less-function\}

`a < b` – `less(a, b)` 関数です。

### greater 関数 \{#greater-function\}

`a > b` – `greater(a, b)` 関数。

### like 関数 \{#like-function\}

`a LIKE b` – `like(a, b)` 関数です。

### notLike 関数 \{#notlike-function\}

`a NOT LIKE b` – `notLike(a, b)` 関数。

### ilike 関数 \{#ilike-function\}

`a ILIKE b` – `ilike(a, b)` 関数。

### BETWEEN 関数 \{#between-function\}

`a BETWEEN b AND c` – `a >= b AND a <= c` と同じです。

`a NOT BETWEEN b AND c` – `a < b OR a > c` と同じです。

## データセットを操作するための演算子 \{#operators-for-working-with-data-sets\}

[IN 演算子](../../sql-reference/operators/in.md)および[EXISTS 演算子](../../sql-reference/operators/exists.md)を参照してください。

### in function \{#in-function\}

`a IN ...` – `in(a, b)` 関数です。

### notIn 関数 \{#notin-function\}

`a NOT IN ...` – `notIn(a, b)` 関数。

### globalIn 関数 \{#globalin-function\}

`a GLOBAL IN ...` – `globalIn(a, b)` 関数に対応します。

### globalNotIn 関数 \{#globalnotin-function\}

`a GLOBAL NOT IN ...` – これに対応する `globalNotIn(a, b)` 関数です。

### in サブクエリ関数 \{#in-subquery-function\}

`a = ANY (subquery)` – `in(a, subquery)` 関数に対応します。  

### notIn サブクエリ関数 \{#notin-subquery-function\}

`a != ANY (subquery)` – `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)` と同等です。

### in サブクエリ関数 \{#in-subquery-function-1\}

`a = ALL (subquery)` は、`a IN (SELECT singleValueOrNull(*) FROM subquery)` と同じです。

### notIn サブクエリ関数

`a != ALL (subquery)` – `notIn(a, subquery)` 関数。

**例**

ALL を使用するクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

結果:

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

ANY を使ったクエリ:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

結果:

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


## 日付・時刻を扱う演算子 \{#operators-for-working-with-dates-and-times\}

### 抽出

```sql
EXTRACT(part FROM date);
```

指定された日付から特定の要素を抽出します。たとえば、指定された日付から月を取得したり、時刻から秒を取得したりできます。

`part` パラメータは、日付のどの部分を取得するかを指定します。次の値を使用できます。

* `DAY` — 月の日。取りうる値: 1–31。
* `MONTH` — 月を表す番号。取りうる値: 1–12。
* `YEAR` — 年。
* `SECOND` — 秒。取りうる値: 0–59。
* `MINUTE` — 分。取りうる値: 0–59。
* `HOUR` — 時。取りうる値: 0–23。

`part` パラメータは大文字・小文字を区別しません。

`date` パラメータは処理対象の日付または時刻を指定します。[Date](../../sql-reference/data-types/date.md) 型または [DateTime](../../sql-reference/data-types/datetime.md) 型を使用できます。

例:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

次の例では、テーブルを作成し、`DateTime` 型の値を 1 つ挿入します。

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

[tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) で、さらに多くの例を確認できます。


### INTERVAL

[Date](../../sql-reference/data-types/date.md) 型および [DateTime](../../sql-reference/data-types/datetime.md) 型の値との算術演算で使用される、[Interval](../../sql-reference/data-types/special-data-types/interval.md) 型の値を作成します。

使用可能な INTERVAL の種類:

* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

`INTERVAL` の値を設定するときには、文字列リテラルも使用できます。たとえば、`INTERVAL 1 HOUR` は `INTERVAL '1 hour'` や `INTERVAL '1' hour` と同じ意味になります。

:::tip\
異なる種類の INTERVAL を組み合わせることはできません。`INTERVAL 4 DAY 1 HOUR` のような式は使用できません。INTERVAL は、その INTERVAL 内で最も小さい単位以下の単位で指定してください。たとえば `INTERVAL 25 HOUR` のようにします。以下の例のように、演算を連続して使用できます。
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

:::note\
`INTERVAL` 構文または `addDays` 関数の使用が常に優先されます。単純な加算や減算（`now() + ...` のような構文）は、タイムゾーン設定を考慮しません。たとえば、夏時間（サマータイム）などです。
:::

例：

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
* [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 型変換関数


## 論理 AND 演算子 \{#logical-and-operator\}

構文 `SELECT a AND b` — 関数 [and](/sql-reference/functions/logical-functions#and) を使用して、`a` と `b` の論理積（AND）を計算します。

## 論理 OR 演算子 \{#logical-or-operator\}

構文 `SELECT a OR b` — 関数 [or](/sql-reference/functions/logical-functions#or) により、`a` と `b` の論理和を計算します。

## 論理否定演算子 \{#logical-negation-operator\}

構文 `SELECT NOT a` は、関数 [not](/sql-reference/functions/logical-functions#not) を使用して `a` の論理否定を計算します。

## 条件演算子 \{#conditional-operator\}

`a ? b : c` – `if(a, b, c)` 関数です。

注意:

条件演算子は、まず b と c を評価し、その後で条件 a が満たされているかを確認し、対応する値を返します。`b` または `c` が [arrayJoin()](/sql-reference/functions/array-join) 関数である場合、条件 "a" に関係なく各行が複製されます。

## 条件式

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

`x` が指定されている場合は `transform(x, [a, ...], [b, ...], c)` 関数が使用されます。指定されていない場合は `multiIf(a, b, ..., c)` 関数が使用されます。

式に `ELSE c` 句が存在しない場合、デフォルト値は `NULL` です。

`transform` 関数は `NULL` をサポートしません。


## 連結演算子 \{#concatenation-operator\}

`s1 || s2` – `concat(s1, s2)` 関数と同等です。

## ラムダ生成演算子 \{#lambda-creation-operator\}

`x -> expr` – `lambda(x, expr)` 関数。

次の演算子は括弧であるため、優先順位を持ちません。

## 配列作成演算子 \{#array-creation-operator\}

`[x1, ...]` – `array(x1, ...)` 関数と同等。

## タプル生成演算子 \{#tuple-creation-operator\}

`(x1, x2, ...)` – `tuple(x1, x2, ...)` 関数と同等です。

## 結合性 \{#associativity\}

すべての二項演算子は左結合です。たとえば、`1 + 2 + 3` は `plus(plus(1, 2), 3)` に変換されます。
これは期待どおりに動作しない場合があります。たとえば、`SELECT 4 > 2 > 3` の結果は 0 になります。

効率化のために、`and` と `or` 関数は任意個数の引数を受け取ることができます。対応する `AND` および `OR` 演算子の連鎖は、これらの関数への単一の呼び出しに変換されます。

## `NULL` の確認 \{#checking-for-null\}

ClickHouse は `IS NULL` および `IS NOT NULL` 演算子をサポートしています。

### IS NULL \

* [Nullable](../../sql-reference/data-types/nullable.md) 型の値に対しては、`IS NULL` 演算子は次を返します：
  * 値が `NULL` の場合は `1`
  * それ以外の場合は `0`
* それ以外のデータ型の値に対しては、`IS NULL` 演算子は常に `0` を返します。

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は列全体のデータを読み取って処理する代わりに、[null](../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み取ります。クエリ `SELECT n IS NULL FROM table` は `SELECT n.null FROM table` に書き換えられます。

{/* */ }

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```


### IS NOT NULL \

* [Nullable](../../sql-reference/data-types/nullable.md) 型の値に対しては、`IS NOT NULL` 演算子は次の値を返します:
  * 値が `NULL` の場合は `0`。
  * それ以外の場合は `1`。
* その他の値に対しては、`IS NOT NULL` 演算子は常に `1` を返します。

{/* */ }

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、この関数は列全体のデータを読み取り・処理する代わりに、[null](../../sql-reference/data-types/nullable.md#finding-null) サブカラムのみを読み取ります。クエリ `SELECT n IS NOT NULL FROM table` は `SELECT NOT n.null FROM TABLE` に書き換えられます。
