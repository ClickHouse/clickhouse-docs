---
slug: /cloud/guides/data-masking
sidebar_label: 'データマスキング'
title: 'ClickHouse のデータマスキング'
description: 'ClickHouse のデータマスキングに関するガイド'
keywords: ['data masking']
doc_type: 'guide'
---



# ClickHouse におけるデータマスキング

データマスキングはデータ保護のための手法であり、元のデータの形式や構造はそのまま保ちつつ、個人を特定できる情報 (PII) や機密性の高い情報を取り除いたデータに置き換えるものです。

このガイドでは、ClickHouse でデータをマスクする方法を説明します。



## 文字列置換関数を使用する {#using-string-functions}

基本的なデータマスキングのユースケースでは、`replace`ファミリーの関数を使用してデータを簡単にマスクできます:

| 関数                                                                                 | 説明                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | haystack文字列内でパターンが最初に出現する箇所を、指定された置換文字列で置き換えます。                                                  |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | haystack文字列内でパターンが出現するすべての箇所を、指定された置換文字列で置き換えます。                                                       |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | haystack内で正規表現パターン(re2構文)に一致する部分文字列が最初に出現する箇所を、指定された置換文字列で置き換えます。 |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | haystack内で正規表現パターン(re2構文)に一致する部分文字列が出現するすべての箇所を、指定された置換文字列で置き換えます。      |

例えば、`replaceOne`関数を使用して、名前「John Smith」をプレースホルダー`[CUSTOMER_NAME]`に置き換えることができます:

```sql title="クエリ"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="レスポンス"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

より汎用的には、`replaceRegexpAll`を使用して任意の顧客名を置き換えることができます:

```sql title="クエリ"
SELECT
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="レスポンス"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

または、`replaceRegexpAll`関数を使用して、社会保障番号の最後の4桁のみを残してマスクすることもできます。

