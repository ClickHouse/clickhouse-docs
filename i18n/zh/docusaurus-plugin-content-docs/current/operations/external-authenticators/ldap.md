import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 服务器可用于验证 ClickHouse 用户。实现这一点有两种不同的方法：

- 将 LDAP 用作现有用户的外部身份验证器，这些用户在 `users.xml` 中定义或在本地访问控制路径中定义。
- 将 LDAP 用作外部用户目录，并允许在 LDAP 服务器上存在的本地未定义用户进行身份验证。

对于这两种方法，必须在 ClickHouse 配置中定义一个内部命名的 LDAP 服务器，以便配置的其他部分可以引用它。

## LDAP 服务器定义 {#ldap-server-definition}

要定义 LDAP 服务器，必须在 `config.xml` 中添加 `ldap_servers` 部分。

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

请注意，您可以在 `ldap_servers` 部分内使用不同的名称定义多个 LDAP 服务器。

**参数**

- `host` — LDAP 服务器主机名或 IP，此参数为必填项，不能为空。
- `port` — LDAP 服务器端口，如果 `enable_tls` 设置为 `true`，默认为 `636`，否则为 `389`。
- `bind_dn` — 用于构造要绑定的 DN 的模板。
    - 每次身份验证尝试时，结果 DN 将通过将模板中所有 `{user_name}` 子字符串替换为实际用户名来构造。
- `user_dn_detection` — 具有 LDAP 搜索参数的部分，用于检测绑定用户的实际用户 DN。
    - 当服务器为 Active Directory 时，这主要用于后续角色映射中的搜索过滤器。生成的用户 DN 将在允许的地方替换 `{user_dn}` 子字符串。默认情况下，用户 DN 设置为等于绑定 DN，但一旦进行了搜索，它将使用实际检测到的用户 DN 值进行更新。
        - `base_dn` — 用于构造 LDAP 搜索的基 DN 的模板。
            - 每次进行 LDAP 搜索时，结果 DN 将通过将模板中所有 `{user_name}` 和 `{bind_dn}` 子字符串替换为实际用户名和绑定 DN 来构造。
        - `scope` — LDAP 搜索的范围。
            - 接受的值有：`base`，`one_level`，`children`，`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 每次进行 LDAP 搜索时，结果过滤器将通过将模板中所有 `{user_name}`，`{bind_dn}`，和 `{base_dn}` 子字符串替换为实际用户名、绑定 DN 和基 DN 来构造。
            - 请注意，特殊字符必须在 XML 中正确转义。
- `verification_cooldown` — 成功绑定尝试后的一段时间（以秒为单位），在此期间用户将被视为对所有连续请求成功通过身份验证，而无需联系 LDAP 服务器。
    - 指定 `0`（默认）以禁用缓存，强制每次身份验证请求都联系 LDAP 服务器。
- `enable_tls` — 触发使用 LDAP 服务器的安全连接的标志。
    - 对于明文 `ldap://` 协议（不推荐）指定 `no`。
    - 对于使用 SSL/TLS 的 LDAP `ldaps://` 协议（推荐，默认）指定 `yes`。
    - 对于传统的 StartTLS 协议（明文 `ldap://` 协议，升级到 TLS）指定 `starttls`。
- `tls_minimum_protocol_version` — SSL/TLS 的最低协议版本。
    - 接受的值有：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认）。
- `tls_require_cert` — SSL/TLS 对等证书验证行为。
    - 接受的值有：`never`，`allow`，`try`，`demand`（默认）。
- `tls_cert_file` — 证书文件的路径。
- `tls_key_file` — 证书密钥文件的路径。
- `tls_ca_cert_file` — CA 证书文件的路径。
- `tls_ca_cert_dir` — 包含 CA 证书的目录路径。
- `tls_cipher_suite` — 允许的加密套件（以 OpenSSL 表示法）。

## LDAP 外部身份验证器 {#ldap-external-authenticator}

可以将远程 LDAP 服务器用作验证本地定义用户（在 `users.xml` 中定义或在本地访问控制路径中定义）的密码的方法。为此，在用户定义中指定先前定义的 LDAP 服务器名称，而不是 `password` 或类似部分。

