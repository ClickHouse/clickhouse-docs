---
description: 'ClickHouse の LDAP 認証を設定するためのガイド'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP サーバーは ClickHouse ユーザーの認証に使用できます。これを行う方法は 2 つあります。

* `users.xml` やローカルのアクセス制御パスで定義されている既存ユーザーに対する外部認証手段として LDAP を使用する。
* LDAP を外部ユーザーディレクトリとして使用し、LDAP サーバー上に存在する場合にはローカルで未定義のユーザーの認証を許可する。

これら 2 つのアプローチのいずれにおいても、ClickHouse の設定内で内部名を持つ LDAP サーバーを定義し、設定の他の箇所からそれを参照できるようにする必要があります。

## LDAP サーバーの定義 \{#ldap-server-definition\}

LDAP サーバーを定義するには、`config.xml` に `ldap_servers` セクションを追加する必要があります。

**例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- Typical LDAP server. -->
        <my_ldap_server>
            <host>localhost</host>
            <port>636</port>
            <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
            <verification_cooldown>300</verification_cooldown>
            <follow_referrals>false</follow_referrals>
            <enable_tls>yes</enable_tls>
            <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
            <tls_require_cert>demand</tls_require_cert>
            <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
            <tls_key_file>/path/to/tls_key_file</tls_key_file>
            <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
            <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
            <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
        </my_ldap_server>

        <!- Typical Active Directory with configured user DN detection for further role mapping. -->
        <my_ad_server>
            <host>localhost</host>
            <port>389</port>
            <bind_dn>EXAMPLE\{user_name}</bind_dn>
            <user_dn_detection>
                <base_dn>CN=Users,DC=example,DC=com</base_dn>
                <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
            </user_dn_detection>
            <enable_tls>no</enable_tls>
        </my_ad_server>
    </ldap_servers>
