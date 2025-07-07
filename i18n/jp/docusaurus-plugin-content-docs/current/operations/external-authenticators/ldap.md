---
'description': 'Guide to configuring LDAP authentication for ClickHouse'
'slug': '/operations/external-authenticators/ldap'
'title': 'LDAP'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAPサーバーは、ClickHouseユーザーの認証に使用できます。これを行うための2つの異なるアプローチがあります。

- 既存のユーザー（`users.xml`で定義されているものまたはローカルアクセス制御パスに定義されているもの）のためにLDAPを外部認証機構として使用する。
- LDAPを外部ユーザーディレクトリとして使用し、LDAPサーバーに存在する場合にはローカルに定義されていないユーザーの認証を許可する。

これらのアプローチの両方には、ClickHouse構成においてLDAPサーバーを内部名で定義する必要がありますので、ほかの構成部分から参照できるようにします。

## LDAPサーバーの定義 {#ldap-server-definition}

LDAPサーバーを定義するには、`config.xml`に`ldap_servers`セクションを追加します。

**例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- 一般的なLDAPサーバー。 -->
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

        <!- ユーザーDN検出が設定された一般的なActive Directoryで、さらに役割マッピングのため。 -->
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

注意：`ldap_servers`セクション内で複数のLDAPサーバーを異なる名前で定義できます。

**パラメータ**

- `host` — LDAPサーバーのホスト名またはIP。これは必須のパラメータであり、空にすることはできません。
- `port` — LDAPサーバーのポート。`enable_tls`が`true`に設定されている場合はデフォルトで`636`、そうでない場合は`389`です。
- `bind_dn` — バインド用にDNを構築するために使用されるテンプレート。
    - 結果のDNは、各認証試行中にテンプレートのすべての`{user_name}`部分文字列を実際のユーザー名に置き換えることによって構築されます。
- `user_dn_detection` — バウンドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを持つセクション。
    - これは主にサーバーがActive Directoryの場合の役割マッピングのための検索フィルターで使用されます。結果のユーザーDNは、任意の位置で許可される`{user_dn}`部分文字列を置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNと等しく設定されますが、検索が実行されると、実際に検出されたユーザーDNの値に更新されます。
        - `base_dn` — LDAP検索のためのベースDNを構築するために使用されるテンプレート。
            - 結果のDNは、LDAP検索中にテンプレートのすべての`{user_name}`と`{bind_dn}`部分文字列を実際のユーザー名とバインドDNに置き換えることによって構築されます。
        - `scope` — LDAP検索のスコープ。
            - 許可された値は：`base`、`one_level`、`children`、`subtree`（デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルターを構築するために使用されるテンプレート。
            - 結果のフィルターは、LDAP検索中にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{base_dn}`部分文字列を実際のユーザー名、バインドDN、およびベースDNに置き換えることにより構築されます。
            - 特殊文字は、XML内で適切にエスケープされる必要があります。
- `verification_cooldown` — 成功したバインド試行の後、LDAPサーバーに連絡せずにユーザーがすべての連続リクエストに対して成功裏に認証されていると見なされる時間（秒単位）の期間。
    - キャッシュを無効にし、各認証リクエストのためにLDAPサーバーに連絡することを強制するには、`0`（デフォルト）を指定します。
- `enable_tls` — LDAPサーバーへの安全な接続の使用をトリガーするフラグ。
    - プレーンテキストの`ldap://`プロトコル（推奨しません）には`no`を指定します。
    - SSL/TLSのLDAP `ldaps://`プロトコル（推奨、デフォルト）には`yes`を指定します。
    - 従来のStartTLSプロトコル（プレーンテキストの`ldap://`プロトコル、TLSにアップグレード）には`starttls`を指定します。
- `tls_minimum_protocol_version` — SSL/TLSの最小プロトコルバージョン。
    - 許可された値は：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）。
- `tls_require_cert` — SSL/TLSピア証明書の検証動作。
    - 許可された値は：`never`、`allow`、`try`、`demand`（デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書キーファイルへのパス。
- `tls_ca_cert_file` — CA証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA証明書を含むディレクトリへのパス。
- `tls_cipher_suite` — 許可されている暗号スイート（OpenSSL表記で）。

## LDAP外部認証機構 {#ldap-external-authenticator}

リモートLDAPサーバーを、ローカルに定義されたユーザー（`users.xml`で定義されているものまたはローカルアクセス制御パスに定義されているもの）のパスワードを検証する方法として使用できます。これを実現するには、ユーザー定義の`password`や類似のセクションの代わりに、事前に定義されたLDAPサーバー名を指定します。