在每次登录尝试时，ClickHouse 尝试使用提供的凭据“绑定”到由 [LDAP 服务器定义](#ldap-server-definition) 中的 `bind_dn` 参数定义的指定 DN，如果成功，则用户被认为已通过身份验证。这通常被称为“简单绑定”方法。

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

请注意，用户 `my_user` 是指 `my_ldap_server`。此 LDAP 服务器必须在主 `config.xml` 文件中按前述方式配置。

当启用基于 SQL 的 [访问控制和帐户管理](/operations/access-rights#access-control-usage) 时，通过 LDAP 服务器进行身份验证的用户也可以使用 [CREATE USER](/sql-reference/statements/create/user) 语句创建。

查询：

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 外部用户目录 {#ldap-external-user-directory}

除了本地定义的用户外，远程 LDAP 服务器可以用作用户定义的来源。为此，在 `config.xml` 文件的 `users_directories` 部分中的 `ldap` 部分指定先前定义的 LDAP 服务器名称（见 [LDAP 服务器定义](#ldap-server-definition)）。

在每次登录尝试时，ClickHouse 尝试在本地查找用户定义并如常进行身份验证。如果未定义用户，ClickHouse 将假定定义存在于外部 LDAP 目录中，并将尝试使用提供的凭据“绑定”到 LDAP 服务器上的指定 DN。如果成功，用户将被视为存在并经过身份验证。用户将从 `roles` 部分中指定的列表中分配角色。此外，可以进行 LDAP “搜索”，结果可以转换并视为角色名称，然后在 `role_mapping` 部分也配置的情况下分配给用户。这意味着必须启用基于 SQL 的 [访问控制和帐户管理](/operations/access-rights#access-control-usage)，并使用 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建角色。

**示例**

进入 `config.xml`。

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

请注意，在 `user_directories` 部分中的 `ldap` 部分提到的 `my_ldap_server` 必须是先前定义并在 `config.xml` 中配置的 LDAP 服务器（见 [LDAP 服务器定义](#ldap-server-definition)）。

**参数**

- `server` — 在上述 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数为必填项，不能为空。
- `roles` — 包含从 LDAP 服务器检索的每个用户将分配的本地定义角色的列表的部分。
    - 如果未在此指定角色或在角色映射中（下文）分配角色，则用户将在身份验证后无法执行任何操作。
- `role_mapping` — 包含 LDAP 搜索参数和映射规则的部分。
    - 当用户通过 LDAP 进行身份验证并仍然绑定时，使用 `search_filter` 和已登录用户的名称进行 LDAP 搜索。对于在搜索过程中找到的每个条目，提取指定属性的值。对于每个具有指定前缀的属性值，删除前缀，剩余的值将成为在 ClickHouse 中定义的本地角色的名称，预计该角色将事先通过 [CREATE ROLE](/sql-reference/statements/create/role) 语句创建。
    - 可以在同一 `ldap` 部分内定义多个 `role_mapping` 部分。所有部分将被应用。
        - `base_dn` — 用于构造 LDAP 搜索基 DN 的模板。
            - 每次进行 LDAP 搜索时，结果 DN 将通过将模板中所有 `{user_name}`，`{bind_dn}`，和 `{user_dn}` 子字符串替换为实际用户名、绑定 DN 和用户 DN 来构造。
        - `scope` — LDAP 搜索的范围。
            - 接受的值有：`base`，`one_level`，`children`，`subtree`（默认）。
        - `search_filter` — 用于构造 LDAP 搜索的搜索过滤器的模板。
            - 每次进行 LDAP 搜索时，结果过滤器将通过将模板中所有 `{user_name}`，`{bind_dn}`，`{user_dn}` 和 `{base_dn}` 子字符串替换为实际用户名、绑定 DN、用户 DN 和基 DN 来构造。
            - 请注意，特殊字符必须在 XML 中正确转义。
        - `attribute` — LDAP 搜索将返回的属性名称。默认为 `cn`。
        - `prefix` — 预期出现在 LDAP 搜索返回的原始字符串列表中每个字符串前面的前缀。将从原始字符串中删除前缀，结果字符串将被视为本地角色名称。默认为空。
