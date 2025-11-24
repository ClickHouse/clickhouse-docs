---
'slug': '/use-cases/observability/clickstack/search'
'title': 'ClickStack로 검색하기'
'sidebar_label': '검색'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 검색하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'search'
- 'logs'
- 'observability'
- 'full-text search'
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack는 이벤트(로그 및 추적)에 대한 전면 검색을 수행할 수 있게 합니다. 이벤트와 일치하는 키워드를 입력하기만 하면 검색을 시작할 수 있습니다. 예를 들어, 로그에 "Error"가 포함되어 있다면, 검색창에 "Error"를 입력하기만 하면 찾을 수 있습니다.

이와 동일한 검색 구문은 대시보드와 차트의 이벤트 필터링에도 사용됩니다.

## Search Features {#search-features}

### Natural language search syntax {#natural-language-syntax}

- 검색은 대소문자를 구분하지 않습니다.
- 기본적으로 전체 단어와 일치하는 검색이 이루어집니다(예: `Error`는 `Error here`와 일치하지만 `Errors here`와는 일치하지 않습니다). 부분 단어와 일치시키려면 단어를 와일드카드로 감쌀 수 있습니다(예: `*Error*`는 `AnyError` 및 `AnyErrors`와 일치합니다).
- 검색어는 어떤 순서로든 검색됩니다(예: `Hello World`는 `Hello World`와 `World Hello`를 포함하는 로그와 일치합니다).
- `NOT` 또는 `-`를 사용하여 키워드를 제외할 수 있습니다(예: `Error NOT Exception` 또는 `Error -Exception`).
- 여러 키워드를 결합하려면 `AND` 및 `OR`를 사용할 수 있습니다(예: `Error OR Exception`).
- 정확한 일치는 큰따옴표를 통해 수행할 수 있습니다(예: `"Error tests not found"`).

<Image img={hyperdx_27} alt="Search" size="md"/>

#### Column/property search {#column-search}

- `column:value` 형식을 사용하여 컬럼 및 JSON/맵 속성을 검색할 수 있습니다(예: `level:Error`, `service:app`).
- 비교 연산자(`>`, `<`, `>=`, `<=`)를 사용하여 값의 범위를 검색할 수 있습니다(예: `Duration:>1000`).
- 속성의 존재 여부를 검색하려면 `property:*`를 사용할 수 있습니다(예: `duration:*`).

### Time input {#time-input}

- 시간 입력은 자연어 입력을 허용합니다(예: `1 hour ago`, `yesterday`, `last week`).
- 특정 시점을 지정하면 그 시점부터 지금까지 검색됩니다.
- 시간 범위는 검색 시 파싱된 시간 범위로 항상 변환되어 시간 쿼리의 디버깅을 쉽게 합니다.
- 특정 시간 범위로 확대하기 위해 히스토그램 바를 강조 표시할 수 있습니다.

### SQL search syntax {#sql-syntax}

검색 입력을 SQL 모드로 전환할 수 있습니다. 이는 검색을 위해 유효한 SQL WHERE 절을 허용합니다. 이는 Lucene 구문으로 표현할 수 없는 복잡한 쿼리에 유용합니다.

### Select statement  {#select-statement}

검색 결과에 표시할 컬럼을 지정하려면 `SELECT` 입력을 사용할 수 있습니다. 이는 검색 페이지에서 선택할 컬럼에 대한 SQL SELECT 표현식입니다. 현재 별칭은 지원되지 않습니다(예: `column as "alias"`를 사용할 수 없습니다).

## Saved searches {#saved-searches}

나중에 빠르게 접근할 수 있도록 검색을 저장할 수 있습니다. 저장된 후, 검색은 왼쪽 사이드바에 나타나 자주 사용되는 검색 쿼리를 재구성하지 않고도 쉽게 다시 방문할 수 있게 합니다.

검색을 저장하려면, 검색 쿼리를 구성하고 저장 버튼을 클릭하면 됩니다. 저장된 검색에 대해 설명적인 이름을 지정하여 나중에 이를 식별할 수 있습니다.

<Image img={saved_search} alt="Saving a Search" size="md" />

### Adding alerts to saved searches {#alerts-on-saved-searches}

저장된 검색은 특정 조건이 충족될 때 알림을 통해 모니터링할 수 있습니다. 저장된 검색과 일치하는 이벤트 수가 지정된 임계값을 초과하거나 하회할 때 알림이 발생하도록 설정할 수 있습니다.

알림 설정 및 구성에 대한 자세한 내용은 [Alerts documentation](/use-cases/observability/clickstack/alerts)를 참조하십시오.

### Tagging {#tagging}
<Tagging />
