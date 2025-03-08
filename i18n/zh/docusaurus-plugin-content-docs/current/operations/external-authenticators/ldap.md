---
slug: /operations/external-authenticators/ldap
title: 'LDAP'
---
import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 服务器可用于验证 ClickHouse 用户。实现这一点有两种不同的方法：

- 将 LDAP 作为现有用户的外部验证器，这些用户在 `users.xml` 中或在本地访问控制路径中定义。
- 将 LDAP 作为外部用户目录，允许本地未定义的用户在 LDAP 服务器上存在时被验证。

对于这两种方法，必须在 ClickHouse 配置中定义一个内部命名的 LDAP 服务器，以便配置的其他部分可以引用它。

## LDAP 服务器定义 {#ldap-server-definition}

要定义 LDAP 服务器，您必须在 `config.xml` 中添加 `ldap_servers` 部分。

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

        <!- 典型的 Active Directory，配置了用户 DN 检测以进行进一步的角色映射。 -->
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

注意，您可以使用不同的名称在 `ldap_servers` 部分内定义多个 LDAP 服务器。

**参数**

- `host` — LDAP 服务器的主机名或 IP，此参数是必需的，不能为空。
- `port` — LDAP 服务器端口，如果 `enable_tls` 设置为 `true`，默认值为 `636`，否则为 `389`。
- `bind_dn` — 用于构造绑定的 DN 的模板。
    - 结果 DN 将通过在每次身份验证尝试过程中将模板的所有 `{user_name}` 子字符串替换为实际用户名来构造。
- `user_dn_detection` — 包含用于检测绑定用户的实际用户 DN 的 LDAP 搜索参数的部分。
    - 这主要用于 Active Directory 服务器的进一步角色映射时的搜索过滤器。当搜索执行时，结果用户 DN 将用于替换 `{user_dn}` 子字符串。默认情况下，用户 DN 设置为等于绑定 DN，但一旦执行搜索，将更新为实际检测到的用户 DN 值。
        - `base_dn` — 用于构造 LDAP 搜索基础 DN 的模板。
            - 结果 DN 将通过将模板的所有 `{user_name}` 和 `{bind_dn}` 子字符串替换为实际用户名和绑定 DN 来构造。
        - `scope` — LDAP 搜索的范围。
            - 可接受的值为：`base`、`one_level`、`children`、`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 结果过滤器将通过替换模板的所有 `{user_name}`、`{bind_dn}` 和 `{base_dn}` 子字符串来构造，使用实际的用户名、绑定 DN 和基础 DN。
            - 注意，特殊字符必须在 XML 中正确转义。
- `verification_cooldown` — 在成功绑定尝试后，假定用户在所有后续请求中成功验证的时间段（以秒为单位），不与 LDAP 服务器联系。
    - 指定 `0`（默认）以禁用缓存，强制每次身份验证请求都联系 LDAP 服务器。
- `enable_tls` — 触发与 LDAP 服务器之间的安全连接的标志。
    - 指定 `no` 用于明文 `ldap://` 协议（不推荐）。
    - 指定 `yes` 用于 SSL/TLS 的 LDAP `ldaps://` 协议（推荐，默认值）。
    - 指定 `starttls` 用于老旧的 StartTLS 协议（明文 `ldap://` 协议，升级到 TLS）。
- `tls_minimum_protocol_version` — SSL/TLS 的最小协议版本。
    - 可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。
- `tls_require_cert` — SSL/TLS 对等证书验证行为。
    - 可接受的值为：`never`、`allow`、`try`、`demand`（默认）。
- `tls_cert_file` — 证书文件的路径。
- `tls_key_file` — 证书密钥文件的路径。
- `tls_ca_cert_file` — CA 证书文件的路径。
- `tls_ca_cert_dir` — 包含 CA 证书的目录的路径。
- `tls_cipher_suite` — 允许的密码套件（以 OpenSSL 表示法）。

## LDAP 外部验证器 {#ldap-external-authenticator}

远程 LDAP 服务器可以用作验证本地定义用户（在 `users.xml` 中定义或在本地访问控制路径中定义）的密码的方法。为此，在用户定义中的 `password` 或类似部分中指定先前定义的 LDAP 服务器名称。

