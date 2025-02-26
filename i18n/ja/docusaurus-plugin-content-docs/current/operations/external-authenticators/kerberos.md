---
slug: /operations/external-authenticators/kerberos
---
# Kerberos
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

既存の正しく構成された ClickHouse ユーザーは、Kerberos 認証プロトコルを通じて認証されることができます。

現在、Kerberos は `users.xml` またはローカルアクセス制御パスに定義されている既存ユーザーのための外部認証器としてのみ使用することができます。これらのユーザーは、HTTP リクエストのみを使用でき、GSS-SPNEGO メカニズムを使用して認証できる必要があります。

このアプローチでは、システムに Kerberos が構成され、ClickHouse 設定において有効になっている必要があります。


## ClickHouse で Kerberos を有効にする {#enabling-kerberos-in-clickhouse}

Kerberos を有効にするには、`config.xml` に `kerberos` セクションを含める必要があります。このセクションには追加のパラメータを含めることができます。

#### パラメータ: {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得され使用される標準的なサービス主題名。
    - このパラメータは省略可能で、省略した場合はデフォルトの principal が使用されます。

- `realm` - 認証を、送信者のレルムがこれと一致するリクエストのみに制限するために使用されるレルム。
    - このパラメータは省略可能で、省略した場合、レルムによる追加のフィルタリングは適用されません。

- `keytab` - サービスの keytab ファイルへのパス。
    - このパラメータは省略可能で、省略した場合は、サービスの keytab ファイルへのパスを `KRB5_KTNAME` 環境変数で設定する必要があります。

例（`config.xml` に追加）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

principal を指定した場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングを使用した場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
1 つの `kerberos` セクションのみを定義できます。複数の `kerberos` セクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

:::note
`principal` と `realm` セクションを同時に指定することはできません。`principal` と `realm` の両方が存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

## 既存のユーザーのための外部認証器としての Kerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos は、ローカルに定義されたユーザー（`users.xml` またはローカルアクセス制御パスに定義されたユーザー）の身元を確認する方法として使用できます。現在、**HTTP インターフェースを介しての** リクエストのみが *kerberized* されることができます（GSS-SPNEGO メカニズムを介して）。

Kerberos principal 名の形式は通常、次のパターンに従います：

- *primary/instance@REALM*

この */instance* 部分は0回以上存在する可能性があります。**認証を成功させるためには、送信者の標準的な principal 名の *primary* 部分が kerberized ユーザー名と一致することが期待されます。**

### `users.xml` で Kerberos を有効にする {#enabling-kerberos-in-users-xml}

ユーザーのために Kerberos 認証を有効にするには、ユーザー定義内で `password` または同様のセクションの代わりに `kerberos` セクションを指定します。

パラメータ：

- `realm` - 認証を、送信者のレルムがこれと一致するリクエストのみに制限するために使用されるレルム。
    - このパラメータは省略可能で、省略した場合、レルムによる追加のフィルタリングは適用されません。

例（`users.xml` に追加）:

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
Kerberos 認証は他のいかなる認証メカニズムと一緒に使用できないことに注意してください。`kerberos` と共に `password` などの他のセクションが存在する場合、ClickHouse はシャットダウンします。
:::

:::info リマインダー
現在、ユーザー `my_user` が `kerberos` を使用すると、Kerberos は前述のようにメインの `config.xml` ファイルで有効にされている必要があります。
:::

### SQL を使用して Kerberos を有効にする {#enabling-kerberos-using-sql}

[SQL 駆動型アクセス制御およびアカウント管理](/guides/sre/user-management/index.md#access-control) が ClickHouse において有効な場合、Kerberos によって識別されるユーザーも SQL ステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...または、レルムによるフィルタリングなしで：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
