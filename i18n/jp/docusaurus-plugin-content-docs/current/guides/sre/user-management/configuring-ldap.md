---
sidebar_label: LDAPの設定
sidebar_position: 2
slug: /guides/sre/configuring-ldap
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# ClickHouseをLDAPを使った認証とロールマッピングの設定

<SelfManaged />

ClickHouseはLDAPを使用してClickHouseデータベースユーザーを認証するように設定できます。このガイドでは、公開ディレクトリに認証されるLDAPシステムとClickHouseを統合する簡単な例を提供します。

## 1. ClickHouseでのLDAP接続設定の構成 {#1-configure-ldap-connection-settings-in-clickhouse}

1. この公開LDAPサーバーへの接続をテストします:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    返信は次のようなものになります:
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

2. `config.xml`ファイルを編集し、LDAPを構成するために次の内容を追加します:
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
    `<test_ldap_server>` タグは特定のLDAPサーバーを識別するための任意のラベルです。
    :::

    上記で使用されている基本設定は次のとおりです:

    |パラメータ   |説明                          |例                      |
    |-------------|------------------------------|-------------------------|
    |host         |LDAPサーバーのホスト名またはIP |ldap.forumsys.com        |
    |port         |LDAPサーバーのディレクトリポート |389                      |
    |bind_dn      |ユーザーへのテンプレートパス  |`uid={user_name},dc=example,dc=com`|
    |enable_tls   |安全なLDAPを使用するかどうか  |no                       |
    |tls_require_cert|接続のために証明書を必要とするかどうか|never|

    :::note
    この例では、公開サーバーが389を使用し、安全なポートを使用しないため、デモの目的でTLSを無効にしています。
    :::

    :::note
    LDAP設定の詳細については、[LDAPドキュメントページ](../../../operations/external-authenticators/ldap.md)を参照してください。
    :::

3. `<user_directories>` セクションに `<ldap>` セクションを追加して、ユーザーロールマッピングを構成します。このセクションでは、ユーザーが認証されるタイミングと、ユーザーが受け取るロールを定義します。この基本的な例では、LDAPで認証されるすべてのユーザーは、ClickHouseの後のステップで定義される `scientists_role` を受け取ります。このセクションは次のように見えるはずです:
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

    上記で使用されている基本設定は次のとおりです:

    |パラメータ   |説明                          |例                      |
    |-------------|------------------------------|-------------------------|
    |server       |前のldap_serversセクションで定義されたラベル |test_ldap_server        |
    |roles        |ClickHouseで定義されたロール名、ユーザーがマッピングされる |scientists_role        |
    |base_dn      |ユーザーを持つグループの検索を開始するベースパス |dc=example,dc=com      |
    |search_filter|ユーザーをマッピングするためのグループを特定するLDAP検索フィルタ |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute    |どの属性名の値が返されるべきか  |cn                      |


4. 設定を適用するためにClickHouseサーバーを再起動します。

## 2. ClickHouseデータベースのロールと権限を構成する {#2-configure-clickhouse-database-roles-and-permissions}

:::note
このセクションの手順は、ClickHouseでSQLアクセス制御とアカウント管理が有効になっていることを前提としています。有効にするには、[SQLユーザーとロールガイド](index.md)を参照してください。
:::

1. `config.xml`ファイルのロールマッピングセクションで使用される同じ名前のロールをClickHouseで作成します。
    ```sql
    CREATE ROLE scientists_role;
    ```

2. ロールに必要な権限を付与します。次のステートメントは、LDAPを通じて認証できるユーザーにすべての権限を付与します:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. LDAP設定をテストする {#3-test-the-ldap-configuration}

1. ClickHouseクライアントを使用してログインします。
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    ステップ1で `ldapsearch` コマンドを使用してディレクトリ内のすべてのユーザーを表示し、すべてのユーザーのパスワードは `password` です。
    :::

2. ユーザーが正しく`scientists_role`ロールにマッピングされていることと、管理者権限を持っているかをテストします。
    ```sql
    SHOW DATABASES
    ```

    ```response
    Query id: 93b785ff-1482-4eda-95b0-b2d68b2c5e0f

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

    9 rows in set. Elapsed: 0.004 sec.
    ```

## まとめ {#summary}
この記事では、ClickHouseがLDAPサーバーに認証し、ロールにマッピングする基本的な設定を示しました。ClickHouseで個々のユーザーを構成するオプションもありますが、ロールの自動マッピングを構成せずにLDAPによってそのユーザーを認証させることができます。また、LDAPモジュールを使用してActive Directoryに接続することもできます。
