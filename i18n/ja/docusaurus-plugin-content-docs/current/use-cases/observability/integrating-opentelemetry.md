```markdown
---
title: OpenTelemetryの統合
description: 観測性のためのOpenTelemetryとClickHouseの統合
slug: /observability/integrating-opentelemetry
keywords: [観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

# データ収集のためのOpenTelemetryの統合

すべての観測性ソリューションには、ログやトレースを収集およびエクスポートする手段が必要です。この目的のために、ClickHouseは[OpenTelemetry (OTel)プロジェクト](https://opentelemetry.io/)を推奨します。

「OpenTelemetryは、トレース、メトリクス、およびログなどのテレメトリーデータを作成および管理するための観測性フレームワークおよびツールキットです。」

ClickHouseやPrometheusとは異なり、OpenTelemetryは観測性のバックエンドではなく、テレメトリーデータの生成、収集、管理、およびエクスポートに焦点を当てています。OpenTelemetryの初期目標は、ユーザーが言語特有のSDKを使用して自身のアプリケーションやシステムを簡単に計測できるようにすることでしたが、OpenTelemetryコレクターを通じたログの収集も含めて拡張されました。OpenTelemetryコレクターは、テレメトリーデータを受信、処理、およびエクスポートするエージェントまたはプロキシです。

## ClickHouse関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetryは多数のコンポーネントで構成されています。データとAPI仕様、標準化されたプロトコル、およびフィールド/カラムの命名規約を提供するだけでなく、OTelはClickHouseで観測性ソリューションを構築するために基本的な2つの機能を提供します。

- [OpenTelemetryコレクター](https://opentelemetry.io/docs/collector/)は、テレメトリーデータを受信、処理、およびエクスポートするプロキシです。ClickHouseを使用したソリューションでは、ログ収集とイベント処理の両方にこのコンポーネントを使用します。
- [言語SDK](https://opentelemetry.io/docs/languages/)は、仕様、API、およびテレメトリーデータのエクスポートを実装します。これらのSDKは、アプリケーションのコード内でトレースが正しく記録されることを確実にし、構成要素のスパンを生成し、メタデータを通じてサービス間でコンテキストを伝播させることを保障します。したがって、分散トレースが形成され、スパンが相関できるようになります。これらのSDKは、一般的なライブラリやフレームワークを自動的に実装するエコシステムに補完され、ユーザーはコードを変更する必要がなく、即座に計測を行うことができます。

ClickHouseを活用した観測性ソリューションでは、これらのツールの両方を活用します。

## ディストリビューション {#distributions}

OpenTelemetryコレクターには[いくつかのディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseソリューションに必要なfilelogレシーバーとClickHouseエクスポーターは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ含まれています。

このディストリビューションには多くのコンポーネントが含まれており、ユーザーはさまざまな構成を試すことができます。ただし、本番環境で実行する場合は、コレクターをその環境に必要なコンポーネントのみを含むように制限することをお勧めします。これを行う理由はいくつかあります。

- コレクターのサイズを縮小し、デプロイ時間を短縮する
- コレクターのセキュリティを向上させ、利用可能な攻撃対象面積を減少させる

[カスタムコレクターの構築](https://opentelemetry.io/docs/collector/custom-collector/)は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用して実現できます。

## OTelによるデータの取り込み {#ingesting-data-with-otel}

### コレクターの展開役割 {#collector-deployment-roles}

ログを収集し、それらをClickHouseに挿入するために、OpenTelemetryコレクターの使用を推奨します。OpenTelemetryコレクターは、主に2つの役割で展開できます。

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、アプリケーション (OpenTelemetry SDKで計測された) から直接イベントを受信します。この場合、エージェントインスタンスはアプリケーションと同じホストで実行されます（例えば、サイドカーまたはDaemonSetとして）。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信できます。前者の場合、これを[エージェント展開パターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼びます。
- **ゲートウェイ** - ゲートウェイインスタンスは、通常、クラスターごと、データセンターごと、またはリージョンごとに展開されるスタンドアロンサービスを提供します。これらは、単一のOTLPエンドポイントを介してアプリケーション (または他のコレクターとしてのエージェント) からイベントを受信します。通常、複数のゲートウェイインスタンスが展開され、ロードバランサーがそれらの間で負荷を分散します。すべてのエージェントやアプリケーションがこの単一のエンドポイントに信号を送信する場合、これを[ゲートウェイ展開パターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ぶことが多いです。

以下では、シンプルなエージェントコレクターがイベントを直接ClickHouseに送信することを前提としています。ゲートウェイを使用する際の詳細については、[ゲートウェイの拡張](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

コレクターを使用する主な利点は、サービスがデータを迅速にオフロードできるようになり、コレクターが再試行、バッチ処理、暗号化、さらには機密データフィルタリングなどの追加処理を行うことができることです。

コレクターは、[レシーバー](https://opentelemetry.io/docs/collector/configuration/#receivers)、[プロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)、および[エクスポーター](https://opentelemetry.io/docs/collector/configuration/#exporters)の3つの主要な処理ステージのための用語を使用します。レシーバーはデータ収集に使用され、プルまたはプッシュベースである可能性があります。プロセッサーはメッセージの変換や強化を行う能力を提供します。エクスポーターは、データを下流のサービスに送信する役割を担います。このサービスは理論的には別のコレクターになることができますが、以下の初期議論ではすべてのデータが直接ClickHouseに送信されると仮定します。

<img src={require('./images/observability-3.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ユーザーが全レシーバー、プロセッサー、エクスポーターのセットに精通することをお勧めします。

コレクターは、ログを収集するために2つの主要なレシーバーを提供します：

**OTLP経由** - この場合、ログはOTLPプロトコルを介してOpenTelemetry SDKからコレクターに直接送信されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを採用しており、各言語のOTLPエクスポーターはローカルコレクターエンドポイントを仮定しています。この場合、コレクターはOTLPレシーバーで構成する必要があります — 上記の[デモの構成](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)を参照してください。このアプローチの利点は、ログデータに自動的にトレースIDが含まれるため、ユーザーが後で特定のログのトレースを識別しやすくなることです。

<img src={require('./images/observability-4.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

このアプローチでは、ユーザーは[適切な言語SDK](https://opentelemetry.io/docs/languages/)でコードを計測する必要があります。

- **Filelogレシーバーによるスクレイピング** - このレシーバーはディスク上のファイルを追尾し、ログメッセージを形成し、これをClickHouseに送信します。このレシーバーは、複数行メッセージの検出、ログのロールオーバーの処理、再起動耐性のためのチェックポイント、構造の抽出などの複雑なタスクを処理します。このレシーバーは、Helmチャートとしてデプロイ可能なDockerおよびKubernetesコンテナログを追尾することも可能で、[これから構造を抽出する](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)ことや、ポッドの詳細でそれを強化することができます。

<img src={require('./images/observability-5.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

**ほとんどのデプロイメントは、上記レシーバーの組み合わせを使用します。ユーザーには、[コレクタのドキュメント](https://opentelemetry.io/docs/collector/)を読み、基本的な概念や[構成構造](https://opentelemetry.io/docs/collector/configuration/)および[インストール手順](https://opentelemetry.io/docs/collector/installation/)に精通することをお勧めします。**

:::note Tip: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、構成を検証および可視化するのに役立ちます。
:::

## 構造化対非構造化 {#structured-vs-unstructured}

ログは構造化または非構造化のいずれかです。

構造化ログは、JSONなどのデータ形式を使用し、HTTPコードやソースIPアドレスなどのメタデータフィールドを定義します。

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

非構造化ログは、通常、正規表現パターンを介して抽出可能な固有の構造を持ちながら、ログを単に文字列として表します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能な限り、構造化ログを使用し、JSON（すなわちndjson）でログを記録することをお勧めします。これにより、後でClickHouseに送信する前に[コレクターのプロセッサー](https://opentelemetry.io/docs/collector/configuration/#processors)で、または挿入時にマテリアライズドビューを使用してログの処理が簡素化されます。構造化ログは、最終的に後の処理リソースを節約し、ClickHouseソリューションに必要なCPUを削減します。

### 例 {#example}

例として、構造化（JSON）と非構造化のログデータセットをそれぞれ約10M行のものとして提供します。以下のリンクからアクセス可能です：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では、構造化データセットを使用します。このファイルがダウンロードされ、以下の例を再現できるように展開されていることを確認してください。

次のコードは、ディスク上のこれらのファイルを読み取り、filelogレシーバーを使用してメッセージをstdoutに出力するためのOTelコレクターのシンプルな構成を示しています。私たちは、ログが構造化されているため[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルへのパスを変更してください。

:::note ClickHouseでの解析を考慮
以下の例は、ログからタイムスタンプを抽出します。これは、ログ行全体をJSON文字列に変換し、結果を`LogAttributes`に配置する`json_parser`オペレーターの使用を必要とします。これは計算コストが高く、[ClickHouseでより効率的に行うことができます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLでの構造の抽出](/observability/schema-design#extracting-structure-with-sql)。同等の非構造化の例は、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)を使用してこれを達成するものが[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)にあります。
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

ユーザーは、[公式の手順](https://opentelemetry.io/docs/collector/installation/)に従ってコレクターをローカルにインストールできます。特に、手順が[contribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)（`filelog`レシーバーが含まれている）を使用するために修正されていることを確認してください。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz`の代わりに、`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で見つけることができます。

インストール後、OTelコレクターを次のコマンドで実行できます：

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、メッセージは出力で次のような形になります：

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

上記は、OTelコレクターによって生成された単一のログメッセージを表しています。これらのメッセージを次のセクションでClickHouseに取り込みます。

ログメッセージの完全なスキーマは、別のレシーバーを使用する場合に存在する可能性のある追加のカラムと共に[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で維持されています。**このスキーマに精通することを強くお勧めします。**

ここでの重要な点は、ログ行自体が`Body`フィールド内に文字列として保持されますが、JSONは`Attributes`フィールドに自動的に抽出されていることです。この同じ[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)を使用して、タイムスタンプが適切な`Timestamp`カラムに抽出されています。OTelを使用したログ処理に関する推奨事項は、[処理](#processing---filtering-transforming-and-enriching)を参照してください。

:::note オペレーター
オペレーターは、ログ処理の最も基本的な単位です。各オペレーターは、ファイルから行を読み取る、またはフィールドからJSONを解析するなど、単一の責任を果たします。オペレーターはパイプライン内でこのように連結されて、目的の結果を得ることができます。
:::

上記のメッセージには`TraceID`や`SpanID`フィールドが存在しません。存在する場合、たとえばユーザーが[分散トレース](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装しているケースでは、上記と同様の技術を使用してJSONから抽出することができます。

ローカルまたはKubernetesのログファイルを収集する必要があるユーザーには、[filelogレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)の利用可能な構成オプションに精通し、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)や[複数行ログの解析がどのように処理されているか](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)に慣れることをお勧めします。

## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログの収集には、[OpenTelemetryのドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を推奨します。ログとメトリクスにポッドメタデータを追加するために、[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)の使用を推奨します。これは、例えば、ラベルなどの動的メタデータを生成する可能性があります。このメタデータは、`ResourceAttributes`カラムに保存されます。ClickHouseは現在、このカラムのタイプを`Map(String, String)`として使用しています。[マップの使用](/observability/schema-design#using-maps)や[マップからの抽出](/observability/schema-design#extracting-from-maps)については、このタイプの取り扱いや最適化の詳細を参照してください。

## トレースの収集 {#collecting-traces}

コードを計測し、トレースを収集したいユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことを推奨します。

ClickHouseにイベントを送信するには、ユーザーは適切なレシーバーを介してトレースイベントを受け取るOTelコレクターを展開する必要があります。OpenTelemetryデモは、[サポートされている各言語を計測し、コレクターにイベントを送信する例](https://opentelemetry.io/docs/demo/)を提供しています。以下に、イベントをstdoutに出力するための適切なコレクター構成の例を示します。

### 例 {#example-1}

トレースをOTLP経由で受信する必要があるため、トレースデータを生成するために[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用します。インストール手順は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の構成は、OTLPレシーバーでトレースイベントを受信し、それらをstdoutに送信します。

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

この構成を次のコマンドで実行します：

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen`を使用してコレクターにトレースイベントを送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、stdoutに出力されるトレースメッセージは次のようになります：

