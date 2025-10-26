---
'description': '既存の適切に構成された ClickHouse ユーザーは、Kerberos 認証プロトコルを介して認証できます。'
'slug': '/operations/external-authenticators/kerberos'
'title': 'Kerberos'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

既存の適切に構成された ClickHouse ユーザーは、Kerberos 認証プロトコルを介して認証されることができます。

現在、Kerberos は、`users.xml` またはローカルアクセス制御パスで定義された既存のユーザーの外部認証機関としてのみ使用できます。これらのユーザーは HTTP リクエストのみを使用でき、GSS-SPNEGO 機構を使用して認証する必要があります。

このアプローチでは、システムに Kerberos を構成し、ClickHouse 設定で有効にする必要があります。

## ClickHouse での Kerberos の有効化 {#enabling-kerberos-in-clickhouse}

Kerberos を有効にするには、`config.xml` に `kerberos` セクションを含める必要があります。このセクションには追加のパラメータが含まれる場合があります。

#### パラメータ {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得され使用されるカノニカルサービスプリンシパル名。
  - このパラメータはオプションであり、省略した場合にはデフォルトのプリンシパルが使用されます。

- `realm` - 認証をその発信者のレルムが一致するリクエストのみに制限するために使用されるレルム。
  - このパラメータはオプションであり、省略した場合にはレルムによる追加のフィルタリングは適用されません。

- `keytab` - サービス keytab ファイルへのパス。
  - このパラメータはオプションであり、省略した場合は `KRB5_KTNAME` 環境変数にサービス keytab ファイルへのパスを設定する必要があります。

例（`config.xml` に入れる）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパル指定のある場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングのある場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` セクションを1つだけ定義できます。複数の `kerberos` セクションが存在すると、ClickHouse は Kerberos 認証を無効にします。
:::

:::note
`principal` と `realm` セクションは同時に指定できません。両方の `principal` と `realm` セクションが存在すると、ClickHouse は Kerberos 認証を無効にします。
:::

## 既存のユーザーの外部認証機関としての Kerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos は、ローカルに定義されたユーザー（`users.xml` またはローカルアクセス制御パスで定義されたユーザー）のアイデンティティを確認する方法として使用できます。現在、**HTTP インターフェースを介したリクエストのみが *kerberized* されることができます**（GSS-SPNEGO 機構を介して）。

Kerberos プリンシパル名の形式は通常、このパターンに従います。

- *primary/instance@REALM*

*/instance* 部分はゼロ回以上出現することがあります。**認証が成功するためには、発信者のカノニカルプリンシパル名の *primary* 部分が kerberized ユーザー名と一致することが期待されます**。

### `users.xml` での Kerberos の有効化 {#enabling-kerberos-in-users-xml}

ユーザーに対して Kerberos 認証を有効にするには、ユーザー定義の `password` または類似のセクションの代わりに `kerberos` セクションを指定します。

パラメータ:

- `realm` - 認証をその発信者のレルムが一致するリクエストのみに制限するために使用されるレルム。
  - このパラメータはオプションであり、省略した場合にはレルムによる追加のフィルタリングは適用されません。

例（`users.xml` に入れる）:

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <kerberos>
                <realm>EXAMPLE.COM</realm>
            </kerberos>
        </my_user>
    </users>
</clickhouse>
```

:::note
Kerberos 認証は、他の認証機構と併用することはできません。`kerberos` に加えて `password` などの他のセクションが存在すると、ClickHouse はシャットダウンします。
:::

:::info リマインダー
今、ユーザー `my_user` が `kerberos` を使用すると、Kerberos は以前に説明したように、メインの `config.xml` ファイルで有効にしなければなりません。
:::

### SQL を使用した Kerberos の有効化 {#enabling-kerberos-using-sql}

[SQL駆動のアクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が ClickHouse で有効になっているとき、Kerberos によって識別されたユーザーは、SQL 文を使用しても作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...または、レルムによるフィルタリングなしで:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
