---
slug: /operations/settings/permissions-for-queries
sidebar_position: 58
sidebar_label: クエリの権限
title: "クエリの権限"
description: "クエリの権限に関する設定。"
---

# クエリの権限

ClickHouseのクエリは、いくつかのタイプに分けることができます：

1.  データを読み取るクエリ: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`。
2.  データを書き込むクエリ: `INSERT`, `OPTIMIZE`。
3.  設定を変更するクエリ: `SET`, `USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリ: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP`, `TRUNCATE`。
5.  `KILL QUERY`。

次の設定は、クエリのタイプによってユーザーの権限を管理します：

## readonly {#readonly}
データを読み取る、データを書き込む、設定を変更するクエリの権限を制限します。

値を1に設定すると、以下が許可されます：

- すべてのタイプの読み取りクエリ（SELECTや同等のクエリなど）。
- セッションコンテキストのみを変更するクエリ（USEなど）。

値を2に設定すると、上記に加えて以下も許可されます：
- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLISTなどのクエリは、システムテーブルから選択を行うだけであるため、SELECTと同等です。
  :::

可能な値：

- 0 — 読み取り、書き込み、設定変更のクエリが許可されます。
- 1 — 読み取りデータクエリのみが許可されます。
- 2 — 読み取りデータおよび設定変更のクエリが許可されます。

デフォルト値: 0

:::note
`readonly = 1`を設定後、ユーザーは現在のセッションで`readonly`および`allow_ddl`設定を変更できません。

[HTTPインターフェース](../../interfaces/http.md)で`GET`メソッドを使用する場合、`readonly = 1`が自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1`を設定すると、ユーザーは設定を変更できなくなります。特定の設定のみの変更を禁止する方法があります。また、`readonly = 1`の制限の下で特定の設定のみを変更できる方法もあります。詳細については[設定に関する制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::


## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリを許可または拒否します。

可能な値：

- 0 — DDLクエリは許可されません。
- 1 — DDLクエリは許可されます。

デフォルト値: 1

:::note
現在のセッションで`allow_ddl = 0`の場合、`SET allow_ddl = 1`を実行できません。
:::


:::note KILL QUERY
`KILL QUERY`は、readonlyとallow_ddl設定の任意の組み合わせで実行できます。
:::
