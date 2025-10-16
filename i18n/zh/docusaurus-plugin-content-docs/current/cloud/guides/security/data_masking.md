---
'slug': '/cloud/guides/data-masking'
'sidebar_label': '数据掩码'
'title': '在 ClickHouse 中的数据掩码'
'description': '关于在 ClickHouse 中进行数据掩码的指南'
'keywords':
- 'data masking'
'doc_type': 'guide'
---


# ClickHouse中的数据掩码

数据掩码是一种数据保护技术，在这种技术中，原始数据会被替换为符合其格式和结构的版本，同时移除任何个人可识别信息（PII）或敏感信息。

本指南展示了如何在ClickHouse中掩码数据。

## 使用字符串替换函数 {#using-string-functions}

对于基本的数据掩码使用案例，`replace`函数系列提供了一种便捷的数据掩码方法：

| 函数                                                                                      | 描述                                                                                                                                                 |
|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceone)             | 用提供的替换字符串替换干草堆字符串中模式的第一个出现。                                                                                                 |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceall)             | 用提供的替换字符串替换干草堆字符串中模式的所有出现。                                                                                                |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceregexpone) | 用提供的替换字符串替换干草堆中与正则表达式模式（采用re2语法）匹配的子字符串的第一个出现。                                                               |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceregexpall) | 用提供的替换字符串替换干草堆中与正则表达式模式（采用re2语法）匹配的所有子字符串的出现。                                                             |

例如，您可以使用`replaceOne`函数将名称“John Smith”替换为占位符`[CUSTOMER_NAME]`：

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

更一般地，您可以使用`replaceRegexpOne`来替换任何客户名称：

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

或者，您可以使用`replaceRegexpAll`函数掩码社会安全号码，仅保留最后4位数字。

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

在上面的查询中，` \3 `用于将第三个捕获组替换到结果字符串中，产生：

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## 创建掩码 `VIEW` {#masked-views}

可以结合上述字符串函数使用 [`VIEW`](/sql-reference/statements/create/view) 对包含敏感数据的列应用转换，在数据呈现给用户之前。
通过这种方式，原始数据保持不变，查询视图的用户仅看到掩码数据。

为了演示，假设我们有一个存储客户订单记录的表。
我们希望确保一组员工可以查看信息，但我们不希望他们看到客户的完整信息。

运行下面的查询以创建一个示例表`orders`并插入一些虚构的客户订单记录：

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

创建一个名为`masked_orders`的视图：

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

在上面的视图创建查询的`SELECT`子句中，我们使用`replaceRegexpOne`定义了对`name`、`email`、`phone`和`shipping_address`字段的转换，这些字段包含我们希望部分掩码的敏感信息。

从视图中选择数据：

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

请注意，从视图返回的数据是部分掩码的，模糊了敏感信息。
您还可以创建多个视图，根据查看者对信息的特权访问级别实现不同程度的模糊处理。

为了确保用户只能访问返回掩码数据的视图，而无法访问原始未掩码数据的表，您应使用 [基于角色的访问控制](/cloud/security/cloud-access-management/overview) 来确保特定角色仅对视图的选择有授权。

首先创建角色：

```sql
CREATE ROLE masked_orders_viewer;
```

接着将`SELECT`权限授予视图：

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

由于ClickHouse角色是累加的，您必须确保那些只应查看掩码视图的用户没有通过任何角色对基础表具有`SELECT`权限。

因此，您应该明确撤销基础表访问以确保安全：

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

最后，将角色分配给适当的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

这确保拥有`masked_orders_viewer`角色的用户仅能看到视图中的掩码数据，而无法查看表中的原始未掩码数据。

## 使用 `MATERIALIZED` 列和列级访问限制 {#materialized-ephemeral-column-restrictions}

在您不想创建单独视图的情况下，您可以将掩码数据版本与原始数据一起存储。
为此，您可以使用 [物化列](/sql-reference/statements/create/table#materialized)。
此类列的值在插入行时会根据指定的物化表达式自动计算，我们可以用它们创建掩码数据的新列。

以之前的示例为例，我们现在将使用`MATERIALIZED`创建掩码列，而不是为掩码数据创建单独的`VIEW`：

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

如果您现在运行以下选择查询，您将看到在插入时，掩码数据“物化”并与原始未掩码数据一起存储。
需要明确选择掩码列，因为ClickHouse默认不会在`SELECT *`查询中自动包含物化列。

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

为了确保用户只能访问包含掩码数据的列，您可以再次使用 [基于角色的访问控制](/cloud/security/cloud-access-management/overview) 来确保特定角色仅对`orders`中的掩码列有选择授权。

重新创建我们之前创建的角色：

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

接下来，将`SELECT`权限授予`orders`表：

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

撤销对任何敏感列的访问：

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

最后，将角色分配给适当的用户：

```sql
GRANT masked_orders_viewer TO your_user;
```

在您希望在`orders`表中仅存储掩码数据的情况下，您可以将敏感的未掩码列标记为 [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)，这将确保这种类型的列不会存储在表中。

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

如果我们运行与之前相同的查询，您将看到仅将物化的掩码数据插入到表中：

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

## 使用日志数据的查询掩码规则 {#use-query-masking-rules}

希望特别掩码日志数据的ClickHouse OSS用户可以使用 [查询掩码规则](/operations/server-configuration-parameters/settings#query_masking_rules)（日志掩码）来掩码数据。

为此，您可以在服务器配置中定义基于正则表达式的掩码规则。
这些规则会在查询和所有日志消息被存储到服务器日志或系统表（如`system.query_log`、`system.text_log`和`system.processes`）之前应用。

这有助于防止敏感数据泄漏到仅在**日志**中。
请注意，它不会掩码查询结果中的数据。

例如，要掩码社会安全号码，您可以将以下规则添加到您的 [服务器配置](/operations/configuration-files) 中：

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
