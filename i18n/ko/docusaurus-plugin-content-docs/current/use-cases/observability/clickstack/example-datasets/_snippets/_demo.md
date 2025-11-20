import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### 데모 아키텍처 {#demo-architecture}

이 데모는 서로 gRPC 및 HTTP를 통해 통신하는 다양한 프로그래밍 언어로 작성된 마이크로서비스와 사용자의 트래픽을 가장하기 위해 Locust를 사용하는 로드 제너레이터로 구성됩니다. 이 데모의 원본 소스 코드는 [ClickStack instrumentation](/use-cases/observability/clickstack/sdks)을 사용하도록 수정되었습니다.

<Image img={architecture} alt="Architecture" size="lg"/>

_크레딧: https://opentelemetry.io/docs/demo/architecture/_

데모에 대한 추가 세부 정보는 다음에서 확인할 수 있습니다:

- [OpenTelemetry 문서](https://opentelemetry.io/docs/demo/)
- [ClickStack 유지 관리 포크](https://github.com/ClickHouse/opentelemetry-demo)
