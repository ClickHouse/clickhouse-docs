---
title: 'OpenTelemetry の統合'
description: 'オブザーバビリティ向けの OpenTelemetry と ClickHouse の統合'
slug: /observability/integrating-opentelemetry
keywords: ['オブザーバビリティ', 'OpenTelemetry']
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


# データ収集のための OpenTelemetry の統合

あらゆるオブザーバビリティソリューションには、ログやトレースを収集およびエクスポートする手段が必要です。この目的のために、ClickHouse は [OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/) を推奨しています。

「OpenTelemetry は、トレース、メトリクス、ログなどのテレメトリデータを作成および管理するために設計された、オブザーバビリティ向けのフレームワークおよびツールキットです。」

ClickHouse や Prometheus と異なり、OpenTelemetry はオブザーバビリティのバックエンドではなく、テレメトリデータの生成、収集、管理、およびエクスポートに重点を置いています。OpenTelemetry の当初の目的は、ユーザーが言語固有の SDK を用いてアプリケーションやシステムに計測用のコード（インストルメンテーション）を容易に組み込めるようにすることでしたが、その後、OpenTelemetry Collector を通じたログ収集も含むように拡張されました。OpenTelemetry Collector は、テレメトリデータを受信・処理・エクスポートするエージェントまたはプロキシです。



## ClickHouseに関連するコンポーネント {#clickhouse-relevant-components}

