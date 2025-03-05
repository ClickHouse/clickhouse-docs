---
slug: /operations/external-authenticators/ldap
title: "LDAP"
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAPサーバーはClickHouseユーザーの認証に使用できます。これを行うためのアプローチは二つあります。

- `users.xml` またはローカルアクセスポイントに定義された既存のユーザーに対してLDAPを外部認証システムとして使用する。
- LDAPを外部ユーザーディレクトリとして使用し、LDAPサーバーに存在する場合はローカルで定義されていないユーザーを認証できるようにする。

これらのアプローチのいずれにおいても、ClickHouseの設定内で内部名のLDAPサーバーを定義する必要があります。これにより、設定の他の部分で参照できるようになります。

## LDAPサーバーの定義 {#ldap-server-definition}

LDAPサーバーを定義するには、`config.xml`に`ldap_servers`セクションを追加する必要があります。

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

        <!- 構成されたユーザーDN検出により、役割マッピングを行う一般的なActive Directory。 -->
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

`ldap_servers`セクション内では、異なる名前を使用して複数のLDAPサーバーを定義することができます。

**パラメーター**

- `host` — LDAPサーバーのホスト名またはIP。必須で、空にはできません。
- `port` — LDAPサーバーポート。`enable_tls`が`true`に設定されている場合はデフォルトが`636`、それ以外は`389`です。
- `bind_dn` — バインドに使用されるDNを構築するためのテンプレート。
    - 結果として得られるDNは、各認証試行時にテンプレートのすべての`{user_name}`部分文字列を実際のユーザー名に置き換えることで構築されます。
- `user_dn_detection` — バインドされたユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータのセクション。
    - これは主にサーバーがActive Directoryの場合の役割マッピングのための検索フィルターで使用されます。結果として得られるユーザーDNは、`{user_dn}`部分文字列が許可される場所で置き換えられます。デフォルトでは、ユーザーDNはバインドDNと同じに設定されますが、検索が行われると、実際に検出されたユーザーDNの値に更新されます。
        - `base_dn` — LDAP検索のためにbase DNを構築するためのテンプレート。
            - 結果として得られるDNは、LDAP検索時にテンプレートのすべての`{user_name}`および`{bind_dn}`部分文字列を実際のユーザー名とバインドDNに置き換えることで構築されます。
        - `scope` — LDAP検索のスコープ。
            - 受け入れられる値は以下です：`base`, `one_level`, `children`, `subtree`（デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルターを構築するためのテンプレート。
            - 結果として得られるフィルターは、LDAP検索時にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{base_dn}`部分文字列を、実際のユーザー名、バインドDN、およびbase DNに置き換えることで構築されます。
            - 特殊文字はXMLで正しくエスケープする必要があります。
- `verification_cooldown` — 成功したバインド試行の後、ユーザーがLDAPサーバーに接触せず、すべての連続リクエストに対して成功裏に認証されると見なされる時間（秒）です。
    - キャッシュを無効にし、各認証リクエストでLDAPサーバーに接触させるようにするには、`0`（デフォルト）を指定してください。
- `enable_tls` — LDAPサーバーへの安全な接続を使用するためのフラグ。
    - プレーンテキストの `ldap://`プロトコル（推奨されません）には`no`を指定します。
    - SSL/TLS `ldaps://`プロトコル（推奨、デフォルト）には`yes`を指定します。
    - レガシーのStartTLSプロトコル（プレーンテキストの `ldap://`プロトコルからTLSにアップグレード）には`starttls`を指定します。
