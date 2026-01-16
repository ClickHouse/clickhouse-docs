---
description: 'MASKING POLICY のドキュメント'
sidebar_label: 'MASKING POLICY'
sidebar_position: 42
slug: /sql-reference/statements/create/masking-policy
title: 'CREATE MASKING POLICY'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

マスキングポリシーを作成します。これにより、特定のユーザーやロールがテーブルをクエリする際に、そのユーザーやロールに対してカラムの値を動的に変換またはマスクできます。

:::tip
マスキングポリシーは、保存されているデータを変更することなく、クエリ時に機密データを変換することで、カラムレベルのデータセキュリティを提供します。
:::

構文:

```sql
CREATE MASKING POLICY [IF NOT EXISTS | OR REPLACE] policy_name ON [database.]table
    UPDATE column1 = expression1 [, column2 = expression2 ...]
    [WHERE condition]
    TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}
    [PRIORITY priority_number]
```


## UPDATE 句 \\{#update-clause\\}

`UPDATE` 句では、マスク対象となるカラムと、その変換方法を指定します。1 つのポリシーで複数のカラムをマスクできます。

例:

- 単純なマスキング: `UPDATE email = '***masked***'`
- 部分的なマスキング: `UPDATE email = concat(substring(email, 1, 3), '***@***.***')`
- ハッシュベースのマスキング: `UPDATE email = concat('masked_', substring(hex(cityHash64(email)), 1, 8))`
- 複数カラムのマスキング: `UPDATE email = '***@***.***', phone = '***-***-****'`

## WHERE 句 \{#where-clause\}

オプションの `WHERE` 句を使用すると、行の値に基づいて条件付きでマスキングを適用できます。条件に一致する行だけにマスキングが適用されます。

例:

```sql
CREATE MASKING POLICY mask_high_salaries ON employees
UPDATE salary = 0
WHERE salary > 100000
TO analyst;
```


## TO 句 \\{#to-clause\\}

`TO` セクションでは、そのポリシーを適用する対象のユーザーやロールを指定します。

- `TO user1, user2`: 特定のユーザー／ロールに適用
- `TO ALL`: すべてのユーザーに適用
- `TO ALL EXCEPT user1, user2`: 指定したユーザー／ロールを除くすべてのユーザー／ロールに適用

:::note
行ポリシーと異なり、マスキングポリシーは、そのポリシーが適用されていないユーザーには影響しません。あるユーザーに適用されるマスキングポリシーがない場合、そのユーザーには元のデータが表示されます。
:::

## PRIORITY 句 \{#priority-clause\}

複数のマスキングポリシーが同じユーザーに対して同じカラムを対象とする場合、`PRIORITY` 句によって適用順序が決まります。ポリシーは優先度の高いものから低いものへと順に適用されます。

デフォルトの優先度は 0 です。同じ優先度を持つポリシーは、順序が未定義のまま適用されます。

例:

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

:::note パフォーマンス上の考慮事項

* マスキングポリシーは、式の複雑さに応じてクエリのパフォーマンスに影響する可能性があります
* 有効なマスキングポリシーが設定されているテーブルでは、一部の最適化が無効化される場合があります
  :::
