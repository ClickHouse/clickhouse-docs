---
'description': '쿼리 수준의 설정'
'sidebar_label': '쿼리 수준 세션 설정'
'slug': '/operations/settings/query-level'
'title': '쿼리 수준 세션 설정'
'doc_type': 'reference'
---

## 개요 {#overview}

특정 설정으로 문을 실행하는 여러 가지 방법이 있습니다. 설정은 계층으로 구성되며, 각 후속 계층은 설정의 이전 값을 재정의합니다.

## 우선순위 {#order-of-priority}

설정을 정의하는 우선순위는 다음과 같습니다:

1. 사용자가 직접 설정을 적용하거나 설정 프로필 내에서

    - SQL (권장)
    - 하나 이상의 XML 또는 YAML 파일을 `/etc/clickhouse-server/users.d`에 추가하기

2. 세션 설정

    - ClickHouse Cloud SQL 콘솔 또는 대화형 모드에서 `clickhouse client`를 통해 `SET setting=value`를 보냅니다. 마찬가지로 HTTP 프로토콜에서 ClickHouse 세션을 사용할 수 있습니다. 이를 위해서는 `session_id` HTTP 매개변수를 지정해야 합니다.

3. 쿼리 설정

    - 비대화형 모드에서 `clickhouse client`를 시작할 때 시작 매개변수 `--setting=value`를 설정합니다.
    - HTTP API를 사용할 때 CGI 매개변수를 전달합니다 (`URL?setting_1=value&setting_2=value...`).
    - SELECT 쿼리의
    [SETTINGS](../../sql-reference/statements/select/index.md#settings-in-select-query) 절에서 설정을 정의합니다. 설정 값은 해당 쿼리에만 적용되며, 쿼리가 실행된 후 기본값 또는 이전 값으로 재설정됩니다.

## 기본 값으로 설정 변환하기 {#converting-a-setting-to-its-default-value}

설정을 변경한 후 기본 값으로 되돌리고 싶다면, 값을 `DEFAULT`로 설정합니다. 구문은 다음과 같습니다:

```sql
SET setting_name = DEFAULT
```

예를 들어, `async_insert`의 기본 값은 `0`입니다. 값을 `1`로 변경했다고 가정합시다:

```sql
SET async_insert = 1;

SELECT value FROM system.settings where name='async_insert';
```

응답은 다음과 같습니다:

```response
┌─value──┐
│ 1      │
└────────┘
```

다음 명령은 값을 다시 0으로 설정합니다:

```sql
SET async_insert = DEFAULT;

SELECT value FROM system.settings where name='async_insert';
```

설정이 이제 기본 값으로 돌아갔습니다:

```response
┌─value───┐
│ 0       │
└─────────┘
```

## 커스텀 설정 {#custom_settings}

일반 [settings](/operations/settings/settings.md) 외에도 사용자는 커스텀 설정을 정의할 수 있습니다.

커스텀 설정 이름은 미리 정의된 접두사 중 하나로 시작해야 합니다. 이러한 접두사의 목록은 서버 구성 파일의 [custom_settings_prefixes](../../operations/server-configuration-parameters/settings.md#custom_settings_prefixes) 매개변수에 선언되어야 합니다.

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

커스텀 설정을 정의하려면 `SET` 명령을 사용합니다:

```sql
SET custom_a = 123;
```

커스텀 설정의 현재 값을 얻으려면 `getSetting()` 함수를 사용합니다:

```sql
SELECT getSetting('custom_a');
```

## 예시 {#examples}

이 예시들은 모두 `async_insert` 설정의 값을 `1`로 설정하며, 실행 중인 시스템에서 설정을 검사하는 방법을 보여줍니다.

### SQL을 사용하여 사용자를 직접 설정 적용하기 {#using-sql-to-apply-a-setting-to-a-user-directly}

다음은 `async_insert = 1` 설정으로 사용자 `ingester`를 생성합니다:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS async_insert = 1
```

#### 설정 프로필 및 할당 검사 {#examine-the-settings-profile-and-assignment}

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
### SQL을 사용하여 설정 프로필을 만들고 사용자를 할당하기 {#using-sql-to-create-a-settings-profile-and-assign-to-a-user}

다음은 `async_insert = 1` 설정으로 프로필 `log_ingest`를 생성합니다:

```sql
CREATE
SETTINGS PROFILE log_ingest SETTINGS async_insert = 1
```

이제 사용자 `ingester`를 생성하고 사용자가 설정 프로필 `log_ingest`에 할당됩니다:

```sql
CREATE USER ingester
IDENTIFIED WITH sha256_hash BY '7e099f39b84ea79559b3e85ea046804e63725fd1f46b37f281276aae20f86dc3'
-- highlight-next-line
SETTINGS PROFILE log_ingest
```

### XML을 사용하여 설정 프로필 및 사용자 만들기 {#using-xml-to-create-a-settings-profile-and-user}

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

#### 설정 프로필 및 할당 검사 {#examine-the-settings-profile-and-assignment-1}

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

### 세션에 설정 할당하기 {#assign-a-setting-to-a-session}

```sql
SET async_insert =1;
SELECT value FROM system.settings where name='async_insert';
```

```response
┌─value──┐
│ 1      │
└────────┘
```

### 쿼리 중에 설정 할당하기 {#assign-a-setting-during-a-query}

```sql
INSERT INTO YourTable
-- highlight-next-line
SETTINGS async_insert=1
VALUES (...)
```

## 참고 {#see-also}

- ClickHouse 설정에 대한 설명은 [Settings](/operations/settings/settings.md) 페이지를 참조하십시오.
- [Global server settings](/operations/server-configuration-parameters/settings.md)
