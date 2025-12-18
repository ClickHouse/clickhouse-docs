---
description: 'ALTER MASKING POLICY 文档'
sidebar_label: '脱敏策略'
sidebar_position: 48
slug: /sql-reference/statements/alter/masking-policy
title: 'ALTER MASKING POLICY'
doc_type: '参考'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# ALTER MASKING POLICY {#alter-masking-policy}

修改已有的掩码策略。

语法：

```sql
ALTER MASKING POLICY [IF EXISTS] policy_name ON [database.]table
    [UPDATE column1 = expression1 [, column2 = expression2 ...]]
    [WHERE condition]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
    [PRIORITY priority_number]
```

所有子句均为可选。仅会更新显式指定的子句。
