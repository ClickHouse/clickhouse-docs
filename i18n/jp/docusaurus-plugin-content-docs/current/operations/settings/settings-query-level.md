---
sidebar_label: クエリレベルのセッション設定
title: クエリレベルのセッション設定
description: "クエリレベルの設定"
slug: /operations/settings/query-level
---

特定の設定でステートメントを実行する方法はいくつかあります。  
設定は階層で構成されており、各階層は前の設定の値を再定義します。

設定を定義する優先順位は次の通りです：

1. ユーザーに対して直接、または設定プロファイル内で設定を適用

    - SQL（推奨）
    - `/etc/clickhouse-server/users.d` に1つ以上のXMLまたはYAMLファイルを追加

2. セッション設定

    - ClickHouse Cloud SQLコンソールまたは `clickhouse client` のインタラクティブモードから `SET setting=value` を送信します。同様に、HTTPプロトコルでClickHouseセッションを使用することもできます。この場合、`session_id` HTTPパラメータを指定する必要があります。

3. クエリ設定

    - `clickhouse client` を非インタラクティブモードで起動する際に、起動パラメータ `--setting=value` を設定します。
    - HTTP APIを使用する場合、CGIパラメータを渡します（`URL?setting_1=value&setting_2=value...`）。
    - SELECTクエリの 
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query) 
    句内で設定を定義します。設定値はそのクエリにのみ適用され、クエリが実行された後にデフォルト値または前の値にリセットされます。

## 例 {#examples}

これらの例はすべて `async_insert` 設定の値を `1` に設定し、実行中のシステムでの設定の調査方法を示しています。

### SQLを使用してユーザーに設定を直接適用する {#using-sql-to-apply-a-setting-to-a-user-directly}

これは、設定 `async_inset = 1` を持つユーザー `ingester` を作成します：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'

# highlight-next-line
SETTINGS async_insert = 1
```

#### 設定プロファイルと割り当てを調査する {#examine-the-settings-profile-and-assignment}

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

### SQLを使用して設定プロファイルを作成しユーザーに割り当てる {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

これは、設定 `async_inset = 1` を持つプロファイル `log_ingest` を作成します：

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

これは、ユーザー `ingester` を作成し、そのユーザーに設定プロファイル `log_ingest` を割り当てます：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'

# highlight-next-line
SETTINGS PROFILE log_ingest
```

### XMLを使用して設定プロファイルとユーザーを作成する {#using-xml-to-create-a-settings-profile-and-user}

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

#### 設定プロファイルと割り当てを調査する {#examine-the-settings-profile-and-assignment-1}

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

### セッションに設定を割り当てる {#assign-a-setting-to-a-session}

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### クエリ中に設定を割り当てる {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable

# highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```

## 設定をデフォルト値に戻す {#converting-a-setting-to-its-default-value}

設定を変更し、デフォルト値に戻したい場合は、値を `DEFAULT` に設定します。構文は以下のようになります：

```sql
SET setting_name = DEFAULT
```

例えば、`async_insert` のデフォルト値は `0` です。値を `1` に変更したとします：

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

レスポンスは以下のようになります：

```response
┌─value──┐
│ 1      │
└────────┘
```

次のコマンドは値を0に戻します：

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

設定はデフォルトに戻りました：

```response
┌─value───┐
│ 0       │
└─────────┘
```

## カスタム設定 {#custom_settings}

一般的な [settings](/operations/settings/settings.md) に加えて、ユーザーはカスタム設定を定義できます。

カスタム設定名は、定義済みのプレフィックスのいずれかで始める必要があります。これらのプレフィックスのリストは、サーバー設定ファイルの [custom_settings_prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) パラメータで宣言する必要があります。

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

カスタム設定を定義するには `SET` コマンドを使用します：

```sql
SET custom_a = 123;
```

カスタム設定の現在の値を取得するには、`getSetting()` 関数を使用します：

```sql
SELECT getSetting('custom_a');
```

**参照**

- ClickHouse設定の説明については [Settings](/operations/settings/settings.md) ページを参照してください。
- [グローバルサーバー設定](/operations/server-configuration-parameters/settings.md)
