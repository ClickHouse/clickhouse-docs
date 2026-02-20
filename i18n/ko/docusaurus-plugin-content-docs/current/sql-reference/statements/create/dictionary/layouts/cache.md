---
slug: /sql-reference/statements/create/dictionary/layouts/cache
title: 'cache 딕셔너리 레이아웃'
sidebar_label: 'cache'
sidebar_position: 6
description: '딕셔너리를 고정 크기의 메모리 캐시에 저장합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`cached` 딕셔너리 레이아웃 타입은 고정된 개수의 셀로 구성된 캐시에 딕셔너리를 저장합니다.
이 셀에는 자주 사용되는 요소가 포함됩니다.

딕셔너리 키는 [UInt64](../../../data-types/int-uint.md) 타입입니다.

딕셔너리를 조회할 때는 먼저 캐시를 검색합니다. 각 데이터 블록마다, 캐시에서 찾을 수 없거나 오래된 키들을 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`로 소스에서 요청합니다. 수신한 데이터는 캐시에 기록됩니다.

키를 딕셔너리에서 찾을 수 없으면 캐시 업데이트 작업이 생성되어 업데이트 큐에 추가됩니다. 업데이트 큐 속성은 `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates` 설정으로 제어할 수 있습니다.

캐시 딕셔너리의 경우, 캐시 내 데이터의 만료 [lifetime](../lifetime.md#refreshing-dictionary-data-using-lifetime)을 설정할 수 있습니다. 셀에 데이터를 로드한 이후 `lifetime`보다 더 많은 시간이 경과하면 해당 셀의 값은 사용되지 않고 키는 만료된 것으로 간주됩니다. 이 키는 다음에 다시 사용해야 할 때 재요청됩니다. 이 동작은 `allow_read_expired_keys` 설정으로 구성할 수 있습니다.

이는 딕셔너리를 저장하는 방식들 중 가장 비효율적인 방법입니다. 캐시의 성능은 설정을 얼마나 올바르게 구성했는지와 사용 시나리오에 크게 의존합니다. 캐시 타입 딕셔너리는 적중률이 충분히 높을 때(권장 99% 이상)만 성능이 좋습니다. 평균 적중률은 [system.dictionaries](../../../../operations/system-tables/dictionaries.md) 테이블에서 확인할 수 있습니다.

`allow_read_expired_keys` 설정이 1로 설정된 경우(기본값은 0), 딕셔너리는 비동기 업데이트를 지원할 수 있습니다. 클라이언트가 키를 요청했고 모든 키가 캐시에 있으나 일부가 만료된 경우, 딕셔너리는 클라이언트에게 만료된 키를 그대로 반환한 뒤 소스에 비동기적으로 재요청합니다.

캐시 성능을 개선하려면 `LIMIT`가 있는 서브쿼리를 사용하고, 딕셔너리 관련 FUNCTION은 외부에서 호출하십시오.

모든 유형의 소스를 지원합니다.

설정 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
        <cache>
            <!-- 캐시의 크기(셀 개수 기준)입니다. 2의 거듭제곱으로 올림 처리됩니다. -->
            <size_in_cells>1000000000</size_in_cells>
            <!-- 만료된 키 읽기 허용 여부입니다. -->
            <allow_read_expired_keys>0</allow_read_expired_keys>
            <!-- 업데이트 큐의 최대 크기입니다. -->
            <max_update_queue_size>100000</max_update_queue_size>
            <!-- 업데이트 작업을 큐에 넣기 위한 최대 대기 시간(밀리초)입니다. -->
            <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
            <!-- 업데이트 작업 완료까지의 최대 대기 시간(밀리초)입니다. -->
            <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
            <!-- 캐시 딕셔너리 업데이트에 사용할 최대 스레드 수입니다. -->
            <max_threads_for_updates>4</max_threads_for_updates>
        </cache>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />

충분히 큰 캐시 크기를 설정하십시오. 셀의 개수는 실험을 통해 결정해야 합니다:

1. 값을 하나 설정합니다.
2. 캐시가 완전히 찰 때까지 쿼리를 실행합니다.
3. `system.dictionaries` 테이블을 사용하여 메모리 사용량을 확인합니다.
4. 원하는 메모리 사용량에 도달할 때까지 셀의 개수를 늘리거나 줄입니다.

:::note
이 레이아웃의 소스로 ClickHouse를 사용하는 것은 권장되지 않습니다. 딕셔너리 조회에는 임의 포인트 읽기(random point reads)가 필요하며, 이는 ClickHouse가 최적화해 둔 액세스 패턴이 아닙니다.
:::
