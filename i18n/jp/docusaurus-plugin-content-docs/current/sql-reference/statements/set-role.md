---
'description': 'SET ROLE に関する文書'
'sidebar_label': 'SET ROLE'
'sidebar_position': 51
'slug': '/sql-reference/statements/set-role'
'title': 'SET ROLE ステートメント'
'doc_type': 'reference'
---

現在のユーザーのロールをアクティブにします。

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE {#set-default-role}

ユーザーにデフォルトロールを設定します。

デフォルトロールは、ユーザーのログイン時に自動的にアクティブになります。デフォルトとして設定できるのは、以前に付与されたロールのみです。ロールがユーザーに付与されていない場合、ClickHouseは例外をスローします。

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 例 {#examples}

ユーザーに複数のデフォルトロールを設定する:

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

付与されたすべてのロールをユーザーにデフォルトとして設定する:

```sql
SET DEFAULT ROLE ALL TO user
```

ユーザーからデフォルトロールを削除する:

```sql
SET DEFAULT ROLE NONE TO user
```

特定のロール `role1` と `role2` を除いて、付与されたすべてのロールをデフォルトとして設定する:

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
