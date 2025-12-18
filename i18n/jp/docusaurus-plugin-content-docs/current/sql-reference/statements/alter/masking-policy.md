---
description: 'ALTER MASKING POLICY 文のドキュメント'
sidebar_label: 'マスキングポリシー'
sidebar_position: 48
slug: /sql-reference/statements/alter/masking-policy
title: 'ALTER MASKING POLICY 文'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# ALTER MASKING POLICY {#alter-masking-policy}

既存のマスキングポリシーを変更します。

構文:

```sql
ALTER MASKING POLICY [IF EXISTS] policy_name ON [database.]table
    [UPDATE column1 = expression1 [, column2 = expression2 ...]]
    [WHERE condition]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
    [PRIORITY priority_number]
```

すべての句は任意指定です。指定した句だけが更新されます。
