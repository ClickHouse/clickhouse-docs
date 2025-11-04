

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### Demo Architecture {#demo-architecture}

デモは、gRPCおよびHTTPを介して相互に通信する異なるプログラミング言語で書かれたマイクロサービスと、Locustを使用してユーザートラフィックを偽装する負荷発生器で構成されています。このデモの元のソースコードは、[ClickStackの計測](/use-cases/observability/clickstack/sdks)を使用するように変更されています。

<Image img={architecture} alt="Architecture" size="lg"/>

_クレジット: https://opentelemetry.io/docs/demo/architecture/_

デモの詳細については以下を参照してください:

- [OpenTelemetryのドキュメント](https://opentelemetry.io/docs/demo/)
- [ClickStackが管理するフォーク](https://github.com/ClickHouse/opentelemetry-demo)
