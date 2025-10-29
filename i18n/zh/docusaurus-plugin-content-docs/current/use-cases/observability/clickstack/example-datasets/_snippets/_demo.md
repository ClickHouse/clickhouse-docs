import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Demo Architecture {#demo-architecture}

该演示由使用不同编程语言编写的微服务组成，这些微服务通过 gRPC 和 HTTP 相互通信，还有一个使用 Locust 模拟用户流量的负载生成器。为此演示提供的原始源代码已修改为使用 [ClickStack instrumentation](/use-cases/observability/clickstack/sdks)。

<Image img={architecture} alt="Architecture" size="lg"/>

_来源: https://opentelemetry.io/docs/demo/architecture/_

关于该演示的更多详细信息可以在以下链接中找到：

- [OpenTelemetry documentation](https://opentelemetry.io/docs/demo/)
- [ClickStack maintained fork](https://github.com/ClickHouse/opentelemetry-demo)
