---
'description': '配置 ClickHouse 的 LDAP 认证指南'
'slug': '/operations/external-authenticators/ldap'
'title': 'LDAP'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 服务器可以用来验证 ClickHouse 用户。有两种不同的方法可以实现这一点：

- 使用 LDAP 作为现有用户的外部验证器，这些用户定义在 `users.xml` 或本地访问控制路径中。
- 使用 LDAP 作为外部用户目录，并允许在 LDAP 服务器上存在的本地未定义用户进行身份验证。

对于这两种方法，必须在 ClickHouse 配置中定义一个内部命名的 LDAP 服务器，以便配置的其他部分可以引用它。

## LDAP 服务器定义 {#ldap-server-definition}

要定义 LDAP 服务器，您必须在 `config.xml` 中添加 `ldap_servers` 部分。

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

请注意，您可以在 `ldap_servers` 部分中使用不同的名称定义多个 LDAP 服务器。

**参数**

- `host` — LDAP 服务器的主机名或 IP，此参数是必需的，不能为空。
- `port` — LDAP 服务器端口，默认为 `636`（如果 `enable_tls` 设置为 `true`），否则为 `389`。
- `bind_dn` — 用于构造绑定所需 DN 的模板。
    - 结果 DN 将通过在每次身份验证尝试中用实际用户名替换模板中的所有 `{user_name}` 子字符串来构造。
- `user_dn_detection` — 包含用于检测已绑定用户实际用户 DN 的 LDAP 搜索参数的部分。
    - 这主要用于在服务器为 Active Directory 时的搜索过滤器中的进一步角色映射。结果用户 DN 将在替换 `{user_dn}` 子字符串时使用。默认情况下，用户 DN 被设置为等于绑定 DN，但一旦执行搜索，它将被更新为实际检测到的用户 DN 值。
        - `base_dn` — 用于构造 LDAP 搜索基本 DN 的模板。
            - 结果的 DN 将通过在 LDAP 搜索期间用实际用户名和绑定 DN 替换模板中所有的 `{user_name}` 和 `{bind_dn}` 子字符串来构造。
        - `scope` — LDAP 搜索的范围。
            - 可接受的值为：`base`，`one_level`，`children`，`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 结果过滤器将通过在 LDAP 搜索期间用实际用户名、绑定 DN 和基础 DN 替换模板中所有的 `{user_name}`、`{bind_dn}` 和 `{base_dn}` 子字符串来构造。
            - 注意，特殊字符必须在 XML 中正确转义。
- `verification_cooldown` — 在成功绑定尝试之后的一段时间（以秒为单位），在此时间段内，用户将被视为已成功验证，所有后续请求无需联系 LDAP 服务器。
    - 指定 `0`（默认值）以禁用缓存，并强制每个身份验证请求都联系 LDAP 服务器。
- `enable_tls` — 触发使用与 LDAP 服务器的安全连接的标志。
    - 对于纯文本的 `ldap://` 协议，请指定 `no`（不推荐）。
    - 对于 SSL/TLS `ldaps://` 协议，请指定 `yes`（推荐，默认）。
    - 对于旧版 StartTLS 协议（纯文本 `ldap://` 协议，升级为 TLS），请指定 `starttls`。
- `tls_minimum_protocol_version` — SSL/TLS 的最低协议版本。
    - 可接受的值为：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认）。
- `tls_require_cert` — SSL/TLS 对等证书验证行为。
    - 可接受的值为：`never`，`allow`，`try`，`demand`（默认）。
- `tls_cert_file` — 证书文件的路径。
- `tls_key_file` — 证书密钥文件的路径。
- `tls_ca_cert_file` — CA 证书文件的路径。
- `tls_ca_cert_dir` — 包含 CA 证书的目录路径。
- `tls_cipher_suite` — 允许的密码套件（以 OpenSSL 记法表示）。

## LDAP 外部验证器 {#ldap-external-authenticator}

可以使用远程 LDAP 服务器作为对本地定义用户（在 `users.xml` 或本地访问控制路径中定义的用户）验证密码的方法。要实现这一点，请在用户定义的 `password` 或类似部分中指定之前定义的 LDAP 服务器名称。

