---
'description': '서버 CPU 오버로드에 대한 행동 제어.'
'sidebar_label': '서버 오버로드'
'slug': '/operations/settings/server-overload'
'title': '서버 오버로드'
'doc_type': 'reference'
---


# 서버 과부하

## 개요 {#overview}

서버는 다양한 이유로 과부하에 걸릴 수 있습니다. 현재 CPU 과부하를 판단하기 위해,
ClickHouse 서버는 CPU 대기 시간(`OSCPUWaitMicroseconds` 메트릭)과 바쁜 시간(`OSCPUVirtualTimeMicroseconds` 메트릭)의 비율을 계산합니다.
서버의 과부하 비율이 특정 수준을 초과하면,
쿼리를 일부 무시하거나 연결 요청을 차단하여 부하를 더 이상 증가시키지 않도록 하는 것이 좋습니다.

서버 설정 `os_cpu_busy_time_threshold`는 CPU가 유용한 작업을 수행하고 있다고 간주할 최소 바쁜 시간을 제어합니다.
현재 `OSCPUVirtualTimeMicroseconds` 메트릭의 값이 이 값보다 낮으면,
CPU 과부하는 0으로 간주됩니다.

## 쿼리 거부 {#rejecting-queries}

쿼리 거부 동작은 쿼리 수준 설정 `min_os_cpu_wait_time_ratio_to_throw` 및
`max_os_cpu_wait_time_ratio_to_throw`에 의해 제어됩니다. 이러한 설정이 구성되고 `min_os_cpu_wait_time_ratio_to_throw`가 
`max_os_cpu_wait_time_ratio_to_throw`보다 작으면, 쿼리는 거부되며 과부하 비율이 최소 
`min_os_cpu_wait_time_ratio_to_throw` 이상일 경우 `SERVER_OVERLOADED` 오류가 발생합니다. 
확률은 최소 및 최대 비율 사이의 선형 보간으로 결정됩니다. 예를 들어, `min_os_cpu_wait_time_ratio_to_throw = 2`,
`max_os_cpu_wait_time_ratio_to_throw = 6`, 그리고 `cpu_overload = 4`라면, 쿼리는 50%의 확률로 거부됩니다.

## 연결 차단 {#dropping-connections}

연결 차단은 서버 수준 설정 `min_os_cpu_wait_time_ratio_to_drop_connection` 및
`max_os_cpu_wait_time_ratio_to_drop_connection`에 의해 제어됩니다. 이러한 설정은 서버 재시작 없이 변경할 수 있습니다.
이 설정 뒤의 아이디어는 쿼리 거부와 유사합니다. 이 경우 유일한 차이는, 서버가 과부하일 경우,
연결 시도가 서버 측에서 거부된다는 것입니다.

## 자원 과부하 경고 {#resource-overload-warnings}

ClickHouse는 서버가 과부하일 때 `system.warnings` 테이블에 CPU 및 메모리 과부하 경고를 기록합니다. 
서버 구성 통해 이러한 임계값을 사용자 정의할 수 있습니다.

**예제**

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
