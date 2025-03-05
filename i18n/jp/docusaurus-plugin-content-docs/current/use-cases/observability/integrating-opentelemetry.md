---
title: OpenTelemetryの統合
description: OpenTelemetryとClickHouseを統合して可観測性を実現
slug: /observability/integrating-opentelemetry
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';

# データ収集のためのOpenTelemetryの統合

任意の可観測性ソリューションには、ログやトレースを収集してエクスポートする手段が必要です。この目的のために、ClickHouseは[OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/)を推奨します。

「OpenTelemetryは、トレース、メトリクス、ログなどのテレメトリデータを生成・管理するために設計された可観測性のフレームワークおよびツールキットです。」

ClickHouseやPrometheusとは異なり、OpenTelemetryは可観測性のバックエンドではなく、テレメトリデータの生成、収集、管理、エクスポートに焦点を当てています。OpenTelemetryの初期の目的は、ユーザーが言語特有のSDKを使用してアプリケーションやシステムを簡単に計測できるようにすることでしたが、ログを収集するOpenTelemetryコレクターを介しての収集を含むように拡張されています。これは、テレメトリデータを受信、処理、エクスポートするエージェントまたはプロキシです。
## ClickHouseに関連するコンポーネント {#clickhouse-relevant-components}

OpenTelemetryは複数のコンポーネントで構成されています。データおよびAPI仕様の提供、標準化されたプロトコル、フィールド/カラムの命名規則に加え、OTelはClickHouseでの可観測性ソリューションを構築するために基本的な2つの機能を提供します：

