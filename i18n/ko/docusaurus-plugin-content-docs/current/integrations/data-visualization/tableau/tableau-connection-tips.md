---
'sidebar_label': 'Connection Tips'
'sidebar_position': 3
'slug': '/integrations/tableau/connection-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'ClickHouse 공식 커넥터를 사용할 때 Tableau 연결 팁.'
'title': '연결 팁'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 연결 팁

<ClickHouseSupportedBadge/>

## 초기 SQL 탭 {#initial-sql-tab}

고급 탭에서 *세션 ID 설정* 체크박스가 활성화되어 있는 경우(기본값), 아래와 같이 세션 수준 [설정](/operations/settings/settings/)을 설정할 수 있습니다.

```text
SET my_setting=value;
```

## 고급 탭 {#advanced-tab}

99%의 경우에 고급 탭이 필요하지 않으며, 나머지 1%의 경우 다음 설정을 사용할 수 있습니다:
- **사용자 정의 연결 매개변수**. 기본적으로 `socket_timeout`이 이미 지정되어 있으며, 일부 추출이 매우 오랜 시간 동안 업데이트되는 경우 이 매개변수를 변경해야 할 수 있습니다. 이 매개변수의 값은 밀리초 단위로 지정됩니다. 나머지 매개변수는 [여기](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)에서 확인할 수 있으며, 이 필드에 쉼표로 구분하여 추가하세요.
- **JDBC 드라이버 custom_http_params**. 이 필드는 값들을 [`custom_http_params` 매개변수로 드라이버에 전달하여 ClickHouse 연결 문자열에 일부 매개변수를 추가하는 것을 허용합니다](https://github.com/ClickHouse/clickhouse-jdbc#configuration). 예를 들어, *세션 ID 설정* 체크박스가 활성화되어 있을 때 `session_id`가 지정되는 방식입니다.
- **JDBC 드라이버 `typeMappings`**. 이 필드는 [ClickHouse 데이터 유형 매핑 목록을 JDBC 드라이버에서 사용하는 Java 데이터 유형으로 전달하는 것을 허용합니다](https://github.com/ClickHouse/clickhouse-jdbc#configuration). 이 매개변수 덕분에 커넥터가 큰 정수를 문자열로 자동 표시합니다. 이를 사용해 매핑 세트를 전달하여 변경할 수 있습니다 *(나는 이유를 모른다)*.
```text
UInt256=java.lang.Double,Int256=java.lang.Double
```
  매핑에 대한 자세한 내용은 관련 섹션을 참조하세요.

- **JDBC 드라이버 URL 매개변수**. 이 필드에서 남은 [드라이버 매개변수](https://github.com/ClickHouse/clickhouse-jdbc#configuration), 예를 들어 `jdbcCompliance`, 를 전달할 수 있습니다. 주의하세요, 매개변수 값은 URL 인코딩 형식으로 전달해야 하며, `custom_http_params` 또는 `typeMappings`를 이 필드와 고급 탭의 이전 필드에서 전달할 경우, 고급 탭의 이전 두 필드 값이 더 높은 우선순위를 가집니다.
- **세션 ID 설정** 체크박스. 초기 SQL 탭에서 세션 수준 설정을 지정하는 데 필요하며, 타임스탬프와 의사 난수를 포함하는 형식 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`의 `session_id`를 생성합니다.
## UInt64, Int128, (U)Int256 데이터 유형에 대한 제한된 지원 {#limited-support-for-uint64-int128-uint256-data-types}
기본적으로 드라이버는 *UInt64, Int128, (U)Int256* 유형의 필드를 문자열로 표시하며, **표시만 하고 변환하지는 않습니다**. 이는 다음 계산된 필드를 작성하려고 할 때 오류가 발생함을 의미합니다.
```text
LEFT([myUInt256], 2) // Error!
```
문자열처럼 큰 정수 필드를 처리하려면 STR() 함수를 사용하여 필드를 명시적으로 감싸야 합니다.

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

그러나 이러한 필드는 대개 고유 값의 수를 찾는 데 사용됩니다 *(Yandex.Metrica의 Watch ID, Visit ID와 같은 ID)* 또는 시각화의 세부 사항을 지정하는 *차원*으로 사용되며, 잘 작동합니다.

```text
COUNTD([myUInt256]) // Works well too!
```
UInt64 필드가 있는 테이블의 데이터 미리보기를 사용할 때 이제 오류가 나타나지 않습니다.
