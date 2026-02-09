---
description: '已存在且已正确配置的 ClickHouse 用户可以通过 Kerberos 协议进行身份验证。'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Kerberos \{#kerberos\}

<SelfManaged />

已存在且正确配置的 ClickHouse 用户可以通过 Kerberos 身份验证协议进行认证。

当前，Kerberos 只能作为外部身份验证器用于现有用户，这些用户定义在 `users.xml` 或本地访问控制路径中。这些用户只能使用 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行认证。

采用此方式时，必须在系统中完成 Kerberos 配置，并在 ClickHouse 配置中将其启用。

## 在 ClickHouse 中启用 Kerberos \{#enabling-kerberos-in-clickhouse\}

要启用 Kerberos，应在 `config.xml` 中添加 `kerberos` 部分。该部分可以包含其他附加参数。

#### 参数 \{#parameters\}

* `principal` - 在接受安全上下文时将被获取和使用的规范服务主体名称（service principal name）。
  * 此参数是可选的，如果省略，将使用默认 principal。

* `realm` - 要使用的 realm，用于将认证限制为仅允许发起方 realm 与其匹配的请求。
  * 此参数是可选的，如果省略，则不会应用任何额外的 realm 过滤。

* `keytab` - 服务 keytab 文件的路径。
  * 此参数是可选的，如果省略，则必须在 `KRB5_KTNAME` 环境变量中设置服务 keytab 文件的路径。

示例（添加到 `config.xml` 中）：

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

包含主体（principal）规范：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

按 realm 筛选：

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
只能定义一个 `kerberos` 节。存在多个 `kerberos` 节时，ClickHouse 会禁用 Kerberos 认证。
:::

:::note
`principal` 和 `realm` 节不能同时指定。如果同时存在 `principal` 和 `realm` 节，ClickHouse 会禁用 Kerberos 认证。
:::

## 将 Kerberos 用作现有用户的外部认证器 \{#kerberos-as-an-external-authenticator-for-existing-users\}

Kerberos 可以作为一种方式，用于验证本地定义用户（在 `users.xml` 或本地访问控制路径中定义的用户）的身份。目前，**只**支持通过 HTTP 接口的请求进行 Kerberos 认证（通过 GSS-SPNEGO 机制）。

Kerberos 主体（principal）名称格式通常遵循以下模式：

* *primary/instance@REALM*

其中 */instance* 部分可以出现零次或多次。**发起方规范主体名称（canonical principal name）中的 *primary* 部分需要与启用 Kerberos 的用户名匹配，认证才能成功**。

### 在 `users.xml` 中启用 Kerberos \{#enabling-kerberos-in-users-xml\}

要为用户启用 Kerberos 认证，请在用户定义中指定 `kerberos` 段，而不是使用 `password` 或类似配置段。

参数：

* `realm` - 用于限制认证，仅允许发起方 realm 与该值匹配的请求通过认证。
  * 该参数是可选的，如果省略，则不会应用任何额外的 realm 过滤。

示例（写入 `users.xml` 中）：

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
请注意，Kerberos 认证不能与任何其他认证机制同时使用。如果在配置中 `kerberos` 段落旁边还存在 `password` 等其他认证段落，将会导致 ClickHouse 强制关闭。
:::

:::info Reminder
请注意，现在一旦用户 `my_user` 使用 `kerberos`，就必须按照前文所述在主配置文件 `config.xml` 中启用 Kerberos。
:::

### 使用 SQL 启用 Kerberos \{#enabling-kerberos-using-sql\}

当在 ClickHouse 中启用 [基于 SQL 的访问控制和账号管理](/operations/access-rights#access-control-usage) 时，也可以通过 SQL 语句创建由 Kerberos 标识的用户。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

……或者，不按 realm 过滤：

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
