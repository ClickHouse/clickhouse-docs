---
description: 'Existing and properly configured ClickHouse users can be authenticated
  via Kerberos authentication protocol.'
slug: '/operations/external-authenticators/kerberos'
title: 'Kerberos'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

既存の適切に構成されたClickHouseユーザーは、Kerberos認証プロトコルを介して認証されることができます。

現在、Kerberosは`users.xml`で定義されるか、ローカルアクセス制御パス内の既存のユーザーのための外部認証機関としてのみ使用できます。これらのユーザーはHTTPリクエストのみを使用でき、GSS-SPNEGOメカニズムを介して認証できる必要があります。

このアプローチのために、Kerberosはシステム内で構成され、ClickHouseの設定で有効にする必要があります。


## ClickHouseでのKerberosの有効化 {#enabling-kerberos-in-clickhouse}

Kerberosを有効にするには、`config.xml`に`kerberos`セクションを含める必要があります。このセクションには追加のパラメーターを含めることができます。

#### パラメーター: {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得して使用される標準的なサービスプリンシパル名。
    - このパラメーターはオプションで、省略した場合はデフォルトのプリンシパルが使用されます。

- `realm` - 認証を、イニシエーターのレルムが一致するリクエストのみに制限するために使用されるレルム。
    - このパラメーターはオプションで、省略した場合はレルムによる追加のフィルタリングは適用されません。

- `keytab` - サービスキーのkeytabファイルへのパス。
    - このパラメーターはオプションで、省略した場合は`KRB5_KTNAME`環境変数にサービスキーのkeytabファイルへのパスを設定する必要があります。

例（`config.xml`に入れる）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパル指定を含める場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングを含める場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos`セクションは1つだけ定義できます。複数の`kerberos`セクションが存在する場合、ClickHouseはKerberos認証を無効にします。
:::

:::note
`principal`と`realm`セクションは同時に指定できません。両方の`principal`と`realm`セクションが存在する場合、ClickHouseはKerberos認証を無効にします。
:::

## 既存のユーザーの外部認証機関としてのKerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberosは、ローカルで定義されたユーザー（`users.xml`で定義されたユーザーまたはローカルアクセス制御パス内のユーザー）のアイデンティティを確認する方法として使用できます。現在、**HTTPインターフェースを介したリクエストのみが*kerberized*（GSS-SPNEGOメカニズムを介して）することができます**。

Kerberosプリンシパル名のフォーマットは通常、以下のパターンに従います：

- *primary/instance@REALM*

この*/instance*部分はゼロ回以上 occurする場合があります。**イニシエーターの標準的なプリンシパル名の*primary*部分は、認証が成功するためにkerberizedユーザー名と一致することが期待されます**。

### `users.xml`でのKerberosの有効化 {#enabling-kerberos-in-users-xml}

ユーザーのためにKerberos認証を有効にするには、ユーザー定義の中で`password`などのセクションの代わりに`kerberos`セクションを指定します。

パラメーター:

- `realm` - 認証をイニシエーターのレルムが一致するリクエストのみに制限するために使用されるレルム。
    - このパラメーターはオプションで、省略した場合はレルムによる追加のフィルタリングは適用されません。

例（`users.xml`に入れる）:

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
Kerberos認証は、他の認証メカニズムと併用できません。`kerberos`と並んで`password`などの他のセクションが存在する場合、ClickHouseはシャットダウンします。
:::

:::info リマインダー
ユーザー`my_user`が`kerberos`を使用している場合、Kerberosは前述のように主要な`config.xml`ファイルで有効にする必要があることに注意してください。
:::

### SQLを使用したKerberosの有効化 {#enabling-kerberos-using-sql}

[SQL駆動のアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)がClickHouseで有効になっている場合、Kerberosによって識別されるユーザーもSQLステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...または、レルムによるフィルタリングなしで:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
