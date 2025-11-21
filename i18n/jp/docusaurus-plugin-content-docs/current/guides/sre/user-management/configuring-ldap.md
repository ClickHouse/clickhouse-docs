---
sidebar_label: 'LDAP の設定'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: '認証とロールマッピングに LDAP を使用するよう ClickHouse を構成する'
description: '認証とロールマッピングに LDAP を使用するよう ClickHouse を構成する方法を説明します'
keywords: ['LDAP 構成', 'LDAP 認証', 'ロールマッピング', 'ユーザー管理', 'SRE ガイド']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# ClickHouse を LDAP での認証とロールマッピングに利用するための設定

<SelfManaged />

ClickHouse は、LDAP を使用して ClickHouse データベースユーザーを認証するように設定できます。このガイドでは、公開ディレクトリに対して認証を行う LDAP システムと ClickHouse を統合するための、簡単な設定例を紹介します。



## 1. ClickHouseでLDAP接続設定を構成する {#1-configure-ldap-connection-settings-in-clickhouse}

1. このパブリックLDAPサーバーへの接続をテストします:

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

2. `config.xml`ファイルを編集し、LDAPを構成するために以下を追加します:

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

   上記で使用されている基本設定は以下の通りです:

   | パラメータ        | 説明                                   | 例                             |
   | ---------------- | --------------------------------------------- | ----------------------------------- |
   | host             | LDAPサーバーのホスト名またはIP                 | ldap.forumsys.com                   |
   | port             | LDAPサーバーのディレクトリポート                | 389                                 |
   | bind_dn          | ユーザーへのテンプレートパス                        | `uid={user_name},dc=example,dc=com` |
   | enable_tls       | セキュアなLDAPを使用するかどうか                    | no                                  |
   | tls_require_cert | 接続に証明書を要求するかどうか | never                               |

   :::note
   この例では、パブリックサーバーがポート389を使用しており、セキュアポートを使用していないため、デモンストレーション目的でTLSを無効にしています。
   :::

   :::note
   LDAP設定の詳細については、[LDAPドキュメントページ](../../../operations/external-authenticators/ldap.md)を参照してください。
   :::

3. ユーザーロールマッピングを構成するために、`<user_directories>`セクションに`<ldap>`セクションを追加します。このセクションは、ユーザーが認証されるタイミングと、ユーザーが受け取るロールを定義します。この基本的な例では、LDAPで認証されたすべてのユーザーは、後のステップでClickHouseで定義される`scientists_role`を受け取ります。このセクションは次のようになります:

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

   上記で使用されている基本設定は以下の通りです:

   | パラメータ     | 説明                                                         | 例                                                       |
   | ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
   | server        | 前のldap_serversセクションで定義されたラベル                     | test_ldap_server                                              |
   | roles         | ユーザーがマッピングされるClickHouseで定義されたロールの名前 | scientists_role                                               |
   | base_dn       | ユーザーを含むグループの検索を開始する基本パス                      | dc=example,dc=com                                             |
   | search_filter | ユーザーをマッピングするために選択するグループを識別するLDAP検索フィルタ   | `(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))` |
   | attribute     | 値を返す属性名                  | cn                                                            |

4. 設定を適用するためにClickHouseサーバーを再起動します。


## 2. ClickHouseデータベースのロールと権限を設定する {#2-configure-clickhouse-database-roles-and-permissions}

:::note
このセクションの手順は、ClickHouseのSQLアクセス制御とアカウント管理が有効になっていることを前提としています。有効化するには、[SQLユーザーとロールガイド](index.md)を参照してください。
:::

1. `config.xml`ファイルのロールマッピングセクションで使用したものと同じ名前でClickHouseにロールを作成します

   ```sql
   CREATE ROLE scientists_role;
   ```

2. ロールに必要な権限を付与します。次のステートメントは、LDAPを通じて認証できるすべてのユーザーに管理者権限を付与します:
   ```sql
   GRANT ALL ON *.* TO scientists_role;
   ```


## 3. LDAP設定のテスト {#3-test-the-ldap-configuration}

1. ClickHouseクライアントを使用してログインします

   ```bash
   $ clickhouse-client --user einstein --password password
   ClickHouse client version 22.2.2.1.
   Connecting to localhost:9000 as user einstein.
   Connected to ClickHouse server version 22.2.2 revision 54455.

   chnode1 :)
   ```

   :::note
   ステップ1の`ldapsearch`コマンドを使用して、ディレクトリ内の利用可能なすべてのユーザーを表示できます。すべてのユーザーのパスワードは`password`です
   :::

2. ユーザーが`scientists_role`ロールに正しくマッピングされ、管理者権限を持っていることをテストします

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

本記事では、ClickHouseをLDAPサーバーで認証し、ロールにマッピングするための基本的な設定方法を説明しました。また、ClickHouseで個別のユーザーを設定し、自動ロールマッピングを構成せずにLDAP認証のみを使用するオプションもあります。LDAPモジュールはActive Directoryへの接続にも使用できます。
