import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### 데모 아키텍처 \{#demo-architecture\}

이 데모는 서로 다른 프로그래밍 언어로 작성된 마이크로서비스로 구성되며, 이들 간에는 gRPC와 HTTP를 통해 통신합니다. 또한 Locust를 사용하여 사용자 트래픽을 시뮬레이션하는 로드 생성기가 포함됩니다. 이 데모의 원본 소스 코드는 [ClickStack instrumentation](/use-cases/observability/clickstack/sdks)을 사용하도록 수정되었습니다.

<Image img={architecture} alt="Architecture" size="lg"/>

_출처: https://opentelemetry.io/docs/demo/architecture/_

데모에 대한 추가 세부 정보는 다음에서 확인할 수 있습니다.

- [OpenTelemetry 문서](https://opentelemetry.io/docs/demo/)
- [ClickStack에서 관리하는 포크](https://github.com/ClickHouse/opentelemetry-demo)