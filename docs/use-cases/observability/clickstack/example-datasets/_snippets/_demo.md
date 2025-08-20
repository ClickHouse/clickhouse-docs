import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Demo Architecture {#demo-architecture}

The demo is composed of microservices written in different programming languages that talk to each other over gRPC and HTTP and a load generator that uses Locust to fake user traffic. The original source code for this demo has been modified to use [ClickStack instrumentation](/use-cases/observability/clickstack/sdks).

<Image img={architecture} alt="Architecture" size="lg"/>

_Credit: https://opentelemetry.io/docs/demo/architecture/_

Further details on the demo can be found in:

- [OpenTelemetry documentation](https://opentelemetry.io/docs/demo/)
- [ClickStack maintained fork](https://github.com/ClickHouse/opentelemetry-demo)
