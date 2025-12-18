---
description: 'Документация по команде ALTER MASKING POLICY'
sidebar_label: 'MASKING POLICY'
sidebar_position: 48
slug: /sql-reference/statements/alter/masking-policy
title: 'ALTER MASKING POLICY'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# ALTER MASKING POLICY {#alter-masking-policy}

Изменяет существующую политику маскирования.

Синтаксис:

```sql
ALTER MASKING POLICY [IF EXISTS] policy_name ON [database.]table
    [UPDATE column1 = expression1 [, column2 = expression2 ...]]
    [WHERE condition]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
    [PRIORITY priority_number]
```

Все части оператора являются необязательными. Будут обновлены только указанные части.
