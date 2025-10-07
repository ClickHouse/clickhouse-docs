---
'sidebar_label': '配置 LDAP'
'sidebar_position': 2
'slug': '/guides/sre/configuring-ldap'
'title': '配置 ClickHouse 使用 LDAP 进行身份验证和角色映射'
'description': '描述如何配置 ClickHouse 使用 LDAP 进行身份验证和角色映射'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 配置 ClickHouse 以使用 LDAP 进行身份验证和角色映射

<SelfManaged />

ClickHouse 可以配置为使用 LDAP 验证 ClickHouse 数据库用户。 本指南提供了将 ClickHouse 与 LDAP 系统集成的简单示例，该系统可以对公共目录进行身份验证。

## 1. 在 ClickHouse 中配置 LDAP 连接设置 {#1-configure-ldap-connection-settings-in-clickhouse}

1. 测试您与此公共 LDAP 服务器的连接：
```bash
$ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
```

    回复将类似于以下内容：
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

2. 编辑 `config.xml` 文件并添加以下内容以配置 LDAP：
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
    `<test_ldap_server>` 标签是一个任意标签，用于标识特定的 LDAP 服务器。
    :::

    以上所用的基本设置如下：

    |参数       |描述                           |示例                        |
    |-----------|--------------------------------|-----------------------------|
    |host       |LDAP 服务器的主机名或 IP      |ldap.forumsys.com            |
    |port       |LDAP 服务器的目录端口         |389                          |
    |bind_dn    |用户的模板路径                |`uid={user_name},dc=example,dc=com`|
    |enable_tls |是否使用安全的 LDAP           |no                           |
    |tls_require_cert |是否需要连接的证书       |never                        |

    :::note
    在此示例中，由于公共服务器使用 389 并且不使用安全端口，因此我们出于演示目的禁用 TLS。
    :::

    :::note
    有关 LDAP 设置的更多详细信息，请查看 [LDAP 文档页面](../../../operations/external-authenticators/ldap.md)。
    :::

3. 将 `<ldap>` 部分添加到 `<user_directories>` 部分以配置用户角色映射。 该部分定义何时对用户进行身份验证以及用户将获得什么角色。 在这个基本示例中，任何通过 LDAP 进行身份验证的用户将获得 `scientists_role`，该角色将在 ClickHouse 中的后续步骤中定义。 该部分应如下所示：
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

    以上所用的基本设置如下：

    |参数       |描述                           |示例                        |
    |-----------|--------------------------------|-----------------------------|
    |server     |在之前的 ldap_servers 部分中定义的标签|test_ldap_server           |
    |roles      |在 ClickHouse 中定义的角色名称，用户将映射到|scientists_role            |
    |base_dn    |搜索用户所在组的基路径        |dc=example,dc=com           |
    |search_filter|用于识别选择映射用户的组的 ldap 搜索过滤器|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute  |应返回的特定属性名称         |cn                          |

4. 重启您的 ClickHouse 服务器以应用设置。

## 2. 配置 ClickHouse 数据库角色和权限 {#2-configure-clickhouse-database-roles-and-permissions}

:::note
本节中的过程假定已启用 ClickHouse 中的 SQL 访问控制和账户管理。 要启用，请查看 [SQL 用户和角色指南](index.md)。
:::

1. 在 ClickHouse 中创建一个与 `config.xml` 文件的角色映射部分中使用的名称相同的角色
```sql
CREATE ROLE scientists_role;
```

2. 向该角色授予所需的权限。 以下语句向能够通过 LDAP 进行身份验证的任何用户授予管理员权限：
```sql
GRANT ALL ON *.* TO scientists_role;
```

## 3. 测试 LDAP 配置 {#3-test-the-ldap-configuration}

1. 使用 ClickHouse 客户端登录
```bash
$ clickhouse-client --user einstein --password password
ClickHouse client version 22.2.2.1.
Connecting to localhost:9000 as user einstein.
Connected to ClickHouse server version 22.2.2 revision 54455.

chnode1 :)
```

    :::note
    在第 1 步中使用 `ldapsearch` 命令查看目录中可用的所有用户，所有用户的密码都是 `password`
    :::

2. 测试用户是否正确映射到 `scientists_role` 角色并具有管理员权限
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

## 总结 {#summary}
本文演示了配置 ClickHouse 以对 LDAP 服务器进行身份验证以及映射到角色的基础知识。 还可以选择在 ClickHouse 中配置单个用户，但无需配置自动角色映射即可使用 LDAP 对这些用户进行身份验证。 LDAP 模块也可以用于连接到 Active Directory。
