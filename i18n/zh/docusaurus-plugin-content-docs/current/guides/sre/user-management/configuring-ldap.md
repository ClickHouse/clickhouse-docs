---
sidebar_label: '配置 LDAP'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: '将 ClickHouse 配置为使用 LDAP 进行身份验证和角色映射'
description: '描述如何将 ClickHouse 配置为使用 LDAP 进行身份验证和角色映射'
keywords: ['LDAP 配置', 'LDAP 身份验证', '角色映射', '用户管理', 'SRE 指南']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# 配置 ClickHouse 使用 LDAP 进行身份验证和角色映射 \\{#configuring-clickhouse-to-use-ldap-for-authentication-and-role-mapping\\}

<SelfManaged />

可以将 ClickHouse 配置为使用 LDAP 来对 ClickHouse 数据库用户进行身份验证。本指南提供了一个简单示例，演示如何将 ClickHouse 与 LDAP 系统集成，并对一个公开可访问的目录进行身份验证。

## 1. 在 ClickHouse 中配置 LDAP 连接设置 \\{#1-configure-ldap-connection-settings-in-clickhouse\\}

1. 测试与该公共 LDAP 服务器的连接：
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    返回结果类似如下：
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

2. 编辑 `config.xml` 文件，并添加以下内容用于配置 LDAP：
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
    `<test_ldap_server>` 标签是用于标识特定 LDAP 服务器的任意标签名。
    :::

    上面使用的是以下基础设置：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |host      |LDAP 服务器的主机名或 IP       |ldap.forumsys.com    |
    |port      |LDAP 服务器的目录服务端口      |389                  |
    |bind_dn   |用户的模板路径                |`uid={user_name},dc=example,dc=com`|
    |enable_tls|是否使用安全 LDAP             |no     |
    |tls_require_cert |是否要求连接时验证证书  |never|

    :::note
    在此示例中，由于公共服务器使用的是 389 端口且未使用安全端口，为了演示目的我们禁用了 TLS。
    :::

    :::note
    有关 LDAP 设置的更多详细信息，请查看 [LDAP 文档页面](../../../operations/external-authenticators/ldap.md)。
    :::

3. 向 `<user_directories>` 部分添加 `<ldap>` 配置块，以配置用户角色映射。该部分定义了用户在何种情况下通过认证，以及用户将获得什么角色。在这个基础示例中，任何通过 LDAP 认证的用户都会获得 `scientists_role` 角色，该角色会在后续步骤中在 ClickHouse 中定义。该部分应类似如下：
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

    上面使用的是以下基础设置：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |server    |在前面 ldap_servers 段中定义的标签名|test_ldap_server|
    |roles      |在 ClickHouse 中定义的、用户将被映射到的角色名称|scientists_role|
    |base_dn   |开始查找包含该用户的组的基础路径        |dc=example,dc=com|
    |search_filter|用于识别要选择以映射用户的组的 LDAP 搜索过滤器    |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |应从哪个属性名返回值            |cn|

4. 重启 ClickHouse 服务器以应用这些设置。

## 2. 配置 ClickHouse 数据库角色和权限 \\{#2-configure-clickhouse-database-roles-and-permissions\\}

:::note
本节中的操作假定 ClickHouse 中已启用 SQL 访问控制和账户管理。要启用，请参阅 [SQL Users and Roles 指南](index.md)。
:::

1. 在 ClickHouse 中创建一个角色，该角色名称须与 `config.xml` 文件中角色映射部分使用的名称相同：
    ```sql
    CREATE ROLE scientists_role;
    ```

2. 为该角色授予所需的权限。以下语句会为任何能够通过 LDAP 进行身份验证的用户授予管理员权限：
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. 测试 LDAP 配置 \\{#3-test-the-ldap-configuration\\}

1. 使用 ClickHouse 客户端登录
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    在第 1 步中使用 `ldapsearch` 命令查看目录中所有可用用户，这些用户的密码均为 `password`。
    :::

2.  测试用户是否已正确映射到 `scientists_role` 角色并具有管理员权限
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

## 摘要 \\{#summary\\}
本文演示了在 ClickHouse 中配置使用 LDAP 服务器进行身份验证以及执行角色映射的基本方法。还介绍了另一种方案：在 ClickHouse 中单独配置用户账号，但将这些用户的身份验证委托给 LDAP，而不配置自动角色映射。LDAP 模块同样可以用于连接 Active Directory。
