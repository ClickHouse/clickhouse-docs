---
slug: /sql-reference/statements/set
sidebar_position: 50
sidebar_label: SET
---

# SET ステートメント

``` sql
SET param = value
```

現在のセッションに対して `param` [設定](../../operations/settings/overview) に `value` を割り当てます。この方法では [サーバー設定](../../operations/server-configuration-parameters/settings.md) を変更することはできません。

指定された設定プロファイルからすべての値を一度のクエリで設定することもできます。

``` sql
SET profile = '設定ファイルからのプロファイル名'
```

詳細については、[設定](../../operations/settings/settings.md)を参照してください。
