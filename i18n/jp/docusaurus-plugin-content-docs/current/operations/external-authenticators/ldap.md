---
description: 'ClickHouse 用 LDAP 認証の設定ガイド'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP サーバーは ClickHouse ユーザーの認証に使用できます。これを行うためには二つの異なるアプローチがあります：

- `users.xml` またはローカルアクセス制御パスで定義された既存のユーザーに対する外部認証者として LDAP を使用する。
- LDAP を外部ユーザーディレクトリとして使用し、LDAP サーバーに存在する場合はローカルで未定義のユーザーを認証できるようにする。

これらのアプローチの両方において、他の設定部分が参照できるように ClickHouse 設定に内部名付き LDAP サーバーを定義する必要があります。

## LDAP サーバーの定義 {#ldap-server-definition}

LDAP サーバーを定義するには、`config.xml` に `ldap_servers` セクションを追加する必要があります。

**例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- 一般的な LDAP サーバー。 -->
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

        <!- 一般的な Active Directory で、役割マッピングのためにユーザー DN の検出を設定。 -->
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

注意: `ldap_servers` セクション内に異なる名前を使用して複数の LDAP サーバーを定義することができます。

**パラメータ**

- `host` — LDAP サーバーのホスト名または IP、このパラメータは必須であり、空にすることはできません。
- `port` — LDAP サーバーのポート、`enable_tls` が `true` に設定されている場合はデフォルトで `636`、そうでなければ `389` です。
- `bind_dn` — バインドに使用する DN を構築するためのテンプレート。
    - 結果の DN は、各認証試行の際にテンプレート内のすべての `{user_name}` サブストリングを実際のユーザー名に置き換えることによって構築されます。
- `user_dn_detection` — バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。
    - これは主に、サーバーが Active Directory の場合の役割マッピングのための検索フィルタで使用されます。結果のユーザー DN は、許可されている場所では `{user_dn}` のサブストリングを置き換える際に使用されます。デフォルトでは、ユーザー DN はバインド DN と等しく設定されますが、一度検索が行われると、実際に検出されたユーザー DN 値に更新されます。
        - `base_dn` — LDAP 検索のためのベース DN を構築するためのテンプレート。
            - 結果の DN は、LDAP 検索の際にテンプレート内のすべての `{user_name}` と `{bind_dn}` サブストリングを実際のユーザー名とバインド DN に置き換えることによって構築されます。
        - `scope` — LDAP 検索のスコープ。
            - 受け入れられる値は: `base`, `one_level`, `children`, `subtree`（デフォルト）。
        - `search_filter` — LDAP 検索のための検索フィルタを構築するためのテンプレート。
            - 結果のフィルタは、LDAP 検索の際にテンプレート内のすべての `{user_name}`、`{bind_dn}`、`{base_dn}` サブストリングを実際のユーザー名、バインド DN、およびベース DN に置き換えることによって構築されます。
            - 注意: 特殊文字は XML で正しくエスケープする必要があります。
- `verification_cooldown` — 成功したバインド試行の後、LDAP サーバーに連絡することなくすべての連続リクエストに対してユーザーが正常に認証されていると見なされる秒数の期間。
    - キャッシュを無効にし、各認証リクエストごとに LDAP サーバーに連絡するよう強制するために `0`（デフォルト）を指定します。
- `enable_tls` — LDAP サーバーへの安全な接続の使用をトリガーするフラグ。
    - プレーンテキスト `ldap://` プロトコルのために `no` を指定します（推奨されません）。
    - LDAP over SSL/TLS `ldaps://` プロトコルのために `yes` を指定します（推奨、デフォルト）。
    - レガシー StartTLS プロトコルのために `starttls` を指定します（プレーンテキスト `ldap://` プロトコルを TLS にアップグレード）。
- `tls_minimum_protocol_version` — SSL/TLS の最小プロトコルバージョン。
    - 受け入れられる値は: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。
- `tls_require_cert` — SSL/TLS ピア証明書の検証動作。
    - 受け入れられる値は: `never`, `allow`, `try`, `demand`（デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書鍵ファイルへのパス。
- `tls_ca_cert_file` — CA 証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA 証明書を含むディレクトリへのパス。
- `tls_cipher_suite` — 許可された暗号スイート（OpenSSL 表記）。

## LDAP 外部認証者 {#ldap-external-authenticator}

リモート LDAP サーバーを、ローカルで定義されたユーザー（`users.xml` またはローカルアクセス制御パスで定義されたユーザー）のパスワードを確認する手段として使用できます。これを実現するには、`users.xml` でのユーザー定義の `password` や類似のセクションの代わりに、以前に定義した LDAP サーバー名を指定します。

