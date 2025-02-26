---
slug: /operations/external-authenticators/ldap
title: "LDAP"
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAPサーバーはClickHouseユーザーの認証に使用できます。これを行うための2つの異なるアプローチがあります。

- `users.xml` またはローカルアクセス制御パスで定義された既存のユーザーのために、LDAPを外部認証機として使用する。
- LDAPを外部ユーザーディレクトリとして使用し、LDAPサーバーに存在する場合、ローカルに未定義のユーザーを認証できるようにする。

これらのアプローチの両方には、ClickHouseの設定内でLDAPサーバーを内部名で定義する必要があります。これにより、設定の他の部分がそれを参照できるようになります。

## LDAPサーバーの定義 {#ldap-server-definition}

LDAPサーバーを定義するには、`config.xml` に `ldap_servers` セクションを追加する必要があります。

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

        <!- ユーザーDN検出が設定された一般的なActive Directory。 -->
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

`ldap_servers` セクション内に異なる名前を持つ複数のLDAPサーバーを定義することができることに注意してください。

**パラメータ**

- `host` — LDAPサーバーのホスト名またはIP。このパラメータは必須で、空にすることはできません。
- `port` — LDAPサーバーのポート。`enable_tls` が `true` に設定されている場合はデフォルトで `636` 、それ以外の場合は `389` です。
- `bind_dn` — バインドするためのDNを構成する際に使用されるテンプレート。
    - バインドを行う際の認証試行ごとに、テンプレート内のすべての `{user_name}` サブストリングが実際のユーザー名に置き換えられて、結果のDNが構成されます。
- `user_dn_detection` — バインドされたユーザーの実際のユーザーDNを検出するためのLDAP検索パラメータのセクション。
    - これは主に、サーバーがActive Directoryのときのさらなるロールマッピングのために検索フィルターで使用されます。結果のユーザーDNは、許可されている場所で `{user_dn}` サブストリングを置き換える際に使用されます。デフォルトでは、ユーザーDNはバインドDNと同等に設定されますが、検索が行われると、実際に検出されたユーザーDN値で更新されます。
        - `base_dn` — LDAP検索のためのベースDNを構成する際に使用されるテンプレート。
            - 結果のDNは、LDAP検索の際にテンプレート内のすべての `{user_name}` および `{bind_dn}` サブストリングが実際のユーザー名とバインドDNに置き換えられて構成されます。
        - `scope` — LDAP検索のスコープ。
            - 受け入れられる値は: `base`, `one_level`, `children`, `subtree` （デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルタを構成する際に使用されるテンプレート。
            - 結果のフィルタは、LDAP検索の際にテンプレート内のすべての `{user_name}` 、 `{bind_dn}` 、および `{base_dn}` サブストリングが実際のユーザー名、バインドDN、およびベースDNに置き換えられて構成されます。
            - 特殊文字はXML内で適切にエスケープする必要があります。
- `verification_cooldown` — 成功したバインド試行の後、LDAPサーバーに連絡せずにすべての連続リクエストに対してユーザーが成功裏に認証されていると見なされる期間（秒単位）。
    - `0` （デフォルト）を指定すると、キャッシュが無効化され、各認証要求のたびにLDAPサーバーに連絡することが強制されます。
- `enable_tls` — LDAPサーバーへの安全な接続の使用をトリガーするフラグ。
    - 平文の `ldap://` プロトコル（推奨されません）には `no` を指定します。
    - SSL/TLSによるLDAP `ldaps://` プロトコル（推奨、デフォルト）には `yes` を指定します。
    - レガシーのStartTLSプロトコル（平文の `ldap://` プロトコル、TLSにアップグレード）には `starttls` を指定します。
