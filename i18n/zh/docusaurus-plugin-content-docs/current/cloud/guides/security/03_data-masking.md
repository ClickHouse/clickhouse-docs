---
slug: /cloud/guides/data-masking
sidebar_label: '数据脱敏'
title: 'ClickHouse 中的数据脱敏'
description: 'ClickHouse 中数据脱敏指南'
keywords: ['数据脱敏']
doc_type: 'guide'
---

# 在 ClickHouse 中进行数据脱敏 {#data-masking-in-clickhouse}

数据脱敏是一种用于数据保护的技术，它通过将原始数据替换为在格式和结构上保持不变、但移除了任何可识别个人身份的信息（PII）或其他敏感信息的数据版本来实现保护。

本指南将演示如何在 ClickHouse 中进行数据脱敏。

## 使用字符串替换函数 {#using-string-functions}

对于基本的数据脱敏场景，`replace` 系列函数提供了一种方便的数据掩码手段：

| Function                                                                                 | Description                                 |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | 将源字符串中首次出现的匹配模式替换为提供的替换字符串。                 |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | 将源字符串中所有出现的匹配模式替换为提供的替换字符串。                 |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | 将源字符串中第一个匹配给定正则表达式模式（re2 语法）的子串替换为提供的替换字符串。 |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | 将源字符串中所有匹配给定正则表达式模式（re2 语法）的子串替换为提供的替换字符串。  |

例如，你可以使用 `replaceOne` 函数将名称 “John Smith” 替换为占位符 `[CUSTOMER_NAME]`：

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

更通用地说，你可以使用 `replaceRegexpOne` 来替换任何客户名称：

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

或者可以使用 `replaceRegexpAll` 函数对社会安全号码进行脱敏处理，只保留最后 4 位数字。

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

在上面的查询中，使用 `\3` 将第三个捕获组插入到结果字符串中，从而得到：

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## 创建掩码 `VIEW` {#masked-views}

可以将 [`VIEW`](/sql-reference/statements/create/view) 与前面提到的字符串函数结合使用，在向用户展示之前，对包含敏感数据的列进行转换。
通过这种方式，原始数据保持不变，而查询该视图的用户只能看到经过掩码处理的数据。

作为演示，假设我们有一张用于存储客户订单记录的表。
我们希望一组员工能够查看这些信息，但又不希望他们看到完整的客户信息。

运行下面的查询以创建示例表 `orders`，并向其中插入一些虚构的客户订单记录：

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

创建一个名为 `masked_orders` 的视图：

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

在上面创建视图的查询语句的 `SELECT` 子句中，我们在 `name`、`email`、`phone` 和 `shipping_address` 字段上使用 `replaceRegexpOne` 函数定义转换逻辑，这些字段包含我们希望进行部分脱敏的敏感信息。

从该视图中查询数据：

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

请注意，从该视图返回的数据经过部分遮蔽处理，用以隐藏敏感信息。
你也可以创建多个视图，并根据查看者的权限级别应用不同程度的模糊/脱敏。

为了确保用户只能访问返回已遮蔽数据的视图，而无法访问包含原始未遮蔽数据的表，你应当使用 [基于角色的访问控制](/cloud/security/console-roles)，确保只有特定角色被授予从该视图进行 `SELECT` 的权限。

首先创建角色：

```sql
CREATE ROLE masked_orders_viewer;
```

接着将该视图的 `SELECT` 权限授予该角色：

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

由于 ClickHouse 的角色权限是累加的，你必须确保那些应该只能看到已脱敏视图的用户，在任何角色下都不对基础表拥有 `SELECT` 权限。

因此，你应当显式撤销对基础表的访问权限，以确保安全：

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最后，将该角色分配给相应的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

这可确保拥有 `masked_orders_viewer` 角色的用户只能在该视图中看到脱敏后的数据，而无法从表中查看原始的未脱敏数据。

## 使用 `MATERIALIZED` 列和列级访问限制 {#materialized-ephemeral-column-restrictions}

在你不想创建单独视图的情况下，可以在原始数据的同时存储经过遮蔽处理的数据副本。
为此，你可以使用[物化列](/sql-reference/statements/create/table#materialized)。
此类列的值会在插入行时根据指定的物化表达式自动计算，
我们可以利用它们创建包含数据遮蔽版本的新列。

延续之前的示例，这次我们不会为遮蔽数据创建单独的 `VIEW`，而是使用 `MATERIALIZED` 创建遮蔽列：

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

如果你现在运行下面的 `SELECT` 查询，你会看到被掩码的数据在插入时就会被“物化”，并与原始未掩码数据一同存储。
必须显式选择这些已掩码的列，因为 ClickHouse 默认不会在 `SELECT *` 查询中自动包含物化列。

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

为了确保用户只能访问包含已脱敏数据的列，你可以再次使用[基于角色的访问控制（Role Based Access Control）](/cloud/security/console-roles)，以确保特定角色仅被授予对 `orders` 表中已脱敏列执行 `SELECT` 的权限。

重新创建我们之前创建的角色：

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

接下来，为 `orders` 表授予 `SELECT` 权限：

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

撤销对所有敏感列的访问权限：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最后，将该角色分配给相应的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

如果你只想在 `orders` 表中存储脱敏后的数据，
可以将那些敏感的未脱敏列标记为 [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)，
从而确保此类列不会被实际存储在表中。

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

如果我们再次运行同一个查询，现在你会发现只有物化后的脱敏数据被插入表中：

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

## 对日志数据使用查询掩码规则 {#use-query-masking-rules}

对于希望专门对日志数据进行掩码的 ClickHouse OSS 用户，可以使用[查询掩码规则](/operations/server-configuration-parameters/settings#query_masking_rules)（日志掩码）对数据进行处理。

为此，您可以在服务器配置中定义基于正则表达式的掩码规则。
这些规则会在查询和所有日志消息写入服务器日志或系统表（例如 `system.query_log`、`system.text_log` 和 `system.processes`）之前生效。

这有助于仅防止敏感数据泄露到**日志**中。
请注意，它不会对查询结果中的数据进行掩码。

例如，要对社会安全号码进行掩码，您可以在[服务器配置](/operations/configuration-files)中添加以下规则：

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
