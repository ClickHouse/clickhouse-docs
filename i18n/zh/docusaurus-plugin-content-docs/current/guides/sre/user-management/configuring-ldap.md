---
'sidebar_label': '配置 LDAP'
'sidebar_position': 2
'slug': '/guides/sre/configuring-ldap'
'title': '配置 ClickHouse 以使用 LDAP 进行身份验证和角色映射'
'description': '描述如何配置 ClickHouse 以使用 LDAP 进行身份验证和角色映射'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 配置 ClickHouse 使用 LDAP 进行身份验证和角色映射

<SelfManaged />

ClickHouse 可以配置为使用 LDAP 来验证 ClickHouse 数据库用户。本文提供了一个简单示例，演示如何将 ClickHouse 与一个公共目录中的 LDAP 系统集成进行身份验证。

## 1. 在 ClickHouse 中配置 LDAP 连接设置 {#1-configure-ldap-connection-settings-in-clickhouse}

1. 测试您与此公共 LDAP 服务器的连接：
```bash
$ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
```

    返回的内容类似于：
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

2. 编辑 `config.xml` 文件，添加以下内容以配置 LDAP：
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
    `<test_ldap_server>` 标签是用于识别特定 LDAP 服务器的任意标签。
    :::

    这些是上述使用的基本设置：

    |参数         |描述                          |示例                      |
    |-------------|------------------------------|---------------------------|
    |host         |LDAP 服务器的主机名或 IP     |ldap.forumsys.com          |
    |port         |LDAP 服务器的目录端口        |389                        |
    |bind_dn      |用户的路径模板               |`uid={user_name},dc=example,dc=com`|
    |enable_tls   |是否使用安全 LDAP            |no                         |
    |tls_require_cert |是否要求连接时要有证书    |never                      |

    :::note
    在本例中，由于公共服务器使用 389 并且不使用安全端口，因此为了演示目的，我们禁用 TLS。
    :::

    :::note
    查看 [LDAP 文档页面](../../../operations/external-authenticators/ldap.md) 以获取有关 LDAP 设置的更多详细信息。
    :::

3. 在 `<user_directories>` 部分中添加 `<ldap>` 部分以配置用户角色映射。该部分定义了用户何时被认证以及用户将获得什么角色。在此基本示例中，任何通过 LDAP 进行身份验证的用户将获得 `scientists_role`，该角色将在 ClickHouse 的后续步骤中定义。该部分应类似于：
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

    这些是上述使用的基本设置：

    |参数         |描述                          |示例                      |
    |-------------|------------------------------|---------------------------|
    |server       |在之前的 ldap_servers 部分中定义的标签 |test_ldap_server           |
    |roles        |在 ClickHouse 中定义的用户将映射到的角色名 |scientists_role            |
    |base_dn      |开始搜索用户组的基本路径    |dc=example,dc=com         |
    |search_filter|用于识别选择用于映射用户的组的 ldap 搜索过滤器 |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute    |应返回值的属性名称        |cn                        |


4. 重启您的 ClickHouse 服务器以应用设置。

## 2. 配置 ClickHouse 数据库角色和权限 {#2-configure-clickhouse-database-roles-and-permissions}

:::note
本节中的过程假定已经启用了 ClickHouse 中的 SQL 访问控制和账户管理。要启用，请查看 [SQL 用户和角色指南](index.md)。
:::

1. 在 ClickHouse 中创建一个与 `config.xml` 文件的角色映射部分中使用的名称相同的角色
```sql
CREATE ROLE scientists_role;
```

2. 授予该角色所需的权限。以下语句授予能够通过 LDAP 进行身份验证的任何用户管理权限：
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
    在步骤 1 中使用 `ldapsearch` 命令查看目录中所有可用用户，所有用户的密码均为 `password`
    :::

2. 测试用户是否正确映射到 `scientists_role` 角色并具有管理权限
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

## 摘要 {#summary}
本文演示了如何配置 ClickHouse 以验证 LDAP 服务器并映射到角色的基础知识。 还可以为 ClickHouse 中的单个用户配置选项，但让这些用户通过 LDAP 进行验证而不配置自动角色映射。LDAP 模块还可以用于连接到 Active Directory。