</clickhouse>
```

なお、`ldap_servers` セクション内には、異なる名前を付けることで複数の LDAP サーバーを定義できます。

**パラメータ**

| パラメータ                          | デフォルト         | 説明                                                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                         | —             | LDAP サーバーのホスト名または IP アドレス。このパラメータは必須であり、空にすることはできません。                                                                                                                                                                                                                                         |
| `port`                         | `636` / `389` | LDAP サーバーのポート。`enable_tls` が `yes` に設定されている場合のデフォルトは `636`、それ以外の場合は `389` です。                                                                                                                                                                                                                 |
| `bind_dn`                      | —             | バインドに使用する DN を構築するためのテンプレートです。生成される DN は、認証の試行ごとに、テンプレート内のすべての `{user_name}` 部分文字列を実際のユーザー名に置き換えて構築されます。                                                                                                                                                                                      |
| `auth_dn_prefix`               | —             | **非推奨。** `bind_dn` の代替です。`bind_dn` と同時に使用することはできません。指定した場合、バインド DN は `auth_dn_prefix + {user_name} + auth_dn_suffix` として構築されます。たとえば、`auth_dn_prefix` を `uid=`、`auth_dn_suffix` を `,ou=users,dc=example,dc=com` に設定することは、`bind_dn` を `uid={user_name},ou=users,dc=example,dc=com` に設定するのと同じです。 |
| `auth_dn_suffix`               | —             | **非推奨。** `auth_dn_prefix` を参照してください。                                                                                                                                                                                                                                                          |
| `verification_cooldown`        | `0`           | バインドの成功後、後続のすべてのリクエストについて LDAP サーバーに問い合わせることなく、ユーザーが認証済みとみなされる期間 (秒単位) です。キャッシュを無効にし、各認証リクエストで LDAP サーバーに必ず問い合わせるには、`0` を指定します。                                                                                                                                                               |
| `follow_referrals`             | `false`       | サーバーから返された LDAP リファラルを LDAP クライアントライブラリが自動的に追跡することを許可するフラグです。主に Microsoft Active Directory 環境で関係し、高位のベース DN (例: `DC=example,DC=com`) に対するサブツリー検索で、リファラルや検索参照 (例: `DC=DomainDnsZones,...`) が返される場合があります。パーティションをまたぐ検索が明示的に必要な場合にのみ `true` に設定してください。                                           |
| `enable_tls`                   | `yes`         | LDAP サーバーへのセキュア接続の使用を有効にするフラグです。平文の `ldap://` プロトコルを使用する場合は `no` (非推奨) 、SSL/TLS 上の LDAP である `ldaps://` プロトコルを使用する場合は `yes` (推奨) 、従来の StartTLS プロトコルを使用する場合は `starttls` (平文の `ldap://` 接続を TLS にアップグレード) を指定します。                                                                               |
| `tls_minimum_protocol_version` | `tls1.2`      | SSL/TLS の最小プロトコルバージョンです。指定可能な値: `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`。                                                                                                                                                                                                                     |
| `tls_require_cert`             | `demand`      | SSL/TLS ピア証明書の検証動作です。指定可能な値: `never`、`allow`、`try`、`demand`。                                                                                                                                                                                                                                  |
| `tls_cert_file`                | —             | 証明書ファイルへのパス。                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | —             | 証明書の鍵ファイルへのパス。                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_file`             | —             | CA 証明書ファイルへのパス。                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | —             | CA 証明書を含むディレクトリへのパス。                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | —             | 使用を許可する暗号スイート (OpenSSL 表記) 。                                                                                                                                                                                                                                                                  |
| `search_limit`                 | `256`         | このサーバー定義で実行される LDAP 検索クエリ (ユーザー DN の検出およびロールマッピング) によって返されるエントリの最大数。                                                                                                                                                                                                                          |

**`user_dn_detection` サブパラメータ**

バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータのセクションです。これは主に、サーバーが Active Directory の場合に、後続のロールマッピング用検索フィルタで使用されます。生成されたユーザー DN は、使用可能な箇所で `{user_dn}` 部分文字列を置き換える際に使われます。デフォルトではユーザー DN はバインド DN と同じ値に設定されますが、検索が実行されると、実際に検出されたユーザー DN の値に更新されます。

| パラメータ           | デフォルト     | 説明                                                                                                                                                                                        |
| --------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | —         | LDAP 検索用のベース DN を構築するためのテンプレートです。生成される DN は、LDAP 検索中にテンプレート内のすべての `{user_name}` および `{bind_dn}` 部分文字列を、実際のユーザー名とバインド DN に置き換えて構築されます。                                                     |
| `scope`         | `subtree` | LDAP 検索のスコープです。指定可能な値: `base`、`one_level`、`children`、`subtree`。                                                                                                                           |
| `search_filter` | —         | LDAP 検索用の検索フィルタを構築するためのテンプレートです。生成されるフィルタは、LDAP 検索中にテンプレート内のすべての `{user_name}`、`{bind_dn}`、`{base_dn}` 部分文字列を、実際のユーザー名、バインド DN、ベース DN に置き換えて構築されます。特殊文字は XML 内で適切にエスケープする必要がある点に注意してください。 |

## LDAP 外部認証 \{#ldap-external-authenticator\}

リモートの LDAP サーバーを、ローカルで定義されたユーザー (`users.xml` またはローカルのアクセス制御パスで定義されたユーザー) のパスワード検証方法として使用できます。これを行うには、ユーザー定義内で `password` などのセクションの代わりに、事前に定義した LDAP サーバー名を指定します。

ログインのたびに、ClickHouse は [LDAP サーバー定義](#ldap-server-definition) で `bind_dn` パラータにより定義された DN に対して、提供された認証情報を用いて「バインド」を試み、成功した場合、そのユーザーは認証済みと見なされます。これは一般的に「シンプルバインド」方式と呼ばれます。

**例**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

ユーザー `my_user` は `my_ldap_server` を参照している点に注意してください。この LDAP サーバーは、前述のとおりメインの `config.xml` ファイルで設定されている必要があります。

SQL 駆動の[アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効な場合、LDAP サーバーで認証されるユーザーも [CREATE USER](/sql-reference/statements/create/user) ステートメントを使用して作成できます。

クエリ:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部ユーザーディレクトリ \{#ldap-external-user-directory\}

ローカルで定義されたユーザーに加えて、リモートの LDAP サーバーをユーザー定義のソースとして使用できます。これを行うには、`config.xml` ファイルの `users_directories` セクション内の `ldap` セクションで、事前に定義した LDAP サーバー名 ([LDAP Server Definition](#ldap-server-definition) を参照) を指定します。

各ログイン時に、ClickHouse はまずローカルでユーザー定義を検索し、通常どおり認証を試みます。ユーザーが定義されていない場合、ClickHouse は外部 LDAP ディレクトリ内にその定義が存在するとみなし、指定された DN に対して、与えられた認証情報を用いて LDAP サーバーへの「バインド」を試行します。成功した場合、そのユーザーは存在し、認証済みであると見なされます。ユーザーには、`roles` セクションで指定されたリストからロールが割り当てられます。さらに、`role_mapping` セクションも構成されている場合、LDAP の「search」を実行し、その結果を変換してロール名として扱い、ユーザーに割り当てることができます。これらすべては、SQL 駆動の [Access Control and Account Management](/operations/access-rights#access-control-usage) が有効であり、ロールが [CREATE ROLE](/sql-reference/statements/create/role) ステートメントを使用して作成されていることを前提としています。

**例**

`config.xml` に記述します。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- Typical LDAP server. -->
        <ldap>
            <server>my_ldap_server</server>
            <roles>
                <my_local_role1 />
                <my_local_role2 />
            </roles>
            <role_mapping>
                <base_dn>ou=groups,dc=example,dc=com</base_dn>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=groupOfNames)(member={bind_dn}))</search_filter>
                <attribute>cn</attribute>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>

        <!- Typical Active Directory with role mapping that relies on the detected user DN. -->
        <ldap>
            <server>my_ad_server</server>
            <role_mapping>
                <base_dn>CN=Users,DC=example,DC=com</base_dn>
                <attribute>CN</attribute>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=group)(member={user_dn}))</search_filter>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>
    </user_directories>
</clickhouse>
```

