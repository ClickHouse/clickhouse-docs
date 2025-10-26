---
'title': 'OpenTelemetryの統合'
'description': 'ObservabilityのためにOpenTelemetryとClickHouseを統合する'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'Observability'
- 'OpenTelemetry'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# OpenTelemetryによるデータ収集の統合

任意の可観測性ソリューションには、ログやトレースを収集し、エクスポートする手段が必要です。この目的のために、ClickHouseは[OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/)を推奨します。

「OpenTelemetryは、トレース、メトリクス、ログなどのテレメトリデータを作成し、管理するために設計された可観測性フレームワークおよびツールキットです。」

ClickHouseやPrometheusとは異なり、OpenTelemetryは可観測性バックエンドではなく、テレメトリデータの生成、収集、管理、エクスポートに焦点を当てています。OpenTelemetryの初期の目標は、ユーザーが言語特有のSDKを使用してアプリケーションやシステムを容易に計装できるようにすることでしたが、現在はOpenTelemetryコレクターを通じてログの収集も含まれるようになりました。これは、テレメトリデータを受信、処理し、エクスポートするエージェントまたはプロキシです。

## ClickHouse関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetryは多くのコンポーネントから成り立っています。データおよびAPIの仕様、標準化されたプロトコル、フィールド/カラムの命名規則を提供することに加えて、OTelはClickHouseでの可観測性ソリューションの構築に不可欠な2つの機能を提供します。

