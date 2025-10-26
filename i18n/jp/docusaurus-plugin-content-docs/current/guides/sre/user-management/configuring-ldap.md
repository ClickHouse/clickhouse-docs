---
'sidebar_label': 'LDAPの構成'
'sidebar_position': 2
'slug': '/guides/sre/configuring-ldap'
'title': 'ClickHouseをLDAPを使用した認証とロールマッピングに構成する'
'description': 'ClickHouseをLDAPを使用して認証とロールマッピングに構成する方法について説明します。'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# ClickHouseを使用してLDAPによる認証とロールマッピングを構成する

<SelfManaged />

ClickHouseは、ユーザーがClickHouseデータベースに認証するためにLDAPを使用するように構成できます。このガイドでは、公開ディレクトリに対して認証を行うLDAPシステムとの統合の単純な例を提供します。

## 1. ClickHouseでのLDAP接続設定の構成 {#1-configure-ldap-connection-settings-in-clickhouse}

1. この公共LDAPサーバーへの接続をテストします：
```bash
$ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
```

    返信は次のようになります：
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

    上記で使用される基本設定は次のとおりです：

    |パラメータ |説明                       |例                   |
    |----------|--------------------------|---------------------|
    |host      |LDAPサーバーのホスト名またはIP|ldap.forumsys.com    |
    |port      |LDAPサーバーのディレクトリポート|389                  |
    |bind_dn   |ユーザーへのテンプレートパス   |`uid={user_name},dc=example,dc=com`|
    |enable_tls|セキュアLDAPを使用するかどうか|no     |
    |tls_require_cert |接続に証明書が必要かどうか|never|

    :::note
    この例では、公開サーバーが389を使用し、セキュアポートを使用していないため、デモ目的でTLSを無効にします。
    :::

    :::note
    LDAP設定の詳細については、[LDAPドキュメントページ](../../../operations/external-authenticators/ldap.md)を参照してください。
    :::

3. `<user_directories>`セクションに`<ldap>`セクションを追加して、ユーザーロールのマッピングを構成します。このセクションでは、ユーザーが認証されたときと、ユーザーが受け取るロールを定義します。この基本例では、LDAPに認証する任意のユーザーは、ClickHouseで後ほど定義される`scientists_role`を受け取ります。このセクションは次のようになります：
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

    上記で使用される基本設定は次のとおりです：

    |パラメータ |説明                       |例                   |
    |----------|--------------------------|---------------------|
    |server    |前のldap_serversセクションで定義されたラベル|test_ldap_server|
    |roles      |ClickHouseでユーザーがマッピングされるロールの名前|scientists_role|
    |base_dn   |ユーザーのグループを検索するためのベースパス|dc=example,dc=com|
    |search_filter|ユーザーをマッピングするために選択するグループを特定するLDAP検索フィルタ|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |どの属性名から値を返すべきか|cn|

4. 設定を適用するためにClickHouseサーバーを再起動します。

## 2. ClickHouseデータベースのロールと権限を構成する {#2-configure-clickhouse-database-roles-and-permissions}

:::note
このセクションの手順は、ClickHouseでSQLアクセスコントロールとアカウント管理が有効になっていることを前提とします。これを有効にするには、[SQL Users and Rolesガイド](index.md)を参照してください。
:::

1. `config.xml`ファイルのロールマッピングセクションで使用されるのと同じ名前のロールをClickHouseで作成します。
```sql
CREATE ROLE scientists_role;
```

2. ロールに必要な権限を付与します。次のステートメントは、LDAPを通じて認証できる任意のユーザーに管理権限を付与します：
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
    ステップ1で`ldapsearch`コマンドを使用して、ディレクトリ内のすべてのユーザーを表示します。すべてのユーザーのパスワードは`password`です。
    :::

2. ユーザーが`scientists_role`ロールに正しくマッピングされており、管理権限を持っていることを確認します。
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

## 概要 {#summary}
この記事では、ClickHouseをLDAPサーバーに認証させ、ロールにマッピングする基本について説明しました。また、LDAPで認証される個別ユーザーをClickHouseで構成するオプションもありますが、ロールマッピングを自動化することなしにそれを行うことも可能です。LDAPモジュールは、Active Directoryに接続するためにも使用できます。
