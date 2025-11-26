---
description: '查询级别的会话设置'
sidebar_label: '查询级别会话设置'
slug: /operations/settings/query-level
title: '查询级别会话设置'
doc_type: 'reference'
---



## 概览 {#overview}

可以通过多种方式在指定的 `settings` 下运行语句。
`settings` 采用分层配置方式，每一层都会覆盖前一层中相同设置的取值。



## 优先级顺序 {#order-of-priority}

定义设置时的优先级顺序如下：

1. 直接将设置应用到某个用户，或在某个设置配置文件中为该用户定义

    - 使用 SQL（推荐）
    - 将一个或多个 XML 或 YAML 文件添加到 `/etc/clickhouse-server/users.d`

2. 会话设置

    - 通过 ClickHouse Cloud SQL 控制台或交互模式下的
    `clickhouse client` 发送 `SET setting=value`。类似地，可以在 HTTP
    协议中使用 ClickHouse 会话。为此，需要指定 `session_id` HTTP 参数。

3. 查询设置

    - 以非交互模式启动 `clickhouse client` 时，设置启动参数
    `--setting=value`。
    - 使用 HTTP API 时，通过 CGI 参数传递
    (`URL?setting_1=value&setting_2=value...`)。
    - 在 SELECT 查询的
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    子句中定义设置。该设置值仅应用于该查询，在查询执行完毕后会重置为默认值或先前的值。



## 将设置恢复为默认值

如果修改了某个设置并希望将其恢复为默认值，请将该值设为 `DEFAULT`。语法如下：

```sql
SET 设置名称 = 默认值
```

例如，`async_insert` 的默认值为 `0`。假设你将其设置为 `1`：

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

响应如下：

```response
┌─value──┐
│ 1      │
└────────┘
```

下面的命令将其值重置为 0：

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

该设置已恢复为默认值：

```response
┌─value───┐
│ 0       │
└─────────┘
```


## 自定义设置

除了通用[设置](/operations/settings/settings.md)之外，用户还可以定义自定义设置。

自定义设置名称必须以预定义前缀之一开头。这些前缀的列表必须在服务器配置文件中的 [custom&#95;settings&#95;prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) 参数中进行声明。

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

若要定义自定义设置，请使用 `SET` 命令：

```sql
SET custom_a = 123;
```

要获取某个自定义设置的当前值，请使用 `getSetting()` 函数：

```sql
SELECT getSetting('custom_a');
```


## 示例

以下示例均将 `async_insert` 设置项的值设为 `1`，并演示如何在运行中的系统中检查这些设置。

### 使用 SQL 直接为用户应用设置

以下示例创建用户 `ingester`，并将其设置为 `async_inset = 1`：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### 检查设置配置文件及其分配

```sql
显示访问权限
```


```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ ...                                                                                │
# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 使用 SQL 创建设置配置文件并分配给用户

这将创建名为 `log_ingest` 的配置文件，并将其设置项 `async_inset` 设为 `1`：

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

这将创建用户 `ingester`，并为其分配设置配置文件 `log_ingest`：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```

### 使用 XML 创建配置文件和用户


```xml title=/etc/clickhouse-server/users.d/users.xml
<clickhouse>
# highlight-start
    <profiles>
        <log_ingest>
            <async_insert>1</async_insert>
        </log_ingest>
    </profiles>
# highlight-end
```


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

### 为会话指定设置

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### 在查询时指定设置

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```


## 另请参阅 {#see-also}

- 查看 [Settings](/operations/settings/settings.md) 页面，了解 ClickHouse 设置的详细说明。
- [全局服务器设置](/operations/server-configuration-parameters/settings.md)
