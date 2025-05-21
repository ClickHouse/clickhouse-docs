---
description: '適切に設定された既存の ClickHouse ユーザーは Kerberos 認証プロトコルを介して認証されることができます。'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

適切に設定された既存の ClickHouse ユーザーは Kerberos 認証プロトコルを介して認証されることができます。

現在、Kerberos は `users.xml` 内またはローカルアクセス制御パス内に定義されている既存のユーザーの外部認証機関としてのみ使用できます。これらのユーザーは HTTP リクエストのみを使用でき、GSS-SPNEGO メカニズムを使用して認証できる必要があります。

このアプローチでは、Kerberos をシステムに設定し、ClickHouse の設定で有効にする必要があります。

## ClickHouse での Kerberos の有効化 {#enabling-kerberos-in-clickhouse}

Kerberos を有効にするには、`config.xml` に `kerberos` セクションを含める必要があります。このセクションには追加のパラメータを含めることができます。

#### パラメータ: {#parameters}

- `principal` - セキュリティコンテキストを受け入れる際に取得され使用される標準サービスプリンシパル名。
    - このパラメータはオプションであり、省略した場合はデフォルトのプリンシパルが使用されます。

- `realm` - 認証を、その発信者のレルムが一致するリクエストに制限するために使用されるレルム。
    - このパラメータはオプションであり、省略した場合はレルムによる追加のフィルタリングは適用されません。

- `keytab` - サービスキータブファイルへのパス。
    - このパラメータはオプションであり、省略した場合は `KRB5_KTNAME` 環境変数にサービスキータブファイルのパスを設定する必要があります。

例（`config.xml` に記載）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパルの指定を含む例:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリングを含む例:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` セクションは1つのみ定義できます。複数の `kerberos` セクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

:::note
`principal` と `realm` セクションは同時に指定できません。両方のセクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

## 既存ユーザーのための外部認証機関としての Kerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos はローカルに定義されたユーザー ( `users.xml` 内またはローカルアクセス制御パス内に定義されたユーザー) の身元を検証する手段として使用できます。現在、**HTTP インターフェース**を介したリクエストのみが *kerberized* できます（GSS-SPNEGO メカニズムを介して）。

Kerberos プリンシパル名の形式は通常次のパターンに従います：

- *primary/instance@REALM*

*/instance* 部分は0回以上発生する可能性があります。**認証が成功するためには、発信者の標準プリンシパル名の *primary* 部分が認証に必要な kerberized ユーザー名と一致することが期待されます。**

### `users.xml` での Kerberos の有効化 {#enabling-kerberos-in-users-xml}

ユーザーの Kerberos 認証を有効にするには、ユーザー定義の中で `password` や類似のセクションの代わりに `kerberos` セクションを指定します。

パラメータ：

- `realm` - 認証を、その発信者のレルムが一致するリクエストに制限するために使用されるレルム。
    - このパラメータはオプションであり、省略した場合はレルムによる追加のフィルタリングは適用されません。

例（`users.xml` に記載）:

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
Kerberos 認証は他の認証メカニズムと同時に使用できません。`password` などの他のセクションが `kerberos` と共に存在する場合、ClickHouse はシャットダウンします。
:::

:::info リマインダー
注意してください。今、ユーザー `my_user` が `kerberos` を使用すると、Kerberos は以前に説明したようにメインの `config.xml` ファイルで有効にする必要があります。
:::

### SQL を使用した Kerberos の有効化 {#enabling-kerberos-using-sql}

ClickHouse で [SQL駆動型アクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効になっている場合、Kerberos で識別されたユーザーは SQL ステートメントを使用して作成することもできます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...または、レルムによるフィルタリングなしで：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
