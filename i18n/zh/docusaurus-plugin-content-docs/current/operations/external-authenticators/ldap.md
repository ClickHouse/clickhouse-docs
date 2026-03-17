---
description: '配置 ClickHouse 的 LDAP 身份验证指南'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 服务器可用于对 ClickHouse 用户进行身份验证。实现这一点有两种不同的方法：

* 将 LDAP 用作现有用户的外部认证器，这些用户定义在 `users.xml` 或本地访问控制配置中。
* 将 LDAP 用作外部用户目录，允许那些本地未定义但在 LDAP 服务器上存在的用户通过身份验证。

对于这两种方法，必须在 ClickHouse 配置中定义一个具有内部名称的 LDAP 服务器，以便配置的其他部分可以引用它。

## LDAP 服务器定义 \{#ldap-server-definition\}

要定义 LDAP 服务器，必须在 `config.xml` 中添加 `ldap_servers` 配置节。

**示例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- Typical LDAP server. -->
        <my_ldap_server>
            <host>localhost</host>
            <port>636</port>
            <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
            <verification_cooldown>300</verification_cooldown>
            <follow_referrals>false</follow_referrals>
            <enable_tls>yes</enable_tls>
            <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
            <tls_require_cert>demand</tls_require_cert>
            <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
            <tls_key_file>/path/to/tls_key_file</tls_key_file>
            <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
            <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
            <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
        </my_ldap_server>

        <!- Typical Active Directory with configured user DN detection for further role mapping. -->
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

请注意，您可以在 `ldap_servers` 部分中定义多个 LDAP 服务器，只需使用不同的名称进行区分即可。

**参数**

