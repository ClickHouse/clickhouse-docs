---
description: '자동 갱신을 위한 딕셔너리 LIFETIME 설정'
sidebar_label: 'LIFETIME'
sidebar_position: 5
slug: /sql-reference/statements/create/dictionary/lifetime
title: 'LIFETIME를 사용한 딕셔너리 데이터 갱신'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

ClickHouse는 `LIFETIME` 태그(초 단위로 정의됨)에 따라 주기적으로 딕셔너리를 업데이트합니다.
`LIFETIME`은 전체를 다운로드하는 딕셔너리에 대한 업데이트 주기이며, 캐시된 딕셔너리에 대한 무효화 주기입니다.

업데이트 중에도 이전 버전의 딕셔너리를 계속 조회할 수 있습니다.
딕셔너리 업데이트는 최초 사용을 위해 로드되는 시점을 제외하고 쿼리를 차단하지 않습니다.
업데이트 중 오류가 발생하면 해당 오류는 서버 로그에 기록되며, 쿼리는 이전 버전의 딕셔너리를 계속 사용할 수 있습니다.
딕셔너리 업데이트가 성공하면 이전 버전의 딕셔너리는 [원자적으로](/concepts/glossary#atomicity) 교체됩니다.

설정 예:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

또는

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>` (`LIFETIME(0)`)으로 설정하면 딕셔너리가 업데이트되지 않습니다.

업데이트를 위한 시간 간격을 설정할 수 있으며, ClickHouse는 이 범위 내에서 균일하게 무작위로 선택된 시간을 사용합니다. 이는 다수의 서버에서 업데이트할 때 딕셔너리 소스에 가해지는 부하를 분산하기 위해 필요합니다.

설정 예시:

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

또는

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>`과 `<max>0</max>`인 경우, ClickHouse는 타임아웃에 의해 딕셔너리를 다시 로드하지 않습니다.
이때 딕셔너리 설정 파일이 변경되었거나 `SYSTEM RELOAD DICTIONARY` 명령이 실행된 경우에는 ClickHouse가 더 일찍 딕셔너리를 다시 로드할 수 있습니다.

딕셔너리를 업데이트할 때 ClickHouse 서버는 [source](./sources/) 유형에 따라 서로 다른 방식으로 동작합니다.

* 텍스트 파일의 경우 수정 시간을 확인합니다. 시간이 이전에 기록된 시간과 다르면 딕셔너리가 업데이트됩니다.
* 다른 소스의 딕셔너리는 기본적으로 매번 업데이트됩니다.

다른 소스(ODBC, PostgreSQL, ClickHouse 등)의 경우, 매번이 아니라 실제로 변경된 경우에만 딕셔너리를 업데이트하도록 쿼리를 설정할 수 있습니다. 이를 위해 다음 단계를 수행하십시오.

* 딕셔너리용 테이블에는 소스 데이터가 업데이트될 때마다 항상 변경되는 필드가 있어야 합니다.
* 소스 설정에는 변경되는 필드를 가져오는 쿼리를 지정해야 합니다. ClickHouse 서버는 쿼리 결과를 행으로 해석하며, 이 행이 이전 상태와 비교하여 변경된 경우 딕셔너리가 업데이트됩니다. [source](./sources/)에 대한 설정에서 `<invalidate_query>` 필드에 이 쿼리를 지정합니다.

설정 예:

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

또는

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`, `ComplexKeyCache`, `SSDCache`, `SSDComplexKeyCache` 딕셔너리는 동기 및 비동기 업데이트를 모두 지원합니다.

또한 `Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` 딕셔너리는 이전 업데이트 이후에 변경된 데이터만 요청하도록 설정할 수도 있습니다. 딕셔너리 소스 구성에서 `update_field`가 지정된 경우, 초 단위의 이전 업데이트 시각 값이 데이터 요청에 포함됩니다. 소스 유형(Executable, HTTP, MySQL, PostgreSQL, ClickHouse, 또는 ODBC)에 따라 외부 소스에서 데이터를 요청하기 전에 `update_field`에 서로 다른 로직이 적용됩니다.


* 소스가 HTTP인 경우 `update_field`는 마지막 업데이트 시간을 값으로 하는 쿼리 매개변수로 추가됩니다.
* 소스가 Executable인 경우 `update_field`는 마지막 업데이트 시간을 값으로 하는 실행 스크립트 인수로 추가됩니다.
* 소스가 ClickHouse, MySQL, PostgreSQL, ODBC인 경우 `update_field`를 마지막 업데이트 시간 이상으로 비교하는 `WHERE` 절이 추가됩니다.
  * 기본적으로 이 `WHERE` 조건은 SQL 쿼리의 최상위 레벨에서 검사됩니다. 또는 `{condition}` 키워드를 사용하여 쿼리 내의 다른 임의의 `WHERE` 절에서 이 조건을 검사할 수도 있습니다. 예:
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

`update_field` 옵션이 설정되어 있으면, 추가 옵션인 `update_lag`을 설정할 수 있습니다. `update_lag` 옵션의 값은 갱신된 데이터를 요청하기 전에 이전 업데이트 시각에서 미리 차감됩니다.

설정 예:

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

또는

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
