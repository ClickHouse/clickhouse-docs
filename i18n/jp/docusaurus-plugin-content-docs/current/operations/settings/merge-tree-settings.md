---
description: '`system.merge_tree_settings` に含まれる MergeTree の設定'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree テーブルの設定'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

システムテーブル `system.merge_tree_settings` には、グローバルに設定されている MergeTree の設定が表示されます。

MergeTree の設定は、サーバー設定ファイルの `merge_tree` セクションで設定するか、`CREATE TABLE` 文の `SETTINGS` 句で個々の `MergeTree` テーブルごとに指定できます。

設定 `max_suspicious_broken_parts` をカスタマイズする例:

すべての `MergeTree` テーブルに対するデフォルト値をサーバー設定ファイルで設定します:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

特定のテーブル用の設定:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

特定のテーブルの設定は `ALTER TABLE ... MODIFY SETTING` を使用して変更します。

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- グローバルデフォルトにリセット（system.merge_tree_settings の値）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree の設定

{/* 以下の設定は、次のスクリプトによって自動生成されたものです
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }
