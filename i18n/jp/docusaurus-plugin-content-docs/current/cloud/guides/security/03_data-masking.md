---
slug: /cloud/guides/data-masking
sidebar_label: 'データマスキング'
title: 'ClickHouse におけるデータマスキング'
description: 'ClickHouse におけるデータマスキングに関するガイド'
keywords: ['データマスキング']
doc_type: 'guide'
---

# ClickHouse におけるデータマスキング \\{#data-masking-in-clickhouse\\}

データマスキングはデータ保護のための手法であり、元のデータの形式や構造は維持したまま、個人を特定できる情報 (PII) や機密情報を取り除いた別バージョンのデータに置き換えるものです。

このガイドでは、ClickHouse でデータをマスクする方法を説明します。

## 文字列置換関数を使用する \\{#using-string-functions\\}

基本的なデータマスキングのユースケースでは、`replace` 系の関数を使うと、データをマスクする簡便な方法になります。

| Function                                                                                 | Description                                                            |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | haystack 文字列の中で、パターンに最初に一致した部分を、指定した置換文字列に置き換えます。                      |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | haystack 文字列の中で、パターンに一致したすべての部分を、指定した置換文字列に置き換えます。                     |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | haystack の中で、正規表現パターン（re2 構文）に一致する部分文字列のうち最初に一致したものを、指定した置換文字列に置き換えます。 |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | haystack の中で、正規表現パターン（re2 構文）に一致するすべての部分文字列を、指定した置換文字列に置き換えます。         |

例えば、`replaceOne` 関数を使用して、名前 &quot;John Smith&quot; をプレースホルダー `[CUSTOMER_NAME]` に置き換えることができます。

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

より一般的には、`replaceRegexpOne` を使用すると任意の顧客名を置き換えることができます。

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

あるいは、`replaceRegexpAll` 関数を使用して社会保障番号の一部をマスクし、最後の 4 桁だけを残すこともできます。

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

上記のクエリでは、`\3` が 3 番目のキャプチャグループを結果の文字列に置換するために使用されており、その結果として次のような文字列が生成されます。

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## マスクされた `VIEW` の作成 \\{#masked-views\\}

[`VIEW`](/sql-reference/statements/create/view) は、前述の文字列関数と組み合わせて使用することで、ユーザーに表示する前に機微なデータを含むカラムに対して変換処理を適用できます。
この方法では、元のデータは変更されず、ビューをクエリするユーザーにはマスク済みのデータのみが表示されます。

例として、顧客の注文レコードを保存しているテーブルがあるとします。
特定の従業員グループが情報を閲覧できるようにしたい一方で、顧客の詳細情報をすべて見せたくはありません。

以下のクエリを実行して、サンプルテーブル `orders` を作成し、いくつかの架空の顧客注文レコードを挿入します。

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

`masked_orders` という名前のビューを作成します。

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

上記のビュー作成クエリの `SELECT` 句では、`name`、`email`、`phone`、`shipping_address` フィールドに対して `replaceRegexpOne` を使用した変換処理を定義しています。これらは、部分的にマスキングしたい機微情報を含むフィールドです。

ビューからデータを取得します:

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

ビューから返されるデータは一部マスキングされており、機密情報が秘匿されていることに注意してください。
また、閲覧者が持つ情報への特権アクセスレベルに応じて、マスキングの度合いが異なる複数のビューを作成することもできます。

ユーザーがマスキングされたデータを返すビューにのみアクセスでき、元のマスキングされていないデータを保持するテーブルにはアクセスできないようにするには、[Role Based Access Control](/cloud/security/console-roles) を使用して、特定のロールに対してビューに対する `SELECT` 権限だけを付与するようにしてください。

まずロールを作成します:

```sql
CREATE ROLE masked_orders_viewer;
```

次に、そのロールにビューに対する `SELECT` 権限を付与します。

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

ClickHouse のロールは付与が累積される性質があるため、マスクされたビューのみを閲覧できるべきユーザーが、いかなるロール経由でもベーステーブルに対する `SELECT` 権限を持たないようにする必要があります。

そのため、安全を期すためにベーステーブルへのアクセスを明示的に取り消すべきです。

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最後に、そのロールを該当するユーザーに割り当てます。

```sql
GRANT masked_orders_viewer TO your_user;
```

これにより、`masked_orders_viewer` ロールを持つユーザーは、ビューからマスクされたデータのみを閲覧でき、テーブルにある元のマスクされていないデータは閲覧できなくなります。

## `MATERIALIZED` カラムとカラムレベルのアクセス制限を使用する \\{#materialized-ephemeral-column-restrictions\\}

別のビューを作成したくない場合は、マスクしたデータを元のデータと並べて保存できます。
そのためには、[マテリアライズドカラム](/sql-reference/statements/create/table#materialized) を使用します。
このようなカラムの値は、行が挿入されるときに指定したマテリアライズド式に従って自動的に計算され、
それを利用してマスク済みデータを含む新しいカラムを作成できます。

先ほどの例では、マスクされたデータ用に別の `VIEW` を作成する代わりに、ここでは `MATERIALIZED` を使用してマスクされたカラムを作成します。

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

ここで次の SELECT クエリを実行すると、マスクされたデータが挿入時にマテリアライズされ、元のマスクされていないデータと並んで保存されていることが分かります。
ClickHouse では、デフォルトでは `SELECT *` クエリに materialized カラムが自動的に含まれないため、マスクされたカラムを明示的に指定して選択する必要があります。

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

マスクされたデータを含む列にのみユーザーがアクセスできるようにするには、再度 [Role Based Access Control](/cloud/security/console-roles) を使用して、特定のロールには `orders` テーブルのマスクされた列に対する `SELECT` 権限のみが付与されるようにします。

先ほど作成したロールを再作成します：

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

次に、`orders` テーブルに対して `SELECT` 権限を付与します。

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

機密情報を含むカラムへのアクセス権を取り消します：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最後に、該当するユーザーにそのロールを割り当てます。

```sql
GRANT masked_orders_viewer TO your_user;
```

`orders` テーブルにマスク済みデータのみを保存したい場合は、
マスクされていない機密性の高いカラムに [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral) を指定できます。
これにより、この種類のカラムはテーブルに保存されなくなります。

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

先ほどと同じクエリを実行すると、今度はマテリアライズされたマスク済みデータのみがテーブルに挿入されていることが確認できます。

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

## クエリマスキングルールでログデータをマスクする \\{#use-query-masking-rules\\}

ClickHouse OSS のユーザーで、特にログデータをマスクしたい場合は、[query masking rules](/operations/server-configuration-parameters/settings#query_masking_rules)（ログマスキング）を利用してデータをマスクできます。

そのためには、サーバー設定で正規表現ベースのマスキングルールを定義します。
これらのルールは、サーバーログやシステムテーブル（`system.query_log`、`system.text_log`、`system.processes` など）に保存される前に、クエリおよびすべてのログメッセージに対して適用されます。

これにより、機密データが **ログ** に書き出されるのを防ぐことができます（ログに対してのみ有効です）。
ただし、クエリ結果内のデータはマスクされない点に注意してください。

例えば、社会保障番号をマスクするには、[server configuration](/operations/configuration-files) に次のルールを追加できます。

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
