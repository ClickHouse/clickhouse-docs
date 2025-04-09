---
slug: /operations/settings/permissions-for-queries
sidebar_position: 58
sidebar_label: クエリのパーミッション
title: "クエリのパーミッション"
description: "クエリのパーミッションに関する設定。"
---


# クエリのパーミッション

ClickHouseのクエリは、いくつかのタイプに分類できます：

1.  データ読み取りクエリ: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`。
2.  データ書き込みクエリ: `INSERT`, `OPTIMIZE`。
3.  設定変更クエリ: `SET`, `USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP`, `TRUNCATE`。
5.  `KILL QUERY`。

以下の設定は、クエリのタイプによるユーザーのパーミッションを制御します：

## readonly {#readonly}
データ読み取り、データ書き込み、および設定変更クエリのパーミッションを制限します。

1に設定すると、次のことを許可します：

- すべてのタイプの読み取りクエリ（SELECTや同等のクエリ）。
- セッションコンテキストのみを変更するクエリ（USEなど）。

2に設定すると、上記に加えて次を許可します：
- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLISTなどのクエリは、システムテーブルからSELECTを行うだけなので、SELECTと同等です。
  :::

可能な値：

- 0 — 読み取り、書き込み、設定変更クエリが許可されます。
- 1 — 読み取りデータクエリのみが許可されます。
- 2 — 読み取りデータクエリと設定変更クエリが許可されます。

デフォルト値: 0

:::note
`readonly = 1` に設定した後、ユーザーは現在のセッションで `readonly` や `allow_ddl` の設定を変更できません。

[HTTPインターフェイス](../../interfaces/http.md)で `GET`メソッドを使用すると、`readonly = 1` が自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1` を設定すると、ユーザーが設定を変更することが禁止されます。ただし、特定の設定のみ変更を禁止する方法もあります。また、`readonly = 1` の制限の下で特定の設定のみ変更を許可する方法もあります。詳細については、[設定に関する制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::


## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリを許可または拒否します。

可能な値：

- 0 — DDLクエリは許可されません。
- 1 — DDLクエリは許可されます。

デフォルト値: 1

:::note
現在のセッションで `allow_ddl = 0` の場合、`SET allow_ddl = 1` を実行することはできません。
:::


:::note KILL QUERY
`KILL QUERY` は、readonlyおよびallow_ddl設定の任意の組み合わせで実行できます。
:::