- `tls_minimum_protocol_version` — SSL/TLSの最小プロトコルバージョン。
    - 受け入れられる値は: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` （デフォルト）。
- `tls_require_cert` — SSL/TLSピア証明書の検証の挙動。
    - 受け入れられる値は: `never`, `allow`, `try`, `demand` （デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書キーファイルへのパス。
- `tls_ca_cert_file` — CA証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA証明書を含むディレクトリへのパス。
- `tls_cipher_suite` — 許可される暗号スイート（OpenSSL表記）。

## LDAP外部認証機 {#ldap-external-authenticator}

リモートLDAPサーバーは、ローカルに定義されたユーザー（`users.xml` またはローカルアクセス制御パスで定義されたユーザー）のパスワード検証方法として使用できます。これを実現するためには、ユーザー定義内の `password` または同様のセクションの代わりに、事前に定義されたLDAPサーバー名を指定します。

各ログイン試行の際に、ClickHouseは指定されたDNに「バインド」しようとします。このDNは、前述の [LDAPサーバーの定義](#ldap-server-definition) で定義された `bind_dn` パラメータによって定義され、提供された資格情報を使用してバインドが成功すれば、ユーザーは認証されたと見なされます。これを「シンプルバインド」メソッドと呼ぶことがよくあります。

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

ユーザー `my_user` が `my_ldap_server` を参照していることに注意してください。このLDAPサーバーは、前述の通り、メインの `config.xml` ファイルに構成されている必要があります。

SQL駆動の [アクセス制御とアカウント管理](/guides/sre/user-management/index.md#access-control) が有効になっている場合、LDAPサーバーによって認証されたユーザーも [CREATE USER](/sql-reference/statements/create/user.md#create-user-statement) ステートメントを使用して作成できます。

クエリ:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルに定義されたユーザーに加えて、リモートLDAPサーバーをユーーディフィニションのソースとして使用できます。これを実現するには、`config.xml` の `users_directories` セクション内の `ldap` セクションで、事前に定義したLDAPサーバー名（[LDAPサーバーの定義](#ldap-server-definition)を参照）を指定します。

各ログイン試行の際に、ClickHouseはユーザー定義をローカルに検索し、通常通り認証しようとします。ユーザーが定義されていない場合、ClickHouseは外部LDAPディレクトリに定義が存在するものと見なし、提供された資格情報を使用してLDAPサーバーの指定されたDNに「バインド」しようとします。成功すれば、そのユーザーは存在し、認証されたと見なされます。ユーザーには `roles` セクションで指定されたリストからのロールが割り当てられます。さらに、LDAPの「検索」を実行し、結果を変換してロール名として扱うことができ、`role_mapping` セクションが設定されていればそれもユーザーに割り当てられます。全てこれには、SQL駆動の [アクセス制御とアカウント管理](/guides/sre/user-management/index.md#access-control) が有効であり、ロールが [CREATE ROLE](/sql-reference/statements/create/role.md#create-role-statement) ステートメントを使用して作成されていることが前提です。

**例**

`config.xml` に追加されます。

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

        <!- 一般的なActive Directory、検出されたユーザーDNに基づくロールマッピング。 -->
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

`user_directories` セクション内の `ldap` セクションで参照されている `my_ldap_server` は、`config.xml` で構成されている事前定義されたLDAPサーバーでなければなりません（[LDAPサーバーの定義](#ldap-server-definition)を参照）。

**パラメータ**

- `server` — 上記の `ldap_servers` 設定セクションで定義したLDAPサーバー名の1つ。このパラメータは必須で、空にすることはできません。
- `roles` — LDAPサーバーから取得した各ユーザーに割り当てられるローカルに定義されたロールのリストを含むセクション。
    - ここでロールが指定されていない場合、またはロールマッピング中に割り当てられない場合、認証後にユーザーはアクションを実行できなくなります。
- `role_mapping` — LDAP検索パラメータとマッピングルールのセクション。
    - ユーザーが認証されると、LDAPにバインドされたまま `search_filter` とログインしたユーザー名を使用してLDAP検索が実行されます。その検索で見つかった各エントリについて、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値に対して、プレフィックスは削除され、残りの値はClickHouseで定義されたローカルロールの名前となります。これらは事前に [CREATE ROLE](/sql-reference/statements/create/role.md#create-role-statement) ステートメントによって作成されることが期待されます。
    - 同じ `ldap` セクション内に複数の `role_mapping` セクションを定義することもできます。すべて適用されます。
        - `base_dn` — LDAP検索のためのベースDNを構成する際に使用されるテンプレート。
            - 結果のDNは、各LDAP検索の際にテンプレート内のすべての `{user_name}` 、 `{bind_dn}` 、及び `{user_dn}` サブストリングが実際のユーザー名、バインドDN、及びユーザーDNに置き換えられて構成されます。
        - `scope` — LDAP検索のスコープ。
            - 受け入れられる値は: `base`, `one_level`, `children`, `subtree` （デフォルト）。
        - `search_filter` — LDAP検索のための検索フィルタを構成する際に使用されるテンプレート。
            - 結果のフィルタは、各LDAP検索の際にテンプレート内のすべての `{user_name}` 、 `{bind_dn}` 、 `{user_dn}` 、および `{base_dn}` サブストリングが実際のユーザー名、バインドDN、ユーザーDN、およびベースDNに置き換えられて構成されます。
            - 特殊文字はXML内で適切にエスケープする必要があります。
        - `attribute` — LDAP検索によって返される属性名。そのデフォルトは `cn` です。
        - `prefix` — LDAP検索で返される元の文字列リストの各文字列の前にあることが期待されるプレフィックス。プレフィックスは元の文字列から削除され、結果の文字列はローカルロール名として扱われます。デフォルトでは空です。
