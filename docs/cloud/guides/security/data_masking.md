---
slug: /cloud/guides/data-masking
sidebar_label: 'Data masking'
title: 'Data masking in ClickHouse Cloud'
description: 'A guide to data masking in ClickHouse Cloud'
keywords: ['data masking']
---

# Data masking in ClickHouse Cloud

Data masking is a technique used for data protection, in which the original data
is replaced with a version of the data which maintains its format and structure 
while removing any personally identifiable information (PII) or sensitive information.

This guide shows you how you can mask data in ClickHouse.

## Use String functions {#using-string-functions}

For basic data masking use cases, the `replace` family of functions can be used:

| Function                                                                                 | Description                                                                                                                                          |
|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceone)             | Replaces the first occurrence of a pattern in a haystack string by the provided replacement string.                                                  |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceall)             | Replaces all occurrences of a pattern in a haystack string by the provided replacement string.                                                       |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceregexpone) | Replaces the first occurrence of a substring matching a regular expression pattern (in re2 syntax) in a haystack by the provided replacement string. |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceregexpall) | Replaces all occurrences of a substring matching a regular expression pattern (in re2 syntax) in a haystack by the provided replacement string.      |

For example, you can replace customer names with a placeholder `[CUSTOMER_NAME]` using the `replaceOne` function:

```sql
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

Or mask a social security number, leaving only the last 4 digits using the `replaceRegexpAll` function:

```sql
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

```response
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## Create masked `VIEW`s {#masked-views}

A [`VIEW`](/sql-reference/statements/create/view) can be used in conjunction with
the aforementioned functions to apply transformations to columns containing sensitive data, before they are presented to the user. 
In this way, the original data remains unchanged, and users querying the view see the masked data.

To demonstrate, let's imagine that we have a table which stores records of customer orders.
We want to make sure that certain employees can view the information without exposing
personal data of the customers.

First, create the following table for the data, and insert some rows into it:

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

Create a view called `masked_orders`:

```sql
CREATE VIEW masked_orders AS
SELECT
    user_id,
    replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****') AS name,
    replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2') AS email,
    replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3') AS phone,
    total_amount,
    order_date,
    replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1') AS shipping_address
FROM orders;
```

In the `SELECT` clause of the view, transformations on the `name`, `email`, `phone` and `shipping_address`
fields are defined in order to partially mask the data.

Select the data from the view:

```sql
SELECT * FROM masked_orders
```

```response
┌─user_id─┬─name─────────┬─email──────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address──────────┐
│    1001 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │       299.99 │ 2024-01-15 │ *** New York, NY 10001    │
│    1002 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │        149.5 │ 2024-01-16 │ *** Los Angeles, CA 90210 │
│    1003 │ Michael **** │ mb****@company.com │ 555-***-7890 │          599 │ 2024-01-17 │ *** Chicago, IL 60601     │
│    1004 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │        89.99 │ 2024-01-18 │ *** Houston, TX 77001     │
│    1005 │ David ****   │ dw****@email.net   │ 555-***-3210 │       449.75 │ 2024-01-19 │ *** Phoenix, AZ 85001     │
└─────────┴──────────────┴────────────────────┴──────────────┴──────────────┴────────────┴───────────────────────────┘
```

The data which is returned is masked, hiding sensitive information.
You can also create multiple views, with differing levels of obfuscation depending 
on the level of privilege of the viewer.

To ensure that users are only able to access the view returning the masked data,
you can use ClickHouse's [Role Based Access Control](/cloud/security/cloud-access-management/overview)
to ensure that the view is tied to a specific role.

First create the role:

```sql
CREATE ROLE masked_orders_viewer;
```

Grant `SELECT` privileges on the view to the role:

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

Because ClickHouse roles are additive, you must ensure that users who should only see the masked view do not have any SELECT privilege on the base table via any role.

As such, you should explicitly revoke base-table access to be safe:

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

Finally, assign the role to the appropriate users:

```sql
GRANT masked_orders_viewer TO your_user;
```

This ensures that users with the `masked_orders_viewer` role are only able to see
the masked data from the view and not the original unmasked data from the table.

## Use query masking rules for log data {#use-query-masking-rules}

For users of ClickHouse OSS wishing to mask log data specifically, you can make use of query masking rules (log masking)
to mask data.

To do so you can define regular expression-based masking rules in the server configuration.
These rules are applied to queries and all log messages before they are stored in server logs or system tables 
(such as `system.query_log`, `system.text_log`, and `system.processes`).

This helps prevent sensitive data from leaking into logs, but does not mask data in query results.

For example, to mask a social security number, you could add the following rule to your server configuration:

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
