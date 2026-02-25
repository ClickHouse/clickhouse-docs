---
description: '서버 CPU 과부하 시 동작 제어'
sidebar_label: '서버 과부하'
slug: /operations/settings/server-overload
title: '서버 과부하'
doc_type: 'reference'
---



# 서버 과부하 \{#server-overload\}



## 개요 \{#overview\}

서버는 다양한 이유로 과부하 상태가 될 수 있습니다. 현재 CPU 과부하를 판단하기 위해
ClickHouse 서버는 CPU 대기 시간(`OSCPUWaitMicroseconds` 메트릭)과 사용 시간
(`OSCPUVirtualTimeMicroseconds` 메트릭)의 비율을 계산합니다. 서버가 특정 비율을 초과하여 과부하된 경우,
부하가 더 증가하지 않도록 일부 쿼리를 버리거나 연결 요청을 차단하는 것이 합리적일 수 있습니다.

서버 설정인 `os_cpu_busy_time_threshold`는 CPU가 유용한 작업을 수행하는 것으로 간주하기 위한 최소 사용 시간을 정의합니다.
현재 `OSCPUVirtualTimeMicroseconds` 메트릭 값이 이 값보다 낮으면
CPU 과부하는 0으로 간주됩니다.



## 쿼리 거부 \{#rejecting-queries\}

쿼리 거부 동작은 쿼리 수준 설정인 `min_os_cpu_wait_time_ratio_to_throw` 및
`max_os_cpu_wait_time_ratio_to_throw`에 의해 제어됩니다. 해당 설정이 설정되어 있고 `min_os_cpu_wait_time_ratio_to_throw`가
`max_os_cpu_wait_time_ratio_to_throw`보다 작은 경우, 과부하 비율이 최소 `min_os_cpu_wait_time_ratio_to_throw` 이상이면
일정 확률로 쿼리가 거부되고 `SERVER_OVERLOADED` 오류가 발생합니다. 이 확률은 최소 및 최대 비율 사이를 선형 보간하여
결정됩니다. 예를 들어, `min_os_cpu_wait_time_ratio_to_throw = 2`,
`max_os_cpu_wait_time_ratio_to_throw = 6`, 그리고 `cpu_overload = 4`인 경우, 해당 쿼리는 `0.5`의 확률로 거부됩니다.



## 연결 끊기 \{#dropping-connections\}

연결 끊기 동작은 서버 수준 설정인 `min_os_cpu_wait_time_ratio_to_drop_connection` 및
`max_os_cpu_wait_time_ratio_to_drop_connection`으로 제어됩니다. 이러한 설정은 서버를 재시작하지 않고도 변경할 수 있습니다. 이러한 설정의 개념은 쿼리 거부 동작과 유사합니다. 이 경우의 유일한 차이점은 서버에 과부하가 걸리면
서버 측에서 연결 시도 자체가 거부된다는 점입니다.



## 리소스 과부하 경고 \{#resource-overload-warnings\}

ClickHouse는 서버에 과부하가 발생하면 CPU 및 메모리 과부하 경고를 `system.warnings` 테이블에 기록합니다. 이러한 임계값은 서버 설정을 통해 조정할 수 있습니다.

**예시**

```xml

<resource_overload_warnings>
    <cpu_overload_warn_ratio>0.9</cpu_overload_warn_ratio>
    <cpu_overload_clear_ratio>0.8</cpu_overload_clear_ratio>
    <cpu_overload_duration_seconds>600</cpu_overload_duration_seconds>
    <memory_overload_warn_ratio>0.9</memory_overload_warn_ratio>
    <memory_overload_clear_ratio>0.8</memory_overload_clear_ratio>
    <memory_overload_duration_seconds>600</memory_overload_duration_seconds>
</resource_overload_warnings>
```
