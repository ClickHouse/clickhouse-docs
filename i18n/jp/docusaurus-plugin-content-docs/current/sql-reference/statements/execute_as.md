---
description: 'EXECUTE AS ステートメントに関するドキュメント'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'EXECUTE AS ステートメント'
doc_type: 'reference'
---



# EXECUTE AS ステートメント

別のユーザーとしてクエリを実行できます。



## 構文 {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

最初の形式（`subquery`なし）では、現在のセッションにおける以降のすべてのクエリが、指定された`target_user`として実行されるように設定されます。

2番目の形式（`subquery`あり）では、指定された`subquery`のみが、指定された`target_user`として実行されます。

いずれの形式も動作させるには、サーバー設定[allow_impersonate_user](/operations/server-configuration-parameters/settings#allow_impersonate_user)を`1`に設定し、`IMPERSONATE`権限を付与する必要があります。例えば、以下のコマンドは

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

ユーザー`user2`が`EXECUTE AS user1 ...`コマンドを実行できるようにし、またユーザー`user3`が任意のユーザーとしてコマンドを実行できるようにします。

別のユーザーになりすましている間、関数[currentUser()](/sql-reference/functions/other-functions#currentUser)はそのなりすまし先のユーザーの名前を返し、関数[authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser)は実際に認証されたユーザーの名前を返します。


## 例 {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- 出力: "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- 出力: "james    default"
```
