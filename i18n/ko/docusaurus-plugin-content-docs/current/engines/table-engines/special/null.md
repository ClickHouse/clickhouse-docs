---
description: '`Null` 테이블에 쓰기 작업을 수행하면 데이터가 무시됩니다. `Null` 테이블에서 읽기 작업을 수행하면 빈 응답이 반환됩니다.'
sidebar_label: 'Null'
sidebar_position: 50
slug: /engines/table-engines/special/null
title: 'Null 테이블 엔진'
doc_type: 'reference'
---

# Null table engine \{#null-table-engine\}

`Null` 테이블에 데이터를 쓸 때는 데이터가 무시됩니다.
`Null` 테이블에서 데이터를 읽을 때는 아무 결과도 반환되지 않습니다.

`Null` 테이블 엔진은 데이터 변환 이후 원본 데이터가 더 이상 필요하지 않을 때 유용합니다.
이를 위해 `Null` 테이블에 materialized view를 생성할 수 있습니다.
테이블에 기록된 데이터는 뷰에서 소비되지만, 원시 데이터는 폐기됩니다.