- `tls_minimum_protocol_version` — SSL/TLSの最小プロトコルバージョン。
    - 受け入れられる値は以下です：`ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。
- `tls_require_cert` — SSL/TLSピア証明書の検証動作。
    - 受け入れられる値は以下です：`never`, `allow`, `try`, `demand`（デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書キーのファイルへのパス。
- `tls_ca_cert_file` — CA証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA証明書が含まれるディレクトリへのパス。
- `tls_cipher_suite` — 許可された暗号スイート（OpenSSL表記で）。

## LDAP外部認証システム {#ldap-external-authenticator}

リモートLDAPサーバーは、ローカルで定義されたユーザー（`users.xml`またはローカルアクセス制御経路に定義されたユーザー）のパスワード確認の手段として使用できます。これを実現するには、ユーザー定義の中で`password`またはそれに類似したセクションの代わりに、事前に定義されたLDAPサーバー名を指定します。

各ログイン試行時に、ClickHouseは`bind_dn`パラメーターで定義された指定されたDNに"バインド"しようとし、提供された認証情報が成功すればユーザーは認証されたと見なされます。これはしばしば"シンプルバインド"メソッドと呼ばれます。

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

ユーザー`my_user`は`my_ldap_server`を参照しています。このLDAPサーバーは、前述のように`config.xml`ファイルのメイン設定で構成されている必要があります。

SQL駆動の [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効な場合、LDAPサーバーによって認証されたユーザーも [CREATE USER](/sql-reference/statements/create/user) ステートメントを使用して作成できます。

クエリ:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルで定義されたユーザーに加えて、リモートLDAPサーバーはユーザー定義のソースとして使用できます。これを実現するには、`config.xml`ファイルの`users_directories`セクション内の`ldap`セクションで事前に定義されたLDAPサーバー名を指定します（[LDAPサーバーの定義](#ldap-server-definition)を参照）。

各ログイン試行時に、ClickHouseはローカルでユーザー定義を検索し、通常通り認証を試みます。ユーザーが定義されていない場合、ClickHouseは外部LDAPディレクトリに定義が存在するものと見なし、提供された認証情報を使用して指定されたDNに"バインド"しようとします。成功すると、ユーザーは存在すると見なされ認証されます。ユーザーは`roles`セクションで指定されたリストから役割を割り当てられます。加えて、LDAP "検索"を実行し、結果を役割名として変換し、`role_mapping`セクションが構成されていればユーザーに割り当てることもできます。これにはSQL駆動の [アクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効であり、役割は [CREATE ROLE](/sql-reference/statements/create/role) ステートメントを使用して作成されている必要があります。

**例**

`config.xml`に入れます。

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

        <!- ユーザーDNの検出に基づく役割マッピングを持つ一般的なActive Directory。 -->
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

`user_directories`セクション内の`ldap`セクションで参照される`my_ldap_server`は、`config.xml`で構成された事前定義されたLDAPサーバーである必要があります（[LDAPサーバーの定義](#ldap-server-definition)を参照）。

**パラメーター**

- `server` — 上記の`ldap_servers`設定セクションで定義されたLDAPサーバー名の一つ。必須で、空にはできません。
- `roles` — LDAPサーバーから取得される各ユーザーに割り当てられるローカルに定義された役割のリストを含むセクション。
    - ここに役割が指定されていない場合や、役割マッピング中に割り当てられない場合、ユーザーは認証後に何のアクションも実行できません。
- `role_mapping` — LDAP検索パラメータおよびマッピングルールを含むセクション。
    - ユーザーが認証される際、LDAPにバインドされている間に、`search_filter`とログインユーザーの名前を使用してLDAP検索が実行されます。その検索中に見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値からプレフィックスが削除され、その残りの値がClickHouseに事前に定義され、作成されていることが期待されるローカル役割の名前になります。
    - 同じ`ldap`セクション内に複数の`role_mapping`セクションを定義することができます。すべてが適用されます。
        - `base_dn` — LDAP検索のためにbase DNを構築するためのテンプレート。
            - 結果として得られるDNは、各LDAP検索時にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{user_dn}`部分文字列を実際のユーザー名、バインドDN、およびユーザーDNに置き換えることで構築されます。
        - `scope` — LDAP検索のスコープ。
            - 受け入れられる値は以下です：`base`, `one_level`, `children`, `subtree`（デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルターを構築するためのテンプレート。
            - 結果として得られるフィルターは、各LDAP検索時にテンプレートのすべての`{user_name}`、`{bind_dn}`、`{user_dn}`、および`{base_dn}`部分文字列を実際のユーザー名、バインドDN、ユーザーDN、およびbase DNに置き換えることで構築されます。
            - 特殊文字はXMLで正しくエスケープする必要があります。
        - `attribute` — LDAP検索によって返される値の属性名。デフォルトは`cn`。
        - `prefix` — LDAP検索によって返される元の文字列リストの各文字列の前に存在することが期待されるプレフィックス。プレフィックスは元の文字列から削除され、結果の文字列はローカル役割名として扱われます。デフォルトでは空です。
