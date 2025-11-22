---
description: 'SET ステートメントに関するドキュメント'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET ステートメント'
doc_type: 'reference'
---

# SET文

```sql
SET param = value
```

現在のセッションに対して、`param` という[設定](/operations/settings/overview)に `value` を割り当てます。この方法で[サーバー設定](../../operations/server-configuration-parameters/settings.md)を変更することはできません。

指定された設定プロファイルに含まれるすべての値を、1 つのクエリで一括設定することもできます。

```sql
SET profile = '設定ファイルからのプロファイル名'
```

boolean 設定を true にする場合、値の指定を省略することで短縮記法を使用できます。設定名だけを指定した場合、自動的に `1`（true）に設定されます。

```sql
-- これらは同等です:
SET force_index_by_date = 1
SET force_index_by_date
```

詳細については、[設定](../../operations/settings/settings.md) を参照してください。
