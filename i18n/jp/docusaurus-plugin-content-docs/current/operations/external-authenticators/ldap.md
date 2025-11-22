---
description: 'ClickHouse で LDAP 認証を設定するためのガイド'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP サーバーは、ClickHouse ユーザーの認証に利用できます。これには 2 つの異なるアプローチがあります。

* `users.xml` またはローカルのアクセス制御パスで定義された既存ユーザーに対して、外部認証機構として LDAP を使用する。
* LDAP を外部ユーザー ディレクトリとして使用し、LDAP サーバー上に存在する場合には、ローカルで未定義のユーザーの認証を許可する。

これら両方のアプローチにおいて、他の設定箇所から参照できるように、ClickHouse の設定内で内部名を付けて LDAP サーバーを定義しておく必要があります。


## LDAPサーバーの定義 {#ldap-server-definition}

LDAPサーバーを定義するには、`config.xml`に`ldap_servers`セクションを追加します。

**例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!-- 典型的なLDAPサーバー。 -->
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

        <!-- ロールマッピングのためにユーザーDN検出が設定された典型的なActive Directory。 -->
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

`ldap_servers`セクション内では、異なる名前を使用して複数のLDAPサーバーを定義できます。

**パラメータ**


- `host` — LDAP サーバーのホスト名または IP アドレス。必須パラメータであり、空にはできません。
- `port` — LDAP サーバーのポート。`enable_tls` が `true` に設定されている場合のデフォルトは `636`、それ以外の場合は `389` です。
- `bind_dn` — バインド先 DN を構築するために使用されるテンプレート。
  - 結果として得られる DN は、各認証試行時にテンプレート中のすべての `{user_name}` 部分文字列を実際のユーザー名で置き換えることで構築されます。
- `user_dn_detection` — バインドされたユーザーの実際のユーザー DN を検出するための LDAP 検索パラメータを含むセクション。
  - これは主に、サーバーが Active Directory の場合に、さらなるロールマッピングのための検索フィルターで使用されます。得られたユーザー DN は、許可されている場所で `{user_dn}` 部分文字列を置き換える際に使用されます。デフォルトでは、ユーザー DN はバインド DN と同じに設定されていますが、一度検索が実行されると、検出された実際のユーザー DN の値で更新されます。
    - `base_dn` — LDAP 検索のベース DN を構築するために使用されるテンプレート。
      - 結果として得られる DN は、LDAP 検索中にテンプレート中のすべての `{user_name}` および `{bind_dn}` 部分文字列を、実際のユーザー名およびバインド DN で置き換えることで構築されます。
    - `scope` — LDAP 検索のスコープ。
      - 指定可能な値: `base`, `one_level`, `children`, `subtree`（デフォルト）。
    - `search_filter` — LDAP 検索の検索フィルターを構築するために使用されるテンプレート。
      - 結果として得られるフィルターは、LDAP 検索中にテンプレート中のすべての `{user_name}`、`{bind_dn}`、`{base_dn}` 部分文字列を、実際のユーザー名、バインド DN、およびベース DN で置き換えることで構築されます。
      - 特殊文字は XML 内で正しくエスケープされている必要があることに注意してください。
- `verification_cooldown` — 正常にバインドが行われた後、その秒数の間、LDAP サーバーに接続せずに、以降のすべてのリクエストに対してユーザーが正しく認証されているものと見なす猶予時間。
  - キャッシュを無効化し、各認証リクエストごとに LDAP サーバーへの接続を強制するには `0`（デフォルト）を指定します。
- `enable_tls` — LDAP サーバーへのセキュア接続を使用するかどうかを制御するフラグ。
  - プレーンテキストの `ldap://` プロトコルを使用するには `no` を指定します（非推奨）。
  - SSL/TLS 上の LDAP `ldaps://` プロトコルを使用するには `yes` を指定します（推奨、デフォルト）。
  - レガシーな StartTLS プロトコル（プレーンテキストの `ldap://` プロトコルを TLS にアップグレード）を使用するには `starttls` を指定します。
- `tls_minimum_protocol_version` — SSL/TLS の最小プロトコルバージョン。
  - 指定可能な値: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`（デフォルト）。
- `tls_require_cert` — SSL/TLS ピア証明書の検証動作。
  - 指定可能な値: `never`, `allow`, `try`, `demand`（デフォルト）。
- `tls_cert_file` — 証明書ファイルへのパス。
- `tls_key_file` — 証明書鍵ファイルへのパス。
- `tls_ca_cert_file` — CA 証明書ファイルへのパス。
- `tls_ca_cert_dir` — CA 証明書を含むディレクトリへのパス。
- `tls_cipher_suite` — 許可される暗号スイート（OpenSSL 表記）。



## LDAP外部認証機構 {#ldap-external-authenticator}

リモートLDAPサーバーは、ローカルに定義されたユーザー（`users.xml`またはローカルアクセス制御パスで定義されたユーザー）のパスワード検証方法として使用できます。これを実現するには、ユーザー定義内の`password`または類似のセクションの代わりに、事前に定義されたLDAPサーバー名を指定します。

各ログイン試行時に、ClickHouseは提供された認証情報を使用して、[LDAPサーバー定義](#ldap-server-definition)の`bind_dn`パラメータで定義された指定のDNへの「バインド」を試み、成功した場合、ユーザーは認証されたと見なされます。これは一般的に「シンプルバインド」方式と呼ばれます。

**例**

```xml
<clickhouse>
    <!-- ... -->
    <users>
        <!-- ... -->
        <my_user>
            <!-- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

