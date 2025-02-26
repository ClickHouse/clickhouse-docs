---
sidebar_label: LDAPの設定
sidebar_position: 2
slug: /guides/sre/configuring-ldap
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# 認証とロールマッピングのためにClickHouseをLDAPを使用するように設定する

<SelfManaged />

ClickHouseは、ClickHouseデータベースユーザーを認証するためにLDAPを使用するように設定できます。このガイドでは、公開ディレクトリに認証するLDAPシステムとClickHouseを統合する簡単な例を提供します。

## 1. ClickHouseでのLDAP接続設定の構成 {#1-configure-ldap-connection-settings-in-clickhouse}

1. この公開LDAPサーバーへの接続をテストします：
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    応答は次のようになります：
    ```response
    # extended LDIF
    #
    # LDAPv3
    # base <dc=example,dc=com> with scope subtree
    # filter: (objectclass=*)
    # requesting: ALL
    #

    # example.com
    dn: dc=example,dc=com
    objectClass: top
    objectClass: dcObject
    objectClass: organization
    o: example.com
    dc: example
    ...
    ```

2. `config.xml`ファイルを編集し、LDAPを構成するために以下を追加します：
    ```xml
    <ldap_servers>
        <test_ldap_server>
        <host>ldap.forumsys.com</host>
        <port>389</port>
        <bind_dn>uid={user_name},dc=example,dc=com</bind_dn>
        <enable_tls>no</enable_tls>
        <tls_require_cert>never</tls_require_cert>
        </test_ldap_server>
    </ldap_servers>
    ```

    :::note
    `<test_ldap_server>`タグは、特定のLDAPサーバーを識別するための任意のラベルです。
    :::

    上記で使用されている基本設定は以下の通りです：

    |パラメータ   |説明                        |例                    |
    |-------------|----------------------------|-----------------------|
    |host         |LDAPサーバーのホスト名またはIP|ldap.forumsys.com     |
    |port         |LDAPサーバーのディレクトリポート|389                   |
    |bind_dn      |ユーザーのテンプレートパス |`uid={user_name},dc=example,dc=com`|
    |enable_tls   |セキュアLDAPを使用するかどうか |no                    |
    |tls_require_cert |接続のために証明書を要求するかどうか |never              |

    :::note
    この例では、公開サーバーが389を使用し、セキュアポートを使用しないため、デモ目的でTLSを無効にしています。
    :::

    :::note
    LDAP設定の詳細については、[LDAPドキュメントページ](../../../operations/external-authenticators/ldap.md)を参照してください。
    :::

3. `<user_directories>`セクションに`<ldap>`セクションを追加して、ユーザーのロールマッピングを構成します。このセクションは、ユーザーが認証される際に何を行い、ユーザーがどのロールを受け取るかを定義します。この基本的な例では、LDAPに認証されたユーザーには後のステップでClickHouseで定義される`scientists_role`が与えられます。このセクションは次のようになります：
    ```xml
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
        <ldap>
              <server>test_ldap_server</server>
              <roles>
                 <scientists_role />
              </roles>
              <role_mapping>
                 <base_dn>dc=example,dc=com</base_dn>
                 <search_filter>(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))</search_filter>
                 <attribute>cn</attribute>
              </role_mapping>
        </ldap>
    </user_directories>
    ```

    上記で使用されている基本設定は以下の通りです：

    |パラメータ   |説明                        |例                    |
    |-------------|----------------------------|-----------------------|
    |server       |前のldap_serversセクションで定義されたラベル|test_ldap_server     |
    |roles        |ClickHouseで定義されたロールの名前、ユーザーがマッピングされる|scientists_role      |
    |base_dn      |ユーザーのグループを検索するために検索を開始する基本パス |dc=example,dc=com     |
    |search_filter|ユーザーをマッピングするために選択するグループを特定するLDAP検索フィルター|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute     |どの属性名から値を返すべきか|cn|

4. 設定を適用するためにClickHouseサーバーを再起動します。

## 2. ClickHouseデータベースのロールと権限を設定する {#2-configure-clickhouse-database-roles-and-permissions}

:::note
このセクションの手続きは、ClickHouseでSQLアクセス制御とアカウント管理が有効になっていることを前提としています。これを有効にするには、[SQLユーザーとロールガイド](index.md)を参照してください。
:::

1. `config.xml`ファイルのロールマッピングセクションで使用されるのと同じ名前でClickHouseにロールを作成します。
    ```sql
    CREATE ROLE scientists_role;
    ```

2. ロールに必要な権限を付与します。以下のステートメントは、LDAPを介して認証できるユーザーに管理権限を付与します：
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. LDAP設定のテスト {#3-test-the-ldap-configuration}

1. ClickHouseクライアントを使用してログインします。
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    ステップ1で`ldapsearch`コマンドを使用して、ディレクトリ内のすべてのユーザーを表示し、すべてのユーザーのパスワードは`password`であることを確認します。
    :::

2. ユーザーが`scientists_role`ロールに正しくマッピングされているか、そして管理権限を持っているかをテストします。
    ```sql
    SHOW DATABASES
    ```

    ```response
    クエリID: 93b785ff-1482-4eda-95b0-b2d68b2c5e0f

    ┌─name───────────────┐
    │ INFORMATION_SCHEMA │
    │ db1_mysql          │
    │ db2                │
    │ db3                │
    │ db4_mysql          │
    │ db5_merge          │
    │ default            │
    │ information_schema │
    │ system             │
    └────────────────────┘

    9行がセットされました。経過時間: 0.004秒。
    ```

## まとめ {#summary}
この記事では、ClickHouseをLDAPサーバーに認証し、ロールにマッピングする基本的な設定方法を示しました。また、ClickHouse内で個々のユーザーを設定するためのオプションもありますが、自動ロールマッピングを構成せずにLDAPに認証されるユーザーを持つこともできます。LDAPモジュールは、Active Directoryへの接続にも使用できます。