在每次登录尝试中，ClickHouse 会尝试使用提供的凭据“绑定”到 LDAP 服务器上由 `bind_dn` 参数定义的指定 DN，如果成功，用户将被视为已验证。这通常被称为“简单绑定”方法。

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

请注意，用户 `my_user` 引用 `my_ldap_server`。这个 LDAP 服务器必须如前所述在主要的 `config.xml` 文件中进行配置。

当启用 SQL 驱动的 [访问控制和账户管理](/operations/access-rights#access-control-usage) 时，可以使用 [CREATE USER](/sql-reference/statements/create/user) 语句创建通过 LDAP 服务器验证的用户。

查询：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部用户目录 {#ldap-external-user-directory}

除了本地定义的用户外，远程 LDAP 服务器还可以用作用户定义的来源。要实现这一点，请在 `config.xml` 文件的 `users_directories` 部分中的 `ldap` 部分中指定之前定义的 LDAP 服务器名称（请参见 [LDAP 服务器定义](#ldap-server-definition)）。

在每次登录尝试中，ClickHouse 会尝试在本地查找用户定义并按常规方式进行身份验证。如果未定义用户，ClickHouse 将假定定义存在于外部 LDAP 目录中，并将尝试使用提供的凭据在 LDAP 服务器上对指定 DN 进行“绑定”。如果成功，用户将被视为存在且已验证。用户将被分配来自 `roles` 部分中指定列表的角色。此外，如果 `role_mapping` 部分也配置了，LDAP “搜索”可以执行，并且结果可以被转换并视为角色名称，然后分配给用户。这一切意味着 SQL 驱动的 [访问控制和账户管理](/operations/access-rights#access-control-usage) 已启用，并且角色通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。

**示例**

插入 `config.xml`。

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

请注意，在 `user_directories` 部分中的 `ldap` 部分中提到的 `my_ldap_server` 必须是一个在 `config.xml` 中配置过并且被定义的 LDAP 服务器（见 [LDAP 服务器定义](#ldap-server-definition)）。

**参数**

- `server` — 在上述 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是必需的，不能为空。
- `roles` — 列出将分配给从 LDAP 服务器获取的每个用户的本地定义角色的部分。
    - 如果在此处未指定角色或在角色映射期间未分配角色（如下所述），用户将在身份验证后将无法执行任何操作。
- `role_mapping` — 包含 LDAP 搜索参数和映射规则的部分。
    - 当用户进行身份验证时，同时仍然绑定到 LDAP，会使用 `search_filter` 和登录用户的名称执行 LDAP 搜索。在该搜索期间找到的每个条目的指定属性值都会被提取。对于每个具有指定前缀的属性值，将去掉前缀，剩余的值将成为在 ClickHouse 中预先定义的本地角色的名称，预计这些角色已经通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。
    - 可以在同一 `ldap` 部分中定义多个 `role_mapping` 部分。它们都会被应用。
        - `base_dn` — 用于构造 LDAP 搜索的基本 DN 的模板。
            - 结果的 DN 将通过在每次 LDAP 搜索期间用实际用户名、绑定 DN 和用户 DN 替换模板中的所有 `{user_name}`、`{bind_dn}` 和 `{user_dn}` 子字符串来构造。
        - `scope` — LDAP 搜索的范围。
            - 可接受的值为：`base`，`one_level`，`children`，`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 结果的过滤器将通过在每次 LDAP 搜索中用实际用户名、绑定 DN、用户 DN 和基础 DN 替换模板中的所有 `{user_name}`、`{bind_dn}`、`{user_dn}` 和 `{base_dn}` 子字符串来构造。
            - 注意，特殊字符必须在 XML 中正确转义。
        - `attribute` — LDAP 搜索将返回其值的属性名称。默认为 `cn`。
        - `prefix` — 期望在 LDAP 搜索返回的原始字符串列表中的每个字符串前面出现的前缀。前缀将从原始字符串中去掉，结果字符串将被视为本地角色名称。默认为空。
