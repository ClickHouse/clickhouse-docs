---
description: 'ClickHouse の `WHERE` 句に関するドキュメント'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 句'
doc_type: 'reference'
keywords: ['WHERE']
---

# WHERE 句 {#where-clause}

`WHERE` 句は、`SELECT` の [`FROM`](../../../sql-reference/statements/select/from.md) 句から得られるデータをフィルタリングするために使用します。

`WHERE` 句がある場合、その直後には `UInt8` 型の式を記述する必要があります。
この式が `0` と評価された行は、その後の変換処理や結果から除外されます。

`WHERE` 句に続く式は、[比較演算子](/sql-reference/operators#comparison-operators) や [論理演算子](/sql-reference/operators#operators-for-working-with-data-sets)、あるいは多数存在する [汎用関数](/sql-reference/functions/regular-functions) のいずれかと組み合わせて使用されることがよくあります。

`WHERE` 式は、基盤となるテーブルエンジンがそれをサポートしている場合、インデックスの利用やパーティションプルーニングの可否を考慮して評価されます。

:::note PREWHERE
[`PREWHERE`](../../../sql-reference/statements/select/prewhere.md) と呼ばれるフィルタリングの最適化も存在します。
PREWHERE は、フィルタリングをより効率的に適用するための最適化です。
`PREWHERE` 句が明示的に指定されていなくても、デフォルトで有効になっています。
:::

## `NULL` の判定 {#testing-for-null}

値が[`NULL`](/sql-reference/syntax#null)かどうかを判定する必要がある場合は、次を使用します。
- [`IS NULL`](/sql-reference/operators#is_null) または [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) または [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

`NULL` を含む式は、上記のように明示的に判定しない限り、真になることはありません。

## 論理演算子を使用したデータのフィルタリング {#filtering-data-with-logical-operators}

複数の条件を組み合わせて指定するために、`WHERE` 句と組み合わせて次の[論理関数](/sql-reference/functions/logical-functions#and)を使用できます：

- [`and()`](/sql-reference/functions/logical-functions#and) または `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) または `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) または `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)

## 条件としての UInt8 列の使用 {#using-uint8-columns-as-a-condition}

ClickHouse では、`UInt8` 列をブール条件として直接使用でき、`0` は `false`、それ以外の非ゼロ値（一般的には `1`）は `true` を表します。
その例については、[下記](#example-uint8-column-as-condition)のセクションで説明します。

## 比較演算子の使用 {#using-comparison-operators}

次の[比較演算子](/sql-reference/operators#comparison-operators)を使用できます。

| 演算子 | 関数 | 説明 | 例 |
|----------|----------|-------------|---------|
| `a = b` | `equals(a, b)` | 等しい | `price = 100` |
| `a == b` | `equals(a, b)` | 等しい（代替構文） | `price == 100` |
| `a != b` | `notEquals(a, b)` | 等しくない | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | 等しくない（代替構文） | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | より小さい | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | 以下 | `price <= 200` |
| `a > b` | `greater(a, b)` | より大きい | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | 以上 | `price >= 500` |
| `a LIKE s` | `like(a, b)` | パターン一致（大文字小文字を区別） | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | パターンに一致しない（大文字小文字を区別） | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | パターン一致（大文字小文字を区別しない） | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | 範囲チェック（両端を含む） | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | 範囲外のチェック | `price NOT BETWEEN 100 AND 500` |

## パターンマッチングと条件式 {#pattern-matching-and-conditional-expressions}

比較演算子に加えて、`WHERE` 句ではパターンマッチングと条件式も使用できます。

| 機能        | 構文                           | 大文字小文字の区別 | パフォーマンス | 最適な用途                               |
| ----------- | ------------------------------ | ------------------ | -------------- | ---------------------------------------- |
| `LIKE`      | `col LIKE '%pattern%'`         | あり               | 高速           | 大文字小文字を区別するパターンマッチング |
| `ILIKE`     | `col ILIKE '%pattern%'`        | なし               | やや低速       | 大文字小文字を区別しない検索             |
| `if()`      | `if(cond, a, b)`               | 該当なし           | 高速           | 単純な二項条件                           |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | 該当なし           | 高速           | 複数条件                                 |
| `CASE`      | `CASE WHEN ... THEN ... END`   | 該当なし           | 高速           | SQL 標準の条件ロジック                   |

使用例については「[パターンマッチングと条件式](#examples-pattern-matching-and-conditional-expressions)」を参照してください。

## リテラル、カラム、サブクエリを用いた式 {#expressions-with-literals-columns-subqueries}

`WHERE` 句の後に続く式には、[リテラル](/sql-reference/syntax#literals)、カラム、またはサブクエリ（条件で使用される値を返す入れ子の `SELECT` 文）を含めることができます。

| Type         | Definition  | Evaluation | Performance | Example                    |
| ------------ | ----------- | ---------- | ----------- | -------------------------- |
| **Literal**  | 固定された定数値    | クエリ記述時に評価  | 最速          | `WHERE price > 100`        |
| **Column**   | テーブルデータへの参照 | 行ごとに評価     | 高速          | `WHERE price > cost`       |
| **Subquery** | 入れ子の SELECT | クエリ実行時に評価  | ケースにより異なる   | `WHERE id IN (SELECT ...)` |

複雑な条件の中で、リテラル、カラム、サブクエリを組み合わせて使用できます。

```sql
-- リテラル + カラム
WHERE price > 100 AND category = 'Electronics'

-- カラム + サブクエリ
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- リテラル + カラム + サブクエリ
WHERE category = 'Electronics'
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

-- 3 つすべてに論理演算子を使用
WHERE (price > 100 OR category IN (SELECT category FROM featured))
  AND in_stock = true
  AND name LIKE '%Special%'
```
## 例 {#examples}

### `NULL` のテスト {#examples-testing-for-null}

`NULL` 値を含むクエリ:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### 論理演算子を使用したデータのフィルタリング {#example-filtering-with-logical-operators}

以下のテーブルとデータを使用します。

```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Laptop', 999.99, 'Electronics', true),
(2, 'Mouse', 25.50, 'Electronics', true),
(3, 'Desk', 299.00, 'Furniture', false),
(4, 'Chair', 150.00, 'Furniture', true),
(5, 'Monitor', 350.00, 'Electronics', true),
(6, 'Lamp', 45.00, 'Furniture', false);
```

**1. `AND` - 両方の条件が満たされている必要があります：**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ マウス   │  25.5 │ 電子機器 │ true     │
2. │  5 │ モニター │   350 │ 電子機器 │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - 少なくとも1つの条件が成立している必要があります：**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ ノートパソコン │ 999.99 │ 電子機器 │ true     │
2. │  3 │ デスク   │    299 │ 家具   │ false    │
3. │  4 │ 椅子  │    150 │ 家具   │ true     │
4. │  6 │ ランプ   │     45 │ 家具   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` - 条件を否定する:**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ 机   │   299 │ 家具      │ false    │
2. │  6 │ ランプ │    45 │ 家具      │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - どちらか一方の条件だけが真でなければならない（両方が真であってはならない）：**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ マウス │  25.5 │ 電子機器 │ true     │
2. │  3 │ デスク │   299 │ 家具      │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. 複数の演算子を組み合わせる:**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ マウス   │  25.5 │ 電子機器 │ true     │
2. │  4 │ 椅子   │   150 │ 家具   │ true     │
3. │  5 │ モニター │   350 │ 電子機器 │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. 関数構文を使う:**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ ノートパソコン  │ 999.99 │ 電子機器 │ true     │
2. │  2 │ マウス   │   25.5 │ 電子機器 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ モニター │    350 │ 電子機器 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

SQL キーワード構文（`AND`、`OR`、`NOT`、`XOR`）の方が一般的に可読性は高いですが、関数構文は複雑な式や動的クエリを構築する際に有用です。

### 条件としての UInt8 列の利用 {#example-uint8-column-as-condition}

[前の例](#example-filtering-with-logical-operators) のテーブルを用いて、列名をそのまま条件として使用できます：

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ ノートパソコン  │ 999.99 │ 電子機器 │ true     │
2. │  2 │ マウス   │   25.5 │ 電子機器 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ モニター │    350 │ 電子機器 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### 比較演算子の使用 {#example-using-comparison-operators}

以下の例では、上記の[例](#example-filtering-with-logical-operators)のテーブルとデータを使用します。簡潔にするため、結果の出力は省略しています。

**1. `true` との明示的な等価比較（`= 1` または `= true`）:**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- または
WHERE in_stock = 1;
```

**2. `false` と明示的に等値比較する（`= 0` または `= false`）:**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- または
WHERE in_stock = 0;
```

**3. 不等比較（`!= 0` または `!= false`）：**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. より大きい（&gt;）:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 以下（≦）：**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 他の条件との組み合わせ:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. `IN` 演算子の使用:**

以下の例では `(1, true)` は [タプル](/sql-reference/data-types/tuple)です。

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

この操作は [array](/sql-reference/data-types/array) を使って行うこともできます。

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 比較スタイルの混在:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### パターンマッチングと条件式 {#examples-pattern-matching-and-conditional-expressions}

以下の例では、上記の[例](#example-filtering-with-logical-operators)と同じテーブルとデータを使用します。説明を簡潔にするため、結果は省略します。

#### LIKE の例 {#like-examples}

```sql
-- 名前に 'o' を含む製品を検索
SELECT * FROM products WHERE name LIKE '%o%';
-- 結果: Laptop, Monitor

-- 'L' で始まる製品を検索
SELECT * FROM products WHERE name LIKE 'L%';
-- 結果: Laptop, Lamp

-- 名前が4文字ちょうどの製品を検索
SELECT * FROM products WHERE name LIKE '____';
-- 結果: Desk, Lamp
```

#### ILIKE の使用例 {#ilike-examples}

```sql
-- 大文字小文字を区別しない 'LAPTOP' の検索
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- 結果: Laptop

-- 大文字小文字を区別しない前方一致検索
SELECT * FROM products WHERE name ILIKE 'l%';
-- 結果: Laptop, Lamp
```

#### IF の使用例 {#if-examples}

```sql
-- カテゴリ別の価格閾値
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- 結果: Mouse, Chair, Monitor
-- (Electronicsで500ドル未満 または Furnitureで200ドル未満)

-- 在庫状況に基づくフィルタ
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- 結果: Laptop, Chair, Monitor, Desk, Lamp
-- (在庫ありで100ドル超の商品 または 在庫なしの全商品)
```

#### multiIf の使用例 {#multiif-examples}

```sql
-- カテゴリベースの複数条件
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- 結果: Mouse, Monitor, Chair
-- (Electronics < $600 または在庫ありFurniture)

-- 段階的フィルタリング
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- 結果: Laptop, Chair, Monitor, Lamp
```

#### CASE の例 {#case-examples}

**シンプルな CASE 式:**

```sql
-- カテゴリごとに異なるルール
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 結果：Mouse、Monitor、Chair
```

**検索した CASE:**

```sql
-- 価格ベースの段階的ロジック
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- 結果: Laptop, Monitor, Mouse, Lamp
```
