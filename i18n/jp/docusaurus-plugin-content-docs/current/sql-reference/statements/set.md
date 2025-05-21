---
description: 'SET文のドキュメント'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET文'
---


# SET文

```sql
SET param = value
```

現在のセッションに対して `param` [設定](/operations/settings/overview) に `value` を割り当てます。この方法で [サーバー設定](../../operations/server-configuration-parameters/settings.md) を変更することはできません。

指定された設定プロファイルのすべての値を一度のクエリで設定することもできます。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

詳細については、[設定](../../operations/settings/settings.md) を参照してください。
