---
'description': 'クエリの権限設定。'
'sidebar_label': 'クエリのアクセス権限'
'sidebar_position': 58
'slug': '/operations/settings/permissions-for-queries'
'title': 'クエリの権限'
---




# クエリの権限

ClickHouseのクエリは、いくつかのタイプに分けることができます。

1.  データを読み取るクエリ: `SELECT`、`SHOW`、`DESCRIBE`、`EXISTS`。
2.  データを書き込むクエリ: `INSERT`、`OPTIMIZE`。
3.  設定を変更するクエリ: `SET`、`USE`。
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) クエリ: `CREATE`、`ALTER`、`RENAME`、`ATTACH`、`DETACH`、`DROP`、`TRUNCATE`。
5.  `KILL QUERY`。

以下の設定は、クエリのタイプによってユーザーの権限を制御します。

## readonly {#readonly}
データを読み取る、データを書き込む、設定を変更するクエリの権限を制限します。

1に設定されている場合は、次のことを許可します：

- すべてのタイプの読み取りクエリ（SELECTや同等のクエリなど）。
- セッションコンテキストのみを変更するクエリ（USEなど）。

2に設定されている場合は、上記に加えて次を許可します：
- SETおよびCREATE TEMPORARY TABLE

  :::tip
  EXISTS、DESCRIBE、EXPLAIN、SHOW PROCESSLISTなどのクエリは、システムテーブルから選択するだけのため、SELECTと同等である。
  :::

可能な値：

- 0 — 読み取り、書き込み、設定変更のクエリは許可されます。
- 1 — 読み取りデータのクエリのみが許可されます。
- 2 — 読み取りデータと設定変更のクエリが許可されます。

デフォルト値: 0

:::note
`readonly = 1`を設定すると、ユーザーは現在のセッションで`readonly`および`allow_ddl`の設定を変更できません。

[HTTPインターフェイス](../../interfaces/http.md)で`GET`メソッドを使用すると、`readonly = 1`が自動的に設定されます。データを変更するには、`POST`メソッドを使用してください。

`readonly = 1`を設定すると、ユーザーは設定を変更できなくなります。特定の設定の変更を禁止する方法があり、また、`readonly = 1`の制限の下で特定の設定のみを変更することを許可する方法もあります。詳細については[設定の制約](../../operations/settings/constraints-on-settings.md)を参照してください。
:::


## allow_ddl {#allow_ddl}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language)クエリを許可または拒否します。

可能な値：

- 0 — DDLクエリは許可されません。
- 1 — DDLクエリは許可されます。

デフォルト値: 1

:::note
現在のセッションで`allow_ddl = 0`の場合、`SET allow_ddl = 1`を実行することはできません。
:::


:::note KILL QUERY
`KILL QUERY`は、readonlyおよびallow_ddl設定の任意の組み合わせで実行できます。
:::
