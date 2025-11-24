---
'description': '쿼리에 대해 보다 유연한 메모리 한계를 설정할 수 있도록 설계된 실험적인 기술.'
'slug': '/operations/settings/memory-overcommit'
'title': '메모리 오버커밋'
'doc_type': 'reference'
---


# 메모리 오버커밋

메모리 오버커밋은 쿼리에 대한 더 유연한 메모리 한계를 설정할 수 있도록 하기 위한 실험적 기술입니다.

이 기술의 아이디어는 쿼리가 사용할 수 있는 보장된 메모리 양을 나타낼 수 있는 설정을 도입하는 것입니다. 
메모리 오버커밋이 활성화되고 메모리 한계에 도달하면 ClickHouse는 가장 많은 오버커밋이 발생한 쿼리를 선택하고 이 쿼리를 종료하여 메모리를 확보하려고 합니다.

메모리 한계에 도달하면 모든 쿼리는 새로운 메모리를 할당하려는 시도 중에 잠시 대기합니다. 
타임아웃이 지나고 메모리가 해제되면 쿼리는 실행을 계속합니다. 
그렇지 않으면 예외가 발생하고 쿼리는 종료됩니다.

중지하거나 종료할 쿼리의 선택은 도달한 메모리 한계에 따라 전역 또는 사용자 오버커밋 트래커에 의해 수행됩니다. 
오버커밋 트래커가 중지할 쿼리를 선택할 수 없는 경우 MEMORY_LIMIT_EXCEEDED 예외가 발생합니다.

## 사용자 오버커밋 트래커 {#user-overcommit-tracker}

사용자 오버커밋 트래커는 사용자의 쿼리 목록에서 가장 큰 오버커밋 비율을 가진 쿼리를 찾습니다. 
특정 쿼리에 대한 오버커밋 비율은 할당된 바이트 수를 `memory_overcommit_ratio_denominator_for_user` 설정의 값으로 나눈 값으로 계산됩니다.

쿼리에 대한 `memory_overcommit_ratio_denominator_for_user`가 0인 경우, 오버커밋 트래커는 이 쿼리를 선택하지 않습니다.

대기 타임아웃은 `memory_usage_overcommit_max_wait_microseconds` 설정에 의해 설정됩니다.

**예시**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## 전역 오버커밋 트래커 {#global-overcommit-tracker}

전역 오버커밋 트래커는 모든 쿼리 목록에서 가장 큰 오버커밋 비율을 가진 쿼리를 찾습니다. 
이 경우 오버커밋 비율은 할당된 바이트 수를 `memory_overcommit_ratio_denominator` 설정의 값으로 나눈 값으로 계산됩니다.

쿼리에 대한 `memory_overcommit_ratio_denominator`가 0인 경우, 오버커밋 트래커는 이 쿼리를 선택하지 않습니다.

대기 타임아웃은 구성 파일의 `memory_usage_overcommit_max_wait_microseconds` 매개변수에 의해 설정됩니다.
