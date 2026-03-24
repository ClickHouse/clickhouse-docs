---
sidebar_label: 'LDAP の設定'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: '認証とロールマッピングに LDAP を使用するように ClickHouse を構成する'
description: 'ClickHouse で認証とロールマッピングに LDAP を使用するように構成する方法について説明します'
keywords: ['LDAP 設定', 'LDAP 認証', 'ロールマッピング', 'ユーザー管理', 'SRE ガイド']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# LDAP を使用した認証とロールマッピングのための ClickHouse の構成 \{#configuring-clickhouse-to-use-ldap-for-authentication-and-role-mapping\}

<SelfManaged />

ClickHouse は、LDAP を使用して ClickHouse データベースユーザーを認証するように構成できます。このガイドでは、一般公開されているディレクトリに対して認証を行う LDAP システムと ClickHouse を統合する、簡単な例を紹介します。

<VerticalStepper headerLevel="h2">

## ClickHouse で LDAP 接続設定を構成する \{#1-configure-ldap-connection-settings-in-clickhouse\}

1. この公開 LDAP サーバーへの接続をテストします:
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

2. `config.xml` ファイルを編集し、LDAP を構成するために以下を追加します:
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
    `<test_ldap_server>` タグは、特定の LDAP サーバーを識別するための任意のラベルです。
    :::

    上記で使用している基本設定は次のとおりです:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |host      |LDAP サーバーのホスト名または IP |ldap.forumsys.com    |
    |port      |LDAP サーバーのディレクトリポート|389                  |
    |bind_dn   |ユーザーへのテンプレートパス        |`uid={user_name},dc=example,dc=com`|
    |enable_tls|セキュアな ldap を使用するかどうか    |no     |
    |tls_require_cert |接続に証明書を必須とするかどうか|never|

    :::note
    この例では、公開サーバーが 389 を使用しており、セキュアポートを使用していないため、デモ目的で TLS を無効にしています。
    :::

    :::note
    LDAP 設定の詳細については、[LDAP doc page](../../../operations/external-authenticators/ldap.md) を参照してください。
    :::

3. ユーザーロールのマッピングを構成するために、`<user_directories>` セクションに `<ldap>` セクションを追加します。このセクションでは、ユーザーがいつ認証されるか、およびユーザーがどのロールを受け取るかを定義します。この基本的な例では、LDAP で認証される任意のユーザーが、後の手順で ClickHouse に定義される `scientists_role` を受け取ります。セクションは次のようになります:
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

    上記で使用している基本設定は次のとおりです:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |server    |前の ldap_servers セクションで定義されたラベル|test_ldap_server|
    |roles      |ClickHouse で定義され、ユーザーのマッピング先となるロール名|scientists_role|
    |base_dn   |ユーザーを含むグループの検索を開始するベースパス        |dc=example,dc=com|
    |search_filter|ユーザーのマッピング先として選択するグループを識別する ldap 検索フィルター    |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |値を返す属性名|cn|

4. 設定を適用するために ClickHouse サーバーを再起動します。

## ClickHouse データベースのロールと権限を構成する \{#2-configure-clickhouse-database-roles-and-permissions\}

:::note
このセクションの手順は、ClickHouse で SQL Access Control and Account Management が有効になっていることを前提としています。有効にするには、[SQL Users and Roles guide](index.md) を参照してください。
:::

1. `config.xml` ファイルのロールマッピングセクションで使用したものと同じ名前のロールを clickhouse に作成します
    ```sql
    CREATE ROLE scientists_role;
    ```

2. 必要な権限をそのロールに付与します。次のステートメントは、LDAP を通じて認証できる任意のユーザーに管理者権限を付与します:
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## LDAP 設定をテストする \{#3-test-the-ldap-configuration\}

1. ClickHouse クライアントを使用してログインします
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    手順 1 の `ldapsearch` コマンドを使用すると、ディレクトリで利用可能なすべてのユーザーを確認できます。すべてのユーザーのパスワードは `password` です
    :::

2.  ユーザーが `scientists_role` ロールに正しくマッピングされ、管理者権限を持っていることをテストします
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

</VerticalStepper>

## まとめ \{#summary\}

この記事では、ClickHouse が LDAP サーバーで認証を行い、ロールにマッピングするための基本的な設定方法を説明しました。ClickHouse 上で個々のユーザーを定義したうえで、それらのユーザーの認証のみを LDAP に任せ、自動的なロールマッピングは設定しない構成も可能です。LDAP モジュールは、Active Directory への接続にも使用できます。