ユーザー`my_user`が`my_ldap_server`を参照していることに注意してください。このLDAPサーバーは、前述のようにメインの`config.xml`ファイルで設定する必要があります。

SQL駆動の[アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効な場合、LDAPサーバーによって認証されるユーザーは、[CREATE USER](/sql-reference/statements/create/user)ステートメントを使用して作成することもできます。

クエリ:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```


## LDAP外部ユーザーディレクトリ {#ldap-external-user-directory}

ローカルに定義されたユーザーに加えて、リモートLDAPサーバーをユーザー定義のソースとして使用できます。これを実現するには、`config.xml`ファイルの`users_directories`セクション内の`ldap`セクションに、事前に定義されたLDAPサーバー名を指定します([LDAPサーバー定義](#ldap-server-definition)を参照)。

ログイン試行のたびに、ClickHouseはローカルでユーザー定義を検索し、通常通り認証を試みます。ユーザーが定義されていない場合、ClickHouseは外部LDAPディレクトリに定義が存在すると仮定し、提供された認証情報を使用してLDAPサーバーの指定されたDNへの「バインド」を試みます。成功した場合、ユーザーは存在し認証されたものとみなされます。ユーザーには`roles`セクションで指定されたリストからロールが割り当てられます。さらに、`role_mapping`セクションも設定されている場合、LDAP「検索」を実行し、結果を変換してロール名として扱い、ユーザーに割り当てることができます。これらすべては、SQLベースの[アクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効であり、[CREATE ROLE](/sql-reference/statements/create/role)ステートメントを使用してロールが作成されていることを前提としています。

**例**

`config.xml`に記述します。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- 典型的なLDAPサーバー。 -->
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

        <!- 検出されたユーザーDNに基づくロールマッピングを使用する典型的なActive Directory。 -->
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

`user_directories`セクション内の`ldap`セクションで参照される`my_ldap_server`は、`config.xml`で設定された事前に定義されたLDAPサーバーである必要があります([LDAPサーバー定義](#ldap-server-definition)を参照)。

**パラメータ**


- `server` — 上記の `ldap_servers` 設定セクションで定義された LDAP サーバー名のいずれか1つです。このパラメーターは必須であり、空にはできません。
- `roles` — LDAP サーバーから取得された各ユーザーに割り当てられる、ローカルで定義されたロールの一覧を含むセクションです。
  - ここでロールが指定されていない場合、または後述のロールマッピング時にロールが割り当てられない場合、ユーザーは認証後にいかなる操作も実行できません。
- `role_mapping` — LDAP 検索パラメーターとマッピングルールを含むセクションです。
  - ユーザーが認証されると、LDAP へのバインドを維持したまま、`search_filter` とログインユーザー名を用いて LDAP 検索が実行されます。その検索で見つかった各エントリに対して、指定された属性の値が抽出されます。指定されたプレフィックスを持つ各属性値については、そのプレフィックスが削除され、残りの値が ClickHouse 内でローカルロール名となります。このロールは事前に [CREATE ROLE](/sql-reference/statements/create/role) ステートメントで作成されていることが想定されています。
  - 同一の `ldap` セクション内に複数の `role_mapping` セクションを定義できます。それらはすべて適用されます。
    - `base_dn` — LDAP 検索に用いるベース DN を構成するためのテンプレートです。
      - LDAP 検索のたびに、このテンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}` の各部分文字列が、実際のユーザー名、バインド DN、ユーザー DN に置き換えられ、最終的な DN が構成されます。
    - `scope` — LDAP 検索のスコープです。
      - 指定可能な値は `base`、`one_level`、`children`、`subtree`（デフォルト）です。
    - `search_filter` — LDAP 検索に用いる検索フィルタを構成するためのテンプレートです。
      - LDAP 検索のたびに、このテンプレート内の `{user_name}`、`{bind_dn}`、`{user_dn}`、`{base_dn}` の各部分文字列が、実際のユーザー名、バインド DN、ユーザー DN、およびベース DN に置き換えられ、最終的なフィルタが構成されます。
      - 特殊文字は XML で正しくエスケープされている必要があることに注意してください。
    - `attribute` — LDAP 検索によって返される値を持つ属性名です。デフォルトは `cn` です。
    - `prefix` — LDAP 検索により返される元の文字列リスト内の各文字列の先頭に存在することが想定されているプレフィックスです。このプレフィックスは元の文字列から削除され、残りの文字列がローカルロール名として扱われます。デフォルトは空です。
