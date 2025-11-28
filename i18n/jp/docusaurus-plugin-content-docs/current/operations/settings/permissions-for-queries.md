---
description: 'クエリ実行権限の設定。'
sidebar_label: 'クエリ権限'
sidebar_position: 58
slug: /operations/settings/permissions-for-queries
title: 'クエリ権限'
doc_type: 'reference'
---



# クエリの権限

ClickHouse におけるクエリは、次のいくつかの種類に分類されます。

1.  データ読み取りクエリ: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`。
2.  データ書き込みクエリ: `INSERT`, `OPTIMIZE`。
3.  設定変更クエリ: `SET`, `USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP`, `TRUNCATE`。
5.  `KILL QUERY`。

次の設定によって、クエリ種別ごとにユーザー権限を制御します。



## readonly {#readonly}
データの読み取り・書き込みおよび設定変更を行うクエリに対する権限を制限します。

1 に設定した場合、以下が許可されます:

- あらゆる種類の読み取りクエリ（`SELECT` およびそれと同等のクエリなど）。
- セッションコンテキストのみを変更するクエリ（`USE` など）。

2 に設定した場合、上記に加えて以下が許可されます:
- `SET` および `CREATE TEMPORARY TABLE`

  :::tip
  `EXISTS`、`DESCRIBE`、`EXPLAIN`、`SHOW PROCESSLIST` などのクエリは、システムテーブルに対して `SELECT` を実行しているだけなので、`SELECT` と同等です。
  :::

取りうる値:

- 0 — 読み取り、書き込み、および設定変更クエリが許可されます。
- 1 — データの読み取りクエリのみが許可されます。
- 2 — データの読み取りおよび設定変更クエリが許可されます。

デフォルト値: 0

:::note
`readonly = 1` を設定すると、ユーザーは現在のセッションで `readonly` および `allow_ddl` の設定を変更できません。

[HTTP インターフェイス](../../interfaces/http.md)で `GET` メソッドを使用する場合、`readonly = 1` が自動的に設定されます。データを変更するには、`POST` メソッドを使用してください。

`readonly = 1` を設定すると、ユーザーは設定を変更できなくなります。特定の設定のみの変更を禁止することもできます。また、`readonly = 1` の制約下で特定の設定のみの変更を許可することもできます。詳細については、[設定に対する制約](../../operations/settings/constraints-on-settings.md) を参照してください。
:::



## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリを許可するかどうかを制御します。

取り得る値:

- 0 — DDL クエリは許可されません。
- 1 — DDL クエリは許可されます。

デフォルト値: 1

:::note
現在のセッションで `allow_ddl = 0` の場合、`SET allow_ddl = 1` を実行することはできません。
:::

:::note KILL QUERY
`KILL QUERY` は、readonly と allow_ddl の設定値の組み合わせに関わらず実行できます。
:::
