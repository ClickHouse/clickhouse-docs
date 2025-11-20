---
slug: /cloud/guides/data-masking
sidebar_label: '数据脱敏'
title: 'ClickHouse 中的数据脱敏'
description: 'ClickHouse 数据脱敏指南'
keywords: ['data masking']
doc_type: 'guide'
---



# ClickHouse 中的数据脱敏

数据脱敏是一种数据保护技术，通过将原始数据替换为在保留其格式和结构的前提下去除所有个人身份信息（PII）或敏感信息的版本来实现。

本指南介绍如何在 ClickHouse 中进行数据脱敏。



## 使用字符串替换函数 {#using-string-functions}

对于基本的数据脱敏场景,`replace` 系列函数提供了一种便捷的数据脱敏方式:

| 函数                                                                                 | 描述                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | 将目标字符串中首次出现的模式替换为指定的替换字符串。                                                  |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | 将目标字符串中所有出现的模式替换为指定的替换字符串。                                                       |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | 将目标字符串中首次匹配正则表达式模式(re2 语法)的子字符串替换为指定的替换字符串。 |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | 将目标字符串中所有匹配正则表达式模式(re2 语法)的子字符串替换为指定的替换字符串。      |

例如,可以使用 `replaceOne` 函数将姓名 "John Smith" 替换为占位符 `[CUSTOMER_NAME]`:

```sql title="查询"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="响应"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

更通用的做法是,可以使用 `replaceRegexpAll` 来替换任意客户姓名:

```sql title="查询"
SELECT
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="响应"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

或者可以使用 `replaceRegexpAll` 函数脱敏社会安全号码,仅保留最后 4 位数字。

```sql title="查询"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

在上述查询中,`\3` 用于将第三个捕获组替换到结果字符串中,产生如下结果:

```response title="响应"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```


## 创建掩码视图 {#masked-views}

[`VIEW`](/sql-reference/statements/create/view) 可以与前述字符串函数结合使用,在向用户呈现数据之前对包含敏感数据的列进行转换。
这样,原始数据保持不变,而查询视图的用户只能看到掩码后的数据。

为了演示,假设我们有一个存储客户订单记录的表。
我们希望确保一组员工可以查看这些信息,但不希望他们看到客户的完整信息。

运行以下查询创建示例表 `orders` 并插入一些虚构的客户订单记录:

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

创建一个名为 `masked_orders` 的视图:

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

在上述视图创建查询的 `SELECT` 子句中,我们使用 `replaceRegexpOne` 函数对 `name`、`email`、`phone` 和 `shipping_address` 字段定义转换,这些字段包含我们希望部分掩码的敏感信息。

从视图中查询数据:

```sql title="查询"
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

请注意，从该视图返回的数据经过了部分掩码处理，用于隐藏敏感信息。
你也可以创建多个视图，根据查看者对信息的权限级别，提供不同程度的脱敏/模糊处理。

为了确保用户只能访问返回掩码数据的视图，而不能访问包含原始未掩码数据的表，你应当使用[基于角色的访问控制](/cloud/security/console-roles)，确保只有特定角色被授予从该视图执行 `SELECT` 的权限。

首先创建角色：

```sql
CREATE ROLE masked_orders_viewer;
```

接下来，将该视图的 `SELECT` 权限授予该角色：

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

由于 ClickHouse 的角色是叠加生效的，你必须确保那些本应只看到脱敏视图的用户，不会通过任何角色在基础表上拥有 `SELECT` 权限。

因此，为了安全起见，你应当显式撤销对基础表的访问权限：

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最后，将该角色分配给相应的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

这可确保具有 `masked_orders_viewer` 角色的用户只能在该视图中看到已遮蔽的数据，而无法从表中看到原始未遮蔽的数据。


## 使用 `MATERIALIZED` 列和列级访问限制 {#materialized-ephemeral-column-restrictions}

在不需要创建单独视图的情况下,您可以将数据的脱敏版本与原始数据一起存储。
为此,您可以使用[物化列](/sql-reference/statements/create/table#materialized)。
在插入行时,这些列的值会根据指定的物化表达式自动计算,
我们可以利用它们创建包含脱敏数据的新列。

以之前的示例为例,现在我们将使用 `MATERIALIZED` 创建脱敏列,而不是为脱敏数据创建单独的 `VIEW`:

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

如果您现在运行以下查询,将会看到脱敏数据在插入时被"物化"并与原始未脱敏数据一起存储。
需要显式选择脱敏列,因为 ClickHouse 默认不会在 `SELECT *` 查询中自动包含物化列。

```sql title="查询"
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

为了确保用户只能访问包含脱敏数据的列，你可以再次使用[基于角色的访问控制](/cloud/security/console-roles)，确保只有特定角色被授予从 `orders` 表中查询脱敏列的权限。

重新创建我们之前定义的角色：

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

接下来，为 `orders` 表授予 `SELECT` 权限：

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

撤销对任意敏感列的访问权限：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最后，将该角色分配给合适的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

如果你只想在 `orders` 表中存储脱敏数据，
可以将未脱敏的敏感列标记为 [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)，
这样就能确保此类列不会被写入到表中。


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

如果我们再次运行相同的查询，现在你会看到，只有物化后的脱敏数据被插入到表中：

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

对于希望对日志数据进行掩码的 ClickHouse OSS 用户,可以使用[查询掩码规则](/operations/server-configuration-parameters/settings#query_masking_rules)(日志掩码)来掩码数据。

为此,您可以在服务器配置中定义基于正则表达式的掩码规则。
这些规则会在查询和所有日志消息存储到服务器日志或系统表(如 `system.query_log`、`system.text_log` 和 `system.processes`)之前应用。

这有助于防止敏感数据泄露到**日志**中。
请注意,它不会掩码查询结果中的数据。

例如,要掩码社会安全号码,您可以将以下规则添加到[服务器配置](/operations/configuration-files)中:

```yaml
<query_masking_rules>
<rule>
<name>隐藏 SSN</name>
<regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
<replace>000-00-0000</replace>
</rule>
</query_masking_rules>
```