| 参数                             | 默认值           | 描述                                                                                                                                                                                                                                                                    |
| ------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                         | —             | LDAP 服务器主机名或 IP。此参数为必填项，不能为空。                                                                                                                                                                                                                                         |
| `port`                         | `636` / `389` | LDAP 服务器端口。如果 `enable_tls` 设为 `yes`，默认值为 `636`；否则为 `389`。                                                                                                                                                                                                             |
| `bind_dn`                      | —             | 用于构造绑定 DN 的模板。每次进行身份验证时，都会将模板中的所有 `{user_name}` 子字符串替换为实际用户名，以生成最终的 DN。                                                                                                                                                                                               |
| `auth_dn_prefix`               | —             | **已弃用。** `bind_dn` 的替代方式之一。不能与 `bind_dn` 同时使用。指定后，绑定 DN 将按 `auth_dn_prefix + {user_name} + auth_dn_suffix` 构造。例如，将 `auth_dn_prefix` 设置为 `uid=`，并将 `auth_dn_suffix` 设置为 `,ou=users,dc=example,dc=com`，等同于将 `bind_dn` 设置为 `uid={user_name},ou=users,dc=example,dc=com`。 |
| `auth_dn_suffix`               | —             | **已弃用。** 参见 `auth_dn_prefix`。                                                                                                                                                                                                                                         |
| `verification_cooldown`        | `0`           | 成功绑定后的一段时间 (以秒为单位) 。在此期间，对于后续所有请求，系统都会假定用户已成功通过身份验证，而无需联系 LDAP 服务器。指定 `0` 可禁用缓存，并强制每次身份验证请求都联系 LDAP 服务器。                                                                                                                                                              |
| `follow_referrals`             | `false`       | 用于允许 LDAP 客户端库自动跟随服务器返回的 LDAP 转介的标志。该参数主要与 Microsoft Active Directory 环境相关：在此类环境中，对高层级基础 DN (例如 `DC=example,DC=com`) 执行子树搜索时，可能返回转介/搜索引用 (例如 `DC=DomainDnsZones,...`) 。仅当你明确需要跨分区搜索时，才将其设置为 `true`。                                                                   |
| `enable_tls`                   | `yes`         | 用于启用与 LDAP 服务器安全连接的标志。指定 `no` 表示使用明文 `ldap://` 协议 (不推荐) ；指定 `yes` 表示使用基于 SSL/TLS 的 LDAP `ldaps://` 协议 (推荐) ；指定 `starttls` 表示使用旧版 StartTLS 协议 (先使用明文 `ldap://` 协议，再升级为 TLS) 。                                                                                          |
| `tls_minimum_protocol_version` | `tls1.2`      | SSL/TLS 的最低协议版本。可接受的值：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`。                                                                                                                                                                                                       |
| `tls_require_cert`             | `demand`      | SSL/TLS 对端证书验证行为。可接受的值：`never`、`allow`、`try`、`demand`。                                                                                                                                                                                                                |
| `tls_cert_file`                | —             | 证书文件路径。                                                                                                                                                                                                                                                               |
| `tls_key_file`                 | —             | 证书私钥文件路径。                                                                                                                                                                                                                                                             |
| `tls_ca_cert_file`             | —             | CA 证书文件路径。                                                                                                                                                                                                                                                            |
| `tls_ca_cert_dir`              | —             | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | —             | 允许的密码套件 (采用 OpenSSL 表示法) 。                                                                                                                                                                                                                                            |
| `search_limit`                 | `256`         | 此服务器定义执行的 LDAP 搜索查询可返回的最大条目数 (用于用户 DN 检测和角色映射) 。                                                                                                                                                                                                                      |

**`user_dn_detection` 子参数**

本节包含用于检测已绑定用户实际 DN 的 LDAP 搜索参数。这主要用于服务器为 Active Directory 时，在后续角色映射中使用搜索过滤器。生成的用户 DN 将在所有允许使用 `{user_dn}` 子字符串进行替换的位置使用。默认情况下，用户 DN 与绑定 DN 相同；但一旦执行搜索，就会更新为实际检测到的用户 DN 值。

| 参数              | 默认值       | 描述                                                                                                                                         |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `base_dn`       | —         | 用于构造 LDAP 搜索基础 DN 的模板。在 LDAP 搜索期间，模板中的所有 `{user_name}` 和 `{bind_dn}` 子字符串都会替换为实际用户名和绑定 DN，以生成最终的 DN。                                       |
| `scope`         | `subtree` | LDAP 搜索范围。可接受的值：`base`、`one_level`、`children`、`subtree`。                                                                                   |
| `search_filter` | —         | 用于构造 LDAP 搜索过滤器的模板。在 LDAP 搜索期间，模板中的所有 `{user_name}`、`{bind_dn}` 和 `{base_dn}` 子字符串都会替换为实际用户名、绑定 DN 和基础 DN，以生成最终的过滤器。请注意，在 XML 中必须正确转义特殊字符。 |

## LDAP 外部认证器 \{#ldap-external-authenticator\}

可以使用远程 LDAP 服务器作为验证本地定义用户 (在 `users.xml` 或本地访问控制路径中定义的用户) 密码的一种方式。为此，在用户定义中，将原本的 `password` 或类似字段替换为之前定义的 LDAP 服务器名称。

在每次登录尝试时，ClickHouse 会尝试使用提供的凭证，对 [LDAP 服务器定义](#ldap-server-definition) 中由 `bind_dn` 参数指定的 DN 执行“绑定”操作，如果成功，则认为该用户已通过认证。这通常被称为“简单绑定 (simple bind) ”方法。

**示例**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

请注意，用户 `my_user` 关联到 `my_ldap_server`。必须在主配置文件 `config.xml` 中按前文所述配置此 LDAP 服务器。

当启用基于 SQL 的[访问控制和账户管理](/operations/access-rights#access-control-usage)时，通过 LDAP 服务器进行身份验证的用户也可以使用 [CREATE USER](/sql-reference/statements/create/user) 语句创建。

查询：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部用户目录 \{#ldap-external-user-directory\}

除了本地定义的用户之外，还可以使用远程 LDAP 服务器作为用户定义的来源。为此，需要在 `config.xml` 文件的 `users_directories` 部分中的 `ldap` 部分里，指定之前定义好的 LDAP 服务器名称 (参见 [LDAP Server Definition](#ldap-server-definition)) 。

在每次登录尝试时，ClickHouse 会首先尝试在本地查找用户定义并按常规方式进行身份验证。如果未找到该用户，ClickHouse 将假定该用户已在外部 LDAP 目录中定义，并尝试使用提供的凭证在 LDAP 服务器上对指定的 DN 执行 bind 操作。如果成功，该用户将被视为存在并通过认证。用户会被分配在 `roles` 部分中指定列表里的角色。此外，还可以执行 LDAP search 操作，并将结果转换后视为角色名称；如果同时配置了 `role_mapping` 部分，则这些角色将被分配给该用户。所有这些都意味着必须启用由 SQL 驱动的[访问控制与账户管理](/operations/access-rights#access-control-usage)，并且需要通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句来创建角色。

**示例**

写入 `config.xml`。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- Typical LDAP server. -->
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

        <!- Typical Active Directory with role mapping that relies on the detected user DN. -->
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

请注意，`user_directories` 部分中 `ldap` 小节引用的 `my_ldap_server`，必须是在 `config.xml` 中事先定义并完成配置的 LDAP 服务器 (参见 [LDAP Server Definition](#ldap-server-definition)) 。

**参数**

| 参数       | 默认值 | 描述                                                                                             |
| -------- | --- | ---------------------------------------------------------------------------------------------- |
| `server` | —   | 上文 `ldap_servers` config 部分中定义的 LDAP 服务器名称之一。此参数为必填项，不能为空。                                     |
| `roles`  | —   | 包含本地定义角色列表的部分，这些角色将分配给从 LDAP 服务器获取的每个用户。如果此处未指定任何角色，或者在角色映射 (见下文) 过程中未分配任何角色，则用户在认证后将无法执行任何操作。 |

**`role_mapping` 子参数**

包含 LDAP search 参数和映射规则的部分。当用户进行身份验证时，在仍绑定到 LDAP 的情况下，会使用 `search_filter` 和登录用户名执行 LDAP search。对于该 search 找到的每个 entry，都会提取指定 attribute 的值。对于每个带有指定 prefix 的 attribute 值，都会移除该 prefix，其余部分将作为 ClickHouse 中本地定义角色的名称；该角色应事先通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。在同一个 `ldap` 部分中可以定义多个 `role_mapping` 部分。它们都会被应用。

| 参数              | 默认值       | 描述                                                                                                                                                                            |
| --------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | —         | 用于构造 LDAP 搜索基础 DN 的 Template。生成的 DN 会在每次 LDAP 搜索期间，将 Template 中所有 `{user_name}`、`{bind_dn}` 和 `{user_dn}` 子字符串替换为实际的用户名、绑定 DN 和用户 DN 后得到。                                     |
| `scope`         | `subtree` | LDAP 搜索的范围。已接受的值：`base`、`one_level`、`children`、`subtree`。                                                                                                                     |
| `search_filter` | —         | 用于构造 LDAP 搜索过滤器的 Template。生成的过滤器会在每次 LDAP 搜索期间，将 Template 中所有 `{user_name}`、`{bind_dn}`、`{user_dn}` 和 `{base_dn}` 子字符串替换为实际的用户名、绑定 DN、用户 DN 和基础 DN 后得到。请注意，特殊字符必须在 XML 中正确转义。 |
| `attribute`     | `cn`      | LDAP 搜索将返回其值的属性名。                                                                                                                                                             |
| `prefix`        | 空         | LDAP 搜索返回的原始字符串列表中，每个字符串前预期包含的前缀。该前缀将从原始字符串中移除，生成的字符串将被视为本地角色名称。                                                                                                              |