---
'description': 'SET ステートメントのドキュメント'
'sidebar_label': 'SET'
'sidebar_position': 50
'slug': '/sql-reference/statements/set'
'title': 'SET ステートメント'
'doc_type': 'reference'
---


# SET ステートメント

```sql
SET param = value
```

現在のセッションの `param` [設定](/operations/settings/overview) に `value` を割り当てます。この方法で [サーバー設定](../../operations/server-configuration-parameters/settings.md) を変更することはできません。

指定された設定プロファイルのすべての値を単一のクエリで設定することもできます。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

boolean 設定を true に設定する場合、値の割り当てを省略して shorthand 構文を使用できます。設定名のみが指定された場合、自動的に `1` (true) に設定されます。

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

詳細については、[設定](../../operations/settings/settings.md) を参照してください。
