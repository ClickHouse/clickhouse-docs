---
title: 'OpenTelemetry の統合'
description: 'OpenTelemetry と ClickHouse を統合して可観測性を実現する'
slug: /observability/integrating-opentelemetry
keywords: ['可観測性', 'OpenTelemetry']
show_related_blogs: true
doc_type: 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# データ収集のための OpenTelemetry 連携

どのようなオブザーバビリティソリューションでも、ログやトレースを収集してエクスポートする手段が必要です。そのために、ClickHouse では [OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/) の利用を推奨しています。

「OpenTelemetry は、トレース、メトリクス、ログなどのテレメトリデータを作成・管理するために設計された、オブザーバビリティ向けのフレームワーク兼ツールキットです。」

ClickHouse や Prometheus と異なり、OpenTelemetry はオブザーバビリティのバックエンドではなく、テレメトリデータの生成・収集・管理・エクスポートに主眼を置いています。OpenTelemetry の当初の目的は、各言語向けの SDKS を用いてアプリケーションやシステムに容易に計装を施せるようにすることでしたが、その後、機能が拡張され、OpenTelemetry Collector を通じてログも収集できるようになりました。OpenTelemetry Collector は、テレメトリデータを受信・処理・エクスポートするエージェントまたはプロキシです。



## ClickHouse 関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetry は複数のコンポーネントから構成されています。データおよび API の仕様、標準化されたプロトコル、フィールド/カラムの命名規則を提供するだけでなく、OTel は ClickHouse を用いてオブザーバビリティ・ソリューションを構築するうえで不可欠な 2 つの機能を提供します。

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) は、テレメトリーデータを受信・処理・エクスポートするプロキシです。ClickHouse を基盤としたソリューションでは、このコンポーネントを、バッチ化および挿入前のログ収集とイベント処理の両方に利用します。
- 仕様、API、およびテレメトリーデータのエクスポートを実装した [Language SDKs](https://opentelemetry.io/docs/languages/)。これらの SDK は、アプリケーションコード内でトレースが正しく記録されることを保証し、個々のスパンを生成し、メタデータを介してサービス間でコンテキストが伝播されるようにすることで、分散トレースを形成し、スパン同士を相関付けられるようにします。これらの SDK は、一般的なライブラリおよびフレームワークを自動的に計装するエコシステムによって補完されており、ユーザーはコードを変更する必要がなく、そのまま利用できるインスツルメンテーションを得ることができます。

ClickHouse を基盤としたオブザーバビリティ・ソリューションでは、これら 2 つのツールをいずれも活用します。



## ディストリビューション {#distributions}

OpenTelemetry Collector には[複数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouse ソリューションに必要となる filelog receiver と ClickHouse exporter は、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) にのみ含まれています。

このディストリビューションには多数のコンポーネントが含まれており、さまざまな構成を試すことができます。しかし、本番環境で運用する場合は、その環境に必要なコンポーネントのみに Collector を絞り込むことを推奨します。これには次のような理由があります。

- Collector のサイズを小さくし、Collector のデプロイ時間を短縮できる
- 利用可能な攻撃面を減らすことで、Collector のセキュリティを向上できる

[カスタム Collector](https://opentelemetry.io/docs/collector/custom-collector/) の構築は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) を使用して行うことができます。



## OTel を使用したデータの取り込み {#ingesting-data-with-otel}

### Collector のデプロイロール {#collector-deployment-roles}

ログを収集して ClickHouse に書き込むには、OpenTelemetry Collector の使用を推奨します。OpenTelemetry Collector は主に 2 つのロールでデプロイできます。

- **Agent** - Agent インスタンスは、エッジ（例: サーバー上や Kubernetes ノード上）でデータを収集したり、OpenTelemetry SDK でインスツルメントされたアプリケーションから直接イベントを受信します。後者の場合、Agent インスタンスはアプリケーションと同一プロセス、または同一ホスト上（sidecar や デーモンセット など）で動作します。Agent は、データを直接 ClickHouse に送信するか、あるいは Gateway インスタンスに送信することができます。前者の場合、これは [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。
- **Gateway**  - Gateway インスタンスは、（たとえば Kubernetes のデプロイメントとして）スタンドアロンのサービスを提供し、通常はクラスタごと、データセンターごと、リージョンごとに配置されます。これらは単一の OTLP エンドポイント経由で、アプリケーション（もしくは Agent として動作する他の Collector）からイベントを受信します。一般的に複数の Gateway インスタンスがデプロイされ、それらの間で負荷を分散するために既製のロードバランサーが利用されます。すべての Agent およびアプリケーションがこの単一のエンドポイントにシグナルを送信する場合、これは [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれることがよくあります。

以下では、シンプルな Agent Collector がイベントを直接 ClickHouse に送信する構成を前提とします。Gateway の利用方法と、どのような場合に有効かといった詳細については、[Scaling with Gateways](#scaling-with-gateways) を参照してください。

### ログの収集 {#collecting-logs}

Collector を使用する主な利点は、サービス側がデータを高速にオフロードでき、その後の再試行、バッチ処理、暗号化、さらには機微情報のフィルタリングといった追加処理を Collector に任せられる点にあります。

Collector では、3 つの主要な処理段階として [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[processor](https://opentelemetry.io/docs/collector/configuration/#processors)、[exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) という用語を使用します。Receiver はデータ収集を担い、プル型またはプッシュ型のいずれかになります。Processor はメッセージの変換および付加情報の付与を行う機能を提供します。Exporter はデータを下流のサービスに送信する役割を担います。理論的には、このサービスが別の Collector であることも可能ですが、以下の初期説明では、すべてのデータが直接 ClickHouse に送信されることを前提とします。

<Image img={observability_3} alt="ログの収集" size="md"/>

すべての Receiver、Processor、Exporter の一覧と機能について、一通り把握しておくことを推奨します。

Collector はログを収集するために、主に 2 つの Receiver を提供します。

**OTLP 経由** - この場合、ログは OTLP プロトコルを介して、OpenTelemetry SDK から Collector に直接（プッシュで）送信されます。[OpenTelemetry demo](https://opentelemetry.io/docs/demo/) はこのアプローチを採用しており、各言語の OTLP Exporter はローカルの Collector エンドポイントを前提としています。この場合、Collector には OTLP Receiver を設定する必要があります。設定例については、上記の [デモの設定](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12) を参照してください。このアプローチの利点は、ログデータに Trace Id が自動的に含まれるため、後から特定のログに対応するトレースや、その逆を特定できることです。

<Image img={observability_4} alt="OTLP 経由でのログ収集" size="md"/>

このアプローチでは、ユーザーは自分のコードを [該当言語の SDK](https://opentelemetry.io/docs/languages/) でインスツルメントする必要があります。

- **Filelog receiver によるスクレイピング** - この Receiver はディスク上のファイルを tail し、ログメッセージを構成して ClickHouse に送信します。この Receiver は、複数行メッセージの検出、ログローテーションの処理、再起動に対する堅牢性を高めるためのチェックポイント処理、構造の抽出といった複雑なタスクを処理します。さらに、この Receiver は Docker および Kubernetes コンテナログを tail することもでき、Helm チャートとしてデプロイ可能であり、[それらから構造を抽出](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) し、ポッドの詳細情報でメタデータを付与することができます。

<Image img={observability_5} alt="Filelog receiver" size="md"/>

**ほとんどのデプロイメントでは、上記の Receiver を組み合わせて使用します。ユーザーには、[Collector のドキュメント](https://opentelemetry.io/docs/collector/) を読み、基本概念に加えて [設定構造](https://opentelemetry.io/docs/collector/configuration/) および [インストール方法](https://opentelemetry.io/docs/collector/installation/) に慣れておくことを推奨します。**



:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) は、構成を検証したり可視化したりするのに便利です。
:::



## 構造化ログと非構造化ログ

ログは構造化ログと非構造化ログのいずれかです。

構造化ログでは JSON などのデータ形式を用い、HTTP ステータスコードや送信元 IP アドレスといったメタデータフィールドを定義します。

```json
{
    "remote_addr":"54.36.149.41",
    "remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET",
    "request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1",
    "status":"200",
    "size":"30577",
    "referer":"-",
    "user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

非構造化ログは、通常、正規表現パターンで抽出可能な一定の構造を持ってはいるものの、ログ全体が 1 つの文字列として表現されます。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能であれば構造化ロギングを採用し、JSON（例: ndjson）形式でログを出力することを推奨します。これにより、後続のログ処理が簡素化されます。具体的には、[Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors) を用いて ClickHouse に送信する前、またはマテリアライズドビューを用いた挿入時に処理を行えます。構造化ログを用いることで、後続の処理に必要なリソースを節約でき、ClickHouse ベースのソリューションで必要となる CPU 使用量を削減できます。

### 例

例として、構造化（JSON）および非構造化ロギングのデータセットを、それぞれ約 1,000 万行ずつ、以下のリンクから取得できるようにしています。

* [Unstructured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Structured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以降の例では、構造化データセットを使用します。これらの例を再現するため、このファイルをダウンロードして展開しておいてください。

次の設定は、OTel collector のシンプルな構成例であり、`filelog` receiver を使ってディスク上のこれらのファイルを読み取り、生成されたメッセージを stdout に出力します。ログは構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) オペレーターを使用します。`access-structured.log` ファイルへのパスを適宜変更してください。

:::note パース処理に ClickHouse の利用を検討する
以下の例では、ログからタイムスタンプを抽出しています。これは `json_parser` オペレーターを使用する必要があり、このオペレーターはログ 1 行全体を JSON 文字列に変換し、その結果を `LogAttributes` に格納します。この処理は計算コストが高くなる可能性があり、[ClickHouse の方がより効率的に実行できます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQL による構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)。同等の非構造化ログの例として、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) を用いて同様の処理を行うサンプルが [こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==) にあります。
:::


**[config-structured-logs.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_1*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Blogging%5D%7E)**

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [logging]
```

ユーザーは [公式手順](https://opentelemetry.io/docs/collector/installation/) に従ってローカル環境にコレクターをインストールできます。重要な点として、手順を読み替えて、[`filelog` receiver を含む] [contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) を使用するようにしてください。たとえば、`otelcol_0.102.1_darwin_arm64.tar.gz` の代わりに `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)から確認できます。

インストールが完了したら、OTel collector は次のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用していると仮定すると、出力されるメッセージは次のような形式になります：


```response
LogRecord #98
ObservedTimestamp: 2024-06-19 13:21:16.414259 +0000 UTC
Timestamp: 2019-01-22 01:12:53 +0000 UTC
SeverityText:
SeverityNumber: Unspecified(0)
Body: Str({"remote_addr":"66.249.66.195","remote_user":"-","run_time":"0","time_local":"2019-01-22 01:12:53.000","request_type":"GET","request_path":"\/product\/7564","request_protocol":"HTTP\/1.1","status":"301","size":"178","referer":"-","user_agent":"Mozilla\/5.0 (Linux; Android 6.0.1; Nexus 5X Build\/MMB29P) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/41.0.2272.96 Mobile Safari\/537.36 (compatible; Googlebot\/2.1; +http:\/\/www.google.com\/bot.html)"})
Attributes:
        -> remote_user: Str(-)
        -> request_protocol: Str(HTTP/1.1)
        -> time_local: Str(2019-01-22 01:12:53.000)
        -> user_agent: Str(Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html))
        -> log.file.name: Str(access.log)
        -> status: Str(301)
        -> size: Str(178)
        -> referer: Str(-)
        -> remote_addr: Str(66.249.66.195)
        -> request_type: Str(GET)
        -> request_path: Str(/product/7564)
        -> run_time: Str(0)
Trace ID:
Span ID:
Flags: 0
```

上記は、OTel collector によって生成された 1 件のログメッセージを表しています。同じメッセージを、後のセクションで ClickHouse に取り込みます。

その他の receiver を使用している場合に含まれ得る追加カラムを含めた、ログメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で管理されています。**このスキーマには必ず目を通し、理解しておくことを強く推奨します。**

ここで重要なのは、ログの 1 行そのものは `Body` フィールド内で文字列として保持されていますが、`json_parser` によって JSON が自動的に抽出され、`Attributes` フィールドに格納されている点です。同じ[operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)を使用して、タイムスタンプを適切な `Timestamp` カラムに抽出しています。OTel を用いたログ処理の推奨事項については、[Processing](#processing---filtering-transforming-and-enriching) を参照してください。

:::note Operators
Operator は、ログ処理における最も基本的な単位です。各 operator は、ファイルから行を読み取る、フィールドから JSON をパースするといった単一の責務のみを担います。Operator はパイプライン内で連結され、目的とする結果を達成します。
:::

上記のメッセージには `TraceID` や `SpanID` フィールドが存在しません。これらが存在する場合、たとえばユーザーが[分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装しているケースでは、先ほど示したのと同じ手法を用いて JSON から抽出できます。

ローカルまたは Kubernetes のログファイルを収集する必要があるユーザーは、[filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)で利用可能な設定オプションに加え、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)や[複数行ログのパース方法](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)についても理解しておくことを推奨します。


## Kubernetes ログの収集 {#collecting-kubernetes-logs}

Kubernetes ログの収集には、[OpenTelemetry のドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を参照することを推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータを用いてログおよびメトリクスを拡張するために利用することを推奨します。これにより、ラベルなどの動的メタデータが `ResourceAttributes` 列に保存される場合があります。ClickHouse は現在、この列に `Map(String, String)` 型を使用しています。この型の扱いや最適化の詳細については、[マップの使用](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)を参照してください。



## トレースの収集

コードを計測してトレースを収集したい場合は、公式の [OTel ドキュメント](https://opentelemetry.io/docs/languages/) を参照することを推奨します。

イベントを ClickHouse に送信するには、OTLP プロトコルでトレースイベントを受信できるよう、適切なレシーバーを備えた OTel collector をデプロイする必要があります。OpenTelemetry のデモでは、[サポートされている各言語の計測例](https://opentelemetry.io/docs/demo/) と、イベントを collector に送信する方法が示されています。以下に、イベントを stdout に出力する collector 設定の一例を示します。

### 例

トレースは OTLP 経由で受信する必要があるため、トレースデータの生成には [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) ツールを使用します。インストール手順は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) を参照してください。

次の設定では、OTLP レシーバーでトレースイベントを受信し、その後 stdout に出力します。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

この構成は次のコマンドで適用します：

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen` を使用してトレースイベントをコレクターに送信します:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、次の例のようなトレースメッセージが標準出力に出力されます。

```response
スパン #86
        トレースID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        親ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        名前            : okey-dokey-0
        種類            : Server
        開始時刻      : 2024-06-19 18:03:41.603868 +0000 UTC
        終了時刻        : 2024-06-19 18:03:41.603991 +0000 UTC
        ステータスコード     : Unset
        ステータスメッセージ :
属性:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

上記は、OTel collector によって生成された 1 件のトレースメッセージを表しています。後続のセクションでは、同じ形式のメッセージを ClickHouse に取り込みます。

トレースメッセージの全体のスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で管理されています。このスキーマにはあらかじめ目を通しておくことを強く推奨します。


## 処理 - フィルタリング、変換、エンリッチ {#processing---filtering-transforming-and-enriching}

前の例でログイベントのタイムスタンプを設定したように、ユーザーは多くの場合、イベントメッセージをフィルタリングし、変換し、エンリッチしたいと考えます。これは、OpenTelemetry のさまざまな機能を使用して実現できます。

- **Processors** - Processors は、[receivers が収集したデータを送信前に変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)します。Processors は、collector 設定の `processors` セクションで構成された順序で適用されます。これらは必須ではありませんが、最小セットが[一般的に推奨](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)されています。ClickHouse と組み合わせて OTel collector を使用する場合、processors は次のようなものに絞ることを推奨します。

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) は、collector 上でのメモリ不足状態を防ぐために使用されます。推奨事項については [Estimating Resources](#estimating-resources) を参照してください。
  - コンテキストに基づくエンリッチを行う processor。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) は、k8s メタデータを用いて spans、metrics、logs のリソース属性を自動的に設定できます。例として、イベントをその送信元ポッド ID でエンリッチします。
  - トレースに必要な場合の [tail または head サンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - Operators で実施できない場合に、不要なイベントをドロップします（下記参照）。
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse と連携する際にデータをバッチで送信するために不可欠です。["Exporting to ClickHouse"](#exporting-to-clickhouse) を参照してください。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) は、receiver で利用可能な最も基本的な処理単位を提供します。Severity や Timestamp などのフィールドを設定できる基本的なパースがサポートされています。ここでは JSON および正規表現によるパースに加え、イベントフィルタリングと基本的な変換がサポートされています。イベントフィルタリングはここで実施することを推奨します。

Operators や [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) を用いた過度なイベント処理は避けることを推奨します。これらは、特に JSON パースにおいて多大なメモリおよび CPU オーバーヘッドを引き起こす可能性があります。いくつかの例外、具体的にはコンテキスト認識が必要なエンリッチ（例: k8s メタデータの追加）を除けば、すべての処理は ClickHouse で挿入時にマテリアライズドビューとカラムを使って実行できます。詳細については [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql) を参照してください。

処理を OTel collector で行う場合、ゲートウェイインスタンスで変換処理を行い、エージェントインスタンスでの処理を最小限に抑えることを推奨します。これにより、サーバー上で稼働するエッジ側エージェントに必要なリソースを可能な限り小さくできます。一般的には、ユーザーは不要なネットワーク使用量を減らすためのフィルタリング、Operators によるタイムスタンプ設定、およびコンテキストを必要とするエンリッチのみをエージェントで実行しています。たとえば、ゲートウェイインスタンスが別の Kubernetes クラスタ内に存在する場合、k8s エンリッチはエージェント側で行う必要があります。

### 例 {#example-2}

次の設定は、非構造化ログファイルの収集を示しています。`regex_parser` Operators を用いてログ行から構造を抽出し、イベントをフィルタリングしている点、さらに processor を使用してイベントをバッチ処理しメモリ使用量を制限している点に注目してください。



[config-unstructured-logs-with-processor.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-unstructured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_regex*_parser*N_______regex%3A_*%22%5E*C*QP*Lip*G%5B*Bd.%5D*P*D*Bs*P-*Bs*P-*Bs*P*B%5B*C*QP*Ltimestamp*G%5B%5E*B%5D%5D*P*D*B%5D*Bs*P%22*C*QP*Lmethod*G%5BA-Z%5D*P*D*Bs*P*C*QP*Lurl*G%5B%5E*Bs%5D*P*D*Bs*PHTTP%2F%5B%5E*Bs%5D*P%22*Bs*P*C*QP*Lstatus*G*Bd*P*D*Bs*P*C*QP*Lsize*G*Bd*P*D*Bs*P%22*C*QP*Lreferrer*G%5B%5E%22%5D***D%22*Bs*P%22*C*QP*Luser*_agent*G%5B%5E%22%5D***D%22*%22*N_______timestamp%3A*N_________parse*_from%3A_attributes.timestamp*N_________layout%3A_*%22*.d%2F*.b%2F*.Y%3A*.H%3A*.M%3A*.S_*.z*%22*N_________*H22%2FJan%2F2019%3A03%3A56%3A14_*P0330*N*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_1s*N___send*_batch*_size%3A_100*N_memory*_limiter%3A*N___check*_interval%3A_1s*N___limit*_mib%3A_2048*N___spike*_limit*_mib%3A_256*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%2C_memory*_limiter%5D*N_____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch, memory_limiter]
      exporters: [logging]
```

```bash
./otelcol-contrib --config config-unstructured-logs-with-processor.yaml
```


## ClickHouse へのエクスポート

Exporter は、1 つ以上のバックエンドまたは送信先にデータを送信します。Exporter にはプル型とプッシュ型があります。イベントを ClickHouse に送信するには、プッシュ型の [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) を使用する必要があります。

:::note OpenTelemetry Collector Contrib を使用する
ClickHouse exporter は [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) の一部であり、コアディストリビューションには含まれていません。ユーザーは Contrib ディストリビューションを使用するか、[独自の collector をビルド](https://opentelemetry.io/docs/collector/custom-collector/) できます。
:::

完全な設定ファイルは以下のとおりです。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 5000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    # ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 5s
    database: default
    sending_queue:
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [clickhouse]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

次の主な設定を確認してください。


* **pipelines** - 上記の設定では、[pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) を使用しています。これはレシーバー、プロセッサー、エクスポーターのセットで構成されており、ログ用とトレース用が 1 つずつ定義されています。
* **endpoint** - ClickHouse との通信は `endpoint` パラメータで設定します。接続文字列 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` により、通信は TCP 経由で行われます。トラフィック切り替えなどの理由から HTTP を利用したい場合は、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)の説明に従って変更してください。接続文字列内でユーザー名とパスワードを指定できる、接続に関する詳細なオプションは[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)に記載されています。

**Important:** 上記の接続文字列では、圧縮 (lz4) と非同期挿入の両方が有効になっています。どちらも常に有効にすることを推奨します。非同期挿入の詳細については [Batching](#batching) を参照してください。圧縮は必ず指定すべきであり、エクスポーターの古いバージョンではデフォルトでは有効になりません。

* **ttl** - この値はデータをどのくらいの期間保持するかを決定します。詳細は「Managing data」を参照してください。これは 72h のように、時間単位 (時間) で指定する必要があります。以下の例では、データが 2019 年のものであり、挿入すると ClickHouse によって即座に削除されてしまうため、TTL を無効にしています。
* **traces&#95;table&#95;name** と **logs&#95;table&#95;name** - ログテーブルおよびトレーステーブルの名前を決定します。
* **create&#95;schema** - 起動時にデフォルトスキーマでテーブルを作成するかどうかを決定します。初期セットアップ向けにはデフォルトで true です。ユーザーは false に設定し、自身のスキーマを定義することを推奨します。
* **database** - 対象データベース。
* **retry&#95;on&#95;failure** - 失敗したバッチを再試行するかどうかを決定する設定です。
* **batch** - バッチプロセッサーは、イベントがバッチとして送信されることを保証します。約 5000 件、タイムアウト 5s 程度の値を推奨します。これらのいずれかの条件を先に満たした時点で、バッチがエクスポーターへのフラッシュ対象となります。これらの値を小さくすると、より低レイテンシーなパイプラインとなり、より早くクエリ可能になりますが、その分 ClickHouse への接続数と送信バッチ数が増加します。[asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を利用していない場合、これは ClickHouse 内の [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) の問題を引き起こす可能性があるため推奨されません。逆に、非同期挿入を利用している場合、クエリ可能になるまでのデータの可用性は非同期挿入の設定にも依存しますが、コネクタからのフラッシュ自体はより早く行われます。詳細は [Batching](#batching) を参照してください。
* **sending&#95;queue** - 送信キューのサイズを制御します。キュー内の各アイテムは 1 つのバッチを含みます。たとえば ClickHouse に到達できない状態でイベントの到着が続き、このキューが上限を超えた場合、バッチは破棄されます。

ユーザーが構造化ログファイルを抽出済みで、(デフォルト認証で) [ローカルの ClickHouse インスタンス](/install) を実行していると仮定すると、次のコマンドでこの設定を実行できます：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、`telemetrygen` ツールを使用して以下のコマンドを実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

起動後、簡単なクエリを実行してログイベントが存在することを確認します。

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical
```


行 1:
──────
Timestamp: 2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags: 0
SeverityText:
SeverityNumber: 0
ServiceName:
Body: {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes: {}
LogAttributes: {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 行を返しました。経過時間: 0.012 秒。処理行数: 5.04 千行、4.62 MB (414.14 千行/秒、379.48 MB/秒)
ピークメモリ使用量: 5.41 MiB。

同様に、トレースイベントについては、ユーザーは `otel_traces` テーブルを確認できます:

SELECT \*
FROM otel_traces
LIMIT 1
FORMAT Vertical

行 1:
──────
Timestamp: 2024-06-20 11:36:41.181398000
TraceId: 00bba81fbd38a242ebb0c81a8ab85d8f
SpanId: beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName: lets-go
SpanKind: SPAN_KIND_CLIENT
ServiceName: telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName: telemetrygen
ScopeVersion:
SpanAttributes: {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration: 123000
StatusCode: STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp: []
Events.Name: []
Events.Attributes: []
Links.TraceId: []
Links.SpanId: []
Links.TraceState: []
Links.Attributes: []

```

```


## 既定のスキーマ

デフォルトでは、ClickHouse エクスポーターはログとトレースの両方に対して出力先となるログテーブルを作成します。これは設定項目 `create_schema` によって無効化できます。さらに、ログおよびトレーステーブルの名前は、上記の設定により、デフォルトの `otel_logs` および `otel_traces` から変更できます。

:::note
以下のスキーマでは、有効期間 72 時間の TTL が有効になっていることを前提としています。
:::

ログのデフォルトスキーマは以下のとおりです（`otelcol-contrib v0.102.1`）：

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt32 CODEC(ZSTD(1)),
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` Int32 CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` String CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` String CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

ここでのカラムは、ログに関する OTel の公式仕様（[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/) に記載）と対応しています。

このスキーマについての重要な注意点をいくつか挙げます。


- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` によって日付でパーティション分割されます。これにより、有効期限切れのデータを効率的に削除できます。
- TTL は `TTL toDateTime(Timestamp) + toIntervalDay(3)` で設定され、これはコレクター設定で指定した値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、含まれるすべての行が有効期限切れになったときにのみ、そのパーツ全体を削除することを意味します。これは、パーツ内の行を削除する（高コストな delete が発生する）よりも効率的です。常にこの設定にすることを推奨します。詳細は [TTL を用いたデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live) を参照してください。
- テーブルはクラシックな [`MergeTree` エンジン](/engines/table-engines/mergetree-family/mergetree)を使用します。これはログとトレースに推奨されており、変更する必要はありません。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` で並べ替えられています。これは、`ServiceName`、`SeverityText`、`Timestamp`、`TraceId` に対するフィルターが最適化されることを意味します。リストの前方にある列の方が後方の列より高速にフィルタリングされます。例えば、`ServiceName` でのフィルタリングは `TraceId` でのフィルタリングよりもかなり高速になります。ユーザーは、想定するアクセスパターンに応じてこの並び順を変更する必要があります。詳しくは [主キーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key) を参照してください。
- 上記のスキーマでは、カラムに `ZSTD(1)` を適用しています。これはログに対して最良の圧縮を提供します。ユーザーは、より高い圧縮率を得るために ZSTD 圧縮レベル（デフォルトの 1 より大きい値）を引き上げることもできますが、有益となるケースは多くありません。この値を増やすと、挿入時（圧縮中）の CPU オーバーヘッドが大きくなりますが、伸長（ひいてはクエリ）のコストは同程度に保たれるはずです。詳細は [こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を参照してください。さらに、ディスク上のサイズを削減する目的で、Timestamp には追加の [デルタエンコーディング](/sql-reference/statements/create/table#delta) が適用されています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) がマップである点に注目してください。ユーザーはこれらの違いを十分に理解しておく必要があります。これらのマップへのアクセス方法およびマップ内のキーへのアクセスを最適化する方法については、[マップの利用](/use-cases/observability/schema-design#using-maps) を参照してください。
- ここにあるその他の型の多く、例えば LowCardinality としての `ServiceName` などは最適化されています。本ドキュメントの例におけるログでは JSON である `Body` は、String として保存される点に注意してください。
- Bloom フィルターはマップのキーと値、および `Body` カラムにも適用されています。これらのカラムにアクセスするクエリの処理時間を短縮することを目的としていますが、通常は必須ではありません。詳細は [セカンダリ / データスキップインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices) を参照してください。



```sql
CREATE TABLE default.otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

ここでも、これは [こちら](https://opentelemetry.io/docs/specs/otel/trace/api/) に記載されているトレース向けの OTel 公式仕様に対応するカラムと相関付けられます。ここでのスキーマは、上記のログ用スキーマと多くの設定を共通化しつつ、スパン特有の Link カラムを追加しています。

スキーマの自動作成を無効化し、テーブルは手動で作成することを推奨します。これにより、プライマリキーおよびセカンダリキーを変更できるほか、クエリ性能を最適化するための追加カラムを導入することが可能になります。詳細については [Schema design](/use-cases/observability/schema-design) を参照してください。


## 挿入の最適化 {#optimizing-inserts}

Observability データを collector 経由で ClickHouse に挿入する際に、高い挿入性能と強い一貫性保証の両方を得るためには、いくつかの簡単なルールに従う必要があります。OTel collector を正しく構成すれば、これらのルールに従うことは容易です。これは、ユーザーが初めて ClickHouse を利用する際に遭遇しがちな[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouse に送信された各挿入は、挿入のデータと、保存が必要なその他のメタデータを含むストレージのパーツを ClickHouse が即座に作成します。そのため、1 回あたりの行数を増やして少ない回数の挿入を行うことで、1 回あたりのデータ量が少ない挿入を大量に送信する場合と比べて、必要な書き込み回数を減らすことができます。1 回あたり少なくとも 1,000 行以上の、比較的大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse への挿入は同期的であり、同一データであれば冪等です。merge tree エンジンファミリーのテーブルでは、ClickHouse はデフォルトで自動的に[挿入時の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、挿入が次のようなケースに対して耐障害性を持つことを意味します。

- (1) データを受信したノードに問題がある場合、挿入クエリはタイムアウト（またはより具体的なエラー）となり、確認応答を受け取りません。
- (2) ノードによってデータは書き込まれたものの、ネットワーク障害によりクエリ送信元へ確認応答を返せない場合、送信元はタイムアウトまたはネットワークエラーを受け取ります。

collector の観点からは、(1) と (2) を区別するのは困難です。しかし、どちらの場合も、確認応答のない挿入は直ちに再試行できます。再試行された挿入クエリが同じ順序で同じデータを含んでいる限り、（未確認の）元の挿入が成功していれば、ClickHouse は再試行された挿入を自動的に無視します。

上記を満たすために、前述の設定例で示した [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) を使用することを推奨します。これにより、上記要件を満たす一貫した行バッチとして挿入が送信されます。collector が高スループット（1 秒あたりのイベント数）になることが想定され、かつ 1 回の挿入で少なくとも 5000 イベントを送信できる場合、通常はパイプラインで必要となるバッチ処理はこれだけです。この場合、collector は batch processor の `timeout` に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシを低く保ちつつ、バッチサイズの一貫性を確保します。

### 非同期挿入の利用 {#use-asynchronous-inserts}

通常、collector のスループットが低い場合、ユーザーは小さなバッチを送信せざるを得ませんが、それでもデータが最小限のエンドツーエンドレイテンシで ClickHouse に到達することを期待します。この場合、batch processor の `timeout` が切れたタイミングで小さなバッチが送信されます。これは問題を引き起こす可能性があり、そのような場合には非同期挿入が必要です。このようなケースは典型的に、**エージェントロールの collector が ClickHouse に直接送信するように構成されている場合**に発生します。ゲートウェイはアグリゲータとして機能することでこの問題を軽減できます。詳しくは[ゲートウェイによるスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチを保証できない場合、[Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) を利用して、バッチ処理を ClickHouse に委譲できます。非同期挿入では、データは最初にバッファに挿入され、その後に（あるいは非同期に）データベースストレージへ書き込まれます。

<Image img={observability_6} alt="Async inserts" size="md"/>

[非同期挿入が有効](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)な場合、ClickHouse が ① 挿入クエリを受信すると、そのクエリのデータは ② まずインメモリバッファに即座に書き込まれます。その後、③ 次のバッファのフラッシュが行われるときに、バッファ内のデータが[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、パーツとしてデータベースストレージに書き込まれます。なお、データベースストレージにフラッシュされるまでは、そのデータはクエリから検索できません。バッファフラッシュのタイミングは[設定可能](/optimize/asynchronous-inserts)です。

collector で非同期挿入を有効にするには、接続文字列に `async_insert=1` を追加します。配信保証を得るために、`wait_for_async_insert=1`（デフォルト）を使用することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。



非同期挿入からのデータは、ClickHouse のバッファがフラッシュされたタイミングで挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えたとき、もしくは最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒が経過したときのいずれかで発生します。`async_insert_stale_timeout_ms` が 0 以外の値に設定されている場合は、最後のクエリから `async_insert_stale_timeout_ms` ミリ秒後にデータが挿入されます。ユーザーはこれらの設定を調整することで、パイプラインのエンドツーエンドのレイテンシを制御できます。バッファのフラッシュをさらにチューニングするために使用できるその他の設定については[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト値で問題ありません。

:::note 適応型非同期挿入の検討
少数のエージェントしか利用しておらず、スループットは低い一方でエンドツーエンドのレイテンシ要件が厳しいケースでは、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般的に、これらは ClickHouse を用いた高スループットな Observability のユースケースには適用されません。
:::

最後に、ClickHouse への同期挿入に関連する従来の重複排除動作は、非同期挿入を使用する場合はデフォルトでは有効になっていません。必要であれば、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の設定に関する詳細は [こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) に、さらに詳細な解説は [こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) に記載されています。



## デプロイメントアーキテクチャ {#deployment-architectures}

OTel collector を ClickHouse と組み合わせて使用する場合、いくつかのデプロイメントアーキテクチャが考えられます。以下ではそれぞれについて、どのような状況で適用可能かを説明します。

### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーは OTel collector をエージェントとしてエッジにデプロイします。これらはローカルアプリケーション（例: サイドカーコンテナ）からトレースを受信し、サーバーや Kubernetes ノードからログを収集します。このモードでは、エージェントはデータを直接 ClickHouse に送信します。

<Image img={observability_7} alt="エージェントのみ" size="md"/>

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。主な利点は、追加のハードウェアを必要とせず、ClickHouse のオブザーバビリティソリューション全体のリソースフットプリントを最小限に抑えつつ、アプリケーションとコレクターの対応関係がシンプルであることです。

エージェントの数が数百を超えるようになったら、ゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャには、スケールさせるうえで課題となるいくつかの欠点があります。

- **接続のスケーリング** - 各エージェントは ClickHouse への接続を確立します。ClickHouse は数百（場合によっては数千）の同時挿入接続を維持することが可能ですが、最終的にはこれが制限要因となり、挿入処理の効率が低下します。つまり、接続維持に ClickHouse のリソースを多く消費します。ゲートウェイを使用すると接続数を最小化でき、挿入をより効率的に行えます。
- **エッジでの処理** - このアーキテクチャでは、あらゆる変換やイベント処理をエッジ側、または ClickHouse 内で実行する必要があります。制約が大きいだけでなく、複雑な ClickHouse マテリアライズドビューが必要になったり、重要なサービスに影響が出たりリソースが限られているエッジ側に大きな計算処理を押し付けることになり得ます。
- **小さなバッチとレイテンシ** - エージェントコレクターは単体ではごく少数のイベントしか収集しない場合があります。このため、配信の SLA を満たすため、一定間隔でフラッシュするように設定する必要があるのが一般的です。その結果として、コレクターが ClickHouse に小さなバッチを送信してしまうことがあります。これは欠点ではありますが、非同期挿入を使用することで軽減できます。詳しくは [挿入の最適化](#optimizing-inserts) を参照してください。

### ゲートウェイによるスケーリング {#scaling-with-gateways}

OTel collector は、上記の制約に対処するためにゲートウェイインスタンスとしてデプロイすることができます。これらは通常、データセンターごとまたはリージョンごとに配置されるスタンドアロンのサービスとして動作します。アプリケーション（またはエージェントロールで動作する他のコレクター）から、単一の OTLP エンドポイント経由でイベントを受信します。一般的には複数のゲートウェイインスタンスをデプロイし、既製のロードバランサーを用いて負荷をそれらの間で分散させます。

<Image img={observability_8} alt="ゲートウェイによるスケーリング" size="md"/>

このアーキテクチャの目的は、計算負荷の高い処理をエージェントからオフロードし、エージェントのリソース使用量を最小化することです。ゲートウェイは、本来であればエージェント側で実行する必要がある変換処理を行うことができます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは ClickHouse に対して大きなバッチでデータを送信し、効率的な挿入を実現します。これらのゲートウェイの OTel collector は、エージェント数の増加やイベントスループットの増大に応じて容易にスケールさせることができます。以下に、サンプルの構造化ログファイルを消費する関連エージェント設定と組み合わせた、ゲートウェイの設定例を示します。エージェントとゲートウェイ間の通信に OTLP を使用している点に注意してください。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)



```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # セキュアな接続を使用している場合はfalseに設定
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行するため変更済み
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

```yaml
receivers:
  otlp:
    protocols:
    grpc:
    endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 10000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4
    ttl: 96h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 10s
    database: default
    sending_queue:
      queue_size: 10000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

これらの設定は、以下のコマンドで適用できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、コレクター群を管理することに伴うコストと運用上のオーバーヘッドです。

より大規模なゲートウェイ型アーキテクチャの管理と、そこから得られる知見の例については、こちらの[ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)を参照することをお勧めします。

### Kafka の追加

上記のアーキテクチャでは、メッセージキューとして Kafka を使用していないことに気付く読者もいるかもしれません。


メッセージバッファとして Kafka キューを使用することは、ログアーキテクチャでよく見られる一般的な設計パターンであり、ELK スタックによって広く普及しました。これにはいくつかの利点があり、主なものは、より強力なメッセージ配信保証を提供し、バックプレッシャーへの対処に役立つ点です。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論的には、クラスタ構成の Kafka インスタンスは、高スループットなメッセージバッファを提供できます。これは、メッセージを解析・処理するよりも、データをディスクに線形に書き込む方が計算オーバーヘッドが小さいためです。たとえば Elastic では、トークナイゼーションとインデックス作成に大きなオーバーヘッドが発生します。データをエージェントから離れた場所に保持することで、送信元でのログローテーションによってメッセージを失うリスクも軽減できます。最後に、一部のユースケースでは魅力的となり得る、メッセージのリプレイやリージョンをまたいだレプリケーション機能も提供します。

しかし、ClickHouse は中程度のハードウェアでも毎秒数百万行レベルのデータ挿入を非常に高速に処理できます。ClickHouse からのバックプレッシャーは**まれ**です。多くの場合、Kafka キューを採用するとアーキテクチャの複雑さとコストが増加します。ログは銀行のトランザクションやその他のミッションクリティカルなデータと同等の配信保証を必要としない、という前提を受け入れられるのであれば、Kafka による複雑化は避けることを推奨します。

一方で、高い配信保証や（複数の送信先に対して）データをリプレイする能力が必要な場合には、Kafka は有用なアーキテクチャ上のコンポーネントとなり得ます。

<Image img={observability_9} alt="Kafka の追加" size="md"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を介して Kafka にデータを送信するように設定できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については Confluent および OTel のドキュメントを参照することを推奨します。

### リソース見積もり {#estimating-resources}

OTel collector のリソース要件は、イベントスループット、メッセージサイズ、および実行される処理量に依存します。OpenTelemetry プロジェクトは、ユーザーがリソース要件を見積もるために利用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を公開しています。

[当社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コア・12GB RAM のゲートウェイインスタンスで毎秒約 60k イベントを処理できます。これは、フィールド名の変更のみを行い、正規表現を使用しない最小限の処理パイプラインを想定しています。

イベントをゲートウェイに送信し、イベントのタイムスタンプ設定のみを行うエージェントインスタンスについては、想定される毎秒ログ数に基づいてサイズを決定することを推奨します。以下は、ユーザーが出発点として利用できるおおよその値です。

| ログレート     | collector エージェントへのリソース |
|--------------|--------------------------------|
| 1k/second    | 0.2 CPU, 0.2 GiB              |
| 5k/second    | 0.5 CPU, 0.5 GiB              |
| 10k/second   | 1 CPU, 1 GiB                  |
