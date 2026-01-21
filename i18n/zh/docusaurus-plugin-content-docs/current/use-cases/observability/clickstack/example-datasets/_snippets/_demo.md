import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### 演示架构 \{#demo-architecture\}

此演示由使用不同编程语言编写的微服务组成，这些微服务通过 gRPC 和 HTTP 相互通信，并包含一个使用 Locust 模拟用户流量的负载生成器。该演示的原始源代码已被修改为使用 [ClickStack instrumentation](/use-cases/observability/clickstack/sdks)。

<Image img={architecture} alt="架构" size="lg"/>

_致谢：https://opentelemetry.io/docs/demo/architecture/_

有关该演示的更多详细信息，请参阅：

- [OpenTelemetry 文档](https://opentelemetry.io/docs/demo/)
- [由 ClickStack 维护的 fork 版本](https://github.com/ClickHouse/opentelemetry-demo)