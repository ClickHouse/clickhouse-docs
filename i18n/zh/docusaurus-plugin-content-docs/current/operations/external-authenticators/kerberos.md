---
'description': '现有并正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行身份验证。'
'slug': '/operations/external-authenticators/kerberos'
'title': 'Kerberos'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

现有并正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行身份验证。

目前，Kerberos 只能用作对在 `users.xml` 中或本地访问控制路径中定义的现有用户的外部验证器。这些用户只能使用 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行身份验证。

对于这种方法，必须在系统中配置 Kerberos，并在 ClickHouse 配置中启用它。

## 在 ClickHouse 中启用 Kerberos {#enabling-kerberos-in-clickhouse}

要启用 Kerberos，应该在 `config.xml` 中包含 `kerberos` 部分。此部分可以包含附加参数。

#### 参数 {#parameters}

- `principal` - 将在接受安全上下文时获取并使用的标准服务主体名称。
  - 此参数是可选的，如果省略，则将使用默认主体。

- `realm` - 用于限制身份验证的领域，仅限于发起者的领域与其匹配的请求。
  - 此参数是可选的，如果省略，则不会应用基于领域的额外过滤。

- `keytab` - 服务 keytab 文件的路径。
  - 此参数是可选的，如果省略，则必须在 `KRB5_KTNAME` 环境变量中设置服务 keytab 文件的路径。

示例（进入 `config.xml`）：

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

带有主体规范：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

带有领域过滤：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
您只能定义一个 `kerberos` 部分。存在多个 `kerberos` 部分将强制 ClickHouse 禁用 Kerberos 认证。
:::

:::note
`principal` 和 `realm` 部分不能同时指定。两个部分同时存在将强制 ClickHouse 禁用 Kerberos 认证。
:::

## Kerberos 作为现有用户的外部验证器 {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos 可用作验证本地定义用户身份（在 `users.xml` 中定义的用户或在本地访问控制路径中的用户）的方法。目前，仅通过 HTTP 接口的请求可以进行 *kerberized*（通过 GSS-SPNEGO 机制）。

Kerberos 主体名称格式通常遵循此模式：

- *primary/instance@REALM*

主体的 */instance* 部分可以出现零次或多次。 **发起者标准主体名称的 *primary* 部分预计与进行身份验证的 kerberized 用户名匹配**。

### 在 `users.xml` 中启用 Kerberos {#enabling-kerberos-in-users-xml}

为了为用户启用 Kerberos 认证，在用户定义中指定 `kerberos` 部分，而不是 `password` 或类似部分。

参数：

- `realm` - 将用于限制身份验证的领域，仅限于发起者的领域与其匹配的请求。
  - 此参数是可选的，如果省略，则不会应用基于领域的额外过滤。

示例（进入 `users.xml`）：

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <kerberos>
                <realm>EXAMPLE.COM</realm>
            </kerberos>
        </my_user>
    </users>
</clickhouse>
```

:::note
请注意，Kerberos 认证不能与任何其他认证机制同时使用。存在诸如 `password` 等任何其他部分与 `kerberos` 共同存在将强制 ClickHouse 关闭。
:::

:::info 提醒
请注意，现在，一旦用户 `my_user` 使用 `kerberos`，必须在主 `config.xml` 文件中启用 Kerberos，如前所述。
:::

### 使用 SQL 启用 Kerberos {#enabling-kerberos-using-sql}

当在 ClickHouse 中启用 [SQL 驱动的访问控制和帐户管理](/operations/access-rights#access-control-usage) 时，可以使用 SQL 语句创建通过 Kerberos 识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...或者，不进行领域过滤：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