```response
Span #86
	Trace ID   	: 1bb5cdd2c9df5f0da320ca22045c60d9
	Parent ID  	: ce129e5c2dd51378
	ID         	: fbb14077b5e149a0
	Name       	: okey-dokey-0
	Kind       	: Server
	Start time 	: 2024-06-19 18:03:41.603868 +0000 UTC
	End time   	: 2024-06-19 18:03:41.603991 +0000 UTC
	Status code	: Unset
	Status message :
Attributes:
 	-> net.peer.ip: Str(1.2.3.4)
 	-> peer.service: Str(telemetrygen-client)
```

上記は、OTelコレクターによって生成された単一のトレースメッセージを表しています。これらのメッセージを次のセクションでClickHouseに取り込みます。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で維持されています。このスキーマに精通することを強くお勧めします。

## 処理 - フィルタリング、変換、強化 {#processing---filtering-transforming-and-enriching}

以前のログイベントのタイムスタンプ設定の例で示されたように、ユーザーは間違いなくイベントメッセージをフィルタ、変換、および強化したいと考えます。これはOpenTelemetryのいくつかの機能を使用して実現できます。

- **プロセッサー** - プロセッサーは、[レシーバーによって収集されたデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、それをエクスポーターに送信する前に変更します。プロセッサーは、コレクターの構成の`processors`セクションで構成された順序で適用されます。これらはオプションですが、最小限のセットは[通常推奨される](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)ものです。ClickHouseとOTelコレクターを使用する場合は、プロセッサーを以下のように制限することをお勧めします：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターのメモリ不足状況を防ぐために使用されます。[リソースの見積もり](#estimating-resources)での推奨を参照してください。
    - コンテキストに基づいて強化を行うプロセッサー。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータを使用してスパン、メトリクス、ログのリソース属性を自動的に設定します。
    - トレースに必要な場合は、[テイルサンプリングまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本的フィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 必要ないイベントを削除します（これをオペレーター経由でできない場合）。
    - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseで作業する際に、データがバッチとして送信されることを保証するために不可欠です。["ClickHouseへのエクスポート"](#exporting-to-clickhouse)を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)はレシーバーで利用可能な最も基本的な処理ユニットを提供します。基本的な解析がサポートされており、重大度とタイムスタンプなどのフィールドを設定できます。JSONおよび正規表現解析はここでサポートされており、イベントのフィルタリングや基本的な変換も行えます。ここでイベントフィルタリングを実施することをお勧めします。

ユーザーには、オペレーターや[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用して過度のイベント処理を避けることをお勧めします。これにより、特にJSON解析時に相当なメモリおよびCPUのオーバーヘッドが発生する可能性があります。すべての処理をClickHouseで挿入時にマテリアライズドビューとカラムで行うことが可能ですが、一部の例外、特にk8sメタデータの追加などのコンテキスト認識型強化は別です。詳細については[SQLでの構造の抽出](/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う場合は、ゲートウェイインスタンスで変換を行い、エージェントインスタンスで行う作業を最小限にすることをお勧めします。これにより、サーバー上で実行されるエッジのエージェントに必要なリソースが最小限に抑えられます。通常、ユーザーはフィルタリング（不要なネットワーク使用を最小限に抑えるため）、タイムスタンプ設定（オペレーター経由）、およびエージェントでのコンテキストが必要な強化を実施することがわかっています。例えば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8s強化はエージェント内で実行する必要があります。

### 例 {#example-2}

次の構成は非構造化ログファイルの収集を示しています。ここでは、オペレーターを使用してログ行から構造を抽出（`regex_parser`）し、イベントをフィルタリング、イベントをバッチ処理しメモリ使用量を制限するためのプロセッサーを使用しています。

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

エクスポーターは、データを1つまたは複数のバックエンドまたは宛先に送信します。エクスポーターにはプルまたはプッシュベースがあります。ClickHouseにイベントを送信するには、プッシュベースの[ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribを使用
ClickHouseエクスポーターは、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部であり、コアディストリビューションには含まれていません。ユーザーは、contribディストリビューションを使用するか、[独自のコレクターを構築](https://opentelemetry.io/docs/collector/custom-collector/)することができます。
:::

完全な構成ファイルは以下に示します。

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

以下の重要な設定に注意してください：
```
- **パイプライン** - 上記の構成は、ログとトレース用に1つずつのレシーバー、プロセッサーおよびエクスポーターのセットで構成された[パイプライン](https://opentelemetry.io/docs/collector/configuration/#pipelines)の使用を強調しています。
- **エンドポイント** - ClickHouseとの通信は`endpoint`パラメーターを介して設定されます。接続文字列`tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`は、TCPを介って通信が行われることを引き起こします。ユーザーがトラフィックスイッチの理由でHTTPを好む場合は、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されているように、この接続文字列を変更してください。ユーザー名とパスワードをこの接続文字列内で指定できる完全な接続詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**重要:** 上記の接続文字列は、圧縮（lz4）および非同期挿入の両方を有効にします。両方が常に有効であることを推奨します。非同期挿入の詳細については、[バッチ処理](#batching)を参照してください。圧縮は常に指定する必要があり、古いバージョンのエクスポーターではデフォルトで有効にはなりません。

- **ttl** - ここに指定された値はデータが保持される期間を決定します。詳細は「データの管理」で説明されています。　これを時間単位で指定する必要があります（例: 72h）。以下の例では、データが2019年のものであるため、ClickHouseによってすぐに削除されるため、TTLを無効にします。
- **traces_table_name**および**logs_table_name** - ログとトレースのテーブル名を決定します。
- **create_schema** - 起動時にテーブルがデフォルトのスキーマで作成されるかどうかを決定します。始めるためにはデフォルトでtrueに設定されています。ユーザーはfalseに設定し、自分自身のスキーマを定義する必要があります。
- **database** - 対象データベース。
- **retry_on_failure** - 失敗したバッチを再試行するかどうかを決定する設定。
- **batch** - バッチプロセッサーは、イベントがバッチとして送信されることを保証します。私たちは、5000程度の値を推奨し、タイムアウトは5秒にします。どちらかの条件が最初に達成されると、エクスポーターにバッチがフラッシュされます。これらの値を下げると、クエリのためのデータが早く利用できる低遅延のパイプラインになりますが、ClickHouseに送信される接続とバッチが増えるため、推奨されません。ユーザーが[非同期挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用していない場合、これは[あまりにも多くのパーツ](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)に関する問題を引き起こす可能性があります。逆に、ユーザーが非同期挿入を使用している場合、クエリのためのデータの可用性も非同期挿入の設定に依存しますが、データはコネクターから早くフラッシュされます。詳細については[バッチ処理](#batching)を参照してください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各アイテムはバッチを含みます。このキューが超過すると、例えばClickHouseに到達できないためにイベントが引き続き到着する場合、バッチがドロップされます。

ユーザーが構造化ログファイルを抽出し、（デフォルト認証のある）[ローカルインスタンスのClickHouse](/install)が実行されていると仮定すると、次のコマンドを使用してこの構成を実行することができます：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、次のコマンドを`telemetrygen`ツールを使用して実行します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中に、簡単なクエリでログイベントが存在することを確認します：

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:     	0
SeverityText:
SeverityNumber: 	0
ServiceName:
Body:           	{"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:	{}
LogAttributes:  	{'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.
```

同様に、トレースイベントについては、ユーザーは`otel_traces`テーブルを確認できます：

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2024-06-20 11:36:41.181398000
TraceId:        	00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:         	beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:       	lets-go
SpanKind:       	SPAN_KIND_CLIENT
ServiceName:    	telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:      	telemetrygen
ScopeVersion:
SpanAttributes: 	{'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:       	123000
StatusCode:     	STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:    	[]
Events.Attributes:  []
Links.TraceId:  	[]
Links.SpanId:   	[]
Links.TraceState:   []
Links.Attributes:   []
```

## 既定のスキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouseエクスポーターはログとトレースの両方用にターゲットログテーブルを作成します。これは、`create_schema`設定を介して無効にすることができます。さらに、ログとトレースのテーブル名は、上記の設定を使用してデフォルトの`otel_logs`および`otel_traces`から変更できます。

:::note  
以下のスキーマでは、TTLが72hとして有効になっていると仮定しています。
:::

ログのデフォルトスキーマは以下の通りです（`otelcol-contrib v0.102.1`）：

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

ここでのカラムは、OTel公式のログ仕様に相関しています。詳細は[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)をご覧ください。

このスキーマに関するいくつかの重要な注意点：

- デフォルトでは、テーブルは`PARTITION BY toDate(Timestamp)`を介して日付でパーティション化されています。これにより、期限が切れたデータを効率的に削除できます。
- TTLは`TTL toDateTime(Timestamp) + toIntervalDay(3)`を介して設定され、コレクター設定で設定された値に対応しています。`[ttl_only_drop_parts=1](/operations/settings/settings#ttl_only_drop_parts)`は、すべての含まれる行が期限切れになったときにのみ、全体のパーツが削除されることを意味します。これは、パーツ内の行を削除するよりも効率的で、高価な削除を避けることができます。私たちは、これを常に設定することを推奨します。詳細は[TTLによるデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live)を参照してください。
- テーブルはクラシックな[`MergeTree`エンジン](/engines/table-engines/mergetree-family/mergetree)を使用します。これは、ログとトレースに推奨され、変更する必要はありません。
- テーブルは`ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`により順序付けられています。これにより、クエリは`ServiceName`、`SeverityText`、`Timestamp`および`TraceId`のフィルタリングに最適化されます。リスト内の前のカラムは後のカラムよりも早くフィルタリングされます。例えば、`ServiceName`でフィルタリングする方が`TraceId`でフィルタリングするよりもかなり高速です。ユーザーは、期待されるアクセスパターンに応じてこの順序を変更する必要があります。詳細は[主キーの選択](/observability/schema-design#choosing-a-primary-ordering-key)を参照してください。
- 上記のスキーマは、カラムに`ZSTD(1)`を適用します。これは、ログに最適な圧縮を提供します。ユーザーは、より良い圧縮のためにZSTD圧縮レベル（デフォルトの1以上）を引き上げることができますが、これはほとんどの場合有益ではありません。この値を増やすと、挿入時のCPUオーバーヘッドが増大します（圧縮処理中）。ただし、解凍（およびクエリ）は比較可能なままのはずです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照してください。追加の[デルタエンコーディング](/sql-reference/statements/create/table#delta)がTimestampに適用され、ディスク上のサイズを減少させることを目指しています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)および[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope)がマップであることに注意してください。ユーザーはそれらの違いを理解する必要があります。これらのマップにアクセスし、内部のキーへのアクセスを最適化する方法については[マップの使用](/observability/schema-design#using-maps)を参照してください。
- ここでのほとんどの他の型（例:`ServiceName`としてLowCardinality）は最適化されています。ログの例ではJSONですが、BodyはStringとして保存されています。
- Bloomフィルターは、マップのキーと値、およびBodyカラムに適用されます。これにより、これらの列へのクエリ時間が改善されることを目的としていますが、通常は必要ありません。詳細は[セカンダリ/データスキッピングインデックス](/observability/schema-design#secondarydata-skipping-indices)を参照してください。

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

このスキーマもOTelの公式仕様で文書化されたトレースのカラムに対応しています。ここでのスキーマは、多くの点で上記のログスキーマと同じ設定を採用しており、追加のスパン特有のリンクカラムがあります。

ユーザーは自動スキーマ作成を無効にし、手動でテーブルを作成することを推奨します。これにより、主キーおよび副キーの変更、クエリパフォーマンスを最適化するための追加のカラムを導入する機会が提供されます。詳細は[スキーマ設計](/observability/schema-design)を参照してください。

## 挿入の最適化 {#optimizing-inserts}

観測可能性データをコレクターを介してClickHouseに挿入する際に高い挿入性能を達成し、強い整合性ガランティーを得るために、ユーザーは単純なルールに従うべきです。OTelコレクターの正しい設定があれば、以下のルールに従うことは容易であるはずです。これにより、ユーザーがClickHouseを初めて使用する際によくある[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を避けることができます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信された各挿入は、挿入からデータを含むストレージパーツを即座に作成します。他のメタデータも保存する必要があります。そのため、各挿入が少ないデータを含む場合と比較して、多くのデータを含む少ない挿入を送信することで、必要な書き込み回数が減少します。私たちは、1回の挿入で1000行以上のかなり大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)で確認できます。

デフォルトでは、ClickHouseへの挿入は同期的であり、同一であれば冪等です。マージツリーエンジンのファミリーに属するテーブルでは、ClickHouseはデフォルトで挿入を自動的に[重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)します。これは、以下のような場合に挿入が問題に耐えられることを意味します：

- (1) データを受け取るノードに問題がある場合、挿入クエリはタイムアウト（またはより具体的なエラー）し、確認を受け取りません。
- (2) ノードによってデータが書き込まれた場合でも、ネットワークの中断のため、確認をクエリの送信者に返すことができなくなることがあります。送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの観点からは、(1)と(2)の区別は難しい場合があります。しかし、両方のケースで、未確認の挿入はすぐに再試行できます。再試行された挿入クエリが元の（未確認の）挿入が成功する場合は、同じデータを同じ順序で含む限り、ClickHouseは再試行された挿入を自動的に無視します。

私たちは、上記を満たすために[バッチプロセッサー](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)の使用を推奨します。これにより、挿入が一貫した行のバッチとして送信されます。コレクターが高スループット（秒当たりのイベント）を持つ場合、1回の挿入で少なくとも5000イベントを送信できる場合、これがパイプラインで必要な唯一のバッチ処理であることが多いです。この場合、コレクターはバッチプロセッサーの`timeout`が到達する前にバッチをフラッシュし、パイプラインのエンドツーエンド遅延が低く保たれ、一貫したサイズのバッチを保持します。

### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、ユーザーはコレクターのスループットが低い場合、データを最低限のエンドツーエンド遅延でClickHouseに到達させたいと考えた場合、小さなバッチを送信することを余儀なくされます。この場合、バッチプロセッサーの`timeout`が期限切れになると小さなバッチが送信されます。これにより問題が発生する可能性があり、非同期挿入が必要です。このケースは、**エージェントの役割を持つコレクターがClickHouseに直接送信されるように構成されているとき**に一般的に発生します。ゲートウェイは集約器として機能することにより、この問題を軽減できます - [ゲートウェイによるスケール](#scaling-with-gateways)を参照してください。

大きなバッチが保証できない場合、ユーザーは[非同期挿入](/cloud/bestpractices/asynchronous-inserts)を使用し、ClickHouseにバッチ処理を委任できます。非同期挿入では、データが最初にバッファに挿入され、その後データベースストレージに書き込まれます。

<img src={require('./images/observability-6.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

[非同期挿入が有効](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)になっている場合、ClickHouseは①挿入クエリを受け取ると、クエリのデータが②最初にメモリ内のバッファに即座に書き込まれます。③次のバッファフラッシュが行われると、バッファのデータは[ソートされ](https://optimize/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、データベースストレージへパートとして書き込まれます。ただし、データはデータベースストレージにフラッシュされる前はクエリで検索可能ではないことに注意してください。バッファフラッシュは[設定可能](https://optimize/asynchronous-inserts)です。

コレクターの非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。配信の保証を得るためには、ユーザーが`wait_for_async_insert=1`（デフォルト）を使用することをお勧めします - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。

非同期挿入からのデータは、ClickHouseバッファがフラッシュされると挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async-insert-max-data-size)が超過した場合、または最初のINSERTクエリ以降[`async_insert_busy_timeout_ms`](/operations/settings/settings#async-insert-busy-timeout-ms)ミリ秒経過後にクエリが発生した場合に行われます。`async_insert_stale_timeout_ms`がゼロ以外の値に設定されている場合、データは最後のクエリから`async_insert_stale_timeout_ms`ミリ秒後に挿入されます。ユーザーは、これらの設定を調整してパイプラインのエンドツーエンド遅延を制御できます。バッファフラッシングを調整するために使用できる追加の設定は、[こちら](https://operations/settings/settings#asynchronous-insert-settings)に文書化されています。一般的に、デフォルトは適切です。

:::note 適応型非同期挿入を考慮
低数のエージェントが使用され、スループットが低いが厳しいエンドツーエンド遅延要件を持つ場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が有用かもしれません。一般的に、これらはClickHouseでの高スループットの観測性ユースケースには適用されません。
:::

最後に、ClickHouseへの同期挿入に関連する以前の重複排除動作は、非同期挿入を使用する際にはデフォルトで有効になっていません。必要な場合は、設定[`async_insert_deduplicate`](/operations/settings/settings#async-insert-deduplicate)を参照してください。

この機能の構成に関する完全な詳細は[こちら](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)にあり、詳細に関しては[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクターをClickHouseで使用する際には、いくつかのデプロイメントアーキテクチャが可能です。それぞれについて以下に説明し、適用される可能性のある条件を示します。

### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクターをエッジにエージェントとして展開します。これらは、ローカルアプリケーション（例：サイドカーコンテナ）からトレースを受信し、サーバーおよびKubernetesノードからログを収集します。このモードでは、エージェントはデータを直接ClickHouseに送信します。

<img src={require('./images/observability-7.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアーキテクチャは、小～中規模のデプロイメントに適しています。その主な利点は、追加のハードウェアを必要とせず、ClickHouseの観測性ソリューションの全体的リソースフットプリントを最小限に保ち、アプリケーションとコレクターの間の単純なマッピングを維持できることです。

エージェントの数が数百を超えると、ゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャには、スケールに挑戦しなければならないいくつかの欠点があります：

- **接続のスケーリング** - 各エージェントはClickHouseへの接続を確立します。ClickHouseは、何百もの（おそらく何千もの）同時挿入接続を維持できますが、最終的にはこれが制限要因となり、挿入の効率が低下し、つまり接続を維持するためにClickHouseがより多くのリソースを使用することになります。ゲートウェイを使用すると、接続数を最小限に抑え、挿入がより効率的になります。
- **エッジでの処理** - このアーキテクチャのすべての変換やイベント処理は、エッジまたはClickHouseで実行する必要があります。制限的であるだけでなく、複雑なClickHouseのマテリアライズドビューを必要とするか、重要なサービスに影響を与える可能性のあるリソースが不足している場合に大きな計算をエッジにプッシュすることになります。
- **小さなバッチと遅延** - エージェントコレクターは、非常に少数のイベントを個別に収集する可能性があります。これは通常、配信のSLAを満たすために設定間隔でフラッシュする必要があることを意味します。これにより、コレクターがClickHouseに小さなバッチを送信することになる場合があります。欠点ですが、非同期挿入で軽減できます - 詳細は[挿入の最適化](#optimizing-inserts)を参照してください。

### ゲートウェイによるスケーリング {#scaling-with-gateways}

OTelコレクターは、上記の制限を緩和するためにゲートウェイインスタンスとしてデプロイできます。これにより、通常はデータセンターまたは地域ごとのスタンドアロンサービスを提供します。これらは、アプリケーション（またはエージェント役割の他のコレクター）からのイベントを、単一のOTLPエンドポイント経由で受信します。通常、いくつかのゲートウェイインスタンスがデプロイされ、アウトオブボックスのロ
[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3コアと12GBのRAMを持つゲートウェイインスタンスは、約60,000イベント/秒を処理できます。これは、フィールドの名称変更を担当する最小限の処理パイプラインがあり、正規表現を使用しないことを前提としています。

イベントをゲートウェイに送信し、イベントのタイムスタンプのみを設定するエージェントインスタンスについては、ユーザーは予想されるログ/秒に基づいてリソースを調整することをお勧めします。以下は、ユーザーが出発点として使用できるおおよその数値を示しています：

Logging rate
Resources to collector agent	
1k/second
0.2CPU, 0.2GiB	
5k/second
0.5 CPU, 0.5GiB	
10k/second
1 CPU, 1GiB	

| Logging rate  | Resources to collector agent |
|---------------|------------------------------|
| 1k/second     | 0.2CPU, 0.2GiB              |
| 5k/second     | 0.5 CPU, 0.5GiB             |
| 10k/second    | 1 CPU, 1GiB                 |
