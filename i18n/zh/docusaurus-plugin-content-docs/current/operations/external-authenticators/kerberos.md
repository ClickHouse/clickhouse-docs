---
'description': 'Existing and properly configured ClickHouse users can be authenticated
  via Kerberos authentication protocol.'
'slug': '/operations/external-authenticators/kerberos'
'title': 'Kerberos'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

现有且配置正确的 ClickHouse 用户可以通过 Kerberos 身份验证协议进行身份验证。

目前，Kerberos 只能用作现有用户的外部身份验证器，这些用户在 `users.xml` 或本地访问控制路径中定义。这些用户只能使用 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行身份验证。

对于这种方法，必须在系统中配置 Kerberos，并且必须在 ClickHouse 配置中启用它。

## 在 ClickHouse 中启用 Kerberos {#enabling-kerberos-in-clickhouse}

要启用 Kerberos，应该在 `config.xml` 中包含 `kerberos` 部分。该部分可能包含其他参数。

#### 参数: {#parameters}

- `principal` - 规范的服务主体名称，将在接受安全上下文时获取并使用。
    - 此参数是可选的，如果省略，将使用默认主体。

- `realm` - 将用于限制身份验证的领域，仅限于发起者的领域与其匹配的请求。
    - 此参数是可选的，如果省略，则不会应用额外的领域过滤。

- `keytab` - 服务 keytab 文件的路径。
    - 此参数是可选的，如果省略，则必须在 `KRB5_KTNAME` 环境变量中设置服务 keytab 文件的路径。

示例（放入 `config.xml` 中）：

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

带有主体规范的示例：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

带领域过滤的示例：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
您只能定义一个 `kerberos` 部分。多个 `kerberos` 部分的存在将强制 ClickHouse 禁用 Kerberos 身份验证。
:::

:::note
`principal` 和 `realm` 部分不能同时指定。两者同时存在将强制 ClickHouse 禁用 Kerberos 身份验证。
:::

## Kerberos 作为现有用户的外部身份验证器 {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos 可以用作验证本地定义用户（在 `users.xml` 或本地访问控制路径中定义的用户）身份的方法。目前，仅能通过 HTTP 接口对请求进行 *kerberized* 处理（通过 GSS-SPNEGO 机制）。

Kerberos 主体名称格式通常遵循以下模式：

- *primary/instance@REALM*

其中 */instance* 部分可以出现零次或多次。**期望发起者的规范主体名称的 *primary* 部分与用于身份验证的 kerberized 用户名匹配，以使身份验证成功**。

### 在 `users.xml` 中启用 Kerberos {#enabling-kerberos-in-users-xml}

为了为用户启用 Kerberos 身份验证，请在用户定义中指定 `kerberos` 部分，而不是 `password` 或类似部分。

参数：

- `realm` - 将用于限制身份验证的领域，仅限于发起者的领域与其匹配的请求。
    - 此参数是可选的，如果省略，则不会应用额外的领域过滤。

示例（放入 `users.xml` 中）：

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
请注意，Kerberos 身份验证不能与任何其他身份验证机制同时使用。与 `kerberos` 一同存在的 `password` 等任何其他部分将强制 ClickHouse 关闭。
:::

:::info 提醒
请注意，现在，一旦用户 `my_user` 使用 `kerberos`，必须如前所述在主 `config.xml` 文件中启用 Kerberos。
:::

### 使用 SQL 启用 Kerberos {#enabling-kerberos-using-sql}

当在 ClickHouse 中启用 [SQL 驱动的访问控制和帐户管理](/operations/access-rights#access-control-usage) 时，可以使用 SQL 语句创建通过 Kerberos 识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...或者不进行领域过滤的示例：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
