---
'description': 'ClickHouseのためのLDAP認証を設定するガイド'
'slug': '/operations/external-authenticators/ldap'
'title': 'LDAP'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAPサーバーはClickHouseユーザーを認証するために使用できます。これを行うための二つの異なるアプローチがあります：

- `users.xml`内やローカルアクセス制御パスで定義された既存のユーザーのためにLDAPを外部認証機関として使用する。
- LDAPを外部ユーザーディレクトリとして使用し、LDAPサーバーに存在する場合にはローカルに未定義のユーザーを認証を許可する。

これらのアプローチの両方において、他の設定部分が参照できるように、ClickHouseの設定内に内部名義のLDAPサーバーを定義する必要があります。

## LDAPサーバーの定義 {#ldap-server-definition}

LDAPサーバーを定義するには、`config.xml`に`ldap_servers`セクションを追加します。

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

注意：`ldap_servers`セクションの中に異なる名前を使用して複数のLDAPサーバーを定義することができます。

**パラメータ**

- `host` — LDAPサーバーのホスト名またはIP。これは必須パラメータであり、空にはできません。
- `port` — LDAPサーバーポート。`enable_tls`が`true`の場合、デフォルトは`636`、それ以外の場合は`389`です。
- `bind_dn` — バインドに使用されるDNを構築するためのテンプレート。
  - 結果として得られるDNは、各認証試行時にテンプレートのすべての`{user_name}`サブストリングを実際のユーザー名で置き換えることによって構築されます。
- `user_dn_detection` — バウンドユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータを含むセクション。
  - これは主に、サーバーがActive Directoryの場合のさらなるロールマッピングのための検索フィルターで使用されます。結果として得られるユーザーDNは、`{user_dn}`サブストリングが許可される場所で置き換えに使用されます。デフォルトではユーザーDNはバインドDNと等しく設定されますが、検索が行われると、実際に検出されたユーザーDN値で更新されます。
    - `base_dn` — LDAP検索のためのベースDNを構築するためのテンプレート。
      - 結果として得られるDNは、LDAP検索中にテンプレートのすべての`{user_name}`および`{bind_dn}`サブストリングを実際のユーザー名とバインドDNで置き換えることによって構築されます。
    - `scope` — LDAP検索のスコープ。
      - 許可される値は：`base`、`one_level`、`children`、`subtree`（デフォルト）。
    - `search_filter` — LDAP検索のための検索フィルターを構築するためのテンプレート。
      - 結果として得られるフィルターは、LDAP検索中にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{base_dn}`サブストリングを実際のユーザー名、バインドDN、ベースDNで置き換えることによって構築されます。
      - 特殊文字はXML内で適切にエスケープする必要があります。
- `verification_cooldown` — 成功したバインド試行の後、LDAPサーバーに連絡することなく、連続するすべてのリクエストに対してユーザーが正常に認証されたと見なされる時間（秒）です。
  - キャッシュを無効にし、各認証リクエストのためにLDAPサーバーへの接触を強制するには、`0`（デフォルト）を指定します。
- `enable_tls` — LDAPサーバーへの安全な接続の使用をトリガーするフラグ。
  - プレーンテキスト`ldap://`プロトコルの場合、`no`を指定します（推奨されません）。
  - SSL/TLS `ldaps://`プロトコルの場合、`yes`を指定します（推奨、デフォルト）。
  - レガシーのStartTLSプロトコルの場合、`starttls`を指定します（プレーンテキスト`ldap://`プロトコル、TLSにアップグレードされます）。
- `tls_minimum_protocol_version` — SSL/TLSの最小プロトコルバージョン。
  - 許可される値は：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（デフォルト）。
- `tls_require_cert` — SSL/TLSピア証明書の検証動作。
  - 許可される値は：`never`、`allow`、`try`、`demand`（デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書キーのファイルへのパス。
- `tls_ca_cert_file` — CA証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA証明書を含むディレクトリへのパス。
- `tls_cipher_suite` — 許可される暗号スイート（OpenSSL表記）。

## LDAP外部認証機関 {#ldap-external-authenticator}

リモートLDAPサーバーを、ローカルで定義されたユーザー（`users.xml`内またはローカルアクセス制御パスで定義されたユーザー）のパスワードを検証する方法として使用できます。これを達成するためには、ユーザー定義内の`password`または類似のセクションの代わりに、以前に定義されたLDAPサーバー名を指定します。

