---
description: '既存の ClickHouse ユーザーが適切に構成されている場合、Kerberos 認証プロトコルで認証できます。'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Kerberos \{#kerberos\}

<SelfManaged />

既存の適切に設定された ClickHouse ユーザーは、Kerberos 認証プロトコルを使用して認証できます。

現在、Kerberos は `users.xml` またはローカルのアクセス制御パスで定義されている既存ユーザーに対する外部認証器としてのみ使用できます。これらのユーザーは HTTP リクエストのみを使用でき、かつ GSS-SPNEGO メカニズムを用いて認証できる必要があります。

この方式を利用するには、システム側で Kerberos が設定されており、かつ ClickHouse の設定で有効化されている必要があります。

## ClickHouse で Kerberos を有効化する \{#enabling-kerberos-in-clickhouse\}

Kerberos を有効化するには、`config.xml` に `kerberos` セクションを追加する必要があります。このセクションには追加のパラメータを含めることができます。

#### パラメータ \{#parameters\}

* `principal` - セキュリティコンテキストを受け入れる際に取得・使用される正規のサービスプリンシパル名。
  * このパラメータは省略可能で、省略された場合はデフォルトのプリンシパルが使用されます。

* `realm` - 認証を、そのリクエストのイニシエータの realm がこの値と一致するもののみに制限するために使用される realm。
  * このパラメータは省略可能で、省略された場合は realm による追加のフィルタリングは行われません。

* `keytab` - サービスの keytab ファイルへのパス。
  * このパラメータは省略可能で、省略された場合はサービスの keytab ファイルへのパスを `KRB5_KTNAME` 環境変数で指定する必要があります。

例（`config.xml` に記述）:

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

プリンシパルを指定した場合:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

レルムによるフィルタリング：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` セクションは 1 つだけ定義できます。複数の `kerberos` セクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

:::note
`principal` セクションと `realm` セクションは同時に指定できません。`principal` と `realm` の両方のセクションが存在する場合、ClickHouse は Kerberos 認証を無効にします。
:::

## 既存ユーザー向けの外部認証方式としての Kerberos \{#kerberos-as-an-external-authenticator-for-existing-users\}

Kerberos は、ローカルに定義されたユーザー（`users.xml` またはローカルのアクセス制御パスで定義されたユーザー）の認証方法として使用できます。現在のところ、**HTTP インターフェイス経由のリクエストのみ**が（GSS-SPNEGO メカニズムを通じて）*Kerberos 対応*とできます。

Kerberos プリンシパル名の形式は通常、次のパターンに従います。

* *primary/instance@REALM*

*/instance* の部分は 0 回以上出現する可能性があります。**イニシエーターの正規（canonical）なプリンシパル名の *primary* 部分が Kerberos 対応ユーザー名と一致している必要があり、一致した場合にのみ認証が成功します。**

### `users.xml` で Kerberos を有効化する \{#enabling-kerberos-in-users-xml\}

ユーザーに対して Kerberos 認証を有効にするには、ユーザー定義内で `password` などのセクションの代わりに `kerberos` セクションを指定します。

パラメータ:

* `realm` - このレルムと一致するレルムを持つイニシエーターからのリクエストにのみ認証を制限するために使用されるレルム。
  * このパラメータは省略可能で、省略された場合はレルムによる追加フィルタリングは行われません。

例（`users.xml` に記述）:

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
Kerberos 認証は、他の認証メカニズムと同時に使用できない点に注意してください。`kerberos` と同時に `password` などの他のセクションが存在すると、ClickHouse はシャットダウンします。
:::

:::info Reminder
ここで、ユーザー `my_user` が `kerberos` を使用するようになった場合、前述のとおり、メインの `config.xml` ファイルで Kerberos を有効化しておく必要がある点に注意してください。
:::

### SQL を使用した Kerberos の有効化 \{#enabling-kerberos-using-sql\}

ClickHouse で [SQL-driven Access Control and Account Management](/operations/access-rights#access-control-usage) が有効化されている場合、Kerberos で識別されるユーザーも SQL 文を使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

…または、レルムでフィルタリングしない場合：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
