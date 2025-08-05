---
description: 'SET文のドキュメント'
sidebar_label: 'SET'
sidebar_position: 50
slug: '/sql-reference/statements/set'
title: 'SET Statement'
---




# SETステートメント

```sql
SET param = value
```

`value`を現在のセッションの`param` [設定](/operations/settings/overview) に割り当てます。この方法では[サーバー設定](../../operations/server-configuration-parameters/settings.md)を変更することはできません。

指定された設定プロファイルのすべての値を単一のクエリで設定することもできます。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

詳細については、[設定](../../operations/settings/settings.md)を参照してください。
