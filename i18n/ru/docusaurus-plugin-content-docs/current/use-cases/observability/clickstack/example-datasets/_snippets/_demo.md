import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Архитектура демо

Демо-система состоит из микросервисов, написанных на разных языках программирования, которые взаимодействуют друг с другом по gRPC и HTTP, а также генератора нагрузки, использующего Locust для имитации пользовательского трафика. Исходный код этого демо был изменён для использования [инструментирования ClickStack](/use-cases/observability/clickstack/sdks).

<Image img={architecture} alt="Архитектура" size="lg" />

*Источник: [https://opentelemetry.io/docs/demo/architecture/](https://opentelemetry.io/docs/demo/architecture/)*

Дополнительную информацию о демо можно найти в:

* [документации OpenTelemetry](https://opentelemetry.io/docs/demo/)
* [форке opentelemetry-demo, поддерживаемом ClickStack](https://github.com/ClickHouse/opentelemetry-demo)
