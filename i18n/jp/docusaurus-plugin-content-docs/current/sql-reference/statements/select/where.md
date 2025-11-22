---
description: 'ClickHouse における `WHERE` 句のドキュメント'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 句'
doc_type: 'reference'
keywords: ['WHERE']
---



# WHERE 句

`WHERE` 句は、`SELECT` 文の [`FROM`](../../../sql-reference/statements/select/from.md) 句から取得されたデータを絞り込むために使用されます。

`WHERE` 句がある場合、その後には型が `UInt8` の式を置かなければなりません。
この式の評価結果が `0` となる行は、その後の変換処理や最終結果から除外されます。

`WHERE` 句に続く式は、多くの場合 [比較演算子](/sql-reference/operators#comparison-operators) や [論理演算子](/sql-reference/operators#operators-for-working-with-data-sets)、あるいは多数ある [汎用関数](/sql-reference/functions/regular-functions) のいずれかと組み合わせて使用されます。

`WHERE` 句の式は、基盤となるテーブルエンジンが対応している場合、インデックスやパーティションプルーニングを利用できるかどうかを考慮して評価されます。

:::note PREWHERE
[`PREWHERE`](../../../sql-reference/statements/select/prewhere.md) と呼ばれるフィルタリングの最適化も存在します。
PREWHERE は、フィルタ処理をより効率的に適用するための最適化機能です。
`PREWHERE` 句が明示的に指定されていなくても、デフォルトで有効になっています。
:::



## `NULL`の判定 {#testing-for-null}

値が[`NULL`](/sql-reference/syntax#null)であるかどうかを判定する必要がある場合は、以下を使用してください:

- [`IS NULL`](/sql-reference/operators#is_null)または[`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null)または[`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

それ以外の方法では、`NULL`を含む式は決して真と評価されません。


## 論理演算子を使用したデータのフィルタリング {#filtering-data-with-logical-operators}

複数の条件を組み合わせる場合、`WHERE`句と共に以下の[論理関数](/sql-reference/functions/logical-functions#and)を使用できます:

- [`and()`](/sql-reference/functions/logical-functions#and) または `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) または `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) または `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)


## 条件としてのUInt8カラムの使用 {#using-uint8-columns-as-a-condition}

ClickHouseでは、`UInt8`カラムを直接ブール条件として使用できます。この場合、`0`は`false`、ゼロ以外の値(通常は`1`)は`true`として扱われます。
この例については、[以下](#example-uint8-column-as-condition)のセクションを参照してください。


## 比較演算子の使用 {#using-comparison-operators}

以下の[比較演算子](/sql-reference/operators#comparison-operators)が使用できます:

| 演算子                | 関数                | 説明                           | 例                         |
| ----------------------- | ----------------------- | ------------------------------------- | ------------------------------- |
| `a = b`                 | `equals(a, b)`          | 等しい                              | `price = 100`                   |
| `a == b`                | `equals(a, b)`          | 等しい(代替構文)         | `price == 100`                  |
| `a != b`                | `notEquals(a, b)`       | 等しくない                          | `category != 'Electronics'`     |
| `a <> b`                | `notEquals(a, b)`       | 等しくない(代替構文)     | `category <> 'Electronics'`     |
| `a < b`                 | `less(a, b)`            | より小さい                             | `price < 200`                   |
| `a <= b`                | `lessOrEquals(a, b)`    | 以下                 | `price <= 200`                  |
| `a > b`                 | `greater(a, b)`         | より大きい                          | `price > 500`                   |
| `a >= b`                | `greaterOrEquals(a, b)` | 以上              | `price >= 500`                  |
| `a LIKE s`              | `like(a, b)`            | パターンマッチング(大文字小文字を区別)     | `name LIKE '%top%'`             |
| `a NOT LIKE s`          | `notLike(a, b)`         | パターン不一致(大文字小文字を区別) | `name NOT LIKE '%top%'`         |
| `a ILIKE s`             | `ilike(a, b)`           | パターンマッチング(大文字小文字を区別しない)   | `name ILIKE '%LAPTOP%'`         |
| `a BETWEEN b AND c`     | `a >= b AND a <= c`     | 範囲チェック(境界値を含む)               | `price BETWEEN 100 AND 500`     |
| `a NOT BETWEEN b AND c` | `a < b OR a > c`        | 範囲外チェック                   | `price NOT BETWEEN 100 AND 500` |


## パターンマッチングと条件式 {#pattern-matching-and-conditional-expressions}

比較演算子に加えて、`WHERE`句でパターンマッチングと条件式を使用できます。

| 機能        | 構文                           | 大文字小文字の区別 | パフォーマンス | 最適な用途                     |
| ----------- | ------------------------------ | ------------------ | -------------- | ------------------------------ |
| `LIKE`      | `col LIKE '%pattern%'`         | あり               | 高速           | 大文字小文字を厳密に区別したパターンマッチング |
| `ILIKE`     | `col ILIKE '%pattern%'`        | なし               | 低速           | 大文字小文字を区別しない検索   |
| `if()`      | `if(cond, a, b)`               | N/A                | 高速           | 単純な二値条件                 |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | N/A                | 高速           | 複数条件                       |
| `CASE`      | `CASE WHEN ... THEN ... END`   | N/A                | 高速           | SQL標準の条件ロジック          |

使用例については、[「パターンマッチングと条件式」](#examples-pattern-matching-and-conditional-expressions)を参照してください。


## リテラル、カラム、またはサブクエリを使用した式 {#expressions-with-literals-columns-subqueries}

`WHERE`句に続く式には、[リテラル](/sql-reference/syntax#literals)、カラム、またはサブクエリを含めることができます。サブクエリは、条件で使用される値を返すネストされた`SELECT`文です。

| タイプ         | 定義           | 評価タイミング           | パフォーマンス | 例                    |
| ------------ | -------------------- | -------------------- | ----------- | -------------------------- |
| **リテラル**  | 固定の定数値 | クエリ記述時     | 最速     | `WHERE price > 100`        |
| **カラム**   | テーブルデータへの参照 | 行ごと              | 高速        | `WHERE price > cost`       |
| **サブクエリ** | ネストされたSELECT        | クエリ実行時 | 可変      | `WHERE id IN (SELECT ...)` |

複雑な条件では、リテラル、カラム、サブクエリを組み合わせることができます:

```sql
-- リテラル + カラム
WHERE price > 100 AND category = 'Electronics'

-- カラム + サブクエリ
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- リテラル + カラム + サブクエリ
WHERE category = 'Electronics'
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

```


-- 論理演算子を使用した3つの条件
WHERE (price > 100 OR category IN (SELECT category FROM featured))
AND in_stock = true
AND name LIKE '%Special%'

````
## 例 {#examples}

### `NULL`のテスト {#examples-testing-for-null}

`NULL`値を含むクエリ:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### 論理演算子を使用したデータのフィルタリング {#example-filtering-with-logical-operators}

以下のテーブルとデータを使用します:

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

**1. `AND` - 両方の条件が真である必要があります:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - 少なくとも1つの条件が真である必要があります:**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` - 条件を否定します:**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - いずれか1つの条件のみが真である必要があります(両方ではない):**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. 複数の演算子の組み合わせ:**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```


```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. 関数構文を使用する:**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

SQLキーワード構文（`AND`、`OR`、`NOT`、`XOR`）は一般的に可読性が高いですが、関数構文は複雑な式や動的クエリを構築する際に有用です。

### UInt8カラムを条件として使用する {#example-uint8-column-as-condition}

[前の例](#example-filtering-with-logical-operators)のテーブルを使用して、カラム名を直接条件として使用できます:

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### 比較演算子を使用する {#example-using-comparison-operators}

以下の例では、上記の[例](#example-filtering-with-logical-operators)のテーブルとデータを使用します。簡潔にするため、結果は省略されています。

**1. trueとの明示的な等価比較（`= 1`または`= true`）:**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```

**2. falseとの明示的な等価比較（`= 0`または`= false`）:**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```

**3. 不等価比較（`!= 0`または`!= false`）:**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. より大きい:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 以下:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 他の条件との組み合わせ:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. `IN`演算子を使用する:**

以下の例では、`(1, true)`は[タプル](/sql-reference/data-types/tuple)です。

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

これを行うために[配列](/sql-reference/data-types/array)を使用することもできます:

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 比較スタイルを混在させる:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### パターンマッチングと条件式 {#examples-pattern-matching-and-conditional-expressions}

以下の例では、上記の[例](#example-filtering-with-logical-operators)のテーブルとデータを使用します。簡潔にするため、結果は省略されています。

#### LIKEの例 {#like-examples}


```sql
-- 名前に 'o' を含む製品を検索
SELECT * FROM products WHERE name LIKE '%o%';
-- 結果: Laptop, Monitor

-- 'L' で始まる製品を検索
SELECT * FROM products WHERE name LIKE 'L%';
-- 結果: Laptop, Lamp

-- ちょうど4文字の製品を検索
SELECT * FROM products WHERE name LIKE '____';
-- 結果: Desk, Lamp
```

#### ILIKE の例 {#ilike-examples}

```sql
-- 'LAPTOP' の大文字小文字を区別しない検索
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- 結果: Laptop

-- 大文字小文字を区別しない前方一致
SELECT * FROM products WHERE name ILIKE 'l%';
-- 結果: Laptop, Lamp
```

#### IF の例 {#if-examples}

```sql
-- カテゴリごとに異なる価格閾値
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- 結果: Mouse, Chair, Monitor
-- (500ドル未満のElectronics または 200ドル未満のFurniture)

-- 在庫状況に基づくフィルタリング
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- 結果: Laptop, Chair, Monitor, Desk, Lamp
-- (100ドル超の在庫あり商品 または すべての在庫なし商品)
```

#### multiIf の例 {#multiif-examples}

```sql
-- カテゴリに基づく複数の条件
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- 結果: Mouse, Monitor, Chair
-- (600ドル未満のElectronics または 在庫ありのFurniture)

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

**単純な CASE:**

```sql
-- カテゴリごとに異なるルール
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 結果: Mouse, Monitor, Chair
```

**検索型 CASE:**

```sql
-- 価格に基づく段階的ロジック
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- 結果: Laptop, Monitor, Mouse, Lamp
```