各ログイン試行の際、ClickHouse は [LDAP サーバーの定義](#ldap-server-definition) で指定された `bind_dn` パラメータによって定義された DN に対して、提供された認証情報を使用して「バインド」しようとし、成功した場合、ユーザーは認証されていると見なされます。これは通常「シンプルバインド」方式と呼ばれます。

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

注意: ユーザー `my_user` は `my_ldap_server` を参照しています。この LDAP サーバーは、前述のようにメインの `config.xml` ファイルで設定されている必要があります。

SQL 主導の [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効になっている場合、LDAP サーバーによって認証されたユーザーは、[CREATE USER](/sql-reference/statements/create/user) ステートメントを使用して作成することもできます。

クエリ:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルで定義されたユーザーに加えて、リモート LDAP サーバーをユーーディフィニションのソースとして使用できます。これを実現するには、`config.xml` の `users_directories` セクション内の `ldap` セクションで以前に定義した LDAP サーバー名（[LDAP サーバー定義](#ldap-server-definition)を参照）を指定します。

各ログイン試行の際、ClickHouse はユーザー定義をローカルで探し、通常通りの方法で認証を試みます。ユーザーが定義されていない場合、ClickHouse は定義が外部 LDAP ディレクトリに存在すると想定し、提供された認証情報を使用して指定された DN に「バインド」しようとします。成功した場合、ユーザーは存在し認証されていると見なされます。ユーザーは `roles` セクションで指定されたリストから役割を割り当てられます。さらに、LDAP の「検索」を実行し、結果を変換して役割名として扱い、`role_mapping` セクションも設定されている場合は、ユーザーに割り当てることができます。これには、SQL 主導の [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効になっていて、役割が [CREATE ROLE](/sql-reference/statements/create/role) ステートメントを使用して作成されている必要があります。

**例**

`config.xml` に追加。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- 一般的な LDAP サーバー。 -->
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

        <!- 一般的な Active Directory で、検出されたユーザー DN に依存する役割マッピング。 -->
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

`user_directories` セクション内の `ldap` セクションで参照される `my_ldap_server` は、`config.xml` で設定されている以前に定義された LDAP サーバーである必要があることに注意してください（[LDAP サーバー定義](#ldap-server-definition)を参照）。

**パラメータ**

- `server` — 上記の `ldap_servers` 設定セクションで定義された LDAP サーバー名の一つ。このパラメータは必須であり、空にすることはできません。
- `roles` — LDAP サーバーから取得される各ユーザーに割り当てられるローカルで定義された役割のリストを含むセクション。
    - ここで役割が指定されていないか、役割マッピング中に割り当てられていない場合、ユーザーは認証後に何のアクションも実行できません。
- `role_mapping` — LDAP 検索パラメータとマッピングルールを含むセクション。
    - ユーザーが認証されると、まだ LDAP にバインドされている間、`search_filter` とログインしているユーザーの名前を使用して LDAP 検索が行われます。検索中に見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値については、プレフィックスが削除され、残りの値が ClickHouse で定義されたローカル役割の名前として扱われます。この役割は、事前に [CREATE ROLE](/sql-reference/statements/create/role) ステートメントを使用して作成されている必要があります。
    - 同じ `ldap` セクション内に複数の `role_mapping` セクションを定義できます。すべてが適用されます。
        - `base_dn` — LDAP 検索のためのベース DN を構築するためのテンプレート。
            - 結果の DN は、各 LDAP 検索の際にテンプレート内の全ての `{user_name}`、`{bind_dn}`、`{user_dn}` サブストリングを実際のユーザー名、バインド DN、およびユーザー DN に置き換えることによって構築されます。
        - `scope` — LDAP 検索のスコープ。
            - 受け入れられる値は: `base`, `one_level`, `children`, `subtree`（デフォルト）。
        - `search_filter` — LDAP 検索のための検索フィルタを構築するためのテンプレート。
            - 結果のフィルタは、各 LDAP 検索の際にテンプレート内のすべての `{user_name}`、`{bind_dn}`、`{user_dn}`、および `{base_dn}` サブストリングを実際のユーザー名、バインド DN、ユーザー DN、およびベース DN に置き換えることによって構築されます。
            - 注意: 特殊文字は XML で正しくエスケープする必要があります。
        - `attribute` — LDAP 検索によって返される値の属性名。デフォルトでは `cn`。
        - `prefix` — LDAP 検索から返された元の文字列リストの各文字列の前に期待されるプレフィックス。デフォルトでは空です。

