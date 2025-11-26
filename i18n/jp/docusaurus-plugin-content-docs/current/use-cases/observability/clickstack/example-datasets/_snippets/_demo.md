import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';

### デモのアーキテクチャ

このデモは、複数のプログラミング言語で実装されたマイクロサービス群が gRPC と HTTP 経由で相互に通信し、Locust を用いてユーザートラフィックを模擬するロードジェネレーターから構成されています。元のデモのソースコードは、[ClickStack 計装](/use-cases/observability/clickstack/sdks) を利用するように変更されています。

<Image img={architecture} alt="アーキテクチャ" size="lg" />

*出典: [https://opentelemetry.io/docs/demo/architecture/](https://opentelemetry.io/docs/demo/architecture/)*

このデモの詳細については、次を参照してください:

* [OpenTelemetry のドキュメント](https://opentelemetry.io/docs/demo/)
* [ClickStack によるフォーク版](https://github.com/ClickHouse/opentelemetry-demo)
