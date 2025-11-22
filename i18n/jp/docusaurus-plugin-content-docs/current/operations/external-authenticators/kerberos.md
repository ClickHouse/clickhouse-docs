---
description: '適切に設定された既存の ClickHouse ユーザーは、Kerberos 認証プロトコルによる認証が可能です。'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

既存の、正しく構成された ClickHouse ユーザーは、Kerberos 認証プロトコルを介して認証できます。

現在、Kerberos は既存ユーザー向けの外部認証方式としてのみ使用でき、これらのユーザーは `users.xml` またはローカルのアクセス制御パスで定義されています。これらのユーザーは HTTP リクエストのみを使用でき、かつ GSS-SPNEGO メカニズムを用いて認証できる必要があります。

この方式を利用するには、システム側で Kerberos を構成し、さらに ClickHouse の設定で有効化しておく必要があります。



## ClickHouseでKerberosを有効化する {#enabling-kerberos-in-clickhouse}

Kerberosを有効化するには、`config.xml`に`kerberos`セクションを含める必要があります。このセクションには追加のパラメータを含めることができます。

#### パラメータ {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得および使用される正規サービスプリンシパル名。
  - このパラメータは省略可能です。省略した場合、デフォルトのプリンシパルが使用されます。

- `realm` - 認証を、イニシエータのレルムが一致するリクエストのみに制限するために使用されるレルム。
  - このパラメータは省略可能です。省略した場合、レルムによる追加のフィルタリングは適用されません。

- `keytab` - サービスkeytabファイルへのパス。
  - このパラメータは省略可能です。省略した場合、サービスkeytabファイルへのパスを`KRB5_KTNAME`環境変数に設定する必要があります。

例（`config.xml`に記述）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパルを指定する場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングを使用する場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos`セクションは1つのみ定義できます。複数の`kerberos`セクションが存在する場合、ClickHouseはKerberos認証を無効化します。
:::

:::note
`principal`と`realm`セクションを同時に指定することはできません。`principal`と`realm`の両方のセクションが存在する場合、ClickHouseはKerberos認証を無効化します。
:::


## 既存ユーザーの外部認証機構としてのKerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberosは、ローカルに定義されたユーザー（`users.xml`またはローカルアクセス制御パスで定義されたユーザー）の身元を検証する方法として使用できます。現在、HTTPインターフェース経由のリクエスト**のみ**が_Kerberos化_（GSS-SPNEGOメカニズム経由）可能です。

Kerberosプリンシパル名の形式は通常、次のパターンに従います:

- _primary/instance@REALM_

_/instance_部分は0回以上出現する可能性があります。**認証を成功させるには、イニシエーターの正規プリンシパル名の_primary_部分がKerberos化されたユーザー名と一致する必要があります**。

### `users.xml`でのKerberosの有効化 {#enabling-kerberos-in-users-xml}

ユーザーのKerberos認証を有効にするには、ユーザー定義で`password`または類似のセクションの代わりに`kerberos`セクションを指定します。

パラメータ:

- `realm` - イニシエーターのレルムが一致するリクエストのみに認証を制限するために使用されるレルム。
  - このパラメータはオプションです。省略した場合、レルムによる追加のフィルタリングは適用されません。

例（`users.xml`に記述）:

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
Kerberos認証は他の認証メカニズムと併用できないことに注意してください。`kerberos`と並んで`password`のような他のセクションが存在すると、ClickHouseはシャットダウンします。
:::

:::info 注意
ユーザー`my_user`が`kerberos`を使用する場合、前述のようにメイン`config.xml`ファイルでKerberosを有効にする必要があることに注意してください。
:::

### SQLを使用したKerberosの有効化 {#enabling-kerberos-using-sql}

ClickHouseで[SQLベースのアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、Kerberosで識別されるユーザーもSQLステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...または、レルムによるフィルタリングなしの場合:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