- [OpenTelemetryコレクター](https://opentelemetry.io/docs/collector/)は、テレメトリデータを受信、処理、エクスポートするプロキシです。ClickHouseを利用したソリューションは、ログ収集とイベント処理の両方にこのコンポーネントを使用します。
- テレメトリデータの仕様、API、エクスポートを実装する[言語SDK](https://opentelemetry.io/docs/languages/)です。これらのSDKは、アプリケーションのコード内でトレースが正しく記録されることを保証し、構成要素スパンを生成し、メタデータを介してサービス間でコンテキストが伝播されることを確実にすることで、分散トレースを形成し、スパンが相関できるようにします。これらのSDKは、ユーザーがコードを変更する必要がなく、即時計装を得られるようにする一般的なライブラリやフレームワークを自動的に実装するエコシステムによって補完されています。

ClickHouseを利用した可観測性ソリューションは、これらのツールの両方を活用します。

## ディストリビューション {#distributions}

OpenTelemetryコレクターには[複数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouseソリューションに必要なfilelogレシーバーとClickHouseエクスポーターは、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)にのみ存在します。

このディストリビューションには多くのコンポーネントが含まれており、ユーザーがさまざまな構成を試すことを可能にします。ただし、運用時には、環境に必要なコンポーネントのみを含むようコレクターを制限することをお勧めします。これにはいくつかの理由があります：

- コレクターのサイズを減らすことで、コレクターのデプロイメント時間を短縮します。
- 利用可能な攻撃対象範囲を減らすことで、コレクターのセキュリティを向上させます。

[カスタムコレクター](https://opentelemetry.io/docs/collector/custom-collector/)は、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用して作成できます。

## OTelによるデータの取り込み {#ingesting-data-with-otel}

### コレクター展開の役割 {#collector-deployment-roles}

ログを収集し、ClickHouseに挿入するために、OpenTelemetryコレクターの使用をお勧めします。OpenTelemetryコレクターは、主に2つの役割で展開できます：

- **エージェント** - エージェントインスタンスは、サーバーやKubernetesノードなどのエッジでデータを収集するか、OpenTelemetry SDKで計装されたアプリケーションからイベントを直接受信します。この場合、エージェントインスタンスはアプリケーションと共に、またはアプリケーションと同じホスト上（サイドカーやDaemonSetなど）で実行されます。エージェントは、データを直接ClickHouseに送信するか、ゲートウェイインスタンスに送信することができます。前者の場合、これは[エージェント展開パターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼ばれます。
- **ゲートウェイ** - ゲートウェイインスタンスは、通常はクラスターごと、データセンターごと、またはリージョンごとのスタンドアロンサービス（Kubernetesのデプロイメントなど）を提供します。これらは、OTLPエンドポイントを介してアプリケーション（またはエージェントとして別のコレクター）からのイベントを受信します。通常、負荷を分散させるために、アウトオブボックスの負荷分散機能を使用されるゲートウェイインスタンスのセットが展開されます。すべてのエージェントとアプリケーションがこの単一エンドポイントに信号を送信する場合、これは[ゲートウェイ展開パターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ばれることがよくあります。

以下では、シンプルなエージェントコレクターがイベントを直接ClickHouseに送信することを前提とします。ゲートウェイの使用と、その適用時期についての詳細は[ゲートウェイでのスケーリング](#scaling-with-gateways)を参照してください。

### ログの収集 {#collecting-logs}

コレクターを使用する主な利点は、サービスがデータを迅速にオフロードできることです。これにより、コレクターが再試行、バッチ処理、暗号化、さらには機密データのフィルタリングなどの追加処理を担当します。

コレクターは、[レシーバ](https://opentelemetry.io/docs/collector/configuration/#receivers)、[プロセッサ](https://opentelemetry.io/docs/collector/configuration/#processors)、および[エクスポータ](https://opentelemetry.io/docs/collector/configuration/#exporters)という3つの主要な処理段階の用語を使用します。レシーバはデータ収集に使用され、プル方式またはプッシュ方式のいずれかです。プロセッサはメッセージの変換や強化機能を提供します。エクスポータは、受信したデータを下流のサービスに送信する役割を担っています。このサービスは理論的には別のコレクターでも可能ですが、以下の初期の議論では、すべてのデータが直接ClickHouseに送信されると仮定します。

<Image img={observability_3} alt="ログの収集" size="md"/>

ユーザーが受信者、プロセッサ、エクスポータの完全なセットに慣れることをお勧めします。

コレクターは、ログを収集するための主に2つのレシーバを提供します：

**OTLPを介して** - この場合、ログはOpenTelemetry SDKからOTLPプロトコルを介してコレクターに直接送信されます。[OpenTelemetryデモ](https://opentelemetry.io/docs/demo/)はこのアプローチを採用しており、各言語のOTLPエクスポータはローカルコレクターエンドポイントを仮定します。この場合、コレクターはOTLPレシーバで構成する必要があります。上記の[デモの構成](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)を参照してください。このアプローチの利点は、ログデータが自動的にトレースIDを含むことであり、ユーザーは後で特定のログに対するトレースを識別できるようになります。

<Image img={observability_4} alt="OTLPを介したログの収集" size="md"/>

このアプローチでは、ユーザーが[適切な言語SDK](https://opentelemetry.io/docs/languages/)でコードを計装する必要があります。

- **Filelogレシーバ経由のスクレイピング** - このレシーバは、ディスク上のファイルを追跡し、ログメッセージを形成し、それをClickHouseに送信します。このレシーバは、複数行メッセージの検出、ログのロールオーバーの処理、再起動に対する堅牢性のためのチェックポイント、および構造の抽出などの複雑なタスクを処理します。このレシーバは、DockerおよびKubernetesコンテナのログを追跡することもでき、helmチャートとして展開可能で、これらから[構造を抽出し](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)、ポッドの詳細でそれを強化することができます。

<Image img={observability_5} alt="Filelogレシーバ" size="md"/>

**ほとんどの展開では、上記のレシーバを組み合わせて使用します。ユーザーは、[コレクターのドキュメント](https://opentelemetry.io/docs/collector/)を読み、基本概念や[構成構造](https://opentelemetry.io/docs/collector/configuration/)および[インストール方法](https://opentelemetry.io/docs/collector/installation/)について理解を深めることをお勧めします。**

:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)は、構成を検証し、可視化するのに役立ちます。
:::

## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは構造化されているか非構造化されています。

構造化ログは、JSONのようなデータ形式を使用し、HTTPコードやソースIPアドレスなどのメタデータフィールドを定義します。

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

非構造化ログは、通常、正規表現パターンを介して抽出可能な固有の構造を持ちながら、ログを純粋に文字列として表現します。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

ユーザーには、可能な限り構造化ログとJSON形式（つまり、ndjson）でログを記録することをお勧めします。これは、後でClickHouseに送信する前に[コレクタープロセッサ](https://opentelemetry.io/docs/collector/configuration/#processors)を使用してログを処理する際、もしくは挿入時にマテリアライズドビューを使用する際に、必要なログの処理を簡素化します。構造化ログは、最終的に後の処理リソースを節約し、ClickHouseソリューションで必要なCPUを削減します。

### 例 {#example}

例のために、構造化（JSON）ログと非構造化ログのデータセットを各約10M行で提供します。以下のリンクから入手できます：

- [非構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [構造化](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例には構造化データセットを使用します。次の例を再現するために、このファイルがダウンロードされ、抽出されていることを確認してください。

以下は、OTelコレクターがこれらのファイルをディスクから読み取り、filelogレシーバを使用して、結果のメッセージをstdoutに出力するためのシンプルな構成を示しています。私たちのログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md)オペレーターを使用します。access-structured.logファイルのパスを変更してください。

:::note ClickHouseでの解析を検討
以下の例では、ログからタイムスタンプを抽出します。これは、全体のログ行をJSON文字列に変換し、その結果を`LogAttributes`に配置する`json_parser`オペレーターの使用を必要とします。これは計算的に高価になる可能性があり、[ClickHouseではより効率的に行えます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQLでの構造抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。等価な非構造化の例は、`[regex_parser](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)`を使用してこれを実現するものが[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)で見つかります。
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

ユーザーは、[公式の指示](https://opentelemetry.io/docs/collector/installation/)に従って、ローカルにコレクターをインストールできます。重要なのは、指示を[Contribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)を使用するように変更することです（`filelog`レシーバを含みます）。たとえば、`otelcol_0.102.1_darwin_arm64.tar.gz`の代わりにユーザーは`otelcol-contrib_0.102.1_darwin_arm64.tar.gz`をダウンロードする必要があります。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)で見つけることができます。

インストール後、OTelコレクターは以下のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用していると仮定すると、メッセージは以下の形式になります：

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

上記はOTelコレクターが生成した単一のログメッセージを表しています。これらのメッセージは、後のセクションでClickHouseに取り込まれます。

ログメッセージの完全なスキーマは、他のレシーバを使用する場合に存在する可能性のある追加カラムとともに、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)に保たれています。**ユーザーはこのスキーマに慣れることを強くお勧めします。**

ここでの重要な点は、ログ行自体が`Body`フィールド内に文字列として保持されますが、JSONは`Attributes`フィールドに自動抽出されていることです。この同じ[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)が、適切な`Timestamp`カラムにタイムスタンプを抽出するために使用されています。OTelによるログ処理の推奨事項については、[処理](#processing---filtering-transforming-and-enriching)を参照してください。

:::note オペレーター
オペレーターは、ログ処理の最も基本的な単位です。各オペレーターは、ファイルから行を読み取る、またはフィールドからJSONを解析するなど、単一の責任を果たします。その後、オペレーターはパイプラインでチェーンして、所望の結果を達成します。
:::

上記のメッセージには`TraceID`や`SpanID`フィールドがありません。ユーザーが[分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装している場合など、これらが存在する場合は、上記と同様の手法でJSONから抽出できます。

ローカルまたはKubernetesのログファイルを収集する必要のあるユーザーには、[filelogレシーバ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)の利用可能な構成オプションや、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)および[マルチラインログ解析の取扱い](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)についても理解することをお勧めします。

## Kubernetesログの収集 {#collecting-kubernetes-logs}

Kubernetesログの収集には、[OpenTelemetryのドキュメントガイド](https://opentelemetry.io/docs/kubernetes/)を推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)は、ポッドメタデータでログとメトリクスを強化するために推奨されます。これにより、ラベルなどの動的メタデータが生成され、`ResourceAttributes`カラムに保存される可能性があります。ClickHouseは現在、このカラムに対して`Map(String, String)`型を使用しています。マップの取り扱いおよび最適化の詳細については、[マップの使用](/use-cases/observability/schema-design#using-maps)および[マップからの抽出](/use-cases/observability/schema-design#extracting-from-maps)を参照してください。

## トレースの収集 {#collecting-traces}

コードを計装してトレースを収集したいユーザーには、公式の[OTelドキュメント](https://opentelemetry.io/docs/languages/)に従うことをお勧めします。

ClickHouseにイベントを配信するには、適切なレシーバ経由でOTLPプロトコルを通じてトレースイベントを受信するOTelコレクターを展開する必要があります。OpenTelemetryデモは、[サポートされている各言語の計装例](https://opentelemetry.io/docs/demo/)を提供し、イベントをコレクターに送信します。以下の構成例は、イベントをstdoutに出力するための適切なコレクター構成を示しています。

### 例 {#example-1}

トレースはOTLP経由で受信する必要があるため、[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)ツールを使用してトレースデータを生成します。インストール手順は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)を参照してください。

以下の構成は、OTLPレシーバでトレースイベントを受信し、stdoutに送信します。

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

以下のコマンドを使用してこの構成を実行します：

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen`を使用してコレクターにトレースイベントを送信します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、以下のようなトレースメッセージがstdoutに出力されます：

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

上記はOTelコレクターによって生成された単一のトレースメッセージを表しています。これらのメッセージは、後のセクションでClickHouseに取り込まれます。

トレースメッセージの完全なスキーマは、[こちら](https://opentelemetry.io/docs/concepts/signals/traces/)に保たれています。ユーザーはこのスキーマに慣れることを強くお勧めします。

## 処理 - フィルタリング、変換、強化 {#processing---filtering-transforming-and-enriching}

前述のログイベントのタイムスタンプを設定する例で示されたように、ユーザーは必然的にイベントメッセージをフィルタリング、変換、強化したいと考えます。これは、OpenTelemetryのいくつかの機能を使用して実現できます：

- **プロセッサ** - プロセッサは[レシーバによって収集されたデータを修正または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)し、エクスポータに送信します。プロセッサは、コレクターの構成の`processors`セクションで設定された順序で適用されます。これらはオプションですが、最小限のセットは[通常推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseを使用するOTelコレクターを使用する際は、プロセッサの制限をお勧めします：

  - `memory_limiter`(https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターでメモリ不足の状況を防ぐために使用されます。推奨事項については[リソースの見積もり](#estimating-resources)を参照してください。
  - コンテキストに基づいて強化を行うプロセッサ。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータによってスパン、メトリクス、ログリソース属性を自動的に設定できるスパンでイベントを強化します。
  - 必要に応じてトレース用の[テールまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター（以下参照）を介してこれができない場合に必要ないイベントを削除します。
  - [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseで作業する際にイベントがバッチとして送信されることを確認するために重要です。["ClickHouseへのエクスポート"](#exporting-to-clickhouse)を参照してください。
  
- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバで利用できる最も基本的な処理単位を提供します。基本的な解析がサポートされており、重要度やタイムスタンプなどのフィールドを設定できます。ここではJSONおよび正規表現解析がサポートされ、イベントのフィルタリングや基本的な変換が可能です。ここでイベントフィルタリングを行うことを推奨します。

ユーザーは、オペレーターや[変換プロセッサ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用して過度なイベント処理を行わないことを推奨します。これは、特にJSON解析時にかなりのメモリおよびCPUオーバーヘッドを引き起こす可能性があります。特定の例外を除き、マテリアライズドビューやカラムでClickHouseで挿入時にすべての処理を行うことが可能です - 特に、k8sメタデータの追加などのコンテキスト認識の強化が必要です。詳細については、[SQLでの構造抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

OTelコレクターを使用して処理を行う場合、ゲートウェイインスタンスで変換を行い、エージェントインスタンスでの作業を最小限に抑えることをお勧めします。これにより、サーバー上で動作するエッジのエージェントが必要とするリソースを可能な限り最小限に抑えることができます。通常、ユーザーはフィルタリング（不必要なネットワーク使用を最小限に抑えるため）、タイムスタンプ設定（オペレーターを介して）、コンテキストを必要とする強化をエージェントで実行します。たとえば、ゲートウェイインスタンスが異なるKubernetesクラスターに居住する場合、k8sの強化はエージェント内で発生する必要があります。

### 例 {#example-2}

以下の構成は、非構造化ログファイルの収集を示しています。ログ行から構造を抽出するためのオペレーター（`regex_parser`）とイベントをフィルタリングし、イベントをバッチ化およびメモリ使用量を制限するためのプロセッサの使用に注意してください。

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

エクスポータは、1つ以上のバックエンドまたは宛先にデータを送信します。エクスポータはプルまたはプッシュ方式にできます。ClickHouseにイベントを送信するには、プッシュベースの[ClickHouseエクスポータ](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)を使用する必要があります。

:::note OpenTelemetry Collector Contribを使用
ClickHouseエクスポータは[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)の一部であり、コアディストリビューションの一部ではありません。ユーザーは、contribディストリビューションを使用するか、[独自のコレクターを構築](https://opentelemetry.io/docs/collector/custom-collector/)できます。
:::

完全な構成ファイルは、以下のように示されています。

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*N Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

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

以下の主要な設定に注意してください：

- **pipelines** - 上記の構成は、ログとトレースのための一連のレシーバ、プロセッサ、エクスポータから成る[パイプライン](https://opentelemetry.io/docs/collector/configuration/#pipelines)の使用を強調しています。
- **endpoint** - ClickHouseとの通信は`endpoint`パラメーターを介して構成されます。接続文字列`tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`により、通信がTCP経由で行われます。ユーザーがトラフィックスイッチの理由でHTTPを好む場合は、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されているように、この接続文字列を変更します。ユーザー名およびパスワードをこの接続文字列内で指定する機能が含まれる完全な接続の詳細については、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されています。

**重要:** 上記の接続文字列は、圧縮（lz4）および非同期挿入の両方を有効にします。両方を常に有効にすることをお勧めします。非同期挿入に関する詳細は[バッチ処理](#batching)を参照してください。圧縮は常に指定する必要があり、旧バージョンのエクスポータではデフォルトで無効になっています。

- **ttl** - ここでの値はデータが保持される期間を決定します。"データの管理"に関する詳細をご覧ください。これは、72hのような時間単位で指定する必要があります。下記の例ではデータが2019年のものであり、ClickHouseに挿入されるとすぐに削除されるためTTLを無効にしています。
- **traces_table_name**および**logs_table_name** - ログおよびトレーステーブルの名前を決定します。
- **create_schema** - 起動時にデフォルトスキーマでテーブルが作成されるかどうかを決定します。入門用にはtrueにデフォルト設定されています。ユーザーはこれをfalseに設定し、自分自身のスキーマを定義する必要があります。
- **database** - 対象データベースです。
- **retry_on_failure** - 失敗したバッチを再試行するかどうかを決定する設定です。
- **batch** - バッチプロセッサは、イベントがバッチとして送信されることを保証します。5000程度の値と5秒のタイムアウトを推奨します。どちらが早く到達してもバッチのフラッシュがトリガーされます。これらの値を下げることで、遅延の少ないパイプラインを実現し、より早くクエリー可能なデータが得られますが、ClickHouseへの接続やバッチが増えるという犠牲が伴います。非同期挿入（https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse）を使用していない場合は、ClickHouse内の[パーツが多すぎる（too many parts）](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts)という問題を引き起こす可能性があるため、これは推奨されません。逆に、非同期挿入を使用している場合は、クエリーのためのデータの可用性も非同期挿入の設定に依存します - ただし、コネクタからのデータはより早くフラッシュされます。詳細については、[バッチ処理](#batching)を参照してください。
- **sending_queue** - 送信キューのサイズを制御します。キュー内の各アイテムにはバッチが含まれています。このキューを超えると（たとえば、ClickHouseが到達不可能になった場合でもイベントが到着し続ける場合）、バッチがドロップされます。

ユーザーが構造化ログファイルを抽出し、[ローカルインスタンスのClickHouse](/install)が実行されていると仮定すると、以下のコマンドを使用してこの構成を実行できます：

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

トレースデータをこのコレクターに送信するには、以下のコマンドを`telemetrygen`ツールを使用して実行します：

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

実行中に、シンプルなクエリーでログイベントが存在することを確認します：

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:             0
SeverityText:
SeverityNumber:         0
ServiceName:
Body:                   {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:        {}
LogAttributes:          {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

Likewise, for trace events, users can check the `otel_traces` table:

SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2024-06-20 11:36:41.181398000
TraceId:                00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:                 beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:               lets-go
SpanKind:               SPAN_KIND_CLIENT
ServiceName:            telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:              telemetrygen
ScopeVersion:
SpanAttributes:         {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:               123000
StatusCode:             STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:            []
Events.Attributes:  []
Links.TraceId:          []
Links.SpanId:           []
Links.TraceState:   []
Links.Attributes:   []
```
## Out of the box schema {#out-of-the-box-schema}

デフォルトで、ClickHouseエクスポーターは、ログとトレースのためのターゲットログテーブルを作成します。これは、設定 `create_schema` によって無効にすることができます。さらに、ログとトレーステーブルの名前は、上記の設定を通じてデフォルトの `otel_logs` と `otel_traces` から変更できます。

:::note
以下のスキーマでは、TTLが72時間に有効になっていると仮定します。
:::

ログのデフォルトスキーマは以下の通りです（`otelcol-contrib v0.102.1`）:

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

ここでのカラムは、[ここに記載されている](https://opentelemetry.io/docs/specs/otel/logs/data-model/) OTel公式仕様のログに関連しています。

このスキーマに関するいくつかの重要な注意事項:

- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` で日付ごとにパーティション分けされています。これにより、有効期限が切れたデータを効率的に削除できます。
- TTLは `TTL toDateTime(Timestamp) + toIntervalDay(3)` により設定され、コレクター設定で設定された値に対応します。 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、全ての行が期限切れになっている場合のみ、全体が削除されることを意味します。これは、パーツ内の行を削除するよりも効率的です。行の削除には高コストがかかりますので、常にこの設定を推奨します。詳細は [データ管理とTTL](/observability/managing-data#data-management-with-ttl-time-to-live) をご覧ください。
- テーブルはクラシックな [`MergeTree` エンジン](/engines/table-engines/mergetree-family/mergetree) を使用します。これはログとトレースのために推奨され、変更する必要はありません。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` で順序付けされています。これにより、`ServiceName`、`SeverityText`、`Timestamp`、および `TraceId` に対するフィルターに対してクエリが最適化されます - リスト内の早いカラムは遅いカラムよりも早くフィルターされます。例えば、`ServiceName` でフィルターすることは `TraceId` でフィルターするよりも遥かに早くなります。ユーザーは、想定されるアクセスポイントに応じてこの順序を調整する必要があります - [主キーの選定]( /use-cases/observability/schema-design#choosing-a-primary-ordering-key) を参照してください。
- 上記のスキーマは、カラムに `ZSTD(1)` を適用します。これはログのために最適な圧縮を提供します。ユーザーは、より良い圧縮のためにZSTD圧縮レベル（デフォルトの1以上）を上げることができますが、これはめったに有益ではありません。この値を上げると、挿入時（圧縮中）にCPUオーバーヘッドが増加しますが、データの非圧縮（およびクエリ）は依然として同等のままであるべきです。詳細は[こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をご覧ください。追加の[デルタエンコーディング](/sql-reference/statements/create/table#delta) がタイムスタンプに適用され、ディスク上のサイズを削減することを目指しています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、および [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) がマップとして定義されている点に注意してください。これらの違いについてユーザーは理解する必要があります。これらのマップにアクセスし、キーの最適化されたアクセス方法を見るには、[マップの使用](/use-cases/observability/schema-design#using-maps) を参照してください。
- ここでの他のほとんどの型（例えば、`ServiceName` はLowCardinalityとして）も最適化されています。`Body`は、私たちの例のログでJSONであるため、Stringとして格納されています。
- ブルームフィルターがマップキーと値、さらに `Body` カラムにも適用されます。これにより、これらのカラムにアクセスするクエリの時間が改善されますが、通常は必要ありません。詳細は[セカンダリーデータスキッピングインデックス](/use-cases/observability/schema-design#secondarydata-skipping-indices)を参照してください。

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

再度、これは、[ここに記載されている](https://opentelemetry.io/docs/specs/otel/trace/api/) OTel公式仕様のトレースに対応するカラムと関連があります。ここでのスキーマは、上記のログスキーマと同様の設定を多く使用しており、スパンに特有の追加Linkカラムがあります。

ユーザーには自動スキーマ作成を無効にして、手動でテーブルを作成することをお勧めします。これにより、主キーおよび副キーの変更、クエリパフォーマンスを最適化するための追加カラムの導入が可能になります。詳細については、[スキーマ設計](/use-cases/observability/schema-design)をご覧ください。
## Optimizing inserts {#optimizing-inserts}

高挿入パフォーマンスを達成しながら強力な整合性保証を得るために、ユーザーはコレクターを介してClickHouseに可観測データを挿入する際に、シンプルなルールに従うべきです。OTelコレクターが正しく構成されている場合、以下のルールは簡単に従うことができるはずです。これにより、ClickHouseを初めて使用する際のユーザーが直面する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を回避できます。
### Batching {#batching}

デフォルトでは、ClickHouseに送信された各挿入は、ClickHouseが直ちに挿入のデータと保存する必要のあるその他のメタデータを含むストレージのパートを作成させます。したがって、より多くのデータを含む少量の挿入を送信することは、少量のデータを含む多数の挿入を送信することに比べて、必要な書き込みの数を減少させます。ユーザーには、少なくとも1,000行の比較的大きなバッチでデータを挿入することをお勧めします。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください。

デフォルトでは、ClickHouseへの挿入は同期的で、同一である場合は冪等性があります。マージツリーエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に[重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、次のような場合に挿入が許容されることを意味します：

- (1) データを受信するノードに問題がある場合、挿入クエリはタイムアウトし（またはより具体的なエラーが発生します）、確認が返されません。
- (2) ノードによってデータが書き込まれた場合、ネットワークの中断によってクエリの送信者に確認を返すことができない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの視点から見ると、(1)と(2)は区別が難しいことがあります。しかし、いずれの場合も、未確認の挿入はただちに再試行することができます。再試行した挿入クエリに、同じ順序で同じデータが含まれている限り、ClickHouseは元の（未確認の）挿入が成功した場合に再試行した挿入を自動的に無視します。

ユーザーには、上記の要件を満たす一貫した行のバッチが送信されることを確保するために、先に示した[バッチプロセッサ](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用することをお勧めします。コレクターが高スループット（秒あたりのイベント数）を持つことが期待される場合、各挿入で少なくとも5000イベントを送信できる場合、これは通常、パイプラインに必要な唯一のバッチ処理です。この場合、コレクターは、バッチプロセッサの `timeout` に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシが低く保たれるようにし、バッチが一貫したサイズであることを確保します。
### Use asynchronous inserts {#use-asynchronous-inserts}

通常、ユーザーはコレクターのスループットが低いときに小さなバッチを送信せざるを得ず、それでもデータが最低限のエンドツーエンドのレイテンシ内でClickHouseに到達することを期待します。この場合、バッチプロセッサの `timeout` が期限切れになると小さなバッチが送信されます。これが問題を引き起こす可能性があり、この場合は非同期挿入が必要です。このケースは、**エージェント役割のコレクターが直接ClickHouseに送信するように設定されているときに一般的に発生します**。ゲートウェイは、集約者として機能することでこの問題を軽減できます - [ゲートウェイによるスケーリング](#scaling-with-gateways)を参照してください。

大きなバッチを保証できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。非同期挿入では、データはまずバッファに挿入され、その後、データベースストレージに書き込まれます。

<Image img={observability_6} alt="Async inserts" size="md"/>

[非同期挿入が有効]( /optimize/asynchronous-inserts#enabling-asynchronous-inserts)な状態で、ClickHouseが① 挿入クエリを受信すると、クエリのデータが② まずメモリ内バッファに直ちに書き込まれます。③ 次のバッファフラッシュが行われると、バッファのデータは[ソート](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、データベースストレージにパートとして書き込まれます。データはデータベースストレージにフラッシュされる前はクエリによって検索可能ではない点に注意してください;バッファフラッシュは[構成可能]( /optimize/asynchronous-inserts)です。

コレクター用に非同期挿入を有効にするには、接続文字列に `async_insert=1` を追加します。ユーザーには配信保証を得るために `wait_for_async_insert=1`（デフォルト）を使用することを推奨します - 詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。

非同期挿入からのデータは、ClickHouseバッファがフラッシュされた後に挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)を超えた場合、または最初のINSERTクエリから[`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size)ミリ秒後に発生します。`async_insert_stale_timeout_ms`が0より大きい値に設定されている場合、データは前回のクエリから`async_insert_stale_timeout_ms`ミリ秒後に挿入されます。ユーザーは、これらの設定を調整してパイプラインのエンドツーエンドのレイテンシを制御できます。バッファフラッシュを調整するために使用できるさらに詳しい設定は、[ここ](/operations/settings/settings#async_insert)に記載されています。一般的に、デフォルトは適切です。

:::note Adaptive Asynchronous Insertsを検討してください
エージェントの数が少なく、スループットが低いが厳しいエンドツーエンドのレイテンシ要件がある場合、[適応型非同期挿入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が役立つかもしれません。一般的に、これらはClickHouseで見る高スループットの可観測性ユースケースには適用されません。
:::

最後に、ClickHouseへの同期挿入に関連した以前の重複排除動作は、非同期挿入を使用しているときにはデフォルトで有効になりません。必要な場合は、設定[`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)を参照してください。

この機能の構成に関する詳細は[こちら]( /optimize/asynchronous-inserts#enabling-asynchronous-inserts)にあり、より深い内容は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)で確認できます。
## Deployment architectures {#deployment-architectures}

OTelコレクターをClickHouseで使用する際に、いくつかのデプロイメントアーキテクチャが可能です。以下にそれぞれについて、その適用可能性を説明します。
### Agents only {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーはOTelコレクターをエージェントとしてエッジにデプロイします。これらはローカルアプリケーション（例：サイドカーコンテナ）からトレースを受信し、サーバーやKubernetesノードからログを収集します。このモードでは、エージェントはデータを直接ClickHouseに送信します。

<Image img={observability_7} alt="Agents only" size="md"/>

このアーキテクチャは、小規模から中規模のデプロイに適しています。主な利点は、追加のハードウェアを必要とせず、ClickHouse可観測ソリューションのリソースフットプリントを最小限に抑え、アプリケーションとコレクターの間にシンプルなマッピングを維持できることです。

エージェントが数百を超えた場合は、ゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャには、スケールが難しいいくつかの欠点があります：

- **接続のスケーリング** - 各エージェントはClickHouseへの接続を確立します。ClickHouseは数百（場合によっては数千）の同時挿入接続を維持することができますが、最終的には制約の要因となり、挿入を効果的でなくします - つまり、接続を維持するためにClickHouseがより多くのリソースを消費するようになります。ゲートウェイを使用すると、接続の数を最小限にし、挿入をより効率的にします。
- **エッジでの処理** - このアーキテクチャでは、エッジまたはClickHouseで変換やイベント処理を行う必要があります。これにより、制約が生じ、複雑なClickHouseマテリアライズドビューや、重要なサービスに影響を与える可能性がある重要な計算をエッジに押し込むことになります。
- **小さなバッチとレイテンシ** - エージェントコレクターは非常に少数のイベントを個別に収集する場合があります。これにより、配信SLAを満たすために設定した間隔でフラッシュする必要が生じます。これにより、コレクターがClickHouseに小さなバッチを送信することになります。これは欠点ですが、非同期挿入で緩和できます - [挿入の最適化](#optimizing-inserts)を参照してください。
### Scaling with gateways {#scaling-with-gateways}

OTelコレクターは、上記の制限に対処するためにゲートウェイインスタンスとして展開することができます。これらは、通常、データセンターや地域ごとのスタンドアロンサービスを提供します。これらは、アプリケーション（またはエージェント役割の他のコレクター）からのイベントを単一のOTLPエンドポイントを介して受信します。通常、一連のゲートウェイインスタンスが展開され、負荷を分散するためにボックスから出たロードバランサーが使用されます。

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

このアーキテクチャの目的は、エージェントから計算集約処理をオフロードし、リソース使用量を最小限に抑えることです。これらのゲートウェイは、エージェントが行う必要のある変換タスクを実行することができます。さらに、複数のエージェントからのイベントを集約することにより、ゲートウェイはClickHouseに大きなバッチを送信できるようにし、効率的な挿入を可能にします。これらのゲートウェイコレクターは、より多くのエージェントが追加され、イベントスループットが増加するにつれて簡単にスケールできます。以下は、関連するエージェント構成とともに、例のゲートウェイ構成を示します。エージェントとゲートウェイ間の通信にはOTLPが使用されている点に注意してください。

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

これらの構成は、以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、コレクターの管理に関連するコストとオーバーヘッドです。

ゲートウェイベースのアーキテクチャを管理するための例とそれに関連する学びの例については、[このブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)をお勧めします。
### Adding Kafka {#adding-kafka}

上記のアーキテクチャがメッセージキューとしてKafkaを使用していないことにお気づきかもしれません。

Kafkaキューをメッセージバッファとして使用することは、ログアーキテクチャで見られる一般的な設計パターンであり、ELKスタックによって普及しました。これにはいくつかの利点があります；主に、強力なメッセージ配信保証を提供し、バックプレッシャーに対処するのに役立ちます。メッセージは、収集エージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスタ化されたKafkaインスタンスは、高スループットメッセージバッファを提供すべきです。これは、メッセージを解析および処理するよりも、ディスクにリニアに書き込む方が少ない計算オーバーヘッドがかかるためです。例えば、Elasticの場合、トークン化とインデックス作成には多くのオーバーヘッドがかかります。データをエージェントから遠ざけることにより、ソースでのログローテーションの影響でメッセージが失われるリスクも減少します。最後に、いくつかのメッセージ再実行およびクロスリージョンの複製機能が提供されており、一部のユースケースにとっては魅力的かもしれません。

しかし、ClickHouseはデータを非常に迅速に挿入でき、適度なハードウェアで毎秒数百万行の挿入が可能です。ClickHouseからのバックプレッシャーは **稀** です。しばしば、Kafkaキューを利用することは、より多くのアーキテクチャの複雑さやコストを伴います。ログが銀行取引や他の重要なデータと同じ配信保証を必要としないという原則を受け入れられるのであれば、Kafkaの複雑さは避けることをお勧めします。

さて、高い配信保証やデータの再実行の能力（複数のソースへの可能性）が必要な場合、Kafkaは有用なアーキテクチャ追加となる可能性があります。

<Image img={observability_9} alt="Adding kafka" size="md"/>

この場合、OTelエージェントは、[Kafkaエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を介してデータをKafkaに送信するように構成できます。ゲートウェイインスタンスは、[Kafkaレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。さらなる詳細については、ConfluentおよびOTelのドキュメントをお勧めします。
### Estimating resources {#estimating-resources}

OTelコレクターのリソース要件は、イベントのスループット、メッセージのサイズ、および実行される処理の量によって異なります。OpenTelemetryプロジェクトは、リソース要件を推定するための[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を維持しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3つのコアと12GBのRAMを持つゲートウェイインスタンスは、毎秒約60kのイベントを処理できます。これは、フィールド名の変更を行う最小限の処理パイプラインが責任を負っている場合の想定です。

イベントをゲートウェイに送信し、イベントのタイムスタンプのみを設定するエージェントインスタンスの場合、ユーザーは予想される毎秒のログに基づいてサイズを考慮することをお勧めします。以下は、ユーザーがスタートポイントとして使用できる近似値を示したものです：

| ロギングレート | コレクターエージェントに必要なリソース |
|--------------|------------------------------|
| 1k/秒    | 0.2CPU, 0.2GiB              |
| 5k/秒    | 0.5 CPU, 0.5GiB             |
| 10k/秒   | 1 CPU, 1GiB                 |
