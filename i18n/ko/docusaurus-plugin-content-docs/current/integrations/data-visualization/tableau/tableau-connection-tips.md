---
sidebar_label: '연결 팁'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 공식 커넥터를 사용할 때 유용한 Tableau 연결 팁.'
title: '연결 팁'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 연결 관련 안내 \{#connection-tips\}

<ClickHouseSupportedBadge/>

## Initial SQL 탭 \{#initial-sql-tab\}

고급 탭에서 *Set Session ID* 체크박스가 기본적으로 활성화되어 있는 경우, 다음을 사용하여 세션 수준의 [settings](/operations/settings/settings/)를 설정할 수 있습니다.

```text
SET my_setting=value;
```


## Advanced 탭 \{#advanced-tab\}

전체 사용 사례의 99%에서는 Advanced 탭이 필요하지 않으며, 나머지 1%에서만 다음 설정을 사용합니다:

- **Custom Connection Parameters**. 기본적으로 `socket_timeout`이 이미 지정되어 있으며, 일부 추출본이 갱신되는 데 매우 오랜 시간이 걸리는 경우 이 파라미터를 변경해야 할 수 있습니다. 이 파라미터의 값은 밀리초 단위로 지정합니다. 기타 파라미터는 [여기](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)에서 확인할 수 있으며, 이 필드에 쉼표로 구분하여 추가합니다.
- **JDBC Driver custom_http_params**. 이 필드는 [드라이버의 `custom_http_params` 파라미터](https://github.com/ClickHouse/clickhouse-jdbc#configuration)에 값을 전달하여 ClickHouse 연결 문자열에 일부 파라미터를 포함할 수 있도록 합니다. 예를 들어 *Set Session ID* 체크박스가 활성화된 경우 `session_id`는 다음과 같이 지정됩니다.
- **JDBC Driver `typeMappings`**. 이 필드는 [JDBC 드라이버에서 사용하는 Java 데이터 타입에 대한 ClickHouse 데이터 타입 매핑 목록을 전달](https://github.com/ClickHouse/clickhouse-jdbc#configuration)할 수 있도록 합니다. 커넥터는 이 파라미터 덕분에 큰 Integer 값을 자동으로 문자열로 표시하며, 다음과 같이 매핑 Set을 전달하여 이를 변경할 수 있습니다 *(이유는 알 수 없습니다)*:
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  매핑에 대한 자세한 내용은 해당 섹션을 참조하십시오.

- **JDBC Driver URL Parameters**. 이 필드에서는 예를 들어 `jdbcCompliance`와 같은 [driver parameters](https://github.com/ClickHouse/clickhouse-jdbc#configuration)를 전달할 수 있습니다. 파라미터 값은 반드시 URL 인코딩 형식으로 전달해야 하며, `custom_http_params` 또는 `typeMappings`를 이 필드와 Advanced 탭의 앞선 필드들에 동시에 지정하는 경우, Advanced 탭에서 앞선 두 필드에 지정한 값이 더 높은 우선순위를 가집니다.
- **Set Session ID** 체크박스. Initial SQL 탭에서 세션 수준 설정을 지정할 때 필요하며, `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` 형식으로 타임스탬프와 의사 난수를 포함하는 `session_id`를 생성합니다.

## UInt64, Int128, (U)Int256 데이터 타입에 대한 제한적인 지원 \{#limited-support-for-uint64-int128-uint256-data-types\}

기본적으로 드라이버는 *UInt64, Int128, (U)Int256* 타입의 필드를 문자열로 표시하지만, **표시만 할 뿐 변환하지는 않습니다**. 따라서 아래 예시와 같이 계산된 필드를 작성하려고 하면 오류가 발생합니다.

```text
LEFT([myUInt256], 2) // Error!
```

대용량 정수형 필드를 문자열처럼 처리하려면 필드를 STR() 함수로 명시적으로 감싸야 합니다.

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

그러나 이러한 필드는 대부분 고유 값(예: Yandex.Metrica의 Watch ID, Visit ID)의 개수를 구하거나 시각화의 세부 수준을 지정하기 위한 *차원(Dimension)* 으로 사용되며, 이런 용도로는 잘 동작합니다.

```text
COUNTD([myUInt256]) // Works well too!
```

이제 UInt64 필드가 있는 테이블의 데이터 미리 보기(View data)를 사용할 때 오류가 발생하지 않습니다.
