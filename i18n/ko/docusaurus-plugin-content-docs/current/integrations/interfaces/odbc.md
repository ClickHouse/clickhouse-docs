---
description: 'ClickHouse ODBC 드라이버 문서'
sidebar_label: 'ODBC 드라이버'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC 드라이버'
doc_type: 'reference'
---

# ODBC Driver \{#odbc-driver\}

ClickHouse ODBC 드라이버는 ODBC를 지원하는 애플리케이션을 ClickHouse에 연결하기 위한 표준 준수 인터페이스를 제공합니다. 이 드라이버는 ODBC API를 구현하여 애플리케이션, BI 도구 및 스크립팅 환경에서 SQL 쿼리를 실행하고 결과를 조회하며, 익숙한 방식으로 ClickHouse와 상호 작용할 수 있도록 합니다.

드라이버는 ClickHouse 서버와 [HTTP protocol](/interfaces/http)을 사용해 통신하며, 이는 모든 ClickHouse 배포 환경에서 기본적으로 지원되는 주요 프로토콜입니다. 이를 통해 드라이버는 로컬 설치 환경, Cloud에서 관리되는 서비스, HTTP 기반 액세스만 가능한 환경 등 다양한 환경에서 일관되게 동작합니다.

드라이버의 소스 코드는
[ClickHouse-ODBC GitHub Repository](https://github.com/ClickHouse/clickhouse-odbc)에 공개되어 있습니다.

:::tip
더 나은 호환성을 위해 ClickHouse 서버를 24.11 버전 이상으로 업데이트할 것을 강력히 권장합니다.
:::

:::note
이 드라이버는 활발히 개발 중입니다. 일부 ODBC 기능은 아직 완전히 구현되지 않았을 수 있습니다. 현재 버전은 필수 연결 기능과 핵심 ODBC 기능 제공에 중점을 두고 있으며, 추가 기능은 향후 릴리스에 포함될 예정입니다.

피드백은 매우 중요하며, 새로운 기능과 개선 사항의 우선순위를 정하는 데 큰 도움이 됩니다. 제한 사항, 누락된 기능 또는 예기치 않은 동작을 발견한 경우, 아래 이슈 트래커를 통해 관찰 내용이나 기능 요청을 공유해 주시기 바랍니다.
[https://github.com/ClickHouse/clickhouse-odbc/issues](https://github.com/ClickHouse/clickhouse-odbc/issues)
:::

## Windows에 설치 \{#installation-on-windows\}

드라이버 최신 버전은
[https://github.com/ClickHouse/clickhouse-odbc/releases/latest](https://github.com/ClickHouse/clickhouse-odbc/releases/latest)에서 확인할 수 있습니다.
해당 페이지에서 MSI 설치 프로그램을 다운로드해 실행한 다음, 간단한 설치 단계를 따르면 됩니다.

## 테스트 \{#testing\}

이 간단한 PowerShell 스크립트를 실행하여 드라이버를 테스트할 수 있습니다. 아래 텍스트를 복사한 다음 URL, 사용자 이름, 비밀번호를 설정하고 PowerShell 명령 프롬프트에 붙여넣으십시오. `$reader.GetValue(0)`을 실행한 후에는 ClickHouse 서버 버전이 표시됩니다.

```powershell
$url = "http://127.0.0.1:8123/"
$username = "default"
$password = ""
$conn = New-Object System.Data.Odbc.OdbcConnection("`
    Driver={ClickHouse ODBC Driver (Unicode)};`
    Url=$url;`
    Username=$username;`
    Password=$password")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "select version()"
$reader = $cmd.ExecuteReader()
$reader.Read()
$reader.GetValue(0)
$reader.Close()
$conn.Close()
```


## 구성 매개변수 \{#configuration-parameters\}

아래 매개변수들은 ClickHouse ODBC 드라이버로 연결을 설정할 때 가장 일반적으로 사용하는 설정입니다. 기본적인 인증, 연결 동작 및 데이터 처리 옵션을 포함합니다. 지원되는 매개변수의 전체 목록은 프로젝트의 GitHub 페이지
[https://github.com/ClickHouse/clickhouse-odbc](https://github.com/ClickHouse/clickhouse-odbc)에서 확인할 수 있습니다.

* `Url`: ClickHouse 서버의 전체 HTTP(S) 엔드포인트를 지정합니다. 프로토콜, 호스트, 포트, 선택적 경로를 모두 포함합니다.
* `Username`: ClickHouse 서버에 인증할 때 사용하는 사용자 이름입니다.
* `Password`: 지정된 사용자 이름에 연관된 비밀번호입니다. 제공하지 않으면 드라이버는 비밀번호 인증 없이 연결합니다.
* `Database`: 연결 시 사용할 기본 데이터베이스입니다.
* `Timeout`: 드라이버가 요청을 중단하기 전에 서버 응답을 기다리는 최대 시간(초)입니다.
* `ClientName`: 클라이언트 메타데이터의 일부로 ClickHouse 서버에 전송되는 사용자 정의 식별자입니다. 트레이싱 또는 서로 다른 애플리케이션에서 발생하는 트래픽을 구분하는 데 유용합니다. 이 매개변수는 드라이버가 생성하는 HTTP 요청의 User-Agent 헤더에 포함됩니다.
* `Compression`: 요청 및 응답 페이로드에 대한 HTTP 압축을 활성화하거나 비활성화합니다. 활성화하면 대용량 결과 세트에서 대역폭 사용량을 줄이고 성능을 향상할 수 있습니다.
* `SqlCompatibilitySettings`: ClickHouse가 기존 관계형 데이터베이스처럼 동작하도록 하는 쿼리 설정을 활성화합니다. 예를 들어 Power BI와 같은 서드파티 도구가 자동으로 쿼리를 생성하는 경우에 유용합니다. 이러한 도구는 일반적으로 특정 ClickHouse 고유 동작을 인지하지 못하며, 오류나 예기치 않은 결과를 초래하는 쿼리를 만들 수 있습니다. 자세한 내용은 [SqlCompatibilitySettings 구성 매개변수가 사용하는 ClickHouse 설정
  ](#sql-compatibility-settings)을 참고하십시오.

다음은 드라이버에 전달되어 연결을 설정하는 전체 연결 문자열 예시입니다.

* WSL 인스턴스에 로컬로 설치된 ClickHouse 서버

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123/;Username=default
```

* ClickHouse Cloud 인스턴스 1개.

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```


## Microsoft Power BI 통합 \{#powerbi-integration\}

ODBC 드라이버를 사용하여 Microsoft Power BI를 ClickHouse 서버에 연결할 수 있습니다. Power BI에는 일반 ODBC 커넥터와 ClickHouse 커넥터라는 두 가지 연결 옵션이 있으며, 둘 다 표준 Power BI 설치에 포함되어 있습니다.

두 커넥터는 내부적으로 모두 ODBC를 사용하지만, 기능 측면에서 차이가 있습니다:

- ClickHouse 커넥터(권장)
  내부적으로 ODBC를 사용하지만 DirectQuery 모드를 지원합니다. 이 모드에서는 Power BI가 SQL 쿼리를 자동으로 생성하고, 각 시각화 또는 필터 작업에 필요한 데이터만 조회합니다.

- ODBC 커넥터
  Import 모드만 지원합니다. Power BI는 사용자가 제공한 쿼리를 실행(또는 전체 테이블을 선택)하고, 결과 전체를 Power BI로 가져옵니다. 이후 새로 고침할 때마다 전체 데이터셋을 다시 가져옵니다.

사용 사례에 따라 적절한 커넥터를 선택하십시오. DirectQuery는 대용량 데이터셋을 사용하는 인터랙티브 대시보드에 가장 적합합니다. 데이터의 전체 로컬 복사본이 필요할 때는 Import 모드를 선택하십시오.

Microsoft Power BI와 ClickHouse 통합에 대한 자세한 내용은 [ClickHouse 문서의 Power BI 통합 페이지](/integrations/powerbi)를 참조하십시오.

## SQL 호환성 설정 \{#sql-compatibility-settings\}

ClickHouse는 고유한 SQL 방언을 사용하므로, 경우에 따라 MS SQL Server, MySQL, PostgreSQL과 같은 다른 데이터베이스와 다르게 동작합니다. 이러한 차이점은 종종 구문을 개선해 ClickHouse 기능을 더 쉽게 사용할 수 있게 해 준다는 점에서 장점이 됩니다.

한편 ODBC 드라이버는 Power BI와 같은 서드파티 도구가 쿼리를 생성하는 환경에서 자주 사용되며, 사용자가 직접 쿼리를 작성하지 않는 경우가 많습니다. 이러한 쿼리는 일반적으로 SQL 표준의 최소 부분 집합에 의존합니다. 이런 상황에서는 ClickHouse의 SQL 표준과의 차이로 인해 예상과 다르게 동작하거나 예기치 않은 결과 또는 오류가 발생할 수 있습니다. ODBC 드라이버는 `SqlCompatibilitySettings`라는 추가 구성 매개변수를 제공하며, 일부 쿼리 설정을 활성화해 ClickHouse의 동작이 표준 SQL에 더 가깝게 맞춰지도록 합니다.

### SqlCompatibilitySettings 구성 파라미터로 활성화되는 ClickHouse 설정 \{#sql-compatibility-settings-list\}

이 섹션에서는 ODBC 드라이버가 어떤 설정을 변경하는지와 그 이유를 설명합니다.

**[cast&#95;keep&#95;nullable](https://clickhouse.com/docs/operations/settings/settings#cast_keep_nullable)**

기본적으로 ClickHouse는 널 허용(nullable) 타입을 널 허용이 아닌(non-nullable) 타입으로 변환하는 것을 허용하지 않습니다. 그러나 많은 BI 도구는 타입 변환을 수행할 때 널 허용 타입과 널 허용이 아닌 타입을 구분하지 않습니다. 그 결과 BI 도구에서 다음과 같은 쿼리가 생성되는 경우가 흔히 있습니다.

```sql
SELECT sum(CAST(value, 'Int32'))
FROM values
```

기본 설정에서 `value` 컬럼이 널 허용인 경우, 이 쿼리는 다음과 같은 메시지와 함께 실패합니다:

```plaintext
DB::Exception: Cannot convert NULL value to non-Nullable type: while executing 'FUNCTION CAST(__table1.value :: 2,
'Int32'_String :: 1) -> CAST(__table1.value, 'Int32'_String) Int32 : 0'. (CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN)
```

`cast_keep_nullable`를 설정하면 `CAST`의 동작이 변경되어 인수의 널 허용 여부(nullability)를 그대로 유지합니다. 이는
이러한 유형의 변환에서 ClickHouse의 동작을 다른 데이터베이스 및 SQL 표준과 더 가깝게 만듭니다.

**[prefer&#95;column&#95;name&#95;to&#95;alias](https://clickhouse.com/docs/operations/settings/settings#prefer_column_name_to_alias)**

ClickHouse에서는 같은 `SELECT` 목록에 있는 식을 별칭(alias)으로 참조할 수 있습니다. 예를 들어, 다음 쿼리는 반복을 피할 수 있어
작성하기가 더 쉽습니다.

```sql
SELECT
    sum(value) AS S,
    count() AS C,
    S / C
FROM test
```

이 기능은 널리 사용되지만, 다른 데이터베이스에서는 일반적으로 동일한 `SELECT` 목록에서 별칭을 이런 방식으로 해석하지 않으므로
이러한 쿼리는 오류가 발생합니다. 문제는 별칭 이름이 컬럼 이름과 동일할 때 가장 두드러집니다. 예를 들어:

```sql
SELECT
    sum(value) AS value,
    avg(value)
FROM test
```

`avg(value)`는 어떤 `value`를 집계해야 할까요? 기본적으로 ClickHouse는 별칭을 우선시하여, 사실상 이를 중첩 집계로 처리합니다. 이는 대부분의 도구가 기대하는 동작이 아닙니다.

이 자체만으로는 문제되는 경우가 드물지만, 일부 BI 도구는 컬럼 별칭을 재사용하는 서브쿼리가 포함된 쿼리를 생성합니다. 예를 들어,
Power BI는 종종 다음과 유사한 쿼리를 생성합니다:

```sql
SELECT
    sum(C1) AS C1,
    count(C1) AS C2
FROM
(
    SELECT sum(value) AS C1
    FROM test
    GROUP BY group_index
) AS TBL
```

`C1`에 대한 참조로 인해 다음 오류가 발생할 수 있습니다:

```plaintext
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function sum(C1) AS C1 is found
inside another aggregate function in query. (ILLEGAL_AGGREGATION)
```

다른 데이터베이스는 일반적으로 같은 수준에서 별칭을 이런 방식으로 해석하지 않고, 대신 `C1`을 서브쿼리의 컬럼으로 취급합니다.
ClickHouse에서 이와 유사한 동작을 유지하고 이러한 쿼리가 오류 없이 실행되도록 하기 위해, ODBC 드라이버는
`prefer_column_name_to_alias`를 활성화합니다.

대부분의 경우 이러한 설정을 활성화해도 문제가 되지 않습니다. 그러나 `readonly` 설정이 `1`로 지정된 사용자는
`SELECT` 쿼리에 대해서도 어떤 설정도 변경할 수 없습니다. 이러한 사용자에게 `SqlCompatibilitySettings`를
활성화하면 오류가 발생합니다. 다음 섹션에서는 읽기 전용 사용자에 대해 이 설정 파라미터가 동작하도록 만드는 방법을 설명합니다.


## 읽기 전용 사용자에서 SQL 호환성 설정 사용하기 \{#readonly-users\}

`SqlCompatibilitySettings` 매개변수를 활성화한 상태로 ODBC 드라이버를 통해 ClickHouse에 연결하는 경우,
`readonly` 설정이 `1`로 지정된 사용자는 드라이버가 쿼리 설정을 변경하려고 시도하기 때문에 오류가 발생합니다.

```plaintext
Code: 164. DB::Exception: Cannot modify 'cast_keep_nullable' setting in readonly mode. (READONLY)
Code: 164. DB::Exception: Cannot modify 'prefer_column_name_to_alias' setting in readonly mode. (READONLY)
```

읽기 전용 모드에서는 개별 `SELECT` 쿼리에 대해서도 설정을 변경할 수 없기 때문에 이런 현상이 발생합니다.
이를 해결하는 방법은 여러 가지가 있습니다.

**옵션 1. `readonly`를 `2`로 설정**

가장 간단한 옵션입니다. `readonly`를 `2`로 설정하면 사용자를 계속 읽기 전용 모드로 유지하면서도 설정을 변경할 수 있습니다.

```sql
ALTER USER your_odbc_user MODIFY SETTING
    readonly = 2
```

대부분의 경우 `readonly`를 2로 설정하는 것이 이 문제를 해결하는 가장 쉽고 권장되는 방법입니다.
이 방법으로 해결되지 않으면 두 번째 옵션을 사용하십시오.

**옵션 2. ODBC 드라이버가 설정하는 값과 일치하도록 사용자 설정을 변경합니다.**

이 방법 역시 간단합니다. ODBC 드라이버가 설정하려는 값과 동일하도록 사용자 설정을 미리 변경하면 됩니다.

```sql
ALTER USER your_odbc_user MODIFY SETTING
    cast_keep_nullable = 1,
    prefer_column_name_to_alias = 1
```

이 변경을 적용하면 ODBC 드라이버는 여전히 설정을 적용하려고 시도하지만, 값이 이미 동일하므로
실제로 변경되는 것은 없고 오류도 발생하지 않습니다.

이 옵션 또한 간단하지만 유지 관리가 필요합니다. 최신 드라이버 버전에서는 설정 목록이 변경되거나
호환성을 위해 새로운 설정이 추가될 수 있습니다. 이러한 설정을 ODBC 사용자 계정에 하드코딩해 둔 경우,
ODBC 드라이버가 추가 설정을 적용하기 시작할 때마다 이를 업데이트해야 할 수 있습니다.
