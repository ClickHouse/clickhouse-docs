---
description: 'ロールの設定に関するドキュメント'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'SET ROLE ステートメント'
doc_type: 'reference'
---

現在のユーザーのロールを有効にします。

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE \{#set-default-role\}

ユーザーに対してデフォルトロールを設定します。

デフォルトロールは、ユーザーのログイン時に自動的に有効化されます。デフォルトとして設定できるのは、すでに付与されているロールのみです。ロールがユーザーに付与されていない場合、ClickHouse は例外を発生させます。

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 例 \{#examples\}

ユーザーに複数のデフォルトロールを設定する：

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

ユーザーに付与されているすべてのロールをデフォルトとして設定する：

```sql
SET DEFAULT ROLE ALL TO user
```

ユーザーからデフォルトロールをすべて削除する：

```sql
SET DEFAULT ROLE NONE TO user
```

特定のロール `role1` と `role2` を除き、付与済みのすべてのロールをデフォルトロールとして設定します。

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
