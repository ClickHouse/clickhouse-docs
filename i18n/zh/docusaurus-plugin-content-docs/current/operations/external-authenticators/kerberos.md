import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Kerberos

<SelfManaged />

现有且已正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行认证。

当前，Kerberos 只能作为现有用户的外部认证器，这些用户在 `users.xml` 中或在本地访问控制路径中定义。这些用户只能使用 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行身份验证。

对于这种方法，Kerberos 必须在系统中进行配置，并且必须在 ClickHouse 配置中启用。

## 在 ClickHouse 中启用 Kerberos {#enabling-kerberos-in-clickhouse}

要启用 Kerberos，应该在 `config.xml` 中包含 `kerberos` 部分。该部分可以包含其他参数。

#### 参数: {#parameters}

- `principal` - 将在接受安全上下文时获取并使用的规范服务主体名称。
    - 此参数是可选的，如果省略，则将使用默认主体。

- `realm` - 将用于限制仅对发起者的 realm 匹配的请求进行身份验证的领域。
    - 此参数是可选的，如果省略，则不会进行额外的领域过滤。

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

带有领域过滤的示例：

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
`principal` 和 `realm` 部分不能同时指定。两个部分的存在将迫使 ClickHouse 禁用 Kerberos 认证。
:::

## Kerberos 作为现有用户的外部认证器 {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos 可以作为验证本地定义用户身份的方法（在 `users.xml` 或本地访问控制路径中定义的用户）。当前，**仅**通过 HTTP 接口的请求可以通过 GSS-SPNEGO 机制进行 *kerberized*。

Kerberos 主体名称格式通常遵循此模式：

- *primary/instance@REALM*

其中 */instance* 部分可以出现零次或多次。**发起者的规范主体名称的 *primary* 部分应与用于身份验证的 kerberized 用户名匹配，以便身份验证成功**。

### 在 `users.xml` 中启用 Kerberos {#enabling-kerberos-in-users-xml}

为了为用户启用 Kerberos 认证，请在用户定义中指定 `kerberos` 部分，而不是 `password` 或类似部分。

参数：

- `realm` - 将用于限制仅对发起者的 realm 匹配的请求进行身份验证的领域。
    - 此参数是可选的，如果省略，则不会进行额外的领域过滤。

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
请注意，Kerberos 认证不能与任何其他认证机制同时使用。存在任何其他部分，如 `password`，则会迫使 ClickHouse 关闭。
:::

:::info 提醒
请注意，现在，一旦用户 `my_user` 使用 `kerberos`，必须如前所述在主 `config.xml` 文件中启用 Kerberos。
:::

### 使用 SQL 启用 Kerberos {#enabling-kerberos-using-sql}

当 [SQL驱动的访问控制和账户管理](/operations/access-rights#access-control-usage) 在 ClickHouse 中启用时，使用 Kerberos 身份识别的用户也可以通过 SQL 语句创建。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...或不进行领域过滤：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
