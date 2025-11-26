---
description: 'EXECUTE AS ステートメントに関するドキュメント'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'EXECUTE AS ステートメント'
doc_type: 'reference'
---



# EXECUTE AS ステートメント

別のユーザーとしてクエリを実行できるようにします。



## 構文

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

最初の形式（`subquery` を含まないもの）は、現在のセッション内でその後に実行されるすべてのクエリが、指定された `target_user` として実行されるように設定します。

2 番目の形式（`subquery` を含むもの）は、指定された `subquery` のみを、指定された `target_user` として実行します。

どちらの形式も機能させるには、サーバー設定 [allow&#95;impersonate&#95;user](/operations/server-configuration-parameters/settings#allow_impersonate_user)
を `1` に設定し、さらに `IMPERSONATE` 権限が付与されている必要があります。例えば、次のコマンドは

```sql
user2 に対して user1 のなりすましを付与;
user3 に対して全てのなりすましを付与;
```

ユーザー `user2` には `EXECUTE AS user1 ...` コマンドの実行を許可し、ユーザー `user3` には任意のユーザーとしてコマンドを実行することを許可します。

別のユーザーとして実行している間、関数 [currentUser()](/sql-reference/functions/other-functions#currentUser) はそのユーザーの名前を返し、
関数 [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser) は実際に認証されたユーザーの名前を返します。


## 例

```sql
SELECT currentUser(), authenticatedUser(); -- 出力: "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- 出力: "james    default"
```
