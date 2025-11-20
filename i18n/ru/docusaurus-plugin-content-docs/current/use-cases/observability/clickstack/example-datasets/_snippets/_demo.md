import Image from "@theme/IdealImage"
import architecture from "@site/static/images/use-cases/observability/hyperdx-demo/architecture.png"

### Архитектура демонстрации {#demo-architecture}

Демонстрация состоит из микросервисов, написанных на различных языках программирования, которые взаимодействуют друг с другом по протоколам gRPC и HTTP, а также генератора нагрузки, использующего Locust для имитации пользовательского трафика. Исходный код этой демонстрации был модифицирован для использования [инструментария ClickStack](/use-cases/observability/clickstack/sdks).

<Image img={architecture} alt='Архитектура' size='lg' />

_Источник: https://opentelemetry.io/docs/demo/architecture/_

Дополнительную информацию о демонстрации можно найти в:

- [документации OpenTelemetry](https://opentelemetry.io/docs/demo/)
- [поддерживаемом форке ClickStack](https://github.com/ClickHouse/opentelemetry-demo)
