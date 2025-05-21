---
description: 'クエリの権限に関する設定。'
sidebar_label: 'クエリの権限'
sidebar_position: 58
slug: /operations/settings/permissions-for-queries
title: 'クエリの権限'
---


# クエリの権限

ClickHouseにおけるクエリは、いくつかのタイプに分けられます：

1.  データ読み取りクエリ： `SELECT`、`SHOW`、`DESCRIBE`、`EXISTS`。
2.  データ書き込みクエリ： `INSERT`、`OPTIMIZE`。
3.  設定変更クエリ： `SET`、`USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ： `CREATE`、`ALTER`、`RENAME`、`ATTACH`、`DETACH`、`DROP`、`TRUNCATE`。
5.  `KILL QUERY`。

以下の設定は、クエリのタイプによってユーザーの権限を規制します：

## readonly {#readonly}
データ読み取り、データ書き込み、および設定変更クエリの権限を制限します。

1に設定されると、次のことが許可されます：

- すべてのタイプの読み取りクエリ（SELECTや同等のクエリなど）。
- セッションのコンテキストのみを変更するクエリ（USEのような）。

2に設定されると、上記に加えて次のことが許可されます：
- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLISTなどのクエリは、システムテーブルから選択するだけなので、SELECTに相当します。
  :::

可能な値：

- 0 — 読み取り、書き込み、設定変更のクエリが許可されます。
- 1 — 読み取りデータクエリのみが許可されます。
- 2 — 読み取りデータおよび設定変更のクエリが許可されます。

デフォルト値： 0

:::note
`readonly = 1`を設定した後、ユーザーは現在のセッションで`readonly`および`allow_ddl`の設定を変更できません。

[HTTPインターフェース](../../interfaces/http.md)で`GET`メソッドを使用する場合、`readonly = 1`が自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1`を設定すると、ユーザーは設定を変更できなくなります。特定の設定のみを変更できないようにユーザーを制限する手段もあります。また、`readonly = 1`の制限下で特定の設定のみの変更を許可する方法もあります。詳細については、[設定の制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::


## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリを許可または拒否します。

可能な値：

- 0 — DDLクエリは許可されません。
- 1 — DDLクエリは許可されます。

デフォルト値： 1

:::note
現在のセッションで`allow_ddl = 0`の場合、`SET allow_ddl = 1`を実行することはできません。
:::


:::note KILL QUERY
`KILL QUERY`は、readonlyおよびallow_ddlの設定の任意の組み合わせで実行できます。
:::
