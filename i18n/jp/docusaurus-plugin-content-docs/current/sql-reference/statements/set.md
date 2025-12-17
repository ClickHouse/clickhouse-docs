---
description: 'SET ステートメントに関するドキュメント'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET ステートメント'
doc_type: 'reference'
---

# SET ステートメント {#set-statement}

```sql
SET param = value
```

現在のセッションに対して、`param` の[設定](/operations/settings/overview)に `value` を割り当てます。この方法で[サーバー設定](../../operations/server-configuration-parameters/settings.md)を変更することはできません。

指定した SETTINGS PROFILE に含まれるすべての設定値を、1つのクエリでまとめて設定することもできます。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

boolean 型の設定を true にする場合、値の指定を省略して短縮記法を使うことができます。設定名だけが指定されていると、自動的に `1`（true）として解釈されます。

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

## クエリパラメータの設定 {#setting-query-parameters}

`SET` ステートメントは、パラメータ名に `param_` というプレフィックスを付けることで、クエリパラメータを定義するためにも使用できます。
クエリパラメータを使用すると、実行時に実際の値に置き換えられるプレースホルダーを含む汎用的なクエリを記述できます。

```sql
SET param_name = value
```

クエリ内でクエリパラメータを使用するには、`{name: datatype}` という構文で指定します。

```sql
SET param_id = 42;
SET param_name = 'John';

SELECT * FROM users
WHERE id = {id: UInt32}
AND name = {name: String};
```

クエリパラメータは、同じクエリを異なる値で何度も実行する必要がある場合に特に有用です。

`Identifier` 型での使用例を含むクエリパラメータの詳細については、[Defining and Using Query Parameters](../../sql-reference/syntax.md#defining-and-using-query-parameters) を参照してください。

詳細については、[Settings](../../operations/settings/settings.md) を参照してください。
