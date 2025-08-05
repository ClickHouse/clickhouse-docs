---
description: 'Documentation for Set Role'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: '/sql-reference/statements/set-role'
title: 'SET ROLE Statement'
---



現在のユーザーのためにロールをアクティベートします。

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE {#set-default-role}

ユーザーにデフォルトのロールを設定します。

デフォルトロールは、ユーザーがログインする際に自動的にアクティベートされます。デフォルトとして設定できるのは、以前に付与されたロールのみです。ロールがユーザーに付与されていない場合、ClickHouseは例外をスローします。

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 例 {#examples}

ユーザーに複数のデフォルトロールを設定します：

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

ユーザーに付与されたすべてのロールをデフォルトとして設定します：

```sql
SET DEFAULT ROLE ALL TO user
```

ユーザーからデフォルトロールを削除します：

```sql
SET DEFAULT ROLE NONE TO user
```

特定のロール `role1` と `role2` を除いたすべての付与されたロールをユーザーにデフォルトとして設定します：

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
