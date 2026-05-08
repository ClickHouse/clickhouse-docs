---
slug: /use-cases/observability/clickstack/ingesting-data/schema/map-vs-json
pagination_prev: null
pagination_next: null
description: 'ClickStack 속성에서 맵 타입과 JSON 타입을 이용하는 타이밍'
sidebar_label: '맵 vs JSON 타입'
title: 'ClickStack의 맵 vs JSON 타입'
doc_type: 'reference'
keywords: ['clickstack', 'json', '맵', '속성', 'schema', '관측성']
---

import BetaBadge from '@theme/badges/BetaBadge';

ClickStack의 [기본 schema](/use-cases/observability/clickstack/ingesting-data/schemas)는 리소스, scope, 로그, 스팬 속성을 `Map(LowCardinality(String), String)` 컬럼에 저장합니다. ClickHouse는 엄격한 타입의 [`JSON` 타입](/interfaces/formats/JSON)도 지원하며, ClickStack은 `Map` 대신 이를 사용할 수 있도록 베타 지원을 제공합니다.

**일반적인 관측성 워크로드에는 [기본 `Map` 기반 schema](/use-cases/observability/clickstack/ingesting-data/schemas)를 유지하는 것을 권장합니다.** JSON 타입은 속성 키 집합이 작고 안정적인 워크로드에서 이를 평가하려는 사용자를 위해 제공되지만, 일반적인 용도로 권장되는 schema는 아닙니다.

## 왜 Map이 기본값으로 권장되는가 \{#why-map\}

관측성 데이터의 대부분은 리소스 속성, 스코프 속성, 스팬 및 로그 속성과 같은 속성으로 이루어집니다. 이러한 집합은 일반적으로 규모가 크고, 고 카디널리티이며, 고처리량으로 수집됩니다. 이러한 속성에 대해 선택하는 schema는 수집 비용과 저장 레이아웃을 결정하는 가장 큰 요인입니다.

`Map(LowCardinality(String), String)`은 키와 값을 하나의 구조에 저장합니다. 과거에는 단일 키를 읽으려면 전체 맵 컬럼을 읽어야 한다는 점이 `Map`의 단점이었습니다. 이제는 그렇지 않습니다. ClickHouse는 이제 [버킷화된 맵 시리얼라이제이션](/sql-reference/data-types/map#bucketed-map-serialization)을 지원하므로, 맵을 여러 버킷으로 나누어 쿼리가 필요한 버킷만 읽을 수 있습니다. 여기에 [ClickStack의 기본 schema](/use-cases/observability/clickstack/ingesting-data/schemas)에서 구성하는 방식대로 맵 키와 값에 [텍스트 인덱스](/engines/table-engines/mergetree-family/textindexes)를 함께 사용하면, 새 키가 추가되어도 추가 수집 비용 없이 `Map`을 읽기 시점에 선택적이고 빠르게 조회할 수 있습니다.

실제로 이는 다음을 의미합니다:

* **키가 늘어나도 안정적인 수집 비용.** 새 속성 키를 추가해도 디스크상의 컬럼 레이아웃이 바뀌거나 새 컬럼 파일이 생성되지 않습니다. 수집 비용은 키 카디널리티가 아니라 데이터 양에 의해 결정됩니다.
* **메타데이터 폭증 없음.** 디스크상의 컬럼 파일 수는 고유한 속성 키 수에 비례해 늘어나지 않습니다.
* **인덱스를 통한 선택적 조회.** 맵 키와 값에 대한 텍스트 인덱스를 사용하면 모든 행을 스캔하지 않고도 특정 값을 조회할 수 있습니다.
* **고처리량에서 예측 가능한 동작.** Map은 트레이싱과 로그에서 흔히 나타나는 버스트성의 schema 없는 속성 집합도 키별 오버헤드 없이 처리합니다.

## 기본값으로 JSON을 사용하지 않는 이유 \{#why-not-json\}

`JSON` 타입은 다른 방식을 사용합니다. 삽입 시점에 ClickHouse는 감지한 각 경로마다 전용의 강타입 서브컬럼을 동적으로 생성합니다. 읽기 시점에는 요청한 서브컬럼만 읽으면 되고, 타입도 유지되며, 쿼리 시점에 CAST할 필요도 없으므로 이는 매력적입니다.

하지만 그 대가는 수집 시점에 발생합니다. 동적 서브컬럼을 많이 생성하고 관리하면 쓰기 시점 오버헤드와 메타데이터 복잡성이 커집니다. 속성 집합이 매우 크거나 매우 동적이고 수집 처리량도 높은 관측성 workload에서는 이러한 오버헤드가 특히 큽니다. [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 제한을 사용하면 추가 경로를 공유 컬럼으로 스필하여 영향을 줄일 수 있지만, 공유 컬럼에 대한 접근은 전용 서브컬럼보다 느립니다. 따라서 애초에 JSON을 사용하려던 이유였던 읽기 시점의 이점도 줄어듭니다.

버킷화된 맵 시리얼라이제이션으로 `Map`의 기존 읽기 시점 오버헤드 대부분이 사라졌기 때문에, 일반적인 관측성 workload에서는 이제 `JSON`의 읽기 시점 이점이 수집 시점 비용을 상쇄하지 못합니다.

## 여전히 JSON을 고려할 수 있는 경우 \{#when-to-consider-json\}

다음 조건이 *모두* 해당된다면 JSON 타입이 적절한 선택이 될 수 있습니다:

* 속성 키 집합이 **작고 안정적**입니다. 즉, 수천 개의 고유 키가 생기지 않으며 새 키도 드물게 추가됩니다.
* 수집 처리량이 속성 카디널리티에 비해 **높지 않습니다**.
* 쿼리 시점에 형 변환을 하지 않고도 속성에 **명확한 타입으로 접근**하기를 원합니다(숫자는 숫자로, 불리언은 불리언으로 유지됩니다).
* ClickStack에서 **베타 기능**을 운영하고, 통합 방식이 변경될 수 있다는 점을 감수할 의향이 있습니다.

이 조건이 모두 충족되지 않는다면 [기본 `Map` 기반 schema](/use-cases/observability/clickstack/ingesting-data/schemas)를 계속 사용하십시오.

## 베타 상태 \{#beta-status\}

<BetaBadge />

:::warning 베타 기능, 프로덕션용 아님
**ClickStack**의 JSON 타입 지원은 **베타 기능**입니다. JSON 타입 자체는 ClickHouse 25.3+에서 프로덕션 환경에 사용할 수 있지만, ClickStack에 통합된 기능은 아직 활발히 개발 중이므로 제한 사항이 있을 수 있으며, 향후 변경되거나 버그가 포함될 수 있습니다.
:::

ClickStack는 버전 `2.0.4`부터 JSON 타입을 베타로 지원합니다.

## JSON 지원 활성화 \{#enabling-json-support\}

[기본 `Map` 기반 schema](/use-cases/observability/clickstack/ingesting-data/schemas) 대신 JSON 타입 schema를 사용하려면 다음 환경 변수를 설정하십시오.

| 변수                                                              | 설정 위치                   | 목적                                                                       |
| --------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` | OTel collector          | ClickHouse에서 JSON 타입을 사용해 schema를 생성합니다.                                 |
| `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`                         | HyperDX (ClickStack UI) | 애플리케이션 계층에서 JSON 타입 schema를 쿼리할 수 있도록 활성화합니다. ClickStack 오픈 소스에서만 지원됩니다. |

### Managed ClickStack \{#managed-clickstack\}

Managed ClickStack에서 JSON 지원을 활성화하려면 collector를 구성하기 전에 support@clickhouse.com으로 문의하십시오. 또한 이 기능은 ClickHouse Cloud의 ClickStack UI (HyperDX)에서도 활성화되어 있어야 합니다.

collector에 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`를 설정하십시오. 예시:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### 오픈 소스 ClickStack \{#oss-clickstack\}

collector가 포함된 모든 배포에서 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`를 설정하고, HyperDX 애플리케이션 계층에서는 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`를 설정하여 JSON 타입 schema를 쿼리할 수 있도록 하십시오.

예시:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

## 맵 기반 schema에서 JSON으로 마이그레이션 \{#migrating-from-map-to-json\}

:::important 하위 호환성
[JSON 타입](/interfaces/formats/JSON)은 기존 맵 기반 schema와 **하위 호환되지 않습니다**. 이 기능을 활성화하면 `JSON` 타입을 사용하는 새 테이블이 생성되며, 데이터를 수동으로 마이그레이션해야 합니다.
:::

[기본 맵 기반 schema](/use-cases/observability/clickstack/ingesting-data/schemas)에서 마이그레이션하려면 다음 단계를 따르십시오.

<VerticalStepper headerLevel="h3">
  ### OTel collector 중지 \{#stop-the-collector\}

  ### 기존 테이블 이름 변경 및 데이터 소스 업데이트 \{#rename-existing-tables-sources\}

  기존 테이블의 이름을 변경하고 HyperDX에서 데이터 소스를 업데이트합니다.

  예시:

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  ### collector 데프로이 \{#deploy-the-collector\}

  `OTEL_AGENT_FEATURE_GATE_ARG`를 설정한 상태로 collector를 데프로이합니다.

  ### JSON schema 지원을 사용하도록 HyperDX 컨테이너 재시작 \{#restart-the-hyperdx-container\}

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  ### 새 데이터 소스 생성 \{#create-new-data-sources\}

  HyperDX에서 JSON 테이블을 가리키는 새 데이터 소스를 생성합니다.
</VerticalStepper>

### 기존 데이터 마이그레이션(선택 사항) \{#migrating-existing-data\}

기존 데이터를 새 JSON 테이블로 옮기려면 다음과 같이 하십시오:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
약 100억 행 미만의 데이터셋에만 권장됩니다. 이전에 Map 타입으로 저장된 데이터는 타입 정밀도가 유지되지 않았습니다(모든 값이 문자열이었습니다). 그 결과, 기존 데이터는 수명 주기가 끝날 때까지 새 schema에서 문자열로 표시되므로 프런트엔드에서 일부 CAST가 필요합니다. 새 데이터의 타입은 JSON 타입으로 유지됩니다.
:::