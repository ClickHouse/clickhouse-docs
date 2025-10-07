import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Архитектура демо {#demo-architecture}

Демо состоит из микросервисов, написанных на различных языках программирования, которые общаются друг с другом по gRPC и HTTP, а также генератора нагрузки, который использует Locust для имитации пользовательского трафика. Исходный код для этого демо был изменен, чтобы использовать [инструментацию ClickStack](/use-cases/observability/clickstack/sdks).

<Image img={architecture} alt="Архитектура" size="lg"/>

_Кредит: https://opentelemetry.io/docs/demo/architecture/_

Дополнительные детали о демо можно найти в:

- [документации OpenTelemetry](https://opentelemetry.io/docs/demo/)
- [форк, поддерживаемый ClickStack](https://github.com/ClickHouse/opentelemetry-demo)
