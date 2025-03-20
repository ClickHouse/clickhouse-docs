---
slug: /operations/external-authenticators/kerberos
---

# Kerberos
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

既存の適切に構成された ClickHouse ユーザーは、Kerberos 認証プロトコルを使用して認証できます。

現在、Kerberos は、`users.xml` またはローカルアクセス制御パスに定義されている既存のユーザーの外部認証機構としてのみ使用できます。これらのユーザーは HTTP リクエストのみを使用でき、GSS-SPNEGO メカニズムを使用して認証できなければなりません。

このアプローチでは、Kerberos をシステムに設定し、ClickHouse 設定で有効にする必要があります。


## ClickHouse での Kerberos の有効化 {#enabling-kerberos-in-clickhouse}

Kerberos を有効にするには、`config.xml` に `kerberos` セクションを含める必要があります。このセクションには追加のパラメータを含めることができます。

#### パラメータ: {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得され、使用されるカノニカルサービスプリンシパル名。
    - このパラメータはオプションで、省略した場合はデフォルトのプリンシパルが使用されます。

- `realm` - 認証を、その発信者のレルムが一致するリクエストのみに制限するために使用されるレルム。
    - このパラメータはオプションで、省略した場合はレルムによる追加のフィルタリングは適用されません。

- `keytab` - サービスキータブファイルへのパス。
    - このパラメータはオプションで、省略した場合はサービスキータブファイルへのパスを `KRB5_KTNAME` 環境変数で設定する必要があります。

例 (`config.xml` に入ります):

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパルの指定あり:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングあり:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` セクションは1つだけ定義できます。複数の `kerberos` セクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

:::note
`principal` と `realm` セクションは同時に指定できません。両方の `principal` と `realm` セクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

## 既存ユーザーの外部認証機構としての Kerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos は、ローカルに定義されたユーザー（`users.xml` またはローカルアクセス制御パスに定義されたユーザー）の身元を確認する方法として使用できます。現在、**HTTP インターフェースを介したリクエストのみが *kerberized* できます**（GSS-SPNEGO メカニズムを介して）。

Kerberos プリンシパル名のフォーマットは通常、次のパターンに従います：

- *primary/instance@REALM*

*/instance* 部分は0回以上現れる可能性があります。**認証が成功するためには、発信者のカノニカルプリンシパル名の *primary* 部分が Kerberos ユーザー名と一致することが期待されています**。

### `users.xml` での Kerberos の有効化 {#enabling-kerberos-in-users-xml}

ユーザーの Kerberos 認証を有効にするには、ユーザー定義の `password` や類似のセクションの代わりに `kerberos` セクションを指定します。

パラメータ：

- `realm` - 認証を、その発信者のレルムが一致するリクエストのみに制限するために使用されるレルム。
    - このパラメータはオプションで、省略した場合はレルムによる追加のフィルタリングは適用されません。

例 (`users.xml` に入ります):

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
Kerberos 認証は、他の認証メカニズムと併用することはできないことに注意してください。`kerberos` と並行する `password` などの他のセクションが存在する場合、ClickHouse はシャットダウンします。
:::

:::info リマインダー
ユーザー `my_user` が `kerberos` を使用する場合、以前に説明したように Kerberos をメイン `config.xml` ファイルで有効にする必要があります。
:::

### SQL を使用した Kerberos の有効化 {#enabling-kerberos-using-sql}

[SQL ドリブンのアクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が ClickHouse で有効になっている場合、Kerberos によって識別されるユーザーも SQL ステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...あるいは、レルムによるフィルタリングなしで:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
