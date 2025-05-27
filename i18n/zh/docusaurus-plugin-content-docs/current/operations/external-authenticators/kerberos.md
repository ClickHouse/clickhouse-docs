---
'description': '现有且正确配置的 ClickHouse 用户可以通过 Kerberos 身份验证协议进行身份验证。'
'slug': '/operations/external-authenticators/kerberos'
'title': 'Kerberos'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

现有的并正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行身份验证。

目前，Kerberos 只能作为现有用户（在 `users.xml` 或本地访问控制路径中定义）的一种外部认证方法。这些用户只能使用 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行身份验证。

为此，系统中必须配置 Kerberos，并且必须在 ClickHouse 配置中启用。

## 在 ClickHouse 中启用 Kerberos {#enabling-kerberos-in-clickhouse}

要启用 Kerberos，应在 `config.xml` 中包含 `kerberos` 部分。此部分可以包含其他参数。

#### 参数: {#parameters}

- `principal` - 规范的服务主体名称，在接收安全上下文时将被获取和使用。
    - 此参数是可选的，如果省略，将使用默认主体。

- `realm` - 一个领域，将用于将身份验证限制为只有当发起者的领域与其匹配的请求。
    - 此参数是可选的，如果省略，将不应用额外的领域过滤。

- `keytab` - 服务密钥表文件的路径。
    - 此参数是可选的，如果省略，服务密钥表文件的路径必须在 `KRB5_KTNAME` 环境变量中设置。

示例（放入 `config.xml`）:

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
您只能定义一个 `kerberos` 部分。存在多个 `kerberos` 部分将迫使 ClickHouse 禁用 Kerberos 认证。
:::

:::note
`principal` 和 `realm` 部分不能同时指定。两个部分同时存在将迫使 ClickHouse 禁用 Kerberos 认证。
:::

## Kerberos 作为现有用户的外部认证方法 {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos 可以作为验证本地定义用户（在 `users.xml` 或本地访问控制路径中定义的用户）身份的一种方法。目前，**仅**可以通过 HTTP 接口进行 *kerberized* 请求（通过 GSS-SPNEGO 机制）。

Kerberos 主体名称格式通常遵循以下模式：

- *primary/instance@REALM*

其中 */instance* 部分可以出现零次或多次。**发起者的规范主体名称的 *primary* 部分应与用于身份验证的 kerberized 用户名匹配，以使身份验证成功**。

### 在 `users.xml` 中启用 Kerberos {#enabling-kerberos-in-users-xml}

要为用户启用 Kerberos 身份验证，请在用户定义中指定 `kerberos` 部分，而不是 `password` 或类似部分。

参数：

- `realm` - 一个领域，将用于将身份验证限制为只有当发起者的领域与其匹配的请求。
    - 此参数是可选的，如果省略，将不应用额外的领域过滤。

示例（放入 `users.xml`）:

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
请注意，Kerberos 身份验证无法与其他任何身份验证机制一起使用。存在其他任何部分（如 `password`）与 `kerberos` 并存将迫使 ClickHouse 关闭。
:::

:::info 提醒
请注意， 现在，一旦用户 `my_user` 使用 `kerberos`，则必须如前所述在主 `config.xml` 文件中启用 Kerberos。
:::

### 使用 SQL 启用 Kerberos {#enabling-kerberos-using-sql}

当 ClickHouse 中启用了 [基于 SQL 的访问控制和账户管理](/operations/access-rights#access-control-usage) 时，使用 Kerberos 识别的用户也可以通过 SQL 语句进行创建。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...或者，不带领域过滤:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
