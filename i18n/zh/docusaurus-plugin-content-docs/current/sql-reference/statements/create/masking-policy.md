---
description: '掩码策略相关文档'
sidebar_label: '掩码策略'
sidebar_position: 42
slug: /sql-reference/statements/create/masking-policy
title: 'CREATE MASKING POLICY'
doc_type: '参考'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

创建一个掩码策略（masking policy），用于在特定用户或角色查询表时，对列值进行动态转换或掩盖。

:::tip
掩码策略通过在查询时转换敏感数据而不修改已存储的数据，从而实现列级数据安全。
:::

语法：

```sql
CREATE MASKING POLICY [IF NOT EXISTS | OR REPLACE] policy_name ON [database.]table
    UPDATE column1 = expression1 [, column2 = expression2 ...]
    [WHERE condition]
    TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}
    [PRIORITY priority_number]
```


## UPDATE 子句 {#update-clause}

`UPDATE` 子句指定要对哪些列进行脱敏以及如何转换它们。可以在单个策略中脱敏多个列。

示例：

- 简单脱敏：`UPDATE email = '***masked***'`
- 部分脱敏：`UPDATE email = concat(substring(email, 1, 3), '***@***.***')`
- 基于哈希的脱敏：`UPDATE email = concat('masked_', substring(hex(cityHash64(email)), 1, 8))`
- 多列脱敏：`UPDATE email = '***@***.***', phone = '***-***-****'`

## WHERE 子句 {#where-clause}

可选的 `WHERE` 子句允许基于行的取值进行条件脱敏。只有满足条件的行才会应用脱敏。

示例：

```sql
CREATE MASKING POLICY mask_high_salaries ON employees
UPDATE salary = 0
WHERE salary > 100000
TO analyst;
```


## TO 子句 {#to-clause}

在 `TO` 子句中，指定该策略应应用到哪些用户和角色。

- `TO user1, user2`：应用于特定用户/角色
- `TO ALL`：应用于所有用户
- `TO ALL EXCEPT user1, user2`：应用于除指定用户外的所有用户

:::note
与行策略不同，掩码策略不会影响未被应用该策略的用户。如果某个用户没有任何适用的掩码策略，他们将看到原始数据。
:::

## PRIORITY 子句 {#priority-clause}

当多个掩码策略应用于同一用户的同一列时，`PRIORITY` 子句决定它们的应用顺序。策略会按从最高优先级到最低优先级的顺序应用。

默认优先级为 0。具有相同优先级的策略会以不确定的顺序应用。

示例：

```sql
-- Applied second (lower priority)
CREATE MASKING POLICY mask1 ON users
UPDATE email = 'low@priority.com'
TO analyst
PRIORITY 1;

-- Applied first (higher priority)
CREATE MASKING POLICY mask2 ON users
UPDATE email = 'high@priority.com'
TO analyst
PRIORITY 10;

-- analyst sees 'low@priority.com' because it's applied last
```

:::note 性能注意事项

* 掩码策略可能会因表达式的复杂度而影响查询性能
* 对于启用了掩码策略的表，某些优化可能会被禁用
  :::