`user_directories` セクション内の `ldap` セクションで参照されている `my_ldap_server` は、事前に `config.xml` 内で定義・設定されている LDAP サーバーでなければなりません ([LDAP Server Definition](#ldap-server-definition) を参照) 。

**パラメータ**

| パラメータ    | デフォルト | 説明                                                                                                                              |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| `server` | —     | 上記の `ldap_servers` config セクションで定義されている LDAP サーバー名の 1 つです。このパラメータは必須であり、空にすることはできません。                                           |
| `roles`  | —     | LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルで定義されたロールのリストを含むセクションです。ここでロールが指定されておらず、またロールマッピング (以下) でも割り当てられない場合、ユーザーは認証後にいかなる操作も実行できません。 |

**`role_mapping` サブパラメータ**

LDAP 検索パラメータとマッピングルールを含むセクションです。ユーザーが認証されると、LDAP にバインドされたままの状態で、`search_filter` とログインしたユーザー名を使用して LDAP 検索が実行されます。その検索で見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値では、そのプレフィックスが削除され、残りの値が ClickHouse で定義されたローカルロール名になります。このロールは、事前に [CREATE ROLE](/sql-reference/statements/create/role) 文によって作成されていることが想定されます。同じ `ldap` セクション内に複数の `role_mapping` セクションを定義できます。それらはすべて適用されます。

| パラメータ           | デフォルト     | 説明                                                                                                                                                                                                                    |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | —         | LDAP 検索のベース DN を構築するために使用する Template。結果の DN は、LDAP 検索のたびに、テンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}` の各部分文字列を実際のユーザー名、bind DN、user DN に置き換えて構築されます。                                                               |
| `scope`         | `subtree` | LDAP 検索のスコープ。指定可能な値: `base`、`one_level`、`children`、`subtree`。                                                                                                                                                         |
| `search_filter` | —         | LDAP 検索の検索フィルタリングを構築するために使用する Template。結果のフィルタリングは、LDAP 検索のたびに、テンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}`、`{base_dn}` の各部分文字列を実際のユーザー名、bind DN、user DN、base DN に置き換えて構築されます。XML では特殊文字を適切にエスケープする必要がある点に注意してください。 |
| `attribute`     | `cn`      | LDAP 検索で値が返される属性名。                                                                                                                                                                                                    |
| `prefix`        | 空         | LDAP 検索で返される元の文字列リスト内の各文字列の先頭に付くことが想定されるプレフィックス。このプレフィックスは元の文字列から削除され、結果の文字列はローカルロール名として扱われます。                                                                                                                        |