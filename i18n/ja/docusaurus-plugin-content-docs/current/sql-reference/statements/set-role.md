---
slug: /sql-reference/statements/set-role
sidebar_position: 51
sidebar_label: SET ROLE
title: "SET ROLEステートメント"
---

現在のユーザーのロールをアクティブにします。

``` sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## デフォルトロールの設定 {#set-default-role}

ユーザーにデフォルトロールを設定します。

デフォルトロールはユーザーがログインした際に自動的にアクティブになります。デフォルトとして設定できるのは、以前に付与されたロールのみです。ロールがユーザーに付与されていない場合、ClickHouseは例外をスローします。

``` sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 例 {#examples}

ユーザーに複数のデフォルトロールを設定します：

``` sql
SET DEFAULT ROLE role1, role2, ... TO user
```

付与されたすべてのロールをユーザーにデフォルトとして設定します：

``` sql
SET DEFAULT ROLE ALL TO user
```

ユーザーからデフォルトロールを削除します：

``` sql
SET DEFAULT ROLE NONE TO user
```

特定のロール `role1` と `role2` を除いて、付与されたすべてのロールをユーザーにデフォルトとして設定します：

``` sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
