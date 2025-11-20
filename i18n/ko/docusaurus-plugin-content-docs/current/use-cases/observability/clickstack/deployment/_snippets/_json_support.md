import BetaBadge from '@theme/badges/BetaBadge';

## JSON 타입 지원 {#json-type-support}

<BetaBadge/>

:::warning 베타 기능
**ClickStack**에서의 JSON 타입 지원은 **베타 기능**입니다. JSON 타입 자체는 ClickHouse 25.3+에서 운영 준비가 되었지만, ClickStack 내에서의 통합은 여전히 active development 중이며 제한사항이 있거나 향후 변경되거나 버그가 있을 수 있습니다.
:::

ClickStack은 `2.0.4` 버전부터 [JSON 타입](/interfaces/formats/JSON)에 대한 베타 지원을 제공합니다.

이 타입의 이점에 대한 내용은 [JSON 타입의 이점](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)을 참조하십시오.

사용자가 JSON 타입 지원을 활성화하려면 다음 환경 변수를 설정해야 합니다:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTel 수집기에서 JSON 타입을 사용하여 스키마가 생성되도록 지원을 활성화합니다.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - HyperDX 애플리케이션에서 JSON 데이터를 쿼리할 수 있도록 지원을 활성화합니다.