- [OpenTelemetryコレクター](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、エクスポートするプロキシです。ClickHouseを利用したソリューションは、このコンポーネントをログ収集とイベント処理の両方に使用します。
- テレメトリデータの仕様、API、およびエクスポートを実装する[言語SDK](https://opentelemetry.io/docs/languages/)です。これらのSDKは、アプリケーションのコード内でトレースが正しく記録されることを保証し、構成要素となるスパンを生成し、メタデータを介してサービス間でコンテキストが伝播することを確保します。これにより、分散トレースが形成され、スパンの相関が確保されます。これらのSDKは、一般的なライブラリやフレームワークを自動的に実装するエコシステムによって補完されるため、ユーザーはコードを変更する必要がなく、即座に計測が行えます。

ClickHouseを利用した可観測性ソリューションは、これらの2つのツールを活用します。
## ディストリビューション {#distributions}

OpenTelemetryコレクターには[いくつかのディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseソリューションに必要なfilelogレシーバーとClickHouseエクスポーターは、[OpenTelemetryコレクターコンスリブディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ存在します。

このディストリビューションには多くのコンポーネントが含まれ、ユーザーはさまざまな構成で実験することができます。しかし、プロダクション環境で実行する際には、コレクターに必要なコンポーネントのみを含めることを推奨します。これを行う理由は以下の通りです：

- コレクターのサイズを削減し、コレクターのデプロイ時間を短縮するため
- 利用可能な攻撃面を減少させることで、コレクターのセキュリティを向上させるため

[カスタムコレクター](https://opentelemetry.io/docs/collector/custom-collector/)を構築するには、[OpenTelemetryコレクタービルダー](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用できます。
## OTelでのデータの取り込み {#ingesting-data-with-otel}
### コレクターのデプロイロール {#collector-deployment-roles}

ログを収集し、ClickHouseに挿入するには、OpenTelemetryコレクターの使用を推奨します。OpenTelemetryコレクターは、主に2つの役割でデプロイできます：

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、OpenTelemetry SDKを使用して計測されたアプリケーションから直接イベントを受信します。後者の場合、エージェントインスタンスはアプリケーションまたはアプリケーションと同じホスト上（サイドカーやDaemonSetのように）で実行されます。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信できます。前者の場合、これを[エージェントデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼びます。
- **ゲートウェイ**  - ゲートウェイインスタンスは、通常、クラスター、データセンター、またはリージョンごとにスタンドアロンサービスを提供します。これらは、単一のOTLPエンドポイントを介してアプリケーション（または他のコレクターからエージェントとして）からイベントを受信します。通常、いくつかのゲートウェイインスタンスがデプロイされ、負荷分散のために使用されるアウトオブザボックスのロードバランサーがあります。すべてのエージェントとアプリケーションがこの単一のエンドポイントに信号を送信する場合、これを[ゲートウェイデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ぶことがよくあります。

以下では、シンプルなエージェントコレクターが、そのイベントを直接ClickHouseに送信することを仮定します。ゲートウェイの使用や適用可能な場合については、[Gatewayを使用したスケーリング](#scaling-with-gateways)を参照してください。
### ログの収集 {#collecting-logs}

コレクターを使用する主な利点は、サービスがデータを迅速にオフロードできることです。コレクターがリトライ、バッチ処理、暗号化、さらには機密データフィルタリングなどの追加処理を行います。

コレクターは[レシーバー](https://opentelemetry.io/docs/collector/configuration/#receivers)、[プロセッサ](https://opentelemetry.io/docs/collector/configuration/#processors)、および[エクスポーター](https://opentelemetry.io/docs/collector/configuration/#exporters)という用語を使用して、3つの主要な処理段階を示します。レシーバーはデータ収集に使用され、プルベースまたはプッシュベースのいずれかです。プロセッサはメッセージの変換と豊富化を行う機能を提供します。エクスポーターはデータをダウンストリームサービスに送信する責任があります。このサービスは理論上は別のコレクターであることができますが、初期の議論ではすべてのデータが直接ClickHouseに送信されると仮定します。

<img src={observability_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ユーザーには、利用可能な全てのレシーバー、プロセッサ、およびエクスポーターに慣れておくことをお勧めします。

コレクターはログを収集するための主な2つのレシーバーを提供します：

**OTLP経由** - この場合、ログはOpenTelemetry SDKからOTLPプロトコルを介してコレクターに直接送信（プッシュ）されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを利用しており、各言語でのOTLPエクスポーターがローカルなコレクターのエンドポイントを仮定します。この場合、コレクターはOTLPレシーバーで構成されている必要があります - 構成の詳細については上記の[デモを参照](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)。このアプローチの利点は、ログデータが自動的にTrace Idを含むため、ユーザーは特定のログに対するトレースを後で特定できることです。

<img src={observability_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

このアプローチでは、ユーザーは[適切な言語SDK](https://opentelemetry.io/docs/languages/)でコードを計測する必要があります。

- **Filelogレシーバーを介したスクレイピング** - このレシーバーはディスク上のファイルを監視し、ログメッセージを形成し、これらをClickHouseに送信します。このレシーバーは、複数行のメッセージの検出、ログのロールオーバーの処理、再起動に対する堅牢性の確保のためのチェックポイントを扱うなどの複雑なタスクを処理します。また、このレシーバーはDockerおよびKubernetesコンテナのログも監視でき、helmチャートとしてデプロイ可能で、これらから[構造を抽出し](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)ポッドの詳細で豊富にすることができます。

<img src={observability_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

**ほとんどのデプロイメントは、上記のレシーバーを組み合わせて使用します。ユーザーには[コレクタードキュメント](https://opentelemetry.io/docs/collector/)を読み、基本的な概念とともに[構成構造](https://opentelemetry.io/docs/collector/configuration/)および[インストール方法](https://opentelemetry.io/docs/collector/installation/)に慣れておくことをお勧めします。**

:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、構成のバリデーションと可視化に役立ちます。
:::
## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは、構造化または非構造化に分けられます。

構造化ログは、JSONのようなデータフォーマットを利用し、httpコードやソースIPアドレスなどのメタデータフィールドを定義します。

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

非構造化ログは、通常、正規表現パターンを介して抽出可能な内在的な構造を持っているとはいえ、ログを純粋に文字列として表します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DDA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

ユーザーには、可能な限り構造化ロギングを採用し、JSON（すなわちndjson）形式でログを記録することを推奨します。これにより、後でClickHouseに送信する前に[コレクタープロセッサ](https://opentelemetry.io/docs/collector/configuration/#processors)の使用や、挿入時にマテリアライズドビューを利用してログの処理が簡略化されます。構造化ログは、後の処理リソースを節約し、ClickHouseソリューションに必要なCPUを削減します。
### 例 {#example}

例として、構造化（JSON）と非構造化のロギングデータセットを提供します。それぞれ約1000万行にわたります。以下のリンクから入手可能です：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では構造化データセットを使用します。このファイルをダウンロードして解凍することで、以下の例を再現してください。

以下は、ファイルログレシーバーを使用してこれらのファイルをディスクから読み取り、その結果のメッセージを標準出力に出力するOTelコレクターの簡単な構成を示しています。私たちのログは構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルのパスを変更してください。

:::note ClickHouseでの解析を検討する
以下の例は、ログからタイムスタンプを抽出します。これは、全体のログ行をJSON文字列に変換し、その結果を`LogAttributes`に配置する`json_parser`オペレーターの使用を必要とします。これは計算コストが高く、[ClickHouseでより効率的に行うことができます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLでの構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。これを達成するために、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)を使用した同等の非構造化の例は、[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)にあります。
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

ユーザーは[公式の指示](https://opentelemetry.io/docs/collector/installation/)に従ってローカルにコレクターをインストールできます。重要なのは、インストラクションを[contribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)を使用するように変更することです（これには`filelog`レシーバーが含まれています）。例えば、`otelcol_0.102.1_darwin_arm64.tar.gz`ではなく、`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードすることになります。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で確認できます。

インストールが完了したら、OTelコレクターを次のコマンドで実行できます：

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、出力のメッセージは次のようになります：

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

上記はOTelコレクターにより生成された単一のログメッセージを表しています。これらの同じメッセージを後のセクションでClickHouseに取り込みます。

ログメッセージの完全なスキーマ、および他のレシーバーを使用している場合に存在する可能性のある追加カラムは[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で保持されています。**ユーザーにはこのスキーマに慣れ親しむことを強くお勧めします。**

ここでのキーは、ログ行自体が`Body`フィールド内に文字列として保持されている一方で、JSONが`Attributes`フィールドに自動的に抽出されていることです。この同じ[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)が、適切な`Timestamp`カラムにタイムスタンプを抽出するために使用されています。OTelでログを処理するための推奨事項については、[Processing](#processing---filtering-transforming-and-enriching)を参照してください。

:::note オペレーター
オペレーターは、ログ処理の最も基本的な単位です。各オペレーターは、ファイルから行を読み込む、またはフィールドからJSONを解析するなどの単一の責任を果たします。オペレーターはその後、パイプライン内でチェーンされ、望ましい結果を実現します。
:::

上記のメッセージには`TraceID`や`SpanID`フィールドはありません。ユーザーが[分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装している場合など、このフィールドがあれば、上記と同様の手法を使用してJSONから抽出できます。

ローカルまたはKubernetesのログファイルを収集する必要があるユーザーには、[filelogレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)の利用可能な構成オプションや、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)および[複数行ログの解析がどのように処理されるか](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)について理解することをお勧めします。
## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesのログを収集するには、[OpenTelemetryのドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータでログとメトリクスを豊富化するために推奨されます。これにより、動的メタデータ（例：ラベル）が生成され、カラム`ResourceAttributes`に保存される可能性があります。ClickHouseは現在、このカラムに対して`Map(String, String)`タイプを使用しています。[マップの使用](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)に関する詳細は、このタイプの取り扱いと最適化について参照してください。
## トレースの収集 {#collecting-traces}

コードを計測してトレースを収集したいユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことを推奨します。

ClickHouseにイベントを届けるために、ユーザーはOTLPプロトコルを介してトレースイベントを受信するOTelコレクターをデプロイする必要があります。OpenTelemetryデモは、[各サポートされている言語を計測する例](https://opentelemetry.io/docs/demo/)を提供しており、コレクターにイベントを送信します。以下に、stdoutに出力される適切なコレクター構成の例を示します：
### 例 {#example-1}

トレースはOTLP経由で受信する必要があるため、私たちはトレースデータを生成する[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用します。インストールについては[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の構成は、OTLPレシーバーでトレースイベントを受信し、それらをstdoutに送信します。

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

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

次のコマンドでこの構成を実行します：

```bash
./otelcol-contrib --config config-traces.yaml
```

トレースイベントは`telemetrygen`を介してコレクターに送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、以下のようなトレースメッセージがstdoutに出力されます：

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

上記はOTelコレクターによって生成された単一のトレースメッセージを表しています。これらの同じメッセージを後のセクションでClickHouseに取り込みます。

トレースメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)で維持されています。ユーザーにはこのスキーマに慣れ親しむことを強くお勧めします。
## 処理 - フィルタリング、変換、豊富化 {#processing---filtering-transforming-and-enriching}

ログイベントのタイムスタンプを設定する以前の例に示されるように、ユーザーは必然的にイベントメッセージをフィルタリング、変換、豊富化したいと思うでしょう。これは、OpenTelemetryのさまざまな機能を使用して実現できます：

- **プロセッサ** - プロセッサは、[レシーバーによって収集されたデータを修正または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポーターに送信する前に処理します。プロセッサは、コレクターの構成の`processors`セクションで構成された順序で適用されます。これらはオプションですが、最小セットは[一般的に推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseでOTelコレクターを使用する場合、プロセッサは以下に制限することをお勧めします：

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)を使用して、コレクター上のメモリ不足の状況を防ぎます。リソースの見積もりについては[Estimating Resources](#estimating-resources)を参照してください。
    - コンテキストに基づいて豊富化を行うプロセッサ。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータでスパン、メトリクス、ログリソース属性を自動的に設定することができます。これにより、イベントにそのソースポッドIDが付加されます。
    - 必要に応じて、トレースに対する[TailまたはHeadサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
    - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター（下記参照）を通じて不要なイベントを削除します。
    - ClickHouseで作業する場合に必須である[バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor)。ClickHouseにデータをバッチで送信することを確認します。詳細は["ClickHouseへのエクスポート"](#exporting-to-clickhouse)。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバーで利用可能な最も基本的な処理単位を提供します。基本的な解析がサポートされ、SeverityやTimestampなどのフィールドを設定できます。ここでは、JSONや正規表現解析とイベントフィルタリング、基本的な変換がサポートされています。イベントフィルタリングはここで行うことをお勧めします。

ユーザーには、オペレーターや[変換プロセッサ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用して過剰なイベント処理を行わないことをお勧めします。これには、特にJSON解析でかなりのメモリとCPUオーバーヘッドが発生する可能性があります。挿入時にマテリアライズドビューとカラムでClickHouseで全ての処理を行うことが可能ですが、特定の例外として、コンテキストに基づく豊富化（例：k8sメタデータの追加）があることに注意してください。詳細は[SQLでの構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う場合、ゲートウェイインスタンスで変換を行い、エージェントインスタンスでの作業を最小限に抑えることをお勧めします。これにより、サーバー上で実行されるエッジのエージェントが必要とするリソースを可能な限り最小限に抑えます。一般的に、ユーザーはフィルタリング（不必要なネットワーク使用を最小化するため）、タイムスタンプ設定（オペレーターを介して）、およびコンテキストを必要とする豊富化を行っているのが一般的です。たとえば、ゲートウェイインスタンスが異なるKubernetesクラスタに存在する場合、k8sの豊富化はエージェントで行う必要があります。
### 例 {#example-2}

以下の構成は、非構造化ログファイルの収集を示しています。ログ行から構造を抽出するためにオペレーター（`regex_parser`）とイベントをフィルタリングするための用途、またイベントをバッチ処理し、メモリ使用量を制限するためのプロセッサを使用しています。

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

エクスポーターは、1つ以上のバックエンドまたは宛先にデータを送信します。エクスポーターはプルまたはプッシュベースのものがあります。ClickHouseにイベントを送信するには、ユーザーはプッシュベースの[ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribを使用
ClickHouseエクスポーターは、コアディストリビューションではなく、[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部です。ユーザーは、contribディストリビューションを使用するか、[独自のコレクターをビルド](https://opentelemetry.io/docs/collector/custom-collector/)することができます。
:::

完全な設定ファイルは以下の通りです。

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

以下の主要設定に注意してください。

- **pipelines** - 上記の設定は、ログとトレースのための受信者、プロセッサー、エクスポーターのセットを構成する[パイプライン](https://opentelemetry.io/docs/collector/configuration/#pipelines)の使用を強調しています。 
- **endpoint** - ClickHouseとの通信は、`endpoint`パラメーターを介して構成されます。接続文字列`tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`は、TCPを介って通信を行います。ユーザーがトラフィックスイッチの理由でHTTPを好む場合、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)のように修正してください。ユーザー名とパスワードをこの接続文字列内で指定する能力を持つ完全な接続詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**重要:** 上記の接続文字列は、圧縮（lz4）と非同期挿入の両方を有効にします。この両方は常に有効にすることをお勧めします。非同期挿入の詳細については、[バッチ処理](#batching)を参照してください。圧縮は常に指定されるべきであり、エクスポーターの古いバージョンではデフォルトで有効にはなりません。

- **ttl** - ここでの値はデータが保持される期間を決定します。「データの管理」に関するさらなる詳細があります。これは、72hのように時間単位で指定する必要があります。以下の例では、データが2019年のもので即座にClickHouseによって削除されるため、TTLを無効にします。 
- **traces_table_name**および **logs_table_name** - ログとトレースのテーブルの名前を決定します。
- **create_schema** - スタートアップ時にテーブルがデフォルトのスキーマで作成されるかどうかを決定します。始めるためのデフォルトはtrueです。ユーザーはこれをfalseに設定し、独自のスキーマを定義する必要があります。
- **database** - 目標データベース。
- **retry_on_failure** - 失敗したバッチが再試行されるべきかどうかを決定する設定です。
- **batch** - バッチプロセッサは、イベントがバッチとして送信されることを保証します。5秒のタイムアウトで、約5000行を推奨します。どちらか一方が最初に到達した場合、バッチがエクスポーターにフラッシュされます。これらの値を下げることで、低遅延のパイプラインを実現でき、より早くクエリ可能なデータが利用可能になりますが、ClickHouseへの接続数と送信されるバッチが増えることになります。非推奨ですので、ユーザーが[非同期挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用していない場合、ClickHouseでの[パーツが多すぎる](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)問題を引き起こす可能性があります。逆に、ユーザーが非同期挿入を使用している場合、クエリ可能なデータの可用性は非同期挿入設定にも依存しますが、接続からのデータはすぐにフラッシュされます。詳細は[バッチ処理](#batching)を参照してください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各アイテムにはバッチが含まれています。ClickHouseに到達できない場合など、このキューが超過された場合、バッチはドロップされます。 

ユーザーが構造化されたログファイルを抽出し、[ローカルインスタンスのClickHouse](/install)を実行している場合（デフォルトの認証を使用）、ユーザーはこの設定を以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、次のコマンドを`telemetrygen`ツールを使って実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中は、単純なクエリでログイベントが存在することを確認してください：

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

デフォルトでは、ClickHouseエクスポーターは、ログとトレースの両方に対してターゲットログテーブルを作成します。これは、`create_schema`設定を介して無効にすることができます。さらに、ログとトレーステーブルの名前は、上記の設定を通じてデフォルトの`otel_logs`および`otel_traces`から変更することができます。

:::note 
以下のスキーマでは、TTLが72hとして有効であると仮定します。
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

ここでのカラムは、[ここ](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で文書化されたOTel公式仕様のログに対応しています。

このスキーマに関する重要な点がいくつかあります：

- デフォルトでは、テーブルは`PARTITION BY toDate(Timestamp)`を介して日付でパーティションを分けられます。これにより、期限切れデータを効率的に削除できます。
- TTLは`TTL toDateTime(Timestamp) + toIntervalDay(3)`を介して設定され、コレクター設定で設定された値に対応しています。[`ttl_only_drop_parts=1`](/operations/settings/settings#ttl_only_drop_parts)は、全ての含まれる行が期限切れになったときにのみパーツ全体がドロップされることを意味します。これは、行の削除を伴う高コストな操作よりも効率的です。常にこれを設定することをお勧めします。詳細は[TTLによるデータ管理](/observability/managing-data#data-management-with-ttl-time-to-live)を参照してください。
- テーブルは古典的な[`MergeTree`エンジン](/engines/table-engines/mergetree-family/mergetree)を使用しています。これはログとトレースに推奨され、変更する必要はありません。
- テーブルは`ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`で順序付けられています。これにより、`ServiceName`、`SeverityText`、`Timestamp`、および`TraceId`のフィルタリングに最適化されたクエリが生成されます - リスト内の早いカラムでフィルタリングすると、遅いカラムよりも速くなります。例えば、`ServiceName`でのフィルタリングは、`TraceId`でのフィルタリングよりもはるかに高速です。ユーザーは、予想されるアクセスパターンに応じてこの順序を変更する必要があります - [主キーの選択](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)を参照してください。
- 上記のスキーマでは、カラムに`ZSTD(1)`が適用されています。これは、ログ用の最適な圧縮を提供します。ユーザーは、圧縮を改善するためにZSTD圧縮レベル（デフォルトの1以上）を上げることができますが、これはほとんどの場合、有益ではありません。この値を上げることで、挿入時のCPU負荷が増加しますが、デコンプレッション（したがってクエリ）は同程度のパフォーマンスを維持します。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照してください。追加の[デルタエンコード](/sql-reference/statements/create/table#delta)がTimestampに適用され、ディスク上のサイズを減少させることを目指しています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、および[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope)がマップであることに注意してください。ユーザーはこれらの違いに精通する必要があります。これらのマップにアクセスし、キーへのアクセスを最適化する方法は、[マップの使用](/use-cases/observability/integrating-opentelemetry.md)を参照してください。
- 他のほとんどのタイプ（例えば`ServiceName`としてLowCardinality）は最適化されています。ただし、Bodyは、私たちの例のログではJSONですが、Stringとして保存されています。
- マップのキーと値、ならびにBodyカラムにはブームフィルターが適用されています。これにより、これらのカラムへのクエリ時間が改善されますが、通常は必要ありません。[セカンダリ/データスキッピングインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices)を参照してください。

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

これも、[ここ](https://opentelemetry.io/docs/specs/otel/trace/api/)で文書化されたOTel公式仕様のトレースに関するカラムに対応します。このスキーマは、上記のログスキーマと多くの同じ設定を適用し、スパンに特有の追加のリンクカラムを持っています。

私たちは、ユーザーが自動スキーマ作成を無効にし、手動でテーブルを作成することを推奨します。これにより、主キーやセカンダリキーを修正することができ、クエリパフォーマンスを最適化するための追加カラムを導入する機会も得られます。詳細は[スキーマ設計](/use-cases/observability/schema-design)を参照してください。
## 挿入の最適化 {#optimizing-inserts}

コレクターを介してClickHouseに観測データを挿入する際に、高い挿入パフォーマンスを達成しつつ強力な整合性保証を得るためには、ユーザーは単純なルールに従う必要があります。OTelコレクターの正しい構成により、以下のルールは簡単に遵守できます。これにより、ユーザーがClickHouseを初めて使用する際に遭遇する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を回避できます。
### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信された各挿入は、挿入からデータを含む格納パーツを直ちに作成することを引き起こします。他のメタデータも保存される必要があります。したがって、少量のデータを含む多くの挿入を送信するのではなく、より多くのデータを含む少量の挿入を送信することで、必要な書き込み回数を減らすことができます。私たちは、少なくとも1,000行を含むかなり大きなバッチでデータを挿入することを推奨します。さらなる詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouseへの挿入は同期的で、同一であれば冪等性があります。マージツリーエンジンファミリーのテーブルに対して、ClickHouseはデフォルトで自動的に[挿入の重複を排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)します。これは、以下のようなケースにおいて挿入が許容されることを意味します：

- （1）データを受け取るノードに問題がある場合、挿入クエリはタイムアウトし（またはより具体的なエラーが発生し）、確認を受け取ることができません。
- （2）データがノードに書き込まれたが、ネットワークの中断により確認がクエリ送信者に返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの観点から見ると、（1）と（2）は区別が難しい場合があります。しかし、どちらのケースでも、未確認の挿入はすぐに再試行することができます。再試行された挿入クエリが同じデータを同じ順序で含んでいる限り、ClickHouseは（未確認の）元の挿入が成功している場合、再試行された挿入を自動的に無視します。

私たちは、上記の要件を満たすために、前に示した[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用することをお勧めします。これにより、挿入が一貫した行のバッチとして送信されることが保証されます。コレクターに高いスループット（毎秒イベント）が期待され、各挿入に対して少なくとも5000イベントを送信できる場合、通常はこれがパイプラインで必要な唯一のバッチ処理です。この場合、コレクターはバッチプロセッサの`timeout`が到達する前にバッチをフラッシュし、パイプラインのエンドツーエンドの遅延を低く保ち、バッチが一貫したサイズになることを保証します。
### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、ユーザーはコレクターのスループットが低い場合に小さなバッチの送信を強いられますが、依然としてデータがClickHouseに届く最小のエンドツーエンドの遅延が期待されます。この場合、バッチ処理者の`timeout`が切れると小さなバッチが送信されます。これが問題を引き起こす可能性があり、非同期挿入が必要となります。このケースは、**エージェントロールのコレクターがClickHouseに直接送信するように設定されている場合**によく見られます。ゲートウェイが集約器として機能することで、この問題を軽減することができます - [ゲートウェイによるスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチが保証できない場合、ユーザーは[非同期挿入](/cloud/bestpractices/asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。非同期挿入により、データは最初にバッファに挿入され、その後データベースストレージに書き込まれます。

<img src={observability_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

[非同期挿入を有効化](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)すると、ClickHouseが①挿入クエリを受け取ると、クエリのデータが②最初にインメモリバッファに書き込まれます。次に③バッファのフラッシュが発生すると、バッファのデータが[並べ替えられ](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、データベースストレージにパートとして書き込まれます。注意すべき点は、データがデータベースストレージにフラッシュされる前にクエリで検索できないことです。バッファのフラッシュは[構成可能](https://optimize/asynchronous-inserts)です。

コレクターで非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。ユーザーには、配信保証を得るために`wait_for_async_insert=1`（デフォルト）を使用することをお勧めします - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期挿入からのデータは、ClickHouseバッファがフラッシュされたときに挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async-insert-max-data-size)を超えたときや、最初のINSERTクエリから[`async_insert_busy_timeout_ms`](/operations/settings/settings#async-insert-busy-timeout-ms)ミリ秒後に発生します。`async_insert_stale_timeout_ms`がゼロ以外の値に設定されている場合、前のクエリから`async_insert_stale_timeout_msミリ秒`経過後にデータが挿入されます。ユーザーはこれらの設定を調整して、パイプラインのエンドツーエンドの遅延を制御できます。バッファのフラッシュを調整するために使用できるさらなる設定は[こちら](https://operations/settings/settings#asynchronous-insert-settings)で文書化されています。一般的に、デフォルト設定が適切です。

:::note 適応型非同期挿入を考慮する
エージェントの数が少なく、スループットが低いが、厳しいエンドツーエンドの遅延要件がある場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が有用です。一般に、これはClickHouseの観測ユースケースの高スループットには適用できません。
:::

最後に、非同期挿入を使用する際にClickHouseへの同期挿入に関連する以前の重複排除の動作は、デフォルトでは有効になりません。必要な場合は、設定[`async_insert_deduplicate`](/operations/settings/settings#async-insert-deduplicate)を参照してください。

この機能の構成に関する完全な詳細は[こちら](https://optimize/asynchronous-inserts#enabling-asynchronous-inserts)で見つけることができ、[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)でより詳しい説明があります。
## デプロイメントアーキテクチャ {#deployment-architectures}

OTelコレクターをClickHouseと共に使用する際に、いくつかのデプロイメントアーキテクチャが可能です。各アーキテクチャと、その適用が考えられる状況について説明します。
### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクターをエッジにエージェントとして展開します。これらは、ローカルアプリケーション（例えば、サイドカーコンテナとして）からト 레ースを受け取り、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントはそれぞれのデータを直接ClickHouseに送信します。

<img src={observability_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。その主な利点は、追加のハードウェアを必要とせず、ClickHouseの観測ソリューションが最小のリソースフットプリントで保たれ、アプリケーションとコレクターとの間のシンプルなマッピングが行われることです。

ユーザーは、エージェントの数が数百を超えた場合は、ゲートウェイベースのアーキテクチャに移行することを検討すべきです。このアーキテクチャには、スケールアップを困難にするいくつかの欠点があります：

- **接続のスケーリング** - 各エージェントはClickHouseに接続を確立します。ClickHouseは同時挿入接続を数百（場合によっては数千）維持することができますが、最終的にはこれが制限要因となり、挿入が非効率的になります。すなわち、ClickHouseが接続を維持するためにより多くのリソースを使用します。ゲートウェイを使用することで、接続の数を最小限に抑え、挿入をより効率的にします。
- **エッジでの処理** - このアーキテクチャでは、エッジまたはClickHouseで任意の変換やイベント処理を実行する必要があります。制約があるだけでなく、これにより複雑なClickHouseマテリアライズドビューが必要になるか、重要なサービスが影響を受け、リソースが不足するエッジに大きな計算が押し出される可能性があります。
- **小さなバッチと遅延** - エージェントコレクターは、個々に非常に少ないイベントを収集する可能性があります。これは通常、配信SLAを満たすために設定されたインターバルでフラッシュする必要があることを意味します。これが、コレクターがClickHouseに小さなバッチを送信することにつながります。これには欠点がありますが、非同期挿入を使用することで軽減できます - [挿入の最適化](#optimizing-inserts)を参照してください。
```

### ゲートウェイを使用したスケーリング {#scaling-with-gateways}

OTelコレクターは、上記の制限に対処するためにゲートウェイインスタンスとして展開できます。これらは通常、データセンターまたはリージョンごとにスタンドアロンサービスを提供します。これらは、アプリケーション（またはエージェント役の他のコレクター）から単一のOTLPエンドポイントを介してイベントを受信します。通常、一連のゲートウェイインスタンスが展開され、アウトオブボックスのロードバランサーを使用して負荷を分散します。

<img src={observability_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

このアーキテクチャの目的は、エージェントから計算集約型の処理をオフロードし、リソース使用量を最小限に抑えることです。これらのゲートウェイは、エージェントが実行する必要がある変換タスクを実行できます。さらに、多くのエージェントからイベントを集約することにより、ゲートウェイは大きなバッチをClickHouseに送信できるため、効率的な挿入を可能にします。これらのゲートウェイコレクターは、エージェントが追加され、イベントスループットが増加するにつれて簡単にスケーリングできます。以下に、例の構造化ログファイルを消費する関連するエージェント構成とともに、例のゲートウェイ構成を示します。エージェントとゲートウェイ間の通信にはOTLPが使用されます。

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
      insecure: true # セキュアな接続を使用している場合はfalseに設定してください
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホストで動作する2つのコレクターがあるため修正
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

これらの構成は、以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、一連のコレクターを管理する際のコストとオーバーヘッドです。

ゲートウェイベースのアーキテクチャを管理する際の学習を含む例については、こちらの[ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)をお勧めします。

### Kafkaの追加 {#adding-kafka}

読者は、上記のアーキテクチャがメッセージキューとしてKafkaを使用していないことに気付くかもしれません。

メッセージバッファとしてKafkaキューを使用するのは、ロギングアーキテクチャで見られる一般的なデザインパターンで、ELKスタックによって普及しました。これにはいくつかの利点があります。特に、より強力なメッセージ配信保証を提供し、バックプレッシャーの管理に役立ちます。メッセージはコレクションエージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスタ化されたKafkaインスタンスは高いスループットのメッセージバッファを提供するはずです。これは、メッセージを解析して処理するよりも、データを線形にディスクに書き込む方が計算オーバーヘッドが少ないためです。たとえばElasticでは、トークン化とインデックス作成にかなりのオーバーヘッドが発生します。エージェントからデータを移動させることで、ソースでのログローテーションの結果としてメッセージを失うリスクも減少します。最後に、一部のユースケースにとって魅力的かもしれないメッセージの再送信およびクロスリージョンレプリケーション機能も提供します。

ただし、ClickHouseはデータを非常に迅速に挿入でき、適度なハードウェアで毎秒数百万の行を処理できます。ClickHouseからのバックプレッシャーは**稀**です。Kafkaキューを利用することは、しばしばアーキテクチャの複雑性とコストを増加させることになります。ログに銀行トランザクションやその他のミッションクリティカルなデータと同じ配信保証が必要ではないという原則を受け入れることができれば、Kafkaの複雑さを避けることをお勧めします。

ただし、高い配送保証やデータの再送信（複数のソースに対して）の能力が必要な場合、Kafkaは有用なアーキテクチャの追加となるでしょう。

<img src={observability_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

この場合、OTelエージェントは[Kafkaエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)を介してデータをKafkaに送信するように構成できます。ゲートウェイインスタンスは、その後、[Kafkaレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。詳細については、ConfluentおよびOTelのドキュメントをお勧めします。

### リソースの見積もり {#estimating-resources}

OTelコレクターのリソース要件は、イベントのスループット、メッセージのサイズ、および実行される処理の量に依存します。OpenTelemetryプロジェクトは、[リソース要件を見積もるためにユーザーが使用できるベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を維持しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3コアおよび12GBのRAMを持つゲートウェイインスタンスは、毎秒約60,000のイベントを処理できます。これは、フィールドの名前変更を担当する最小限の処理パイプラインを前提としています。

イベントをゲートウェイに送信するエージェントインスタンスについては、イベントにタイムスタンプを設定するだけで、ユーザーは予想される毎秒のログに基づいてサイズを決定することをお勧めします。以下は、ユーザーが出発点として使用できるおおよその数値を示しています：

| ログ記録レート | コレクターエージェントのリソース |
|--------------|------------------------------|
| 1k/秒     | 0.2CPU, 0.2GiB              |
| 5k/秒     | 0.5 CPU, 0.5GiB             |
| 10k/秒    | 1 CPU, 1GiB                 |
```
