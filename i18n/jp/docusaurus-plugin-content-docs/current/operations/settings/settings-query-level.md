---
description: 'クエリ単位の設定'
sidebar_label: 'クエリレベルのセッション設定'
slug: /operations/settings/query-level
title: 'クエリレベルのセッション設定'
doc_type: 'reference'
---



## 概要 {#overview}

特定の設定を指定してステートメントを実行する方法はいくつかあります。
設定はレイヤー状に構成されており、後続の各レイヤーが前のレイヤーでの設定値を上書きします。



## 優先順位 {#order-of-priority}

設定を定義する際の優先順位は次のとおりです。

1. 設定をユーザーに直接、または設定プロファイル内で適用する

    - SQL（推奨）
    - 1 つ以上の XML または YAML ファイルを `/etc/clickhouse-server/users.d` に追加する

2. セッション設定

    - ClickHouse Cloud の SQL コンソール、または対話モードの `clickhouse client` から
    `SET setting=value` を送信します。同様に、HTTP プロトコルで ClickHouse セッションを
    使用できます。その場合は、`session_id` HTTP パラメーターを指定する必要があります。

3. クエリ設定

    - `clickhouse client` を非対話モードで起動する際に、起動パラメーター
    `--setting=value` を指定します。
    - HTTP API を使用する場合、CGI パラメーター（`URL?setting_1=value&setting_2=value...`）を渡します。
    - SELECT クエリの
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query)
    句で設定を定義します。設定値はそのクエリにのみ適用され、クエリ実行後はデフォルト値
    または以前の値にリセットされます。



## 設定をデフォルト値に戻す

設定を変更して元のデフォルト値に戻したい場合は、値を `DEFAULT` に設定します。構文は次のとおりです。

```sql
SET setting_name = DEFAULT
```

たとえば、`async_insert` のデフォルト値は `0` です。これを `1` に変更したとします。

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

レスポンスは以下のとおりです：

```response
┌─value──┐
│ 1      │
└────────┘
```

次のコマンドで値を 0 にリセットします。

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

設定はデフォルト値に戻りました。

```response
┌─value───┐
│ 0       │
└─────────┘
```


## カスタム設定

共通の[設定](/operations/settings/settings.md)に加えて、ユーザーはカスタム設定を定義できます。

カスタム設定名は、あらかじめ定義されたプレフィックスのいずれかで始まる必要があります。これらのプレフィックスの一覧は、サーバー設定ファイル内で [custom&#95;settings&#95;prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) パラメータとして宣言する必要があります。

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

カスタム設定を行うには、`SET` コマンドを使用します。

```sql
SET custom_a = 123;
```

カスタム設定の現在の値を取得するには、`getSetting()` 関数を使用してください。

```sql
SELECT getSetting('custom_a');
```


## 例

これらの例ではすべて、`async_insert` 設定の値を `1` に設定し、
実行中のシステムで設定を確認する方法を示します。

### SQL を使用して設定をユーザーに直接適用する

これは、設定 `async_inset = 1` を持つユーザー `ingester` を作成します。

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### 設定プロファイルとその割り当てを確認する

```sql
アクセスを表示
```


```response
┌─ACCESS─────────────────────────────────────────────────────────────────────────────┐
│ ...                                                                                │
# highlight-next-line
│ CREATE USER ingester IDENTIFIED WITH sha256_password SETTINGS async_insert = true  │
│ ...                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### SQL を使用して設定プロファイルを作成し、ユーザーに割り当てる

これは、`async_inset = 1` という設定を持つ `log_ingest` プロファイルを作成します:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

ユーザー `ingester` を作成し、そのユーザーに設定プロファイル `log_ingest` を割り当てます：

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```

### XML を使用して設定プロファイルおよびユーザーを作成する


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

#### 設定プロファイルと割り当てを確認する {#examine-the-settings-profile-and-assignment-1}

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

### セッションに設定を適用する

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### クエリ実行時に設定を指定する

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```


## 関連項目 {#see-also}

- ClickHouse の設定については、[Settings](/operations/settings/settings.md) ページを参照してください。
- [サーバーのグローバル設定](/operations/server-configuration-parameters/settings.md)
