---
description: '查询级别会话设置'
sidebar_label: '查询级别会话设置'
slug: /operations/settings/query-level
title: '查询级别会话设置'
doc_type: 'reference'
---

## 概述 {#overview}

有多种方式可以在运行语句时指定特定的设置。
设置是分层配置的，每一后续层都会覆盖该设置在前一层中的值。

## 优先级顺序 {#order-of-priority}

定义设置时的优先级顺序为：

1. 直接将设置应用于某个用户，或在某个设置配置文件中为用户应用设置

    - 使用 SQL（推荐）
    - 将一个或多个 XML 或 YAML 文件添加到 `/etc/clickhouse-server/users.d` 目录

2. 会话级设置

    - 从 ClickHouse Cloud SQL 控制台或 `clickhouse client` 的交互模式发送
      `SET setting=value`。类似地，也可以在 HTTP 协议中使用 ClickHouse 会话。
      为此，需要指定 `session_id` HTTP 参数。

3. 查询级设置

    - 在非交互模式启动 `clickhouse client` 时，通过启动参数 `--setting=value` 设置。
    - 使用 HTTP API 时，以 CGI 参数形式传递（`URL?setting_1=value&setting_2=value...`）。
    - 在 SELECT 查询的
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    子句中定义设置。该设置值仅应用于该次查询，在查询执行完成后将被重置为默认值或先前的值。

## 将设置恢复为默认值 {#converting-a-setting-to-its-default-value}

如果您修改了某个设置并希望将其恢复为默认值，请将该值设为 `DEFAULT`。语法如下：

```sql
SET setting_name = DEFAULT
```

例如，`async_insert` 的默认值为 `0`。假设你将该参数的值修改为 `1`：

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

以下命令将其值重置为 0：

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

此设置现已恢复为默认值：

```response
┌─value───┐
│ 0       │
└─────────┘
```


## 自定义设置 {#custom_settings}

除了通用的[设置](/operations/settings/settings.md)之外，用户还可以定义自定义设置。

自定义设置名称必须以前缀列表中的某个预定义前缀开头。该前缀列表需要在服务器配置文件的 [custom&#95;settings&#95;prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) 参数中声明。

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


## 示例 {#examples}

这些示例都将 `async_insert` 设置为 `1`，并展示如何在正在运行的系统中查看这些设置。

### 使用 SQL 将设置直接应用到用户 {#using-sql-to-apply-a-setting-to-a-user-directly}

以下示例创建用户 `ingester`，并为其设置 `async_insert = 1`：

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
# highlight-next-line {#highlight-next-line}
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```


### 使用 SQL 创建设置配置文件并分配给用户 {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

以下语句会创建名为 `log_ingest` 的设置配置文件，并设置 `async_inset = 1`：

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


### 使用 XML 创建设置配置文件及用户 {#using-xml-to-create-a-settings-profile-and-user}

```xml title=/etc/clickhouse-server/users.d/users.xml
<clickhouse>
# highlight-start {#highlight-start}
    <profiles>
        <log_ingest>
            <async_insert>1</async_insert>
        </log_ingest>
    </profiles>
# highlight-end {#highlight-end}

    <users>
        <ingester>
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>
# highlight-start {#highlight-start}
            <profile>log_ingest</profile>
# highlight-end {#highlight-end}
        </ingester>
        <default replace="true">
            <password_sha256_hex>7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3</password_sha256_hex>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
        </default>
    </users>
</clickhouse>
```


#### 查看设置配置文件及其分配 {#examine-the-settings-profile-and-assignment-1}

```sql
显示访问权限
```

```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ CREATE USER default IDENTIFIED WITH sha256_password                                │
# highlight-next-line {#highlight-next-line}
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS PROFILE log_ingest   │
│ CREATE SETTINGS PROFILE default                                                    │
# highlight-next-line {#highlight-next-line}
│ CREATE SETTINGS PROFILE log_ingest SETTINGS async_insert = true                    │
│ CREATE SETTINGS PROFILE readonly SETTINGS readonly = 1                             │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```


### 为会话指定设置 {#assign-a-setting-to-a-session}

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```


### 在查询时指定设置 {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```


## 另请参阅 {#see-also}

- 查看 [Settings](/operations/settings/settings.md) 页面，了解 ClickHouse 各项设置的说明。
- [全局服务器设置](/operations/server-configuration-parameters/settings.md)