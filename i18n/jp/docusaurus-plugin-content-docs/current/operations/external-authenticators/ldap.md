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

* `host` — LDAP サーバーのホスト名または IP。このパラメータは必須であり、空にはできません。
* `port` — LDAP サーバーのポート。`enable_tls` が `true` に設定されている場合のデフォルトは `636`、それ以外の場合は `389` です。
* `bind_dn` — バインドに使用する DN を構築するためのテンプレート。
  * 認証が試行されるたびに、このテンプレート内のすべての `{user_name}` 文字列が実際のユーザー名で置き換えられ、最終的な DN が構築されます。
* `user_dn_detection` — バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータのセクション。
  * これは主にサーバーが Active Directory の場合に、追加のロールマッピングのための検索フィルタで使用されます。最終的なユーザー DN は、`{user_dn}` 文字列を許可されている場所で置き換える際に使用されます。デフォルトではユーザー DN は bind DN と同一に設定されますが、検索が実行されると、検出された実際のユーザー DN の値で更新されます。
    * `base_dn` — LDAP 検索用の base DN を構築するために使用されるテンプレート。
      * LDAP 検索中に、このテンプレート内のすべての `{user_name}` および `{bind_dn}` 文字列が実際のユーザー名および bind DN で置き換えられ、最終的な DN が構築されます。
    * `scope` — LDAP 検索のスコープ。
      * 受け付けられる値は `base`、`one_level`、`children`、`subtree`（デフォルト）です。
    * `search_filter` — LDAP 検索用の検索フィルタを構築するために使用されるテンプレート。
      * LDAP 検索中に、このテンプレート内のすべての `{user_name}`、`{bind_dn}`、`{base_dn}` 文字列が、実際のユーザー名、bind DN、base DN で置き換えられ、最終的なフィルタが構築されます。
      * 特殊文字は XML で正しくエスケープする必要がある点に注意してください。
* `verification_cooldown` — バインドが成功した後、この秒数の間は LDAP サーバーに問い合わせることなく、連続するすべてのリクエストについてユーザーが認証済みであるとみなされる期間。
  * キャッシュを無効化し、認証リクエストごとに LDAP サーバーへの問い合わせを強制するには、`0`（デフォルト）を指定します。
* `enable_tls` — LDAP サーバーへのセキュア接続を使用するかどうかを制御するフラグ。
  * プレーンテキストの `ldap://` プロトコル（推奨されません）を使用するには `no` を指定します。
  * SSL/TLS 上の LDAP `ldaps://` プロトコル（推奨、デフォルト）を使用するには `yes` を指定します。
  * レガシーな StartTLS プロトコル（TLS へアップグレードされるプレーンテキストの `ldap://` プロトコル）を使用するには `starttls` を指定します。
* `tls_minimum_protocol_version` — SSL/TLS の最小プロトコルバージョン。
  * 受け付けられる値は `ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）です。
* `tls_require_cert` — SSL/TLS ピア証明書の検証動作。
  * 受け付けられる値は `never`、`allow`、`try`、`demand`（デフォルト）です。
* `tls_cert_file` — 証明書ファイルへのパス。
* `tls_key_file` — 証明書鍵ファイルへのパス。
* `tls_ca_cert_file` — CA 証明書ファイルへのパス。
* `tls_ca_cert_dir` — CA 証明書を含むディレクトリへのパス。
* `tls_cipher_suite` — 許可される暗号スイート（OpenSSL の表記）。

## LDAP 外部認証 \{#ldap-external-authenticator\}

リモートの LDAP サーバーを、ローカルで定義されたユーザー（`users.xml` またはローカルのアクセス制御パスで定義されたユーザー）のパスワード検証方法として使用できます。これを行うには、ユーザー定義内で `password` などのセクションの代わりに、事前に定義した LDAP サーバー名を指定します。

ログインのたびに、ClickHouse は [LDAP サーバー定義](#ldap-server-definition) で `bind_dn` パラメータにより定義された DN に対して、提供された認証情報を用いて「バインド」を試み、成功した場合、そのユーザーは認証済みと見なされます。これは一般的に「シンプルバインド」方式と呼ばれます。

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

ローカルで定義されたユーザーに加えて、リモートの LDAP サーバーをユーザー定義のソースとして使用できます。これを行うには、`config.xml` ファイルの `users_directories` セクション内の `ldap` セクションで、事前に定義した LDAP サーバー名（[LDAP Server Definition](#ldap-server-definition) を参照）を指定します。

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

`user_directories` セクション内の `ldap` セクションで参照されている `my_ldap_server` は、事前に `config.xml` 内で定義・設定されている LDAP サーバーでなければなりません（[LDAP Server Definition](#ldap-server-definition) を参照）。

**パラメータ**

* `server` — 上記の `ldap_servers` 設定セクションで定義されている LDAP サーバー名の 1 つ。このパラメータは必須で、空にはできません。
* `roles` — LDAP サーバーから取得した各ユーザーに割り当てられる、ローカルで定義されたロールの一覧を含むセクション。
  * ここでロールが指定されていない場合、または（下記の）ロールマッピング時にロールが割り当てられない場合、ユーザーは認証後に一切の操作を行うことができません。
* `role_mapping` — LDAP 検索パラメータとマッピングルールを定義するセクション。
  * ユーザーが認証するとき、LDAP にバインドした状態のまま、`search_filter` とログインしたユーザー名を使って LDAP 検索が実行されます。その検索で見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値については、プレフィックスが削除され、その残りの値が ClickHouse 内で定義されたローカルロールの名前になります。このロールはあらかじめ [CREATE ROLE](/sql-reference/statements/create/role) ステートメントで作成されている必要があります。
  * 同じ `ldap` セクション内には複数の `role_mapping` セクションを定義できます。それらはすべて適用されます。
    * `base_dn` — LDAP 検索用のベース DN を構築するために使用されるテンプレート。
      * 実際の DN は、各 LDAP 検索時にテンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}` の各部分文字列を、それぞれ実際のユーザー名、バインド DN、ユーザー DN に置き換えることで構築されます。
    * `scope` — LDAP 検索のスコープ。
      * 指定可能な値は `base`、`one_level`、`children`、`subtree`（デフォルト）です。
    * `search_filter` — LDAP 検索用の検索フィルタを構築するために使用されるテンプレート。
      * 実際のフィルタは、各 LDAP 検索時にテンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}`、`{base_dn}` の各部分文字列を、実際のユーザー名、バインド DN、ユーザー DN、およびベース DN に置き換えることで構築されます。
      * 特殊文字は XML では正しくエスケープする必要があることに注意してください。
    * `attribute` — LDAP 検索によって返される値を持つ属性名。デフォルトは `cn` です。
    * `prefix` — LDAP 検索で返される元の文字列リストの各文字列の先頭に付いていることが期待されるプレフィックス。プレフィックスは元の文字列から削除され、その結果の文字列がローカルロール名として扱われます。デフォルトは空です。
