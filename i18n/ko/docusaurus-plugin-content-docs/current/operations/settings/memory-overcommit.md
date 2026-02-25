---
description: '실험적인 기법으로, 쿼리의 메모리 한도를 보다 유연하게 설정할 수 있도록 합니다.'
slug: /operations/settings/memory-overcommit
title: '메모리 오버커밋'
doc_type: 'reference'
---



# 메모리 오버커밋 \{#memory-overcommit\}

메모리 오버커밋은 쿼리에 대해 더 유연한 메모리 한도를 설정할 수 있도록 하는 실험적인 기법입니다.

이 기법의 핵심은 쿼리가 사용할 수 있는 보장된 메모리 양을 나타내는 설정을 도입하는 것입니다.
메모리 오버커밋이 활성화되어 있고 메모리 한도에 도달하면, ClickHouse는 가장 많이 오버커밋된 쿼리를 선택하고 해당 쿼리를 종료하여 메모리를 해제하려고 시도합니다.

메모리 한도에 도달하면, 어떤 쿼리든 새 메모리를 할당하려는 동안 일정 시간 동안 대기합니다.
대기 타임아웃이 경과한 뒤 메모리가 해제되면 쿼리는 실행을 계속합니다.
그렇지 않으면 예외가 발생하고 쿼리는 종료됩니다.

중지하거나 종료할 쿼리의 선택은 어떤 메모리 한도에 도달했는지에 따라 글로벌 또는 사용자 오버커밋 트래커에 의해 수행됩니다.
오버커밋 트래커가 중지할 쿼리를 선택하지 못하면 MEMORY_LIMIT_EXCEEDED 예외가 발생합니다.



## User overcommit tracker \{#user-overcommit-tracker\}

User overcommit tracker는 사용자의 쿼리 목록에서 오버커밋 비율이 가장 높은 쿼리를 찾습니다.
쿼리에 대한 오버커밋 비율은 할당된 바이트 수를 `memory_overcommit_ratio_denominator_for_user` 설정 값으로 나누어 계산합니다.

해당 쿼리에 대한 `memory_overcommit_ratio_denominator_for_user` 값이 0이면, 오버커밋 트래커는 이 쿼리를 선택하지 않습니다.

대기 시간 제한은 `memory_usage_overcommit_max_wait_microseconds` 설정으로 지정합니다.

**예시**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```


## Global overcommit tracker \{#global-overcommit-tracker\}

Global overcommit tracker는 전체 쿼리 목록에서 overcommit 비율이 가장 큰 쿼리를 찾습니다.
이때 overcommit 비율은 할당된 바이트 수를 `memory_overcommit_ratio_denominator` 설정 값으로 나눈 값으로 계산됩니다.

해당 쿼리의 `memory_overcommit_ratio_denominator` 값이 0이면, overcommit tracker는 그 쿼리를 선택하지 않습니다.

대기 시간 제한은 설정 파일의 `memory_usage_overcommit_max_wait_microseconds` 파라미터로 지정됩니다.
