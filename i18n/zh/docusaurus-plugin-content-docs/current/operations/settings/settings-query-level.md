---
'description': '查询级的设置'
'sidebar_label': '查询级会话设置'
'slug': '/operations/settings/query-level'
'title': '查询级会话设置'
---

## 概述 {#overview}

有多种方法可以使用特定设置来运行语句。设置是分层配置的，每个后续层会重新定义先前的设置值。

## 优先级顺序 {#order-of-priority}

定义设置的优先级顺序如下：

1. 将设置直接应用于用户，或在设置配置文件中

    - SQL（推荐）
    - 将一个或多个 XML 或 YAML 文件添加到 `/etc/clickhouse-server/users.d`

2. 会话设置

    - 从 ClickHouse Cloud SQL 控制台或在交互模式下使用 `clickhouse client` 发送 `SET setting=value`。同样，您可以在 HTTP 协议中使用 ClickHouse 会话。为此，您需要指定 `session_id` HTTP 参数。

3. 查询设置

    - 在非交互模式下启动 `clickhouse client` 时，设置启动参数 `--setting=value`。
    - 使用 HTTP API 时，传递 CGI 参数（`URL?setting_1=value&setting_2=value...`）。
    - 在 SELECT 查询的
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    子句中定义设置。设置值仅适用于该查询，查询执行后恢复为默认值或先前值。


## 将设置恢复为默认值 {#converting-a-setting-to-its-default-value}

如果您更改了设置并希望将其恢复为默认值，请将值设置为 `DEFAULT`。语法如下：

```sql
SET setting_name = DEFAULT
```

例如，`async_insert` 的默认值为 `0`。假设您将其值更改为 `1`：

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

响应为：

```response
┌─value──┐
│ 1      │
└────────┘
```

以下命令将其值重置为 0：

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

设置现在已恢复为默认值：

```response
┌─value───┐
│ 0       │
└─────────┘
```

## 自定义设置 {#custom_settings}

除了常见的 [settings](/operations/settings/settings.md) 之外，用户可以定义自定义设置。

自定义设置名称必须以预定义前缀之一开头。这些前缀的列表必须在服务器配置文件中的 [custom_settings_prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) 参数中声明。

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

要定义自定义设置，请使用 `SET` 命令：

```sql
SET custom_a = 123;
```

要获取自定义设置的当前值，请使用 `getSetting()` 函数：

```sql
SELECT getSetting('custom_a');
```

## 示例 {#examples}

这些示例均将 `async_insert` 设置的值设置为 `1`，并展示如何检查运行中的系统中的设置。

### 使用 SQL 直接将设置应用于用户 {#using-sql-to-apply-a-setting-to-a-user-directly}

这将创建用户 `ingester`，并设置 `async_inset = 1`：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### 检查设置配置文件和分配 {#examine-the-settings-profile-and-assignment}

```sql
SHOW ACCESS
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ ...                                                                                │

# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```
### 使用 SQL 创建设置配置文件并分配给用户 {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

这将创建配置文件 `log_ingest`，并设置 `async_inset = 1`：

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

这将创建用户 `ingester`，并将设置配置文件 `log_ingest` 分配给该用户：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```


### 使用 XML 创建设置配置文件和用户 {#using-xml-to-create-a-settings-profile-and-user}

```xml title=/etc/clickhouse-server/users.d/users.xml
<clickhouse>

# highlight-start
    <profiles>
        <log_ingest>
            <async_insert>1</async_insert>
        </log_ingest>
    </profiles>

# highlight-end

    <users>
        <ingester>
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>

# highlight-start
            <profile>log_ingest</profile>

# highlight-end
        </ingester>
        <default replace="true">
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
        </default>
    </users>
</clickhouse>
```

#### 检查设置配置文件和分配 {#examine-the-settings-profile-and-assignment-1}

```sql
SHOW ACCESS
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ CREATE USER default IDENTIFIED WITH sha256_password                                │

# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS PROFILE log_ingest   │
│ CREATE SETTINGS PROFILE default                                                    │

# highlight-next-line
│ CREATE SETTINGS PROFILE log_ingest SETTINGS async_insert = true                    │
│ CREATE SETTINGS PROFILE readonly SETTINGS readonly = 1                             │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 将设置分配给会话 {#assign-a-setting-to-a-session}

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### 在查询期间分配设置 {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```

## 另请参见 {#see-also}

- 查看 [Settings](/operations/settings/settings.md) 页面以获取 ClickHouse 设置的描述。
- [Global server settings](/operations/server-configuration-parameters/settings.md)
