---
description: 'SET SQL 문에 대한 문서'
sidebar_label: 'SET'
sidebar_position: 50
slug: /sql-reference/statements/set
title: 'SET SQL 문'
doc_type: 'reference'
---

# SET 문 \{#set-statement\}

```sql
SET param = value
```

현재 세션에서 `param` [setting](/operations/settings/overview)에 `value`를 할당합니다. 이 방식으로는 [server settings](../../operations/server-configuration-parameters/settings.md)을(를) 변경할 수 없습니다.

또한 지정된 SETTINGS PROFILE에 정의된 모든 값을 단일 쿼리로 설정할 수 있습니다.

```sql
SET profile = 'profile-name-from-the-settings-file'
```

불리언 설정이 true인 경우 값 할당을 생략하여 축약된 문법을 사용할 수 있습니다. 설정 이름만 지정하면 자동으로 `1`(true)로 설정됩니다.

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```


## SET TIME ZONE \{#set-time-zone\}

```sql
SET TIME ZONE [=] 'timezone'
```

세션 타임존을 설정합니다. 이는 `SET session_timezone = 'timezone'`의 별칭으로, PostgreSQL 및 기타 SQL 데이터베이스와의 호환성을 위해 제공됩니다.

많은 SQL 클라이언트, ORM, JDBC 드라이버는 연결할 때 자동으로 `SET TIME ZONE`을 실행합니다. 이 구문을 사용하면 이러한 도구를 별도의 사용자 지정 우회 방법 없이 ClickHouse에서 사용할 수 있습니다.

```sql
SET TIME ZONE 'UTC';
SET TIME ZONE 'Europe/Amsterdam';
SET TIME ZONE 'America/New_York';

-- Verify the current session time zone
SELECT getSetting('session_timezone');
```

타임존 값은 [IANA Time Zone Database](https://www.iana.org/time-zones)에 있는 유효한 이름이어야 합니다. 유효하지 않은 타임존 이름을 사용하면 오류가 발생합니다.

`session_timezone` SETTING에 대한 자세한 내용은 [session_timezone](/operations/settings/settings#session_timezone)을 참조하십시오.

## 쿼리 매개변수 설정 \{#setting-query-parameters\}

`SET` 문은 매개변수 이름 앞에 `param_` 접두사를 붙여 쿼리 매개변수를 정의하는 데에도 사용할 수 있습니다.
쿼리 매개변수를 사용하면 실행 시 실제 값으로 대체되는 플레이스홀더를 포함한 범용적인 쿼리를 작성할 수 있습니다.

```sql
SET param_name = value
```

쿼리에서 쿼리 파라미터를 사용하려면 `{name: datatype}` 구문으로 참조합니다:

```sql
SET param_id = 42;
SET param_name = 'John';

SELECT * FROM users
WHERE id = {id: UInt32}
AND name = {name: String};
```

동일한 쿼리를 서로 다른 값으로 여러 번 실행해야 할 때 쿼리 매개변수를 사용하면 특히 유용합니다.

`Identifier` 타입과 함께 사용하는 방법을 포함하여 쿼리 매개변수에 대한 자세한 내용은 [쿼리 매개변수 정의 및 사용](../../sql-reference/syntax.md#defining-and-using-query-parameters)을 참조하십시오.

자세한 내용은 [Settings](../../operations/settings/settings.md) 문서를 참조하십시오.
