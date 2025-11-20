---
'description': '다양한 인수 값에서 배열을 생성합니다.'
'sidebar_position': 154
'slug': '/sql-reference/aggregate-functions/reference/groupuniqarray'
'title': 'groupUniqArray'
'doc_type': 'reference'
---


# groupUniqArray

구문: `groupUniqArray(x)` 또는 `groupUniqArray(max_size)(x)`

다양한 인자 값으로부터 배열을 생성합니다. 메모리 소비는 [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md) 함수와 동일합니다.

두 번째 버전(`max_size` 매개변수가 있는 경우)은 결과 배열의 크기를 `max_size` 요소로 제한합니다.
예를 들어, `groupUniqArray(1)(x)`는 `[any(x)]`와 동등합니다.