OpenTelemetryは複数のコンポーネントで構成されています。データとAPI仕様、標準化されたプロトコル、フィールド/カラムの命名規則を提供するだけでなく、OTelはClickHouseを用いたObservabilityソリューションの構築に不可欠な2つの機能を提供します:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、エクスポートするプロキシです。ClickHouseベースのソリューションでは、このコンポーネントをログ収集とイベント処理の両方に使用し、バッチ処理と挿入の前段階で活用します。
- 仕様、API、テレメトリデータのエクスポートを実装する[言語SDK](https://opentelemetry.io/docs/languages/)。これらのSDKは、アプリケーションコード内でトレースが正確に記録されることを効果的に保証し、構成スパンを生成し、メタデータを通じてサービス間でコンテキストが伝播されることを確実にします。これにより分散トレースが形成され、スパンの相関付けが可能になります。これらのSDKは、一般的なライブラリやフレームワークを自動的に実装するエコシステムによって補完されるため、ユーザーはコードを変更する必要がなく、すぐに使えるインストルメンテーション機能を取得できます。

ClickHouseベースのObservabilityソリューションは、これら両方のツールを活用します。


## ディストリビューション {#distributions}

OpenTelemetryコレクターには[複数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)が存在します。ClickHouseソリューションに必要なfilelogレシーバーとClickHouseエクスポーターは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ含まれています。

このディストリビューションには多数のコンポーネントが含まれており、ユーザーは様々な構成を試すことができます。ただし、本番環境で実行する場合は、環境に必要なコンポーネントのみを含むようにコレクターを制限することを推奨します。その理由は以下の通りです:

- コレクターのサイズを削減し、デプロイ時間を短縮できる
- 攻撃対象領域を削減することでコレクターのセキュリティを向上できる

[カスタムコレクター](https://opentelemetry.io/docs/collector/custom-collector/)の構築は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用して実現できます。


## OTelによるデータ取り込み {#ingesting-data-with-otel}

### Collectorのデプロイメントロール {#collector-deployment-roles}

ログを収集してClickHouseに挿入するには、OpenTelemetry Collectorの使用を推奨します。OpenTelemetry Collectorは、主に2つのロールでデプロイできます。

- **Agent** - Agentインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、OpenTelemetry SDKで計装されたアプリケーションから直接イベントを受信します。後者の場合、Agentインスタンスはアプリケーションと共に、またはアプリケーションと同じホスト上で実行されます(サイドカーやDaemonSetなど)。Agentは、データをClickHouseに直接送信するか、Gatewayインスタンスに送信できます。前者の場合は、[Agentデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼ばれます。
- **Gateway** - Gatewayインスタンスは、通常、クラスター、データセンター、またはリージョンごとに、独立したサービス(例えば、Kubernetes内のデプロイメント)を提供します。これらは、単一のOTLPエンドポイントを介してアプリケーション(または他のCollectorをAgentとして)からイベントを受信します。通常、複数のGatewayインスタンスがデプロイされ、標準のロードバランサーを使用してそれらの間で負荷を分散します。すべてのAgentとアプリケーションがこの単一のエンドポイントにシグナルを送信する場合、これは[Gatewayデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ばれることがよくあります。

以下では、イベントをClickHouseに直接送信するシンプルなAgent Collectorを想定しています。Gatewayの使用方法と適用可能な場合の詳細については、[Gatewayによるスケーリング](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

Collectorを使用する主な利点は、サービスがデータを迅速にオフロードでき、再試行、バッチ処理、暗号化、さらには機密データのフィルタリングなどの追加処理をCollectorに任せられることです。

Collectorは、3つの主要な処理段階に対して[Receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[Processor](https://opentelemetry.io/docs/collector/configuration/#processors)、[Exporter](https://opentelemetry.io/docs/collector/configuration/#exporters)という用語を使用します。Receiverはデータ収集に使用され、プル型またはプッシュ型のいずれかです。Processorは、メッセージの変換と拡充を実行する機能を提供します。Exporterは、データを下流のサービスに送信する責任を負います。理論上、このサービスは別のCollectorである可能性もありますが、以下の初期の説明では、すべてのデータがClickHouseに直接送信されることを前提としています。

<Image img={observability_3} alt='Collecting logs' size='md' />

ユーザーは、Receiver、Processor、Exporterの全セットに精通することを推奨します。

Collectorは、ログを収集するための2つの主要なReceiverを提供します。

**OTLP経由** - この場合、ログはOTLPプロトコルを介してOpenTelemetry SDKからCollectorに直接送信(プッシュ)されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを採用しており、各言語のOTLP ExporterはローカルのCollectorエンドポイントを想定しています。この場合、CollectorはOTLP Receiverで構成する必要があります。[設定例についてはデモ](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)を参照してください。このアプローチの利点は、ログデータに自動的にTrace IDが含まれるため、ユーザーが後で特定のログのトレースを識別でき、その逆も可能になることです。

<Image img={observability_4} alt='Collecting logs via otlp' size='md' />

このアプローチでは、ユーザーは[適切な言語SDK](https://opentelemetry.io/docs/languages/)でコードを計装する必要があります。

- **Filelog Receiverによるスクレイピング** - このReceiverは、ディスク上のファイルを追跡してログメッセージを作成し、これらをClickHouseに送信します。このReceiverは、複数行メッセージの検出、ログローテーションの処理、再起動に対する堅牢性のためのチェックポイント、構造の抽出などの複雑なタスクを処理します。このReceiverは、さらにDockerおよびKubernetesコンテナログを追跡することができ、Helmチャートとしてデプロイ可能で、[これらから構造を抽出](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)し、Podの詳細で拡充します。

<Image img={observability_5} alt='File log receiver' size='md' />

**ほとんどのデプロイメントでは、上記のReceiverの組み合わせを使用します。ユーザーは[Collectorドキュメント](https://opentelemetry.io/docs/collector/)を読み、基本概念、[設定構造](https://opentelemetry.io/docs/collector/configuration/)、[インストール方法](https://opentelemetry.io/docs/collector/installation/)に精通することを推奨します。**


:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) は、構成の検証や可視化に役立つツールです。
:::



## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは構造化または非構造化のいずれかの形式を取ることができます。

構造化ログは、JSONなどのデータ形式を使用し、HTTPコードや送信元IPアドレスなどのメタデータフィールドを定義します。

```json
{
  "remote_addr": "54.36.149.41",
  "remote_user": "-",
  "run_time": "0",
  "time_local": "2019-01-22 00:26:14.000",
  "request_type": "GET",
  "request_path": "\/filter\/27|13 ,27|  5 ,p53",
  "request_protocol": "HTTP\/1.1",
  "status": "200",
  "size": "30577",
  "referer": "-",
  "user_agent": "Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

非構造化ログは、通常、正規表現パターンによって抽出可能な固有の構造を持っていますが、ログを純粋に文字列として表現します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能な限り、構造化ログを採用し、JSON（すなわちndjson）形式でログを記録することを推奨します。これにより、[Collectorプロセッサ](https://opentelemetry.io/docs/collector/configuration/#processors)を使用してClickHouseに送信する前、またはマテリアライズドビューを使用した挿入時のいずれかで、後続のログ処理が簡素化されます。構造化ログは最終的に後続の処理リソースを節約し、ClickHouseソリューションで必要なCPUを削減します。

### 例 {#example}

例示の目的で、それぞれ約1000万行を含む構造化（JSON）および非構造化ログデータセットを以下のリンクで提供しています：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では構造化データセットを使用します。以下の例を再現するには、このファイルをダウンロードして展開してください。

以下は、filelogレシーバーを使用してディスク上のこれらのファイルを読み取り、結果のメッセージを標準出力に出力するOTel Collectorの簡単な設定を示しています。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルへのパスを変更してください。

:::note パース処理にClickHouseの使用を検討
以下の例では、ログからタイムスタンプを抽出します。これには`json_parser`オペレーターの使用が必要であり、ログ行全体をJSON文字列に変換し、結果を`LogAttributes`に配置します。これは計算コストが高く、[ClickHouseでより効率的に実行できます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLによる構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)。これを実現するために[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)を使用する同等の非構造化の例は、[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)で確認できます。
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

ユーザーは、コレクターをローカル環境にインストールするために[公式手順](https://opentelemetry.io/docs/collector/installation/)に従うことができます。重要なのは、手順を `filelog` レシーバーを含む [contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) を使用するように読み替えることです。たとえば、`otelcol_0.102.1_darwin_arm64.tar.gz` の代わりに `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)から入手できます。

インストール後、OTel Collector は次のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、出力されるメッセージは次のような形式になります。


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

上記は、OTel Collector によって生成される単一のログメッセージを表しています。同じメッセージを、後続のセクションで ClickHouse に取り込みます。

ログメッセージの完全なスキーマと、他の receiver を使用している場合に存在しうる追加カラムは[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で管理されています。**このスキーマに精通しておくことを強く推奨します。**

ここでのポイントは、ログ行そのものは `Body` フィールド内に文字列として保持される一方で、`json_parser` によって JSON が自動的に抽出され、`Attributes` フィールドに格納されているという点です。同じ[operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)を使用して、タイムスタンプも適切な `Timestamp` カラムに抽出しています。OTel を用いたログ処理に関する推奨事項については、[Processing](#processing---filtering-transforming-and-enriching) を参照してください。

:::note Operators
Operator はログ処理における最も基本的な単位です。各 operator は、ファイルから行を読み込む、あるフィールドから JSON をパースする、といった単一の責務を果たします。Operator はパイプライン内で連結され、望ましい結果を得るための処理フローを構成します。
:::

上記のメッセージには `TraceID` や `SpanID` フィールドが含まれていません。これらのフィールドが存在する場合、たとえば[分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装しているケースでは、上で示したのと同じ手法を用いて JSON から抽出できます。

ローカルまたは Kubernetes のログファイルを収集する必要がある場合は、[filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) で利用可能な設定オプションと、[offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) や[複数行ログのパース方法](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)の扱いについて理解を深めることを推奨します。


## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログの収集には、[OpenTelemetryドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)の利用を推奨します。ログとメトリクスをポッドメタデータで拡充するには、[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)の使用を推奨します。これにより、`ResourceAttributes`列に格納される動的メタデータ(ラベルなど)が生成される可能性があります。ClickHouseは現在、この列に`Map(String, String)`型を使用しています。この型の処理と最適化の詳細については、[マップの使用](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)を参照してください。


## トレースの収集 {#collecting-traces}

コードを計装してトレースを収集する場合は、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことを推奨します。

イベントをClickHouseに配信するには、適切なレシーバーを介してOTLPプロトコル経由でトレースイベントを受信するOTelコレクターをデプロイする必要があります。OpenTelemetryデモでは、[サポートされている各言語の計装例](https://opentelemetry.io/docs/demo/)とコレクターへのイベント送信方法が提供されています。イベントを標準出力に出力するコレクター設定の例を以下に示します:

### 例 {#example-1}

トレースはOTLP経由で受信する必要があるため、トレースデータの生成には[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用します。インストール手順については[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の設定は、OTLPレシーバーでトレースイベントを受信し、標準出力に送信します。

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

この設定を以下のコマンドで実行します:

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen`を使用してコレクターにトレースイベントを送信します:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、以下の例のようなトレースメッセージが標準出力に出力されます:

```response
Span #86
        Trace ID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        Parent ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Name            : okey-dokey-0
        Kind            : Server
        Start time      : 2024-06-19 18:03:41.603868 +0000 UTC
        End time        : 2024-06-19 18:03:41.603991 +0000 UTC
        Status code     : Unset
        Status message :
Attributes:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

上記はOTelコレクターによって生成された単一のトレースメッセージを表しています。これらのメッセージを後のセクションでClickHouseに取り込みます。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で管理されています。このスキーマに精通しておくことを強く推奨します。


## 処理 - フィルタリング、変換、エンリッチメント {#processing---filtering-transforming-and-enriching}

ログイベントのタイムスタンプを設定する先の例で示したように、ユーザーは必然的にイベントメッセージのフィルタリング、変換、エンリッチメントを行う必要があります。これはOpenTelemetryの複数の機能を使用して実現できます:

- **プロセッサ** - プロセッサは[レシーバーによって収集されたデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポーターに送信します。プロセッサはコレクター設定の`processors`セクションで設定された順序で適用されます。これらはオプションですが、最小限のセットの使用が[通常推奨されています](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。OTelコレクターをClickHouseと併用する場合、プロセッサを以下に限定することを推奨します:
  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターでのメモリ不足を防ぐために使用されます。推奨事項については[リソースの見積もり](#estimating-resources)を参照してください。
  - コンテキストに基づいてエンリッチメントを行うプロセッサ。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータを使用してスパン、メトリクス、ログのリソース属性を自動的に設定できます(例:イベントをソースポッドIDでエンリッチ)。
  - トレースに必要な場合は[テールサンプリングまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター経由で実行できない場合に、不要なイベントを削除します(以下を参照)。
  - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseと連携する際にデータをバッチで送信するために不可欠です。[「ClickHouseへのエクスポート」](#exporting-to-clickhouse)を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバーで利用可能な最も基本的な処理単位を提供します。基本的なパースがサポートされており、SeverityやTimestampなどのフィールドを設定できます。JSONおよび正規表現パース、イベントフィルタリング、基本的な変換がサポートされています。イベントフィルタリングはここで実行することを推奨します。

オペレーターや[変換プロセッサ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用した過度なイベント処理は避けることを推奨します。これらは特にJSONパースにおいて、かなりのメモリとCPUオーバーヘッドを発生させる可能性があります。一部の例外(具体的には、コンテキストを考慮したエンリッチメント、例えばk8sメタデータの追加など)を除き、マテリアライズドビューとカラムを使用してClickHouseで挿入時にすべての処理を行うことが可能です。詳細については[SQLによる構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う場合、ゲートウェイインスタンスで変換を実行し、エージェントインスタンスでの作業を最小限に抑えることを推奨します。これにより、サーバー上で実行されるエッジのエージェントが必要とするリソースを可能な限り最小限に抑えることができます。通常、ユーザーはエージェントでフィルタリング(不要なネットワーク使用を最小限に抑えるため)、タイムスタンプ設定(オペレーター経由)、およびコンテキストを必要とするエンリッチメントのみを実行しています。例えば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8sエンリッチメントはエージェントで実行する必要があります。

### 例 {#example-2}

以下の設定は、非構造化ログファイルの収集を示しています。ログ行から構造を抽出(`regex_parser`)およびイベントをフィルタリングするためのオペレーターの使用と、イベントをバッチ処理しメモリ使用量を制限するプロセッサの使用に注目してください。


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


## ClickHouseへのエクスポート {#exporting-to-clickhouse}

エクスポーターは、1つ以上のバックエンドまたは宛先にデータを送信します。エクスポーターはプル型またはプッシュ型があります。ClickHouseにイベントを送信するには、プッシュ型の[ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribの使用
ClickHouseエクスポーターは、コアディストリビューションではなく、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部です。ユーザーはcontribディストリビューションを使用するか、[独自のコレクターを構築](https://opentelemetry.io/docs/collector/custom-collector/)できます。
:::

完全な設定ファイルを以下に示します。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

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
          layout: "%Y-%m-%d %H:%M:%S"
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

以下の主要な設定に注意してください:


* **pipelines** - 上記の設定では、[pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) の使用に注目してください。これはレシーバー、プロセッサー、エクスポーターのセットで構成されており、ログ用とトレース用がそれぞれ 1 つずつ定義されています。
* **endpoint** - ClickHouse との通信は `endpoint` パラメーターで設定します。接続文字列 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` により、通信は TCP 経由で行われます。トラフィック切り替えの理由から HTTP を利用したい場合は、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されているとおりに変更してください。接続文字列内でユーザー名とパスワードを指定できる、完全な接続オプションの詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)を参照してください。

**重要:** 上記の接続文字列は、圧縮（lz4）と非同期挿入の両方を有効にしています。これらは常に有効にしておくことを推奨します。非同期挿入の詳細については [Batching](#batching) を参照してください。圧縮は常に明示的に指定する必要があり、古いバージョンのエクスポーターではデフォルトでは有効になりません。

* **ttl** - ここでの値は、データが保持される期間を決定します。詳細は「Managing data」を参照してください。これは 72h のように、時間単位（時間）で指定する必要があります。以下の例では、データが 2019 年のものであり、挿入すると直ちに ClickHouse によって削除されてしまうため、TTL を無効にしています。
* **traces&#95;table&#95;name** と **logs&#95;table&#95;name** - ログおよびトレーステーブルの名前を決定します。
* **create&#95;schema** - 起動時にデフォルトスキーマでテーブルを作成するかどうかを決定します。入門用途ではデフォルトで true です。ユーザーはこれを false に設定し、自身のスキーマを定義することを推奨します。
* **database** - 対象のデータベース。
* **retry&#95;on&#95;failure** - 失敗したバッチを再試行するかどうかを制御する設定です。
* **batch** - バッチプロセッサーはイベントがバッチとして送信されることを保証します。バッチサイズ 5000 前後とタイムアウト 5s を推奨します。これらのいずれかに先に到達した時点で、バッチがエクスポーターへフラッシュされます。これらの値を下げると、より低レイテンシーなパイプラインとなり、より早くクエリ可能になりますが、その分 ClickHouse への接続数および送信されるバッチ数が増加します。これは、[asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を利用していない場合には推奨されません。ClickHouse で [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) の問題を引き起こす可能性があるためです。逆に、asynchronous inserts を利用している場合、クエリ可能になるまでのデータの可用性は非同期挿入の設定にも依存しますが、コネクターからのフラッシュ自体はより早く行われます。詳細は [Batching](#batching) を参照してください。
* **sending&#95;queue** - 送信キューのサイズを制御します。キュー内の各アイテムは 1 つのバッチを保持します。たとえば ClickHouse に到達できない一方でイベントの到着が続くなどして、このキューが上限を超えた場合、バッチは破棄されます。

ユーザーが構造化ログファイルを抽出し、[ローカルの ClickHouse インスタンス](/install)（デフォルト認証）を実行していると仮定すると、次のコマンドでこの構成を実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、`telemetrygen` ツールを使用して以下のコマンドを実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

起動後は、簡単なクエリでログイベントが出力されていることを確認します。

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical
```


Row 1:
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

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

同様に、トレースイベントについては、`otel_traces`テーブルを確認できます:

SELECT \*
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
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


## 標準スキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouseエクスポーターはログとトレースの両方に対してターゲットログテーブルを作成します。これは`create_schema`設定で無効化できます。また、ログテーブルとトレーステーブルの名前は、上記の設定を使用してデフォルトの`otel_logs`および`otel_traces`から変更することができます。

:::note
以下のスキーマでは、TTLが72時間として有効化されていることを前提としています。
:::

ログのデフォルトスキーマを以下に示します（`otelcol-contrib v0.102.1`）:

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

ここに示すカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)に記載されているOTel公式仕様のログ仕様に対応しています。

このスキーマに関する重要な注意事項:


- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` により日付でパーティション分割されます。これにより、期限切れデータを効率的に削除できます。
- TTL は `TTL toDateTime(Timestamp) + toIntervalDay(3)` で設定され、これはコレクター設定で指定された値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、含まれるすべての行の有効期限が切れた場合にのみ、そのパーツ全体を削除することを意味します。これは、パーツ内の行を削除する（高コストな delete を伴う）よりも効率的です。常にこの設定にすることを推奨します。詳細は [TTL（Time to Live）によるデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live) を参照してください。
- テーブルは従来の [`MergeTree` エンジン](/engines/table-engines/mergetree-family/mergetree) を使用します。これはログおよびトレースに推奨されるものであり、変更する必要はありません。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` でソートされています。これは、`ServiceName`、`SeverityText`、`Timestamp`、`TraceId` に対するフィルターにクエリが最適化されることを意味します。リストの先頭にある列ほど後ろの列より高速にフィルタリングされます（例：`ServiceName` でのフィルタリングは `TraceId` でのフィルタリングよりも大幅に高速です）。ユーザーは、想定されるアクセスパターンに応じてこの並び順を変更する必要があります。詳細は [主キーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key) を参照してください。
- 上記のスキーマでは、列に `ZSTD(1)` を適用しています。これはログに対して最良の圧縮を提供します。ユーザーは、より高い圧縮率を得るために（デフォルトの 1 よりも）ZSTD 圧縮レベルを上げることができますが、有益となるケースはまれです。この値を上げると、挿入時（圧縮時）の CPU オーバーヘッドが増大しますが、解凍（およびクエリ性能）は同程度のままのはずです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照してください。さらに、ディスク上のサイズ削減を目的として、Timestamp には追加の [delta encoding](/sql-reference/statements/create/table#delta) が適用されています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) がいずれも Map 型である点に注意してください。ユーザーはこれらの違いに慣れておく必要があります。これらの Map へのアクセス方法およびその中のキーへのアクセスを最適化する方法については、[マップの使用](/use-cases/observability/schema-design#using-maps) を参照してください。
- ここにあるその他の型のほとんど（例：LowCardinality としての `ServiceName`）は最適化されています。例のログでは JSON である `Body` は String として保存される点に注意してください。
- Bloom フィルターは Map のキーと値、さらに `Body` 列に適用されています。これは、これらの列にアクセスするクエリの実行時間を改善することを目的としていますが、通常は必須ではありません。[セカンダリ／データスキップインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices) を参照してください。



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

ここでも、これは [こちら](https://opentelemetry.io/docs/specs/otel/trace/api/) に記載されているトレース向け OTel 公式仕様に対応するカラムと対応します。ここでのスキーマは、上記のログスキーマと多くの同じ設定を採用しつつ、スパン固有の Link カラムを追加で含みます。

ユーザーには、自動スキーマ作成を無効化し、テーブルを手動で作成することを推奨します。これにより、プライマリキーおよびセカンダリキーを変更できるほか、クエリパフォーマンスを最適化するための追加カラムを導入することも可能になります。詳細については [Schema design](/use-cases/observability/schema-design) を参照してください。


## 挿入の最適化 {#optimizing-inserts}

高い挿入パフォーマンスを達成しつつ強力な一貫性保証を得るために、コレクター経由でObservabilityデータをClickHouseに挿入する際には、シンプルなルールに従う必要があります。OTelコレクターを適切に設定することで、以下のルールに従うことは容易になります。これにより、ClickHouseを初めて使用する際にユーザーが遭遇する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信される各挿入により、ClickHouseは挿入データと保存が必要なその他のメタデータを含むストレージパートを即座に作成します。したがって、各挿入に含まれるデータ量が少ない大量の挿入を送信するよりも、各挿入により多くのデータを含む少量の挿入を送信する方が、必要な書き込み回数を削減できます。一度に少なくとも1,000行の十分に大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください。

デフォルトでは、ClickHouseへの挿入は同期的であり、同一の場合は冪等性を持ちます。マージツリーエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、以下のようなケースで挿入が耐障害性を持つことを意味します:

- (1) データを受信するノードに問題がある場合、挿入クエリはタイムアウト(またはより具体的なエラー)となり、確認応答を受信しません。
- (2) ノードによってデータが書き込まれたものの、ネットワークの中断によりクエリの送信者に確認応答を返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの観点からは、(1)と(2)を区別することは困難です。しかし、どちらの場合でも、確認応答されなかった挿入は即座に再試行できます。再試行された挿入クエリが同じ順序で同じデータを含んでいる限り、(確認応答されなかった)元の挿入が成功していれば、ClickHouseは再試行された挿入を自動的に無視します。

上記を満たすために、以前の設定で示した[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)の使用を推奨します。これにより、上記の要件を満たす一貫した行のバッチとして挿入が送信されることが保証されます。コレクターが高スループット(秒あたりのイベント数)を持つことが予想され、各挿入で少なくとも5000イベントを送信できる場合、これは通常パイプラインで必要な唯一のバッチ処理です。この場合、コレクターはバッチプロセッサの`timeout`に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドレイテンシを低く保ち、バッチサイズを一貫させます。

### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、コレクターのスループットが低い場合、ユーザーは小さなバッチを送信せざるを得ませんが、それでも最小限のエンドツーエンドレイテンシ内でデータがClickHouseに到達することを期待します。この場合、バッチプロセッサの`timeout`が期限切れになると小さなバッチが送信されます。これは問題を引き起こす可能性があり、非同期挿入が必要となる場合です。このケースは通常、**エージェントロールのコレクターがClickHouseに直接送信するように設定されている場合**に発生します。ゲートウェイはアグリゲータとして機能することで、この問題を軽減できます - [ゲートウェイによるスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチが保証できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してバッチ処理をClickHouseに委任できます。非同期挿入では、データは最初にバッファに挿入され、その後非同期的にデータベースストレージに書き込まれます。

<Image img={observability_6} alt='非同期挿入' size='md' />

[非同期挿入を有効化](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)すると、ClickHouseが①挿入クエリを受信したとき、クエリのデータは②まずインメモリバッファに即座に書き込まれます。③次のバッファフラッシュが行われると、バッファのデータは[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、パートとしてデータベースストレージに書き込まれます。データベースストレージにフラッシュされる前は、データはクエリで検索できないことに注意してください。バッファフラッシュは[設定可能](/optimize/asynchronous-inserts)です。

コレクターで非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。配信保証を得るために、`wait_for_async_insert=1`(デフォルト)の使用を推奨します - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。


非同期インサートからのデータは、ClickHouse のバッファがフラッシュされたタイミングで挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えた場合、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒が経過した場合のいずれかで発生します。`async_insert_stale_timeout_ms` が 0 以外の値に設定されている場合は、最後のクエリから `async_insert_stale_timeout_ms` ミリ秒後にデータが挿入されます。ユーザーはこれらの設定を調整することで、パイプラインのエンドツーエンドのレイテンシを制御できます。バッファフラッシュの調整に使用できるその他の設定については[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト設定で十分です。

:::note 適応型非同期インサートの検討
利用されるエージェント数が少なく、スループットも低い一方でエンドツーエンドのレイテンシに厳しい要件がある場合、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般的に、ClickHouse で見られるような高スループットのオブザーバビリティ用途には適用されません。
:::

最後に、ClickHouse への同期インサートで利用可能だった従来の重複排除の挙動は、非同期インサートを使用する場合にはデフォルトで有効になっていません。必要な場合は、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の設定方法の詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、詳細な解説は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。



## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクターをClickHouseと併用する場合、複数のデプロイメントアーキテクチャが可能です。以下では、それぞれのアーキテクチャと適用が推奨される状況について説明します。

### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、OTelコレクターをエージェントとしてエッジにデプロイします。エージェントはローカルアプリケーション(例:サイドカーコンテナ)からトレースを受信し、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントがデータを直接ClickHouseに送信します。

<Image img={observability_7} alt='エージェントのみ' size='md' />

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。主な利点は、追加のハードウェアを必要とせず、ClickHouse可観測性ソリューションの総リソース使用量を最小限に抑えられること、そしてアプリケーションとコレクター間のマッピングがシンプルであることです。

エージェント数が数百を超えた場合は、ゲートウェイベースのアーキテクチャへの移行を検討してください。このアーキテクチャには、スケーリングを困難にするいくつかの欠点があります:

- **接続のスケーリング** - 各エージェントがClickHouseへの接続を確立します。ClickHouseは数百(場合によっては数千)の同時挿入接続を維持できますが、最終的にはこれが制限要因となり、挿入の効率が低下します。つまり、ClickHouseが接続を維持するためにより多くのリソースを消費することになります。ゲートウェイを使用することで接続数を最小限に抑え、挿入をより効率的にできます。
- **エッジでの処理** - このアーキテクチャでは、すべての変換やイベント処理をエッジまたはClickHouse内で実行する必要があります。これは制約となるだけでなく、複雑なClickHouseマテリアライズドビューを使用するか、重要なサービスに影響を与える可能性があり、リソースが限られているエッジに大量の計算処理を押し付けることを意味します。
- **小さなバッチとレイテンシ** - エージェントコレクターが個別に収集するイベント数は非常に少ない場合があります。これは通常、配信SLAを満たすために設定された間隔でフラッシュするように構成する必要があることを意味します。その結果、コレクターがClickHouseに小さなバッチを送信することになります。これは欠点ですが、非同期挿入によって軽減できます。[挿入の最適化](#optimizing-inserts)を参照してください。

### ゲートウェイによるスケーリング {#scaling-with-gateways}

上記の制限に対処するため、OTelコレクターをゲートウェイインスタンスとしてデプロイできます。ゲートウェイは通常、データセンターごとまたはリージョンごとにスタンドアロンサービスを提供します。単一のOTLPエンドポイントを介して、アプリケーション(またはエージェントロールの他のコレクター)からイベントを受信します。通常、複数のゲートウェイインスタンスがデプロイされ、標準のロードバランサーを使用してそれらの間で負荷を分散します。

<Image img={observability_8} alt='ゲートウェイによるスケーリング' size='md' />

このアーキテクチャの目的は、計算集約的な処理をエージェントからオフロードし、リソース使用量を最小限に抑えることです。ゲートウェイは、本来エージェントが実行する必要がある変換タスクを実行できます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは大きなバッチをClickHouseに送信でき、効率的な挿入が可能になります。これらのゲートウェイコレクターは、エージェントが追加されイベントスループットが増加するにつれて、容易にスケーリングできます。以下に、サンプルの構造化ログファイルを処理する関連エージェント設定を含むゲートウェイ設定の例を示します。エージェントとゲートウェイ間の通信にOTLPが使用されていることに注意してください。

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
          layout: "%Y-%m-%d %H:%M:%S"
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # Set to false if you are using a secure connection
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

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

これらの設定は以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、コレクタ群の管理に伴うコストとオーバーヘッドです。

より大規模なゲートウェイベースのアーキテクチャの管理例と関連する知見については、この[ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)をご参照ください。

### Kafkaの追加 {#adding-kafka}

上記のアーキテクチャではメッセージキューとしてKafkaを使用していないことにお気付きかもしれません。


Kafkaキューをメッセージバッファとして使用することは、ロギングアーキテクチャで見られる一般的な設計パターンであり、ELKスタックによって広く普及しました。これにはいくつかの利点があります。主に、より強力なメッセージ配信保証を提供し、バックプレッシャーへの対処に役立ちます。メッセージは収集エージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスタ化されたKafkaインスタンスは高スループットのメッセージバッファを提供できます。これは、メッセージを解析・処理するよりもデータをディスクに線形に書き込む方が計算オーバーヘッドが少ないためです。例えば、Elasticでは、トークン化とインデックス作成に大きなオーバーヘッドが発生します。エージェントからデータを移動することで、ソースでのログローテーションによるメッセージ損失のリスクも軽減されます。最後に、メッセージリプレイやクロスリージョンレプリケーション機能を提供するため、一部のユースケースにとって魅力的です。

しかし、ClickHouseは非常に高速にデータを挿入できます。中程度のハードウェアで毎秒数百万行を処理可能です。ClickHouseからのバックプレッシャーは**まれ**です。多くの場合、Kafkaキューを活用することは、アーキテクチャの複雑さとコストの増加を意味します。ログが銀行取引やその他のミッションクリティカルなデータと同じ配信保証を必要としないという原則を受け入れられるのであれば、Kafkaの複雑さを避けることを推奨します。

ただし、高い配信保証やデータのリプレイ機能(複数のソースへの配信を含む)が必要な場合、Kafkaは有用なアーキテクチャの追加となり得ます。

<Image img={observability_9} alt='Kafkaの追加' size='md' />

この場合、OTelエージェントは[Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)を介してKafkaにデータを送信するように設定できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。詳細については、ConfluentとOTelのドキュメントを参照してください。

### リソースの見積もり {#estimating-resources}

OTelコレクターのリソース要件は、イベントのスループット、メッセージのサイズ、実行される処理量に依存します。OpenTelemetryプロジェクトは、リソース要件を見積もるために使用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を提供しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3コアと12GBのRAMを持つゲートウェイインスタンスは、毎秒約60,000イベントを処理できます。これは、フィールドの名前変更を行う最小限の処理パイプラインを想定しており、正規表現は使用していません。

ゲートウェイへのイベント送信を担当し、イベントのタイムスタンプのみを設定するエージェントインスタンスについては、予想される毎秒のログ数に基づいてサイズを決定することを推奨します。以下は、ユーザーが出発点として使用できる概算値です:

| ロギングレート | コレクターエージェントのリソース |
| ------------ | ---------------------------- |
| 1k/秒    | 0.2CPU、0.2GiB               |
| 5k/秒    | 0.5 CPU、0.5GiB              |
| 10k/秒   | 1 CPU、1GiB                  |