```sql title="クエリ"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

上記のクエリでは、`\3`を使用して3番目のキャプチャグループを結果の文字列に置換しており、次のような結果が生成されます:

```response title="レスポンス"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```


## マスク化された`VIEW`の作成 {#masked-views}

[`VIEW`](/sql-reference/statements/create/view)は、前述の文字列関数と組み合わせて使用することで、機密データを含むカラムに変換を適用し、ユーザーに提示する前に処理することができます。
この方法により、元のデータは変更されず、ビューをクエリするユーザーにはマスク化されたデータのみが表示されます。

例として、顧客注文の記録を保存するテーブルがあるとします。
従業員グループが情報を閲覧できるようにしたいが、顧客の完全な情報は見せたくない場合を考えます。

以下のクエリを実行して、サンプルテーブル`orders`を作成し、架空の顧客注文レコードを挿入します:

```sql
CREATE TABLE orders (
    user_id UInt32,
    name String,
    email String,
    phone String,
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

`masked_orders`という名前のビューを作成します:

```sql
CREATE VIEW masked_orders AS
SELECT
    user_id,
    replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****') AS name,
    replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2') AS email,
    replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3') AS phone,
    total_amount,
    order_date,
    replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1') AS shipping_address
FROM orders;
```

上記のビュー作成クエリの`SELECT`句では、部分的にマスク化したい機密情報を含むフィールドである`name`、`email`、`phone`、`shipping_address`に対して、`replaceRegexpOne`を使用した変換を定義しています。

ビューからデータを選択します:

```sql title="Query"
SELECT * FROM masked_orders
```


```response title="Response"
┌─user_id─┬─name─────────┬─email──────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address──────────┐
│    1001 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │       299.99 │ 2024-01-15 │ *** New York, NY 10001    │
│    1002 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │        149.5 │ 2024-01-16 │ *** Los Angeles, CA 90210 │
│    1003 │ Michael **** │ mb****@company.com │ 555-***-7890 │          599 │ 2024-01-17 │ *** Chicago, IL 60601     │
│    1004 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │        89.99 │ 2024-01-18 │ *** Houston, TX 77001     │
│    1005 │ David ****   │ dw****@email.net   │ 555-***-3210 │       449.75 │ 2024-01-19 │ *** Phoenix, AZ 85001     │
└─────────┴──────────────┴────────────────────┴──────────────┴──────────────┴────────────┴───────────────────────────┘
```

ビューから返されるデータの一部はマスクされており、機微な情報が難読化されていることに注意してください。
また、閲覧者が持つ情報への特権的なアクセスレベルに応じて、難読化の度合いが異なる複数のビューを作成することもできます。

ユーザーがマスクされたデータを返すビューにのみアクセスでき、元のマスクされていないデータを持つテーブルにはアクセスできないようにするには、[Role Based Access Control](/cloud/security/console-roles) を使用して、特定のロールにビューに対する `SELECT` 権限のみを付与するように設定する必要があります。

まずロールを作成します。

```sql
CREATE ROLE masked_orders_viewer;
```

次に、そのロールにビューに対する `SELECT` 権限を付与します：

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

ClickHouse のロールは加算的であるため、マスクされたビューのみを参照できるべきユーザーが、いかなるロール経由であってもベーステーブルに対する `SELECT` 権限を持たないようにする必要があります。

そのため、安全のためにベーステーブルへのアクセス権を明示的に取り消すようにしてください。

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最後に、そのロールを適切なユーザーに割り当てます。

```sql
GRANT masked_orders_viewer TO your_user;
```

これにより、`masked_orders_viewer` ロールを持つユーザーはビュー上のマスク済みデータのみを閲覧でき、テーブルに格納された元のマスク前のデータを閲覧することはできなくなります。


## `MATERIALIZED`カラムとカラムレベルのアクセス制限を使用する {#materialized-ephemeral-column-restrictions}

別のビューを作成したくない場合は、マスク化されたバージョンのデータを元のデータと並行して保存することができます。
これを行うには、[マテリアライズドカラム](/sql-reference/statements/create/table#materialized)を使用できます。
このようなカラムの値は、行が挿入される際に指定されたマテリアライズド式に従って自動的に計算されるため、
マスク化されたバージョンのデータを持つ新しいカラムを作成するために使用できます。

前の例を参考に、マスク化されたデータ用の別の`VIEW`を作成する代わりに、`MATERIALIZED`を使用してマスク化されたカラムを作成します:

```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2'),
    phone String,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

次のselectクエリを実行すると、マスク化されたデータが挿入時に「マテリアライズ」され、元のマスク化されていないデータと並行して保存されていることがわかります。
ClickHouseはデフォルトで`SELECT *`クエリにマテリアライズドカラムを自動的に含めないため、マスク化されたカラムを明示的に選択する必要があります。

```sql title="クエリ"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```


```response title="Response"
   ┌─user_id─┬─name──────────┬─email─────────────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address───────────────────┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked────┐
1. │    1001 │ John Smith    │ john.smith@gmail.com      │ 555-123-4567 │       299.99 │ 2024-01-15 │ 123 Main St, New York, NY 10001    │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ **** New York, NY 10001    │
2. │    1002 │ Sarah Johnson │ sarah.johnson@outlook.com │ 555-987-6543 │        149.5 │ 2024-01-16 │ 456 Oak Ave, Los Angeles, CA 90210 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ **** Los Angeles, CA 90210 │
3. │    1003 │ Michael Brown │ mbrown@company.com        │ 555-456-7890 │          599 │ 2024-01-17 │ 789 Pine Rd, Chicago, IL 60601     │ Michael **** │ mb****@company.com │ 555-***-7890 │ **** Chicago, IL 60601     │
4. │    1004 │ Emily Rogers  │ emily.rogers@yahoo.com    │ 555-321-0987 │        89.99 │ 2024-01-18 │ 321 Elm St, Houston, TX 77001      │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ **** Houston, TX 77001     │
5. │    1005 │ David Wilson  │ dwilson@email.net         │ 555-654-3210 │       449.75 │ 2024-01-19 │ 654 Cedar Blvd, Phoenix, AZ 85001  │ David ****   │ dw****@email.net   │ 555-***-3210 │ **** Phoenix, AZ 85001     │
   └─────────┴───────────────┴───────────────────────────┴──────────────┴──────────────┴────────────┴────────────────────────────────────┴──────────────┴────────────────────┴──────────────┴────────────────────────────┘
```

ユーザーがマスク済みデータを含むカラムにのみアクセスできるようにするには、再度 [Role Based Access Control](/cloud/security/console-roles) を使用し、特定のロールに対して `orders` のマスク済みカラムにのみ `SELECT` 権限を付与するよう設定できます。

先ほど作成したロールを再作成します。

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

次に、`orders` テーブルに対する `SELECT` 権限を付与します。

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

機密性の高いカラムへのアクセス権を取り消します：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最後に、そのロールを対象のユーザーに割り当てます。

```sql
GRANT masked_orders_viewer TO your_user;
```

`orders` テーブルにマスク済みデータのみを保存したい場合は、
マスク前の機微なカラムを [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral) としてマークできます。
これにより、この種のカラムはテーブルに保存されないことが保証されます。


```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String EPHEMERAL,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String EPHEMERAL,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2'),
    phone String EPHEMERAL,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String EPHEMERAL,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^([^,]+),\\s*(.*)$', '*** \\2')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders (user_id, name, email, phone, total_amount, order_date, shipping_address) VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

先ほどと同じクエリを実行すると、マテリアライズされたマスク済みデータだけがテーブルに挿入されていることがわかります。

```sql title="Query"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```

```response title="Response"
   ┌─user_id─┬─total_amount─┬─order_date─┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked───┐
1. │    1001 │       299.99 │ 2024-01-15 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ *** New York, NY 10001    │
2. │    1002 │        149.5 │ 2024-01-16 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ *** Los Angeles, CA 90210 │
3. │    1003 │          599 │ 2024-01-17 │ Michael **** │ mb****@company.com │ 555-***-7890 │ *** Chicago, IL 60601     │
4. │    1004 │        89.99 │ 2024-01-18 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ *** Houston, TX 77001     │
5. │    1005 │       449.75 │ 2024-01-19 │ David ****   │ dw****@email.net   │ 555-***-3210 │ *** Phoenix, AZ 85001     │
   └─────────┴──────────────┴────────────┴──────────────┴────────────────────┴──────────────┴───────────────────────────┘
```


## ログデータに対するクエリマスキングルールの使用 {#use-query-masking-rules}

ログデータを特にマスキングしたいClickHouse OSSのユーザーは、[クエリマスキングルール](/operations/server-configuration-parameters/settings#query_masking_rules)(ログマスキング)を使用してデータをマスキングできます。

これを行うには、サーバー設定で正規表現ベースのマスキングルールを定義します。
これらのルールは、サーバーログやシステムテーブル(`system.query_log`、`system.text_log`、`system.processes`など)に保存される前に、クエリとすべてのログメッセージに適用されます。

これにより、機密データが**ログ**にのみ漏洩することを防ぐことができます。
なお、クエリ結果のデータはマスキングされません。

例えば、社会保障番号をマスキングするには、[サーバー設定](/operations/configuration-files)に以下のルールを追加します:

```yaml
<query_masking_rules>
<rule>
<name>SSNを隠す</name>
<regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
<replace>000-00-0000</replace>
</rule>
</query_masking_rules>
```
