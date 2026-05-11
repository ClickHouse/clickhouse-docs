## schema 선택: Map vs JSON \{#schema-choice-map-vs-json\}

ClickStack는 기본적으로 속성을 `Map(LowCardinality(String), String)` 컬럼에 저장합니다. 이는 관측성 워크로드에 권장되는 schema입니다. [버킷화된 맵 시리얼라이제이션](/sql-reference/data-types/map#bucketed-map-serialization)과 맵 키 및 값에 대한 텍스트 인덱스를 함께 사용하면, 동적 JSON 서브컬럼을 키별로 수집할 때 발생하는 오버헤드 없이 선택적 조회를 수행할 수 있습니다.

`JSON` 타입 schema는 속성 키 집합이 작고 안정적인 워크로드를 평가할 수 있도록 베타로 제공됩니다. 기본값으로는 **권장되지 않습니다**. 전체 비교와 JSON 지원을 활성화하는 데 필요한 env var는 [Map vs JSON type](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json)에서 확인하십시오.