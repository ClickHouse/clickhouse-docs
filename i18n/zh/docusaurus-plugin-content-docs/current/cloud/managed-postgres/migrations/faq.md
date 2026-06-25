---
slug: /cloud/managed-postgres/migrations/faq
sidebar_label: '常见问题'
title: 'Managed Postgres 迁移常见问题解答'
description: '有关将数据迁移到 ClickHouse Managed Postgres 的常见问题。'
keywords: ['postgres', 'migration', 'faq', 'managed postgres', 'logical replication', 'enum', 'unique constraint']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migrations-faq" />

# Managed Postgres 迁移常见问题 \{#managed-postgres-migrations-faq\}

关于 Postgres 复制机制的许多问题——包括 `TOAST` 列、replication slot、publication、schema 变更以及数据类型映射——都已在 [ClickPipes for Postgres FAQ](/integrations/clickpipes/postgres/faq) 中解答。其中的信息同样适用于 Managed Postgres 迁移。

### 复制期间出现“enum 的输入值无效”错误 \{#invalid-enum-value\}

当源端 Postgres 中存在目标端 Managed Postgres 上没有的 enum 值时，就会出现此错误。逻辑复制不会自动传播 `ALTER TYPE ... ADD VALUE` 命令，因此，如果在初始 schema 设置完成后又在源端新增了 enum 值，就会导致目标端插入失败。

要解决此问题，请在目标 Postgres 的该 enum 类型中补上缺失的值：

```sql
ALTER TYPE your_enum_type ADD VALUE 'new_value';
```

将 `your_enum_type` 替换为你的枚举类型名称，并将 `'new_value'` 替换为错误信息中缺少的值。

### 复制期间出现唯一约束冲突错误 \{#unique-constraint-violation\}

在逻辑复制过程中，如果复制顺序与目标端现有的唯一约束发生冲突，就可能出现唯一约束冲突。这种情况可能出现在涉及操作重放的 CDC (变更数据捕获) 工作负载中：某些操作会暂时违反唯一性，而后续更新才会消除冲突。

要解除复制阻塞，请删除目标 Postgres 上的唯一约束：

```sql
ALTER TABLE your_table DROP CONSTRAINT your_constraint_name;
```

可通过运行以下命令查看约束名称：

```sql
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'u';
```

在切换时，待复制完成且源端不再处于活动状态后，重新添加该约束：

```sql
ALTER TABLE your_table ADD CONSTRAINT your_constraint_name UNIQUE (column1, column2);
```