import BetaBadge from '@theme/badges/BetaBadge';

## JSON 타입 지원 \{#json-type-support\}

<BetaBadge/>

:::warning[베타 기능 - 프로덕션 환경에 아직 적합하지 않음]
**ClickStack**의 JSON 타입 지원은 **베타 기능**입니다. JSON 타입 자체는 ClickHouse 25.3+에서 프로덕션 환경에서 사용할 준비가 되어 있지만, ClickStack 내 통합은 아직 활발히 개발 중이며 제한 사항이 있거나, 향후 변경되거나, 버그를 포함할 수 있습니다.
:::

ClickStack은 `2.0.4` 버전부터 [JSON type](/interfaces/formats/JSON)에 대한 베타 지원을 제공합니다.

이 타입의 이점은 [Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)를 참고하십시오.

JSON 타입 지원을 활성화하려면 다음 환경 변수를 설정해야 합니다.

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTel collector에서 지원을 활성화하여 스키마가 JSON 타입을 사용해 생성되도록 합니다.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` (ClickStack 오픈 소스 배포판에서만 해당) - ClickStack UI 애플리케이션에서 지원을 활성화하여 JSON 데이터를 조회할 수 있도록 합니다.