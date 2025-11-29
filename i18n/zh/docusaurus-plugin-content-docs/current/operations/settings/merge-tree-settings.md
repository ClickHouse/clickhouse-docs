---
description: '用于 MergeTree 的设置，位于 `system.merge_tree_settings` 中'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表的设置'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局生效的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中进行全局配置，或者在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

自定义设置 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中为所有 `MergeTree` 表配置默认值：

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

为特定表设置：

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

使用 `ALTER TABLE ... MODIFY SETTING` 命令更改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- 重置为全局默认值（取自 system.merge_tree_settings）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## MergeTree 设置 {#mergetree-settings}

{/* 以下设置由以下脚本自动生成：
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }
