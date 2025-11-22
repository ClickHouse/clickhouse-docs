---
description: '配置 ClickHouse 的 LDAP 身份验证指南'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 服务器可用于对 ClickHouse 用户进行身份验证。可以通过两种不同的方法来实现：

* 将 LDAP 用作现有用户（在 `users.xml` 或本地访问控制路径中定义）的外部身份验证服务。
* 将 LDAP 用作外部用户目录，允许本地未定义但在 LDAP 服务器中存在的用户通过身份验证。

对于上述两种方法，都必须在 ClickHouse 配置中定义一个具名的 LDAP 服务器，以便配置的其他部分可以引用它。


## LDAP 服务器定义 {#ldap-server-definition}

要定义 LDAP 服务器,需要在 `config.xml` 中添加 `ldap_servers` 配置段。

**示例**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- 典型的 LDAP 服务器。 -->
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

        <!- 典型的 Active Directory,已配置用户 DN 检测以用于后续角色映射。 -->
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

注意,可以在 `ldap_servers` 配置段中使用不同的名称定义多个 LDAP 服务器。

**参数**


- `host` — LDAP 服务器主机名或 IP，此参数为必填项且不能为空。
- `port` — LDAP 服务器端口，如果 `enable_tls` 设置为 `true`，默认值为 `636`，否则为 `389`。
- `bind_dn` — 用于构造要绑定的 DN 的模板。
  - 最终 DN 将通过在每次身份验证尝试期间，把模板中的所有 `{user_name}` 子串替换为实际用户名来构造。
- `user_dn_detection` — 用于检测已绑定用户实际用户 DN 的 LDAP 搜索参数配置段。
  - 这主要用于在服务器为 Active Directory 时，在后续角色映射的搜索过滤器中使用。生成的用户 DN 将在所有允许的位置用于替换 `{user_dn}` 子串。默认情况下，用户 DN 设置为与 bind DN 相同，但一旦执行搜索，它将更新为实际检测到的用户 DN 值。
    - `base_dn` — 用于构造 LDAP 搜索基础 DN 的模板。
      - 最终 DN 将通过在 LDAP 搜索期间，把模板中的所有 `{user_name}` 和 `{bind_dn}` 子串分别替换为实际用户名和 bind DN 来构造。
    - `scope` — LDAP 搜索的范围。
      - 可接受的值为：`base`、`one_level`、`children`、`subtree`（默认）。
    - `search_filter` — 用于构造 LDAP 搜索过滤器的模板。
      - 最终过滤器将通过在 LDAP 搜索期间，把模板中的 `{user_name}`、`{bind_dn}` 和 `{base_dn}` 子串分别替换为实际用户名、bind DN 和 base DN 来构造。
      - 注意，必须在 XML 中对特殊字符进行正确转义。
- `verification_cooldown` — 成功绑定尝试之后的一段时间（秒），在此期间，将认为该用户在所有连续请求中均已成功通过身份验证，而无需再次联系 LDAP 服务器。
  - 指定 `0`（默认）以禁用缓存，并强制对每个身份验证请求都联系 LDAP 服务器。
- `enable_tls` — 用于启用与 LDAP 服务器建立安全连接的标志。
  - 指定 `no` 以使用明文 `ldap://` 协议（不推荐）。
  - 指定 `yes` 以使用基于 SSL/TLS 的 LDAP `ldaps://` 协议（推荐，默认）。
  - 指定 `starttls` 以使用旧版 StartTLS 协议（先使用明文 `ldap://` 协议，再升级为 TLS）。
- `tls_minimum_protocol_version` — SSL/TLS 的最小协议版本。
  - 可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。
- `tls_require_cert` — SSL/TLS 对端证书验证行为。
  - 可接受的值为：`never`、`allow`、`try`、`demand`（默认）。
- `tls_cert_file` — 证书文件路径。
- `tls_key_file` — 证书私钥文件路径。
- `tls_ca_cert_file` — CA 证书文件路径。
- `tls_ca_cert_dir` — 包含 CA 证书的目录路径。
- `tls_cipher_suite` — 允许的密码套件（OpenSSL 表示法）。



## LDAP 外部身份验证器 {#ldap-external-authenticator}

远程 LDAP 服务器可用作验证本地定义用户(在 `users.xml` 或本地访问控制路径中定义的用户)密码的方法。要实现此功能,请在用户定义中指定先前定义的 LDAP 服务器名称,而不是 `password` 或类似的配置段。

在每次登录尝试时,ClickHouse 会尝试使用提供的凭据"绑定"到 [LDAP 服务器定义](#ldap-server-definition)中由 `bind_dn` 参数定义的指定 DN,如果成功,则认为用户已通过身份验证。这通常称为"简单绑定"方法。

**示例**

```xml
<clickhouse>
    <!-- ... -->
    <users>
        <!-- ... -->
        <my_user>
            <!-- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

注意,用户 `my_user` 引用了 `my_ldap_server`。此 LDAP 服务器必须按照前面所述在主 `config.xml` 文件中进行配置。

当启用基于 SQL 的[访问控制和账户管理](/operations/access-rights#access-control-usage)时,通过 LDAP 服务器进行身份验证的用户也可以使用 [CREATE USER](/sql-reference/statements/create/user) 语句创建。

查询:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```


## LDAP 外部用户目录 {#ldap-external-user-directory}

除了本地定义的用户外,还可以使用远程 LDAP 服务器作为用户定义的来源。要实现此功能,需在 `config.xml` 文件的 `users_directories` 部分内的 `ldap` 部分中指定先前定义的 LDAP 服务器名称(参见 [LDAP 服务器定义](#ldap-server-definition))。

每次登录尝试时,ClickHouse 会先尝试在本地查找用户定义并按常规方式进行身份验证。如果用户未定义,ClickHouse 将假定该定义存在于外部 LDAP 目录中,并尝试使用提供的凭据"绑定"到 LDAP 服务器上指定的 DN。如果成功,该用户将被视为存在且已通过身份验证。该用户将被分配 `roles` 部分中指定列表的角色。此外,如果还配置了 `role_mapping` 部分,则可以执行 LDAP "搜索",并将结果转换为角色名称后分配给用户。这意味着必须启用基于 SQL 的[访问控制和账户管理](/operations/access-rights#access-control-usage),并使用 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建角色。

**示例**

配置写入 `config.xml`。

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- 典型的 LDAP 服务器。 -->
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

        <!- 典型的 Active Directory,其角色映射依赖于检测到的用户 DN。 -->
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

请注意,`user_directories` 部分内的 `ldap` 部分中引用的 `my_ldap_server` 必须是先前在 `config.xml` 中配置的 LDAP 服务器(参见 [LDAP 服务器定义](#ldap-server-definition))。

**参数**


- `server` — 上文 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数为必需且不能为空。
- `roles` — 包含本地定义角色列表的部分，这些角色将分配给从 LDAP 服务器检索到的每个用户。
  - 如果此处未指定角色，或在角色映射（见下文）期间未分配角色，用户在完成身份验证后将无法执行任何操作。
- `role_mapping` — 包含 LDAP 搜索参数和映射规则的部分。
  - 当用户进行身份验证时，在仍然绑定到 LDAP 的状态下，将使用 `search_filter` 和已登录用户的名称执行一次 LDAP 搜索。对于该搜索中找到的每个条目，将提取指定属性的值。对于每个具有指定前缀的属性值，将移除该前缀，剩余部分将作为在 ClickHouse 中定义的本地角色名称，且预期该角色已通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句预先创建。
  - 在同一个 `ldap` 部分中可以定义多个 `role_mapping` 小节。它们都会被应用。
    - `base_dn` — 用于构造 LDAP 搜索 base DN 的模板。
      - 每次执行 LDAP 搜索时，将使用实际的用户名、bind DN 和 user DN 替换模板中的 `{user_name}`、`{bind_dn}` 和 `{user_dn}` 子串，以构造最终的 DN。
    - `scope` — LDAP 搜索的范围。
      - 可接受的值为：`base`、`one_level`、`children`、`subtree`（默认值）。
    - `search_filter` — 用于构造 LDAP 搜索过滤器的模板。
      - 每次执行 LDAP 搜索时，将使用实际的用户名、bind DN、user DN 和 base DN 替换模板中的 `{user_name}`、`{bind_dn}`、`{user_dn}` 和 `{base_dn}` 子串，以构造最终的过滤器。
      - 注意，特殊字符在 XML 中必须进行正确转义。
    - `attribute` — 其值将由 LDAP 搜索返回的属性名称。默认值为 `cn`。
    - `prefix` — 预期出现在 LDAP 搜索返回的原始字符串列表中每个字符串前面的前缀。该前缀将从原始字符串中移除，剩余字符串将被视为本地角色名称。默认为空。
