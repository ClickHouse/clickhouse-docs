---
description: 'クエリ権限の設定。'
sidebar_label: 'クエリ権限'
sidebar_position: 58
slug: /operations/settings/permissions-for-queries
title: 'クエリ権限'
doc_type: 'reference'
---



# クエリに対する権限

ClickHouse のクエリは、いくつかの種類に分類できます。

1.  データ読み取りクエリ: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`。
2.  データ書き込みクエリ: `INSERT`, `OPTIMIZE`。
3.  設定変更クエリ: `SET`, `USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP` `TRUNCATE`。
5.  `KILL QUERY`。

以下の設定により、クエリの種類ごとにユーザーの権限が制御されます。



## readonly {#readonly}

データの読み取り、書き込み、および設定変更クエリに対する権限を制限します。

1に設定した場合、以下が許可されます:

- すべての種類の読み取りクエリ(SELECTおよび同等のクエリ)。
- セッションコンテキストのみを変更するクエリ(USEなど)。

2に設定した場合、上記に加えて以下が許可されます:

- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLISTなどのクエリは、システムテーブルからのselectを実行するだけであるため、SELECTと同等です。
  :::

設定可能な値:

- 0 — 読み取り、書き込み、および設定変更クエリが許可されます。
- 1 — データの読み取りクエリのみが許可されます。
- 2 — データの読み取りおよび設定変更クエリが許可されます。

デフォルト値: 0

:::note
`readonly = 1`を設定した後、ユーザーは現在のセッションで`readonly`および`allow_ddl`設定を変更できません。

[HTTPインターフェース](../../interfaces/http.md)で`GET`メソッドを使用する場合、`readonly = 1`が自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1`を設定すると、ユーザーによる設定変更が禁止されます。特定の設定のみの変更を禁止する方法があります。また、`readonly = 1`の制限下で特定の設定のみの変更を許可する方法もあります。詳細については、[設定の制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::


## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリの実行を許可または拒否します。

設定可能な値:

- 0 — DDLクエリは許可されません。
- 1 — DDLクエリは許可されます。

デフォルト値: 1

:::note
現在のセッションで`allow_ddl = 0`に設定されている場合、`SET allow_ddl = 1`を実行することはできません。
:::

:::note KILL QUERY
`KILL QUERY`は、readonlyおよびallow_ddl設定の任意の組み合わせで実行できます。
:::
