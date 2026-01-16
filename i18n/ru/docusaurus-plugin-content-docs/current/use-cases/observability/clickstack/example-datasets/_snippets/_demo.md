import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Архитектура демо \\{#demo-architecture\\}

Демо состоит из микросервисов, написанных на разных языках программирования, которые взаимодействуют друг с другом по gRPC и HTTP, а также генератора нагрузки, использующего Locust для имитации пользовательского трафика. Исходный код этого демо был изменён для использования [инструментации ClickStack](/use-cases/observability/clickstack/sdks).

<Image img={architecture} alt="Архитектура" size="lg"/>

_Источник: https://opentelemetry.io/docs/demo/architecture/_

Дополнительные сведения о демо приведены в:

- [Документация по OpenTelemetry](https://opentelemetry.io/docs/demo/)
- [Форк, поддерживаемый ClickStack](https://github.com/ClickHouse/opentelemetry-demo)