各ログイン試行時に、ClickHouseは[LDAPサーバーの定義](#ldap-server-definition)内の`bind_dn`パラメータで定義された指定されたDNにバインドを試み、提供された資格情報でバインドが成功した場合、そのユーザーは認証されたと見なされます。これはしばしば「シンプルバインド」メソッドと呼ばれます。

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

注意：ユーザー`my_user`は`my_ldap_server`を参照しています。このLDAPサーバーは、前述のように`config.xml`のメインファイルに設定されている必要があります。

SQL駆動の[アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、LDAPサーバーによって認証されたユーザーも[CREATE USER](/sql-reference/statements/create/user)ステートメントを使用して作成できます。

クエリ：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルで定義されたユーザーに加えて、リモートLDAPサーバーをユーーデフィニションのソースとして使用できます。これを達成するためには、`config.xml`の`users_directories`セクション内の`ldap`セクションに以前に定義されたLDAPサーバー名（[LDAPサーバーの定義](#ldap-server-definition)を参照）を指定します。

各ログイン試行時に、ClickHouseは通常通りにローカルでユーーデフィニションを探し認証を試みます。ユーザーが未定義の場合、ClickHouseはその定義が外部LDAPディレクトリに存在すると仮定し、提供された資格情報でLDAPサーバーの指定されたDNにバインドを試みます。成功した場合、そのユーザーは存在し、認証されたと見なされます。ユーザーには`roles`セクションで指定されたリストからロールが割り当てられます。さらに、LDAPの「検索」を実行し、結果をロール名として変換してユーザーに割り当てることができます。これには`role_mapping`セクションも構成されている必要があります。すべては、SQL駆動の[アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効であり、ロールが[CREATE ROLE](/sql-reference/statements/create/role)ステートメントを使用して作成されることを前提としています。

**例**

`config.xml`に配置します。

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

`user_directories`セクション内の`ldap`セクションで参照されている`my_ldap_server`は、`config.xml`で設定された以前に定義されたLDAPサーバーである必要があります（[LDAPサーバーの定義](#ldap-server-definition)を参照）。

**パラメータ**

- `server` — 上述の`ldap_servers`設定セクションで定義されたLDAPサーバー名の一つ。このパラメータは必須であり、空にはできません。
- `roles` — LDAPサーバーから取得される各ユーザーに割り当てられるローカルで定義されたロールのリストを持つセクション。
  - ここでロールが指定されていない場合、またはロールマッピング中に割り当てられない場合、ユーザーは認証後に何のアクションも実行できません。
- `role_mapping` — LDAP検索パラメータとマッピングルールを含むセクション。
  - ユーザーが認証する際、依然としてLDAPにバインドされた状態で、`search_filter`とログインユーザーの名前を使用してLDAP検索が行われます。その検索中に見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ属性値ごとに、プレフィックスが元の文字列から削除され、残りの値がClickHouseで定義されたローカルロールの名前になります。このロールは事前に[CREATE ROLE](/sql-reference/statements/create/role)ステートメントによって作成されることが期待されます。
  - 同じ`ldap`セクション内に複数の`role_mapping`セクションを定義することができます。すべてが適用されます。
    - `base_dn` — LDAP検索のためのベースDNを構築するためのテンプレート。
      - 結果として得られるDNは、各LDAP検索時にテンプレートのすべての`{user_name}`、`{bind_dn}`、および`{user_dn}`サブストリングを実際のユーザー名、バインドDN、およびユーザーDNで置き換えて構築されます。
    - `scope` — LDAP検索のスコープ。
      - 許可される値は：`base`、`one_level`、`children`、`subtree`（デフォルト）。
    - `search_filter` — LDAP検索のための検索フィルターを構築するためのテンプレート。
      - 結果として得られるフィルターは、各LDAP検索時にテンプレートのすべての`{user_name}`、`{bind_dn}`、`{user_dn}`、および`{base_dn}`サブストリングを実際のユーザー名、バインドDN、ユーザーDN、ベースDNで置き換えることによって構築されます。
      - 特殊文字はXML内で適切にエスケープする必要があります。
    - `attribute` — LDAP検索によって返される値の属性名。デフォルトは`cn`です。
    - `prefix` — LDAP検索によって返される元の文字列リストの各文字列の前に期待されるプレフィックス。プレフィックスは元の文字列から削除され、結果的に得られる文字列はローカルロール名として扱われます。デフォルトでは空です。
