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

* `host` — LDAP 服务器的主机名或 IP，此参数为必需参数，且不能为空。
* `port` — LDAP 服务器端口，如果 `enable_tls` 设置为 `true`，默认值为 `636`，否则为 `389`。
* `bind_dn` — 用于构造绑定 DN 的模板。
  * 最终的 DN 将在每次认证尝试期间，通过将模板中所有 `{user_name}` 子串替换为实际用户名来构造。
* `user_dn_detection` — 包含用于检测绑定用户实际用户 DN 的 LDAP 搜索参数的部分。
  * 这主要用于在服务器为 Active Directory 时，在搜索过滤器中进行后续角色映射。生成的用户 DN 将用于在允许的位置替换 `{user_dn}` 子串。默认情况下，用户 DN 与 bind DN 相同，但一旦执行搜索，它将被更新为实际检测到的用户 DN 值。
    * `base_dn` — 用于构造 LDAP 搜索基础 DN 的模板。
      * 最终的 DN 将在 LDAP 搜索期间，通过将模板中所有 `{user_name}` 和 `{bind_dn}` 子串替换为实际用户名和 bind DN 来构造。
    * `scope` — LDAP 搜索的作用域。
      * 可接受的值为：`base`、`one_level`、`children`、`subtree`（默认）。
    * `search_filter` — 用于构造 LDAP 搜索过滤器的模板。
      * 最终的过滤器将在 LDAP 搜索期间，通过将模板中所有 `{user_name}`、`{bind_dn}` 和 `{base_dn}` 子串替换为实际用户名、bind DN 和 base DN 来构造。
      * 注意，必须在 XML 中正确转义特殊字符。
* `verification_cooldown` — 成功绑定尝试之后的一段时间（以秒为单位），在此期间内，所有连续请求在不联系 LDAP 服务器的情况下，都会被视为用户已成功认证。
  * 指定 `0`（默认）以禁用缓存，并强制对每个认证请求都联系 LDAP 服务器。
* `enable_tls` — 用于启用与 LDAP 服务器安全连接的标志。
  * 指定 `no` 使用明文 `ldap://` 协议（不推荐）。
  * 指定 `yes` 使用基于 SSL/TLS 的 LDAP `ldaps://` 协议（推荐，默认）。
  * 指定 `starttls` 使用传统的 StartTLS 协议（明文 `ldap://` 协议，升级为 TLS）。
* `tls_minimum_protocol_version` — SSL/TLS 的最小协议版本。
  * 可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。
* `tls_require_cert` — SSL/TLS 对端证书验证行为。
  * 可接受的值为：`never`、`allow`、`try`、`demand`（默认）。
* `tls_cert_file` — 证书文件路径。
* `tls_key_file` — 证书密钥文件路径。
* `tls_ca_cert_file` — CA 证书文件路径。
* `tls_ca_cert_dir` — 包含 CA 证书的目录路径。
* `tls_cipher_suite` — 允许的密码套件（使用 OpenSSL 表示法）。

## LDAP 外部认证器 \{#ldap-external-authenticator\}

可以使用远程 LDAP 服务器作为验证本地定义用户（在 `users.xml` 或本地访问控制路径中定义的用户）密码的一种方式。为此，在用户定义中，将原本的 `password` 或类似字段替换为之前定义的 LDAP 服务器名称。

在每次登录尝试时，ClickHouse 会尝试使用提供的凭证，对 [LDAP 服务器定义](#ldap-server-definition) 中由 `bind_dn` 参数指定的 DN 执行“绑定”操作，如果成功，则认为该用户已通过认证。这通常被称为“简单绑定（simple bind）”方法。

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

除了本地定义的用户之外，还可以使用远程 LDAP 服务器作为用户定义的来源。为此，需要在 `config.xml` 文件的 `users_directories` 部分中的 `ldap` 部分里，指定之前定义好的 LDAP 服务器名称（参见 [LDAP Server Definition](#ldap-server-definition)）。

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

请注意，`user_directories` 部分中 `ldap` 小节引用的 `my_ldap_server`，必须是在 `config.xml` 中事先定义并完成配置的 LDAP 服务器（参见 [LDAP Server Definition](#ldap-server-definition)）。

**参数**

* `server` — 在上面 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数为必填项，且不能为空。
* `roles` — 包含本地定义角色列表的部分，这些角色将被分配给每个从 LDAP 服务器检索到的用户。
  * 如果此处未指定任何角色，或者在下面的角色映射过程中未分配角色，用户在完成认证后将无法执行任何操作。
* `role_mapping` — 包含 LDAP 搜索参数和映射规则的部分。
  * 当用户进行认证时，在仍然绑定到 LDAP 的情况下，将使用 `search_filter` 和已登录用户的名称执行 LDAP 搜索。对在该搜索中找到的每个条目，将提取指定属性的值。对于每个具有指定前缀的属性值，将移除该前缀，其余部分的值将作为在 ClickHouse 中本地定义的角色名称，且这些角色应事先通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。
  * 在同一个 `ldap` 部分中可以定义多个 `role_mapping` 小节，且会全部生效。
    * `base_dn` — 用于构造 LDAP 搜索基础 DN 的模板。
      * 最终 DN 将通过在每次 LDAP 搜索期间，用实际用户名、绑定 DN 和用户 DN 分别替换模板中的 `{user_name}`、`{bind_dn}` 和 `{user_dn}` 子串来构造。
    * `scope` — LDAP 搜索的范围。
      * 可接受的取值为：`base`、`one_level`、`children`、`subtree`（默认）。
    * `search_filter` — 用于构造 LDAP 搜索过滤器的模板。
      * 最终过滤器将通过在每次 LDAP 搜索期间，用实际用户名、绑定 DN、用户 DN 和基础 DN 分别替换模板中的 `{user_name}`、`{bind_dn}`、`{user_dn}` 和 `{base_dn}` 子串来构造。
      * 注意，必须在 XML 中对特殊字符进行正确转义。
    * `attribute` — 其值将由 LDAP 搜索返回的属性名。默认为 `cn`。
    * `prefix` — 预期出现在 LDAP 搜索返回的原始字符串列表中每个字符串前面的前缀。该前缀会从原始字符串中移除，得到的字符串将被视为本地角色名称。默认为空。
