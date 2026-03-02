---
slug: /use-cases/observability/clickstack/search
title: 'ClickStack로 검색하기'
sidebar_label: '검색'
pagination_prev: null
pagination_next: null
description: 'ClickStack로 검색하기'
doc_type: 'guide'
keywords: ['clickstack', '검색', '로그', '관측성', '전체 텍스트 검색']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack을 사용하면 이벤트(로그와 트레이스)에 대해 전문 검색을 수행할 수 있습니다. 이벤트와 일치하는 키워드를 입력하여 바로 검색을 시작할 수 있습니다. 예를 들어, 로그에 &quot;Error&quot;가 포함되어 있으면 검색창에 &quot;Error&quot;라고 입력하는 것만으로 찾을 수 있습니다.

이와 동일한 검색 구문은 대시보드와 차트에서 이벤트를 필터링할 때에도 사용됩니다.


## 검색 기능 \{#search-features\}

### 자연어 검색 구문 \{#natural-language-syntax\}

- 검색은 대소문자를 구분하지 않습니다.
- 기본적으로 전체 단어 단위로 일치합니다(예: `Error`는 `Error here`와는
  일치하지만 `Errors here`와는 일치하지 않습니다). 부분 단어를 일치시키려면
  단어를 와일드카드로 둘러쌀 수 있습니다(예: `*Error*`는 `AnyError`와
  `AnyErrors`에 일치합니다).
- 검색어의 순서는 상관없습니다(예: `Hello World`는 `Hello World`와
  `World Hello`를 포함하는 로그와 일치합니다).
- `NOT` 또는 `-`를 사용하여 키워드를 제외할 수 있습니다(예: `Error NOT Exception` 또는
  `Error -Exception`).
- 여러 키워드를 결합하려면 `AND` 및 `OR`를 사용할 수 있습니다(예:
  `Error OR Exception`).
- 큰따옴표를 사용하여 정확히 일치하는 구문 검색을 할 수 있습니다(예: `"Error tests not found"`).

<Image img={hyperdx_27} alt="검색" size="md"/>

#### 컬럼/속성 검색 \{#column-search\}

- `column:value` 형식을 사용하여 컬럼과 JSON/맵 속성을 검색할 수 있습니다 (예: `level:Error`,
  `service:app`)
- 비교 연산자 (`>`, `<`, `>=`, `<=`)를 사용하여 값의 범위를 검색할 수 있습니다 (예: `Duration:>1000`)
- `property:*` 형식을 사용하여 속성의 존재 여부를 검색할 수 있습니다 (예:
  `duration:*`)

### Time input \{#time-input\}

- Time input은 자연어 입력(예: `1 hour ago`, `yesterday`, `last week`)을 지원합니다.
- 단일 시점을 지정하면 해당 시점부터 현재까지 검색합니다.
- 검색 시 시간 범위는 항상 파싱된 시간 범위로 변환되어 시간 쿼리를 쉽게 디버깅할 수 있습니다.
- 히스토그램 막대를 하이라이트하여 특정 시간 범위로 확대해 볼 수도 있습니다.

### SQL search syntax \{#sql-syntax\}

필요에 따라 검색 입력을 SQL 모드로 전환할 수 있습니다. 이 모드에서는 검색 조건으로 모든 유효한
SQL WHERE 절을 사용할 수 있습니다. 이는 Lucene 구문으로는 표현할 수 없는 복잡한 쿼리에 유용합니다.

### Select 구문 \{#select-statement\}

검색 결과에 표시할 컬럼을 지정하려면 `SELECT` 입력을 사용합니다. 이는 검색 페이지에서 선택할 컬럼을 지정하는 SQL `SELECT` 표현식입니다. 현재는 별칭(alias)을 지원하지 않습니다(예: `column as "alias"`는 사용할 수 없습니다).

## 저장된 검색 \{#saved-searches\}

검색을 저장해 두면 나중에 빠르게 다시 사용할 수 있습니다. 검색을 저장하면 왼쪽 사이드바에 표시되어, 자주 사용하는 검색 쿼리를 다시 구성하지 않고도 쉽게 다시 실행할 수 있습니다.

검색을 저장하려면 검색 쿼리를 설정한 다음 저장 버튼을 클릭하면 됩니다. 나중에 쉽게 알아볼 수 있도록 저장된 검색에 알기 쉬운 이름을 지정할 수 있습니다.

<Image img={saved_search} alt="검색 저장하기" size="md" />

### 저장된 검색에 알림 추가하기 \{#alerts-on-saved-searches\}

저장된 검색에 알림을 설정하면 특정 조건이 충족될 때 통지를 받도록 모니터링할 수 있습니다. 저장된 검색과 일치하는 이벤트 수가 지정한 임계값을 초과하거나 그 아래로 떨어질 때 트리거되도록 알림을 구성할 수 있습니다. 

알림 설정 및 구성에 대한 자세한 내용은 [알림(Alerts) 문서](/use-cases/observability/clickstack/alerts)를 참조하십시오.

### 태그 지정 \{#tagging\}

<Tagging />