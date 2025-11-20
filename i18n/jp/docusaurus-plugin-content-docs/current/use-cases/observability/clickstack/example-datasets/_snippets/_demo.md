import Image from "@theme/IdealImage"
import architecture from "@site/static/images/use-cases/observability/hyperdx-demo/architecture.png"

### デモアーキテクチャ {#demo-architecture}

このデモは、異なるプログラミング言語で記述されたマイクロサービスで構成されており、gRPCとHTTPを介して相互に通信します。また、Locustを使用してユーザートラフィックをシミュレートする負荷生成ツールも含まれています。このデモの元のソースコードは、[ClickStack計装](/use-cases/observability/clickstack/sdks)を使用するように変更されています。

<Image img={architecture} alt='アーキテクチャ' size='lg' />

_出典: https://opentelemetry.io/docs/demo/architecture/_

デモの詳細については、以下を参照してください:

- [OpenTelemetryドキュメント](https://opentelemetry.io/docs/demo/)
- [ClickStack管理フォーク](https://github.com/ClickHouse/opentelemetry-demo)
