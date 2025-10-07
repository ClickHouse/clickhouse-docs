---
'slug': '/cloud/guides/data-masking'
'sidebar_label': 'データマスキング'
'title': 'ClickHouseにおけるデータマスキング'
'description': 'ClickHouseにおけるデータマスキングに関するガイド'
'keywords':
- 'data masking'
'doc_type': 'guide'
---


# ClickHouseにおけるデータマスキング

データマスキングはデータ保護のための技術であり、元のデータをその形式と構造を維持しながら、個人を特定できる情報（PII）や機密情報を取り除いたデータのバージョンに置き換えます。

このガイドでは、ClickHouseでデータをマスキングする方法を説明します。

## 文字列置換関数の使用 {#using-string-functions}

基本的なデータマスキングの使用例では、`replace`ファミリーの関数がデータをマスキングする便利な方法を提供します。

| 関数                                                                                       | 説明                                                                                                                                                    |
|--------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceone)               | 指定された置換文字列で、ハヤスタリング内のパターンの最初の出現を置き換えます。                                                                         |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceall)               | ハヤスタリング内のパターンのすべての出現を指定された置換文字列で置き換えます。                                                                         |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceregexpone) | ハヤスタリング内で正規表現パターン（re2構文）に一致する部分文字列の最初の出現を指定された置換文字列で置き換えます。                                    |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceregexpall) | ハヤスタリング内で正規表現パターン（re2構文）に一致する部分文字列のすべての出現を指定された置換文字列で置き換えます。                                  |

例えば、`replaceOne`関数を使用して「John Smith」という名前をプレースホルダー`[CUSTOMER_NAME]`に置き換えることができます。

```sql title="Query"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

より一般的には、`replaceRegexpOne`を使用して任意の顧客名を置き換えることができます。

```sql title="Query"
SELECT 
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

また、`replaceRegexpAll`関数を使用して、社会保障番号をマスキングし、最後の4桁だけを残すこともできます。

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

上記のクエリでは、`\3`が結果の文字列に第3キャプチャグループを挿入するために使用され、次のようになります。

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## マスクされた`VIEW`の作成 {#masked-views}

[`VIEW`](/sql-reference/statements/create/view)は、前述の文字列関数と組み合わせて使用され、ユーザーに表示される前に機密データを含むカラムに変換を適用できます。
このようにして、元のデータは変更されることなく、ビューをクエリするユーザーはマスキングされたデータのみを見ることができます。

例を示すために、顧客注文の記録を保存するテーブルがあると仮定しましょう。
特定の従業員のグループが情報を表示できるようにしたいが、顧客の完全な情報を見せたくありません。

以下のクエリを実行して、例となるテーブル`orders`を作成し、一部の架空の顧客注文記録を挿入します。

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

次に、`masked_orders`というビューを作成します：

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

上記のビュー作成クエリの`SELECT`句では、機密情報を部分的にマスキングするために、`name`、`email`、`phone`、および`shipping_address`フィールドに対して`replaceRegexpOne`を使用して変換を定義しています。

ビューからデータを選択します：

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

ビューから返されるデータが部分的にマスキングされ、機密情報が難読化されていることに注意してください。
特権アクセスレベルに応じて異なる難読化のレベルを持つ複数のビューを作成することもできます。

ユーザーがマスキングされたデータを返すビューにのみアクセスできるようにし、元のマスキングされていないデータを持つテーブルにはアクセスできないようにするために、[Role Based Access Control](/cloud/security/cloud-access-management/overview)を使用して、特定のロールにビューからの選択権を持たせてください。

まず、ロールを作成します：

```sql
CREATE ROLE masked_orders_viewer;
```

次に、ロールにビューへの`SELECT`権限を付与します：

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

ClickHouseのロールは加算的なので、マスキングされたビューのみを表示する必要のあるユーザーが、いかなるロールを通じてもベーステーブルに対して`SELECT`権限を持たないことを確認する必要があります。

そのため、念のためにベーステーブルへのアクセスを明示的に取り消すべきです：

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最後に、適切なユーザーにロールを割り当てます：

```sql
GRANT masked_orders_viewer TO your_user;
```

これにより、`masked_orders_viewer`ロールを持つユーザーは、元のマスキングされていないデータではなく、ビューからのマスキングされたデータのみを表示できるようになります。

