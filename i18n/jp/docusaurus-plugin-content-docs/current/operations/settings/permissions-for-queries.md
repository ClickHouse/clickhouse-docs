---
'description': 'クエリ権限の設定。'
'sidebar_label': 'クエリの権限'
'sidebar_position': 58
'slug': '/operations/settings/permissions-for-queries'
'title': 'クエリの権限'
'doc_type': 'reference'
---


# クエリの権限

ClickHouseのクエリは、いくつかのタイプに分類できます：

1.  データの読み取りクエリ: `SELECT`、`SHOW`、`DESCRIBE`、`EXISTS`。
2.  データの書き込みクエリ: `INSERT`、`OPTIMIZE`。
3.  設定変更のクエリ: `SET`、`USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ: `CREATE`、`ALTER`、`RENAME`、`ATTACH`、`DETACH`、`DROP`、`TRUNCATE`。
5.  `KILL QUERY`。

次の設定は、クエリのタイプによってユーザーの権限を規制します：

## readonly {#readonly}
データの読み取り、データの書き込みおよび設定変更のクエリに対する権限を制限します。

1に設定されている場合、次を許可します：

- すべての種類の読み取りクエリ（SELECTやその同等のクエリなど）。
- セッションコンテキストのみに変更を加えるクエリ（USEなど）。

2に設定されている場合、上記に加えて：
- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLIST等のクエリは、システムテーブルから選択を行うため、SELECTと同等です。
  :::

可能な値：

- 0 — 読み取り、書き込み、設定変更のクエリが許可されます。
- 1 — 読み取りデータのクエリのみが許可されます。
- 2 — 読み取りデータおよび設定変更のクエリが許可されます。

デフォルト値：0

:::note
`readonly = 1`に設定した後は、ユーザーは現在のセッションで`readonly`および`allow_ddl`の設定を変更できません。

[HTTPインターフェース](../../interfaces/http.md)で`GET`メソッドを使用する場合、`readonly = 1`は自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1`を設定すると、ユーザーは設定を変更できなくなります。特定の設定だけを変更できないように制限する方法があります。また、`readonly = 1`制限下で特定の設定だけを変更できるようにする方法もあります。詳細については[設定の制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::

## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリを許可または拒否します。

可能な値：

- 0 — DDLクエリは許可されていません。
- 1 — DDLクエリは許可されています。

デフォルト値：1

:::note
現在のセッションで`allow_ddl = 0`の場合、`SET allow_ddl = 1`を実行することはできません。
:::

:::note KILL QUERY
`KILL QUERY`は、readonlyおよびallow_ddl設定の任意の組み合わせで実行できます。
:::