在每次登录尝试时，ClickHouse 尝试使用提供的凭据“绑定”到由 [LDAP 服务器定义](#ldap-server-definition) 中的 `bind_dn` 参数定义的指定 DN，如果成功，用户将被视为经过验证。这通常称为“简单绑定”方法。

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

注意，用户 `my_user` 引用 `my_ldap_server`。这个 LDAP 服务器必须如前所述在主 `config.xml` 文件中配置。

当启用 SQL 驱动的 [访问控制与账户管理](/operations/access-rights#access-control-usage) 时，可以使用 [CREATE USER](/sql-reference/statements/create/user) 语句创建通过 LDAP 服务器验证的用户。

查询：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部用户目录 {#ldap-external-user-directory}

除了本地定义的用户，远程 LDAP 服务器还可以用作用户定义的来源。为此，在 `config.xml` 文件的 `users_directories` 部分的 `ldap` 部分中指定先前定义的 LDAP 服务器名称（见 [LDAP 服务器定义](#ldap-server-definition)）。

在每次登录尝试时，ClickHouse 尝试在本地查找用户定义并像往常一样进行身份验证。如果用户未定义，ClickHouse 将假定定义存在于外部 LDAP 目录中，并尝试使用提供的凭据“绑定”到 LDAP 服务器上的指定 DN。如果成功，用户将被视为存在并被验证。用户将被分配 `roles` 部分中指定的角色列表。此外，可以执行 LDAP “搜索”，并可以将结果转换并视为角色名称，然后分配给用户，前提是 `role_mapping` 部分也进行了配置。所有这些意味着启用了 SQL 驱动的 [访问控制与账户管理](/operations/access-rights#access-control-usage)，并且角色是使用 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建的。

**示例**

进入 `config.xml`。

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

        <!- 典型的 Active Directory，其角色映射依赖于检测到的用户 DN。 -->
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

注意，在 `user_directories` 部分的 `ldap` 中提到的 `my_ldap_server` 必须是先前定义并在 `config.xml` 中配置的 LDAP 服务器（见 [LDAP 服务器定义](#ldap-server-definition)）。

**参数**

- `server` — 在上述 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是必需的，不能为空。
- `roles` — 指定将分配给从 LDAP 服务器检索到的每个用户的本地角色列表的部分。
    - 如果这里没有指定角色或在角色映射（如下）期间没有分配角色，用户在身份验证后将无法执行任何操作。
- `role_mapping` — 包含 LDAP 搜索参数和映射规则的部分。
    - 当用户进行身份验证时，同时仍绑定到 LDAP，使用 `search_filter` 和登录用户的名称执行 LDAP 搜索。在该搜索期间找到的每个条目的值提取指定属性。对于每个具有指定前缀的属性值，前缀将被删除，其余值将成为在 ClickHouse 中定义的本地角色的名称，期望事先通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。
    - 可以在同一 `ldap` 部分内定义多个 `role_mapping` 部分。所有这些都会被应用。
        - `base_dn` — 用于构造 LDAP 搜索基础 DN 的模板。
            - 结果 DN 将通过将模板的所有 `{user_name}`、`{bind_dn}` 和 `{user_dn}` 子字符串替换为每次 LDAP 搜索期间的实际用户名、绑定 DN 和用户 DN 来构造。
        - `scope` — LDAP 搜索的范围。
            - 可接受的值为：`base`、`one_level`、`children`、`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 结果过滤器将通过替换模板中的所有 `{user_name}`、`{bind_dn}`、`{user_dn}` 和 `{base_dn}` 子字符串构造，使用每次 LDAP 搜索期间的实际用户名、绑定 DN、用户 DN 和基础 DN。
            - 注意，特殊字符必须在 XML 中正确转义。
        - `attribute` — LDAP 搜索返回的值的属性名称。默认是 `cn`。
        - `prefix` — 期望在 LDAP 搜索返回的原始字符串列表中每个字符串前面的前缀。前缀将从原始字符串中删除，结果字符串将被视为本地角色名称。默认是空。
