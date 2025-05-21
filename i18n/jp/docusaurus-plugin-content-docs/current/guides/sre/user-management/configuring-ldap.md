---
sidebar_label: 'LDAPの設定'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: 'ClickHouseをLDAP認証および役割マッピングに使用するように構成する'
description: 'ClickHouseをLDAP認証および役割マッピングに使用するように構成する方法を説明します'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# ClickHouseをLDAP認証および役割マッピングに使用するように構成する

<SelfManaged />

ClickHouseは、ClickHouseデータベースユーザーを認証するためにLDAPを使用するように構成できます。このガイドでは、公開されているディレクトリに対して認証するLDAPシステムとのClickHouseの統合の簡単な例を提供します。

## 1. ClickHouseでのLDAP接続設定の構成 {#1-configure-ldap-connection-settings-in-clickhouse}

1. この公開LDAPサーバーへの接続をテストします:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    応答は次のようになります:
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
    `<test_ldap_server>`タグは特定のLDAPサーバーを識別するための任意のラベルです。
    :::

    上記で使用される基本設定は次の通りです:

    |パラメータ|説明                          |例                   |
    |----------|-------------------------------|---------------------|
    |host      |LDAPサーバーのホスト名またはIP|ldap.forumsys.com    |
    |port      |LDAPサーバーのディレクトリポート|389                  |
    |bind_dn   |ユーザーへのテンプレートパス |`uid={user_name},dc=example,dc=com`|
    |enable_tls|安全なLDAPを使用するかどうか |no                   |
    |tls_require_cert|接続に証明書が必要かどうか|never                |

    :::note
    この例では、公開サーバーが389を使用し、安全なポートを使用しないため、デモ目的でTLSを無効にしています。
    :::

    :::note
    LDAP設定の詳細については、[LDAPドキュメントページ](../../../operations/external-authenticators/ldap.md)を参照してください。
    :::

3. `<user_directories>`セクションに`<ldap>`セクションを追加してユーザー役割マッピングを設定します。このセクションでは、ユーザーが認証される際にどの役割が与えられるかを定義します。この基本的な例では、LDAPに認証される任意のユーザーには、ClickHouseの後のステップで定義される`scientists_role`が与えられます。このセクションは次のようになります:
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

    上記で使用される基本設定は次の通りです:

    |パラメータ|説明                          |例                   |
    |----------|-------------------------------|---------------------|
    |server    |前のldap_serversセクションで定義されたラベル |test_ldap_server     |
    |roles     |ユーザーがマッピングされるClickHouseで定義された役割の名前 |scientists_role      |
    |base_dn   |ユーザーでグループを検索するための開始パス |dc=example,dc=com   |
    |search_filter|ユーザーをマッピングするために選択するグループを特定するLDAP検索フィルタ |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |返されるべき属性名 |cn                    |


4. 設定を適用するためにClickHouseサーバーを再起動します。

## 2. ClickHouseデータベースの役割と権限の設定 {#2-configure-clickhouse-database-roles-and-permissions}

:::note
このセクションの手順は、ClickHouseでSQLアクセス制御とアカウント管理が有効になっていることを想定しています。これを有効にするには、[SQLユーザーと役割ガイド](index.md)を参照してください。
:::

1. `config.xml`ファイルの役割マッピングセクションで使用されるのと同じ名前の役割をClickHouseで作成します。
    ```sql
    CREATE ROLE scientists_role;
    ```

2. 役割に必要な権限を付与します。次のステートメントは、LDAPを通じて認証できるユーザーに管理権限を付与します:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. LDAP設定のテスト {#3-test-the-ldap-configuration}

1. ClickHouseクライアントを使用してログインします。
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    localhost:9000としてユーザーeinsteinに接続中。
    ClickHouseサーバーのバージョン22.2.2、リビジョン54455に接続されました。

    chnode1 :)
    ```

    :::note
    ステップ1で`ldapsearch`コマンドを使用して、ディレクトリ内のすべてのユーザーを表示します。この全てのユーザーのパスワードは`password`です。
    :::

2.  ユーザーが`scientists_role`役割に正しくマッピングされており、管理権限を持っているかをテストします。
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

    9 行がセットにあります。経過時間: 0.004 秒。
    ```

## まとめ {#summary}
この記事では、ClickHouseがLDAPサーバーに対して認証し、役割にマッピングする基本を示しました。また、ClickHouse内の個々のユーザーを構成するオプションもありますが、役割の自動マッピングを構成せずにLDAPによってこれらのユーザーを認証させることもできます。LDAPモジュールは、Active Directoryへの接続にも使用できます。
