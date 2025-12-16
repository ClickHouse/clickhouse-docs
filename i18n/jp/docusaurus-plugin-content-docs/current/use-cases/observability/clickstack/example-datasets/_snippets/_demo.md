import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### デモのアーキテクチャ {#demo-architecture}

このデモは、gRPC と HTTP を介して相互に通信する異なるプログラミング言語で書かれたマイクロサービス群と、Locust を使用してユーザートラフィックを模倣するロードジェネレータで構成されています。このデモのオリジナルのソースコードは、[ClickStack インストルメンテーション](/use-cases/observability/clickstack/sdks) を使用するように変更されています。

<Image img={architecture} alt="アーキテクチャ" size="lg"/>

_出典: https://opentelemetry.io/docs/demo/architecture/_

このデモの詳細については、以下を参照してください。

- [OpenTelemetry のドキュメント](https://opentelemetry.io/docs/demo/)
- [ClickStack が保守しているフォーク](https://github.com/ClickHouse/opentelemetry-demo)