## `MATERIALIZED`カラムとカラムレベルのアクセス制限の使用 {#materialized-ephemeral-column-restrictions}

別のビューを作成したくない場合には、元のデータと並行してマスキングされたバージョンのデータを保存できます。
そのために、[マテリアライズドカラム](/sql-reference/statements/create/table#materialized)を使用できます。
そのようなカラムの値は、行が挿入されるときに指定されたマテリアライズ表現に基づいて自動的に計算され、マスキングされたバージョンのデータを持つ新しいカラムを作成するために使用できます。

前の例を参考にして、マスキングされたデータ用の別の`VIEW`を作成する代わりに、`MATERIALIZED`を使用してマスキングされたカラムを作成します：

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

次に、以下の選択クエリを実行すると、マスキングされたデータが挿入時に「マテリアライズ」され、元のマスキングされていないデータと並行して保存されることがわかります。
ClickHouseは、デフォルトで`SELECT *`クエリに自動的にマテリアライズドカラムを含めないため、マスキングされたカラムを明示的に選択する必要があります。

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
   ┌─user_id─┬─name──────────┬─email─────────────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address───────────────────┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked────┐
1. │    1001 │ John Smith    │ john.smith@gmail.com      │ 555-123-4567 │       299.99 │ 2024-01-15 │ 123 Main St, New York, NY 10001    │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ **** New York, NY 10001    │
2. │    1002 │ Sarah Johnson │ sarah.johnson@outlook.com │ 555-987-6543 │        149.5 │ 2024-01-16 │ 456 Oak Ave, Los Angeles, CA 90210 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ **** Los Angeles, CA 90210 │
3. │    1003 │ Michael Brown │ mbrown@company.com        │ 555-456-7890 │          599 │ 2024-01-17 │ 789 Pine Rd, Chicago, IL 60601     │ Michael **** │ mb****@company.com │ 555-***-7890 │ **** Chicago, IL 60601     │
4. │    1004 │ Emily Rogers  │ emily.rogers@yahoo.com    │ 555-321-0987 │        89.99 │ 2024-01-18 │ 321 Elm St, Houston, TX 77001      │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ **** Houston, TX 77001     │
5. │    1005 │ David Wilson  │ dwilson@email.net         │ 555-654-3210 │       449.75 │ 2024-01-19 │ 654 Cedar Blvd, Phoenix, AZ 85001  │ David ****   │ dw****@email.net   │ 555-***-3210 │ **** Phoenix, AZ 85001     │
   └─────────┴───────────────┴───────────────────────────┴──────────────┴──────────────┴────────────┴────────────────────────────────────┴──────────────┴────────────────────┴──────────────┴────────────────────────────┘
```

マスキングされたデータを含むカラムにユーザーがのみアクセスできるようにするために、再度[Role Based Access Control](/cloud/security/cloud-access-management/overview)を使用して、特定のロールが`orders`からマスキングされたカラムの選択権のみ持つようにしてください。

以前に作成したロールを再作成します：

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

次に、`orders`テーブルに`SELECT`権限を付与します：

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

機密カラムへのアクセスを取り消します：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最後に、適切なユーザーにロールを割り当てます：

```sql
GRANT masked_orders_viewer TO your_user;
```

`orders`テーブルにマスキングされたデータのみを保存したい場合は、機密のマスキングされていないカラムを[`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)としてマークできます。
これにより、このタイプのカラムはテーブルに保存されません。

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

以前と同じクエリを実行すると、マテリアライズドなマスキングされたデータのみがテーブルに挿入されることがわかります：

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

## ログデータのクエリマスキングルールの使用 {#use-query-masking-rules}

特にClickHouse OSSのユーザーがログデータをマスキングするためには、[クエリマスキングルール](/operations/server-configuration-parameters/settings#query_masking_rules)（ログマスキング）を利用してデータをマスキングできます。

そのためには、サーバー構成で正規表現に基づくマスキングルールを定義することができます。
これらのルールは、クエリやすべてのログメッセージに適用され、サーバーログやシステムテーブル（例えば、`system.query_log`、`system.text_log`、および`system.processes`）に保存される前に適用されます。

これにより、機密データが**ログ**に漏れ出るのを防ぐことができます。
クエリ結果のデータがマスキングされるわけではない点に注意してください。

例えば、社会保障番号をマスキングするには、次のルールを[サーバー構成](/operations/configuration-files)に追加することができます。

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