各ログイン試行時に、ClickHouseはLDAPサーバーの[LDAPサーバーの定義](#ldap-server-definition)で定義された`bind_dn`パラメータによって指定されたDNに"バインド"しようとし、成功すればユーザーが認証されたと見なされます。これを「シンプルバインド」メソッドとも呼びます。

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

注意：ユーザー`my_user`が`my_ldap_server`を参照しています。このLDAPサーバーは、前述のようにメインの`config.xml`ファイルに構成されている必要があります。

SQL駆動の[アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、LDAPサーバーによって認証されたユーザーも[CREATE USER](/sql-reference/statements/create/user)ステートメントを使用して作成できます。

クエリ：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルに定義されたユーザーに加えて、リモートLDAPサーバーをユーーディフィニションのソースとして利用できます。これを実現するには、`config.xml`ファイルの`users_directories`セクション内の`ldap`セクションに事前に定義されたLDAPサーバー名（[LDAPサーバーの定義](#ldap-server-definition)を参照）を指定します。

各ログイン試行時に、ClickHouseはローカルでユーザー定義を見つけて通常通り認証しようとします。ユーザーが定義されていない場合、ClickHouseは外部LDAPディレクトリに定義が存在すると仮定し、提供された資格情報を使用してLDAPサーバーの所定のDNに"バインド"しようとします。成功すれば、ユーザーは存在すると見なされ、認証されます。ユーザーは`roles`セクションに指定されたリストから役割が割り当てられます。さらに、LDAPの"検索"を実行し、結果を変換して役割名として扱い、`role_mapping`セクションも構成されている場合にはユーザーに割り当てることができます。これにはSQL駆動の[アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)が有効になっており、役割は[CREATE ROLE](/sql-reference/statements/create/role)ステートメントを使って作成されることが前提です。

**例**

`config.xml`に入ります。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- 一般的なLDAPサーバー。 -->
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

        <!- ユーザーDNが検出されたときに依存する役割マッピングがある一般的なActive Directory。 -->
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

`user_directories`セクション内の`ldap`セクションで参照されている`my_ldap_server`は、`config.xml`で構成された事前に定義されたLDAPサーバーである必要があることに注意してください（[LDAPサーバーの定義](#ldap-server-definition)を参照）。

**パラメータ**

- `server` — 上記の`ldap_servers`構成セクションに定義されたLDAPサーバー名の1つ。このパラメータは必須であり、空にすることはできません。
- `roles` — LDAPサーバーから取得される各ユーザーに割り当てられるローカルに定義された役割のリストを持つセクション。
    - ここで役割が指定されていない場合、または役割マッピング中に割り当てられない場合、認証後にユーザーは何のアクションも実行できません。
- `role_mapping` — LDAP検索パラメータとマッピングルールを持つセクション。
    - ユーザーが認証されるとき、LDAPにバウンドしている間に、`search_filter`とログインユーザーの名前を使用してLDAP検索が実行されます。その検索中に見つかった各エントリに対して、指定された属性の値が抽出されます。指定された接頭辞を持つ各属性値に対して、接頭辞が元の文字列から削除され、残りの値がClickHouseで定義されたローカル役割の名前になります。ローカル役割は事前に[CREATE ROLE](/sql-reference/statements/create/role)ステートメントによって作成されることが期待されています。
    - 同じ`ldap`セクション内で複数の`role_mapping`セクションが定義されることができます。すべてが適用されます。
        - `base_dn` — LDAP検索のためのベースDNを構築するために使用されるテンプレート。
            - 結果のDNは、各LDAP検索中にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{user_dn}`部分文字列を実際のユーザー名、バインドDN、およびユーザーDNに置き換えることによって構築されます。
        - `scope` — LDAP検索のスコープ。
            - 許可された値は：`base`、`one_level`、`children`、`subtree`（デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルターを構築するために使用されるテンプレート。
            - 結果のフィルターは、各LDAP検索中にテンプレートのすべての`{user_name}`、`{bind_dn}`、`{user_dn}`、および`{base_dn}`部分文字列を実際のユーザー名、バインドDN、ユーザーDN、およびベースDNに置き換えることにより構築されます。
            - 特殊文字は、XML内で適切にエスケープされる必要があります。
        - `attribute` — LDAP検索によって返される値の属性名。デフォルトは`cn`です。
        - `prefix` — LDAP検索によって返される元の文字列リストの各文字列の前にあると期待される接頭辞。接頭辞は元の文字列から削除され、結果の文字列はローカル役割名として扱われます。デフォルトでは空です。
