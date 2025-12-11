---
title: 'OpenTelemetry の統合'
description: '可観測性向上のための OpenTelemetry と ClickHouse の統合'
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

# データ収集のための OpenTelemetry の統合 {#integrating-opentelemetry-for-data-collection}

あらゆるオブザーバビリティソリューションには、ログやトレースを収集してエクスポートする手段が必要です。この目的のために、ClickHouse は [OpenTelemetry (OTel) プロジェクト](https://opentelemetry.io/) の利用を推奨します。

「OpenTelemetry は、トレース、メトリクス、ログなどのテレメトリデータを作成および管理するために設計された、オブザーバビリティフレームワーク兼ツールキットです。」

ClickHouse や Prometheus とは異なり、OpenTelemetry はオブザーバビリティのバックエンドではなく、テレメトリデータの生成、収集、管理、およびエクスポートに重点を置いています。OpenTelemetry の当初の目的は、ユーザーが言語固有の SDKs を用いてアプリケーションやシステムを容易に計装できるようにすることでしたが、その範囲は拡大し、OpenTelemetry Collector を通じてログを収集する機能も含むようになりました。OpenTelemetry Collector は、テレメトリデータを受信・処理・エクスポートするエージェントまたはプロキシです。

## ClickHouse 関連コンポーネント {#clickhouse-relevant-components}

OpenTelemetry は複数のコンポーネントで構成されています。データおよび API 仕様、標準化されたプロトコル、フィールド／カラムの命名規則を提供することに加えて、OTel は ClickHouse を用いたオブザーバビリティソリューションを構築する上で不可欠な 2 つの機能を提供します。

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) は、テレメトリーデータを受信、処理、およびエクスポートするプロキシです。ClickHouse を基盤とするソリューションでは、このコンポーネントを、バッチ処理および挿入前のログ収集とイベント処理の両方に利用します。
- 仕様、API、およびテレメトリーデータのエクスポートを実装する [Language SDKs](https://opentelemetry.io/docs/languages/)。これらの SDK は、アプリケーションのコード内でトレースが正しく記録されることを確実にし、構成要素となる span を生成し、メタデータを通じてサービス間でコンテキストが伝播されるようにします。これにより分散トレースが形成され、span を相関付けることが可能になります。これらの SDK は、一般的なライブラリやフレームワークに対する自動インストルメンテーションを提供するエコシステムによって補完されており、ユーザーはコードを変更する必要がなく、すぐに利用可能なインストルメンテーションを得られます。

ClickHouse を基盤とするオブザーバビリティソリューションは、これら 2 つのツールをどちらも活用します。

## ディストリビューション {#distributions}

OpenTelemetry Collector には[複数のディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)があります。ClickHouse ソリューションに必要となる filelog receiver と ClickHouse exporter は、[OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) にのみ含まれています。

このディストリビューションには多くのコンポーネントが含まれており、ユーザーはさまざまな構成を試すことができます。しかし、本番環境で運用する場合は、対象の環境で必要となるコンポーネントのみに Collector を限定することが推奨されます。そうする理由としては、次のようなものがあります。

- Collector のサイズを小さくし、Collector のデプロイ時間を短縮する
- 利用可能な攻撃対象領域を減らすことで Collector のセキュリティを向上させる

[カスタム Collector](https://opentelemetry.io/docs/collector/custom-collector/) のビルドは、[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) を使用して行うことができます。

## OTel を使用したデータ取り込み {#ingesting-data-with-otel}

### コレクターのデプロイメント時のロール {#collector-deployment-roles}

ログを収集して ClickHouse に挿入するためには、OpenTelemetry Collector の利用を推奨します。OpenTelemetry Collector は、主に次の 2 つのロールでデプロイできます。

- **Agent** - Agent インスタンスは、エッジ（例: サーバー上や Kubernetes ノード上）でデータを収集するか、OpenTelemetry SDK でインストルメントされたアプリケーションからイベントを直接受信します。後者の場合、Agent インスタンスはアプリケーションと同一プロセス内、またはアプリケーションと同じホスト上（サイドカーやデーモンセットなど）で動作します。Agent は、収集したデータを直接 ClickHouse に送信することも、ゲートウェイインスタンスに送信することもできます。前者の場合、これは [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。
- **Gateway**  - Gateway インスタンスは独立したサービス（たとえば Kubernetes のデプロイメント）として提供され、通常はクラスター単位、データセンター単位、リージョン単位で配置されます。これらは、単一の OTLP エンドポイント経由でアプリケーション（または Agent として動作する他のコレクター）からイベントを受信します。一般的に、複数の Gateway インスタンスをデプロイし、既存のロードバランサーを利用してその間で負荷分散します。すべての Agent とアプリケーションがこの単一のエンドポイントにシグナルを送る場合、これは [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれることがよくあります。

以下では、イベントを直接 ClickHouse に送信するシンプルな Agent としてのコレクター構成を前提とします。ゲートウェイの利用方法と有効なユースケースの詳細については、[Scaling with Gateways](#scaling-with-gateways) を参照してください。

### ログの収集 {#collecting-logs}

Collector を使用する主な利点は、サービス側がデータをすばやく渡して処理を手放し、その後のリトライ、バッチ処理、暗号化、さらには機密データのフィルタリングといった追加処理を Collector 側に任せられる点です。

Collector では、処理の 3 つの主要なステージとして [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers)、[processor](https://opentelemetry.io/docs/collector/configuration/#processors)、[exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) という用語を使用します。Receiver はデータ収集に使用され、pull 型または push 型のいずれかになります。Processor はメッセージの変換および付加情報の追加を行う機能を提供します。Exporter はデータを下流のサービスへ送信する役割を担います。理論的にはこの下流サービスも別の Collector にできますが、以下の最初の説明では、すべてのデータが直接 ClickHouse に送信されるものと仮定します。

<Image img={observability_3} alt="ログの収集" size="md"/>

利用者には、利用可能な receiver、processor、exporter の全体像を把握しておくことを推奨します。

Collector は、ログを収集するために 2 つの主要な receiver を提供します。

**OTLP 経由** - この場合、ログは OTLP プロトコル経由で OpenTelemetry SDK から Collector へ直接（push で）送信されます。[OpenTelemetry demo](https://opentelemetry.io/docs/demo/) はこのアプローチを採用しており、各言語の OTLP exporter はローカルの Collector エンドポイントを前提としています。この場合、Collector 側では OTLP receiver を使うように設定する必要があります。設定例については上記の [デモの設定](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12) を参照してください。このアプローチの利点は、ログデータに自動的に Trace ID が含まれるため、特定のログに対応するトレースを後から特定したり、その逆を行ったりできる点にあります。

<Image img={observability_4} alt="OTLP 経由でのログ収集" size="md"/>

このアプローチでは、利用者は自分のコードを [対象言語向けの SDK](https://opentelemetry.io/docs/languages/) で計装する必要があります。

- **Filelog receiver によるスクレイピング** - この receiver はディスク上のファイルを tail してログメッセージを生成し、これらを ClickHouse に送信します。この receiver は、複数行メッセージの検出、ログローテーションの処理、再起動に対する堅牢性を高めるためのチェックポイント、構造の抽出などの複雑なタスクを処理します。さらに、この receiver は Docker および Kubernetes のコンテナログも tail でき、Helm チャートとしてデプロイ可能であり、[それらから構造を抽出](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)し、ポッドの詳細情報で付加情報を与えることができます。

<Image img={observability_5} alt="Filelog receiver" size="md"/>

**ほとんどのデプロイメントでは、上記の receiver を組み合わせて使用します。利用者には [collector ドキュメント](https://opentelemetry.io/docs/collector/) を参照し、基本概念に加えて [設定構造](https://opentelemetry.io/docs/collector/configuration/) や [インストール方法](https://opentelemetry.io/docs/collector/installation/) に慣れておくことを推奨します。**

:::note ヒント: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) は設定の検証と可視化に有用です。
:::

## 構造化ログと非構造化ログ {#structured-vs-unstructured}

ログは、構造化ログか非構造化ログのいずれかです。

構造化ログは JSON などのデータ形式を使用して、HTTP ステータスコードや送信元 IP アドレスといったメタデータフィールドを定義します。

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

非構造化ログは、通常、正規表現パターンで抽出可能なある程度の内在的な構造を持ちますが、ログ自体はあくまで文字列としてのみ表現されます。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

可能な場合は構造化ログを採用し、JSON（例：ndjson）形式でログを出力することを推奨します。これにより、後続のログ処理が簡略化されます。具体的には、[Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors) を使用して ClickHouse に送信する前、あるいは挿入時にマテリアライズドビューを用いて処理する際の負荷を軽減できます。構造化ログを利用することで、後段の処理に必要なリソースを節約でき、最終的には ClickHouse ソリューションで必要となる CPU を削減できます。

### 例 {#example}

例として、構造化（JSON）および非構造化のログデータセットをそれぞれ約 1,000 万行分用意しており、以下のリンクからダウンロードできます。

* [Unstructured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Structured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

以下の例では構造化データセットを使用します。後続の例を再現できるよう、このファイルをダウンロードして展開しておいてください。

次は、`filelog` レシーバーを使ってこれらのファイルをディスクから読み込み、結果のメッセージを stdout に出力する OTel collector の簡単な設定例です。ログが構造化されているため、[`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) オペレーターを使用します。`access-structured.log` ファイルへのパスは適宜変更してください。

:::note パースには ClickHouse の利用も検討
以下の例では、ログからタイムスタンプを抽出します。これは、ログ 1 行全体を JSON としてパースし、その結果を `LogAttributes` に格納する `json_parser` オペレーターの使用を必要とします。この処理は計算コストが高く、[ClickHouse でより効率的に実行できます](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQL を使った構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)。これと同等の非構造化ログ向けの例として、[`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) を使用して同様の処理を行うものが[こちら](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)にあります。
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

ユーザーは[公式手順](https://opentelemetry.io/docs/collector/installation/)に従って、OTel collector をローカルにインストールできます。重要な点として、その手順を参照する際は、[`filelog` receiver を含む contrib ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)を使うように読み替えてください。たとえば、`otelcol_0.102.1_darwin_arm64.tar.gz` の代わりに `otelcol-contrib_0.102.1_darwin_arm64.tar.gz` をダウンロードします。リリースは[こちら](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)から取得できます。

インストールが完了したら、OTel collector は次のコマンドで実行できます。

```bash
./otelcol-contrib --config config-logs.yaml
```

構造化ログを使用している場合、出力されるメッセージは次の形式になります。

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

上記は、OTel collector によって生成された単一のログメッセージを表しています。同じメッセージを後続のセクションで ClickHouse に取り込みます。

他の receiver を使用している場合に存在し得る追加カラムを含む、ログメッセージの完全なスキーマは[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)で管理されています。**このスキーマには事前に精通しておくことを強く推奨します。**

ここでのポイントは、ログ行自体は `Body` フィールド内の文字列として保持される一方で、`json_parser` によって JSON が自動的に抽出され、`Attributes` フィールドに格納されているという点です。同じ[オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)を使用して、タイムスタンプも適切な `Timestamp` カラムに抽出しています。OTel を使用したログ処理に関する推奨事項については、[Processing](#processing---filtering-transforming-and-enriching) を参照してください。

:::note Operators
Operators はログ処理の最も基本的な単位です。各 operator は、ファイルから行を読み取る、フィールドから JSON をパースするなど、単一の責務を担います。その後、operator はパイプライン内でチェーンされ、目的の結果を得ます。
:::

上記のメッセージには `TraceID` や `SpanID` フィールドが存在しません。たとえば、ユーザーが[分散トレーシング](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)を実装している場合などにこれらが存在する場合は、上記と同じ手法を使って JSON から抽出できます。

ローカルまたは Kubernetes のログファイルを収集する必要があるユーザーには、[filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)で利用可能な設定オプションと、[オフセット](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking)および[複数行ログのパース処理](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)の扱いについて理解しておくことを推奨します。

## Kubernetes ログの収集 {#collecting-kubernetes-logs}

Kubernetes ログの収集については、[OpenTelemetry のドキュメントガイド](https://opentelemetry.io/docs/kubernetes/) を推奨します。[Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) を使用すると、ポッドのメタデータでログおよびメトリクスを拡充できます。これにより、例えばラベルのような動的メタデータが生成され、`ResourceAttributes` 列に保存されます。ClickHouse は現在、この列に対して `Map(String, String)` 型を使用しています。この型の取り扱いや最適化の詳細については、[Using Maps](/use-cases/observability/schema-design#using-maps) および [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps) を参照してください。

## トレースの収集 {#collecting-traces}

コードにインストルメンテーションを施してトレースを収集したい場合は、公式の [OTel ドキュメント](https://opentelemetry.io/docs/languages/) に従うことを推奨します。

イベントを ClickHouse に送信するには、適切なレシーバー (`receiver`) を介して OTLP プロトコル経由でトレースイベントを受信する OTel collector をデプロイする必要があります。OpenTelemetry のデモでは、[サポートされている各言語へのインストルメンテーション例](https://opentelemetry.io/docs/demo/) と、イベントを collector に送信する方法を示しています。標準出力 (`stdout`) にイベントを出力する、適切な collector 設定の例を以下に示します。

### 例 {#example-1}

トレースは OTLP で受信する必要があるため、トレースデータを生成するために [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) ツールを使用します。インストールするには、[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)の手順に従ってください。

次の設定では、OTLP レシーバーでトレースイベントを受信し、その後標準出力 (stdout) に出力します。

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

この設定を次のコマンドで適用します:

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen` を使用してトレースイベントをコレクターに送信します:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

これにより、次の例のようなトレースメッセージが stdout に出力されます。

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

上記は、OTel collector によって生成された 1 つのトレースメッセージを表しています。後続のセクションで、同じ形式のメッセージを ClickHouse に取り込みます。

トレースメッセージの完全なスキーマは [こちら](https://opentelemetry.io/docs/concepts/signals/traces/) で公開されています。ユーザーの皆さまには、このスキーマに十分に精通しておくことを強く推奨します。

## 処理 - フィルタリング、変換、およびエンリッチ {#processing---filtering-transforming-and-enriching}

先ほどのログイベントのタイムスタンプ設定の例で示したように、ユーザーは必然的にイベントメッセージをフィルタリング、変換し、エンリッチしたくなります。これは OpenTelemetry の複数の機能を利用することで実現できます。

- **Processors** - Processor は、[receivers が収集したデータを、エクスポータに送信する前に修正または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)します。Processor は、collector 設定の `processors` セクションで指定された順序で適用されます。これらは任意ですが、最小限のセットが[一般的に推奨](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)されています。OTel collector を ClickHouse と併用する場合、Processor は次のものに限定することを推奨します:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) は、collector 上でのメモリ不足を防ぐために使用します。推奨事項については [Estimating Resources](#estimating-resources) を参照してください。
  - コンテキストに基づいてエンリッチを行う Processor。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) は、k8s メタデータを使用してスパン、メトリクス、およびログのリソース属性を自動的に設定できます。例: イベントにそのソースのポッド ID を付加してエンリッチする。
  - トレースに対して必要な場合の [tail または head サンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
  - [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター経由では実施できない場合に、不要なイベントを削除します（下記参照）。
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - データをバッチで送信するため、ClickHouse と連携する際には不可欠です。["Exporting to ClickHouse"](#exporting-to-clickhouse) を参照してください。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) は、receiver で利用可能な処理の最小単位を提供します。基本的なパースがサポートされており、Severity や Timestamp などのフィールドを設定できます。JSON および正規表現によるパースに加え、イベントフィルタリングと基本的な変換がサポートされています。イベントフィルタリングはここで実行することを推奨します。

Operators や [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) を使用して過度なイベント処理を行うことは避けることを推奨します。これらは、特に JSON パースにおいてメモリおよび CPU の大きなオーバーヘッドを発生させる可能性があります。いくつかの例外（具体的には、k8s メタデータの追加などのコンテキスト依存のエンリッチ）を除き、挿入時に ClickHouse 内でマテリアライズドビューおよびカラムを用いて、すべての処理を行うことが可能です。詳細については [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql) を参照してください。

処理を OTel collector で行う場合、ゲートウェイインスタンスで変換処理を行い、エージェントインスタンスでの処理を最小限に抑えることを推奨します。これにより、サーバー上で動作するエッジのエージェントに必要なリソースを可能な限り小さくできます。一般的に、ユーザーは不要なネットワーク使用量を最小化するためのフィルタリング、Operators によるタイムスタンプ設定、およびコンテキストを必要とするエンリッチのみをエージェントで実行しています。たとえば、ゲートウェイインスタンスが別の Kubernetes クラスターに存在する場合、k8s エンリッチはエージェント側で行う必要があります。

### 例 {#example-2}

次の構成は、非構造化ログファイルを収集する方法を示しています。ログ行から構造を抽出するためのオペレーター（`regex_parser`）やイベントをフィルタリングするためのオペレーターに加え、イベントをバッチ処理してメモリ使用量を制限するプロセッサーの利用方法に注目してください。

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

## ClickHouse へのエクスポート {#exporting-to-clickhouse}

エクスポーターは、1 つ以上のバックエンドまたは送信先にデータを送信します。エクスポーターには、プル型とプッシュ型があります。イベントを ClickHouse に送信するには、プッシュ型の [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) を使用する必要があります。

:::note OpenTelemetry Collector Contrib を使用する
ClickHouse exporter は [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main) の一部であり、コアディストリビューションには含まれていません。ユーザーは contrib ディストリビューションを使用するか、[独自の Collector をビルド](https://opentelemetry.io/docs/collector/custom-collector/) できます。
:::

完全な設定ファイルを以下に示します。

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

以下の主な設定を確認してください：

* **pipelines** - 上記の設定では、[pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines) の利用が重要です。これはレシーバー、プロセッサー、エクスポーターのセットで構成されており、ログ用とトレース用にそれぞれ 1 つずつ定義されています。
* **endpoint** - ClickHouse との通信は `endpoint` パラメーターで設定します。接続文字列 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` により、通信は TCP 経由で行われます。トラフィック切り替えなどの理由で HTTP を利用したい場合は、この接続文字列を[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)で説明されている方法に従って変更してください。ユーザー名とパスワードをこの接続文字列内で指定できる、より完全な接続設定の詳細は[こちら](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)に記載されています。

**Important:** 上記の接続文字列では、圧縮（lz4）と非同期インサートの両方が有効になっています。両方とも常に有効にすることを推奨します。非同期インサートの詳細については [Batching](#batching) を参照してください。圧縮は常に明示的に指定すべきであり、エクスポーターの古いバージョンではデフォルトで有効にはなりません。

* **ttl** - ここでの値はデータ保持期間を決定します。詳細は「Managing data」を参照してください。時間単位で指定する必要があります（例: 72h）。以下の例では、データが 2019 年のものであり、挿入すると ClickHouse により即座に削除されてしまうため、TTL を無効にしています。
* **traces&#95;table&#95;name** および **logs&#95;table&#95;name** - ログテーブルおよびトレーステーブルの名前を決定します。
* **create&#95;schema** - 起動時にデフォルトスキーマでテーブルを作成するかどうかを決定します。初期セットアップでは true がデフォルトです。ユーザーはこれを false に設定し、自身のスキーマを定義する必要があります。
* **database** - 対象のデータベース。
* **retry&#95;on&#95;failure** - 失敗したバッチを再試行するかどうかを決定する設定です。
* **batch** - バッチプロセッサーはイベントをバッチ単位で送信します。約 5000 のサイズと 5s のタイムアウトを推奨します。いずれかの条件を先に満たした時点で、エクスポーターへのフラッシュが開始されます。これらの値を下げると、より低レイテンシーなパイプラインとなり、クエリ可能になるまでの時間は短くなりますが、ClickHouse への接続数と送信バッチ数が増加します。[asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を使用していない場合、ClickHouse で [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) の問題を引き起こす可能性があるため、これは推奨されません。逆に、asynchronous inserts を使用している場合、クエリ可能となるデータの可用性は非同期インサートの設定にも依存しますが、コネクタからのフラッシュ自体は早く行われます。詳細は [Batching](#batching) を参照してください。
* **sending&#95;queue** - 送信キューのサイズを制御します。キュー内の各アイテムは 1 つのバッチを保持します。たとえば ClickHouse に到達できない状況でイベントの到着が継続し、このキューがあふれた場合、バッチは破棄されます。

ユーザーが構造化ログファイルを抽出済みで、（デフォルト認証の）[local instance of ClickHouse](/install) が稼働していると仮定すると、この設定は次のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

このコレクターにトレースデータを送信するには、`telemetrygen` ツールを使用して次のコマンドを実行します。

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

起動したら、次のような簡単なクエリでログイベントが存在することを確認します。

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

同様に、トレースイベントについては`otel_traces`テーブルを確認できます:

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

## 既定のスキーマ {#out-of-the-box-schema}

デフォルトでは、ClickHouse exporter はログとトレースの両方に対して出力先のログテーブルを作成します。これは設定 `create_schema` によって無効化できます。さらに、前述の設定により、ログテーブルおよびトレーステーブルの名前は、デフォルト値である `otel_logs` および `otel_traces` から変更できます。

:::note
以下のスキーマでは、TTL が 72h に設定され有効になっているものとします。
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

ここに挙げたカラムは、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)に記載されているログに関する OTel 公式仕様と対応しています。

このスキーマについて、いくつか重要な注意点があります。

- デフォルトでは、テーブルは `PARTITION BY toDate(Timestamp)` によって日付でパーティション分割されます。これにより、有効期限切れのデータを効率的に削除できます。
- TTL は `TTL toDateTime(Timestamp) + toIntervalDay(3)` によって設定されており、collector の設定で指定した値に対応します。[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) は、含まれるすべての行が有効期限切れになった場合にのみ、そのパーツ全体を削除することを意味します。これは、パーツ内の行単位で削除する（高コストな delete を伴う）よりも効率的です。常にこの設定にすることを推奨します。詳細は [Data management with TTL](/observability/managing-data#data-management-with-ttl-time-to-live) を参照してください。
- テーブルは標準的な [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree) を使用します。これはログおよびトレースに推奨されており、通常変更する必要はありません。
- テーブルは `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)` で並べ替えられます。これは、`ServiceName`、`SeverityText`、`Timestamp`、`TraceId` に対するフィルタにクエリが最適化されることを意味します。リストの前方にあるカラムの方が後方のカラムより高速にフィルタされます。たとえば `ServiceName` によるフィルタは `TraceId` によるフィルタよりもかなり高速です。ユーザーは、想定されるアクセスパターンに応じてこの ORDER BY を調整してください。詳細は [Choosing a primary key](/use-cases/observability/schema-design#choosing-a-primary-ordering-key) を参照してください。
- 上記のスキーマでは、カラムに `ZSTD(1)` を適用しています。これはログに対して最も優れた圧縮率を提供します。より高い圧縮率を得るために（デフォルトの 1 より）ZSTD の圧縮レベルを上げることもできますが、恩恵があるケースはまれです。この値を大きくすると、挿入時（圧縮処理時）の CPU オーバーヘッドが増加しますが、伸長（およびクエリ性能）はほぼ変わらないはずです。詳細は [こちら](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を参照してください。さらに、ディスク上のサイズ削減を目的として Timestamp には追加の [delta encoding](/sql-reference/statements/create/table#delta) が適用されています。
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/)、[`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes)、[`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) がマップ型である点に注意してください。ユーザーはこれらの違いに慣れておく必要があります。これらのマップへのアクセス方法や、その中のキーへのアクセス最適化については [Using maps](/use-cases/observability/schema-design#using-maps) を参照してください。
- ここでのその他の型、たとえば LowCardinality としての `ServiceName` などは最適化されています。例のログで JSON である `Body` は String として保存される点に注意してください。
- Bloom filter はマップのキーおよび値、さらに `Body` カラムにも適用されています。これは、これらのカラムにアクセスするクエリの実行時間を改善することを目的としていますが、多くの場合必須ではありません。詳細は [Secondary/Data skipping indices](/use-cases/observability/schema-design#secondarydata-skipping-indices) を参照してください。

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

繰り返しになりますが、これは [こちら](https://opentelemetry.io/docs/specs/otel/trace/api/) に記載されているトレースに関する OTel 公式仕様に対応するカラムと相関付けられます。ここでのスキーマは、上記のログ用スキーマと多くの設定を共通化しつつ、span 固有の Link カラムを追加しています。

ユーザーには、自動スキーマ作成を無効化し、テーブルを手動で作成することを推奨します。これにより、主キーおよびセカンダリキーを変更できるほか、クエリパフォーマンスを最適化するための追加カラムを導入することが可能になります。詳細については [Schema design](/use-cases/observability/schema-design) を参照してください。

## 挿入の最適化 {#optimizing-inserts}

collector 経由で Observability データを ClickHouse に挿入する際に、高い挿入パフォーマンスと強い一貫性保証の両方を得るには、いくつかの簡単なルールに従う必要があります。OTel collector を正しく構成すれば、これらのルールに従うことは容易になります。これにより、初めて ClickHouse を使用する際にユーザーが遭遇しがちな[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouse に送信された各 `insert` ごとに、ClickHouse はその `insert` のデータおよび保存が必要なその他のメタデータを含むストレージパーツを即座に作成します。したがって、大量のデータを少数の `insert` にまとめて送信する方が、少量のデータを多数の `insert` に分割して送信する場合と比べて、必要な書き込み回数を削減できます。1 回あたり少なくとも 1,000 行の、十分に大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse への `insert` は同期的に実行され、かつ内容が同一であれば冪等です。MergeTree エンジンファミリーのテーブルでは、ClickHouse はデフォルトで自動的に [`insert` の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、`insert` が次のようなケースでも問題なく扱われることを意味します。

- (1) データを受信するノードに問題が発生した場合、`insert` クエリはタイムアウト（またはより具体的なエラー）となり、確認応答（ACK）を受信しません。
- (2) ノードがデータを書き込んだものの、ネットワーク断などによりクエリ送信元に確認応答を返せない場合、送信元はタイムアウトまたはネットワークエラーを受け取ります。

コレクター側の観点からは、(1) と (2) を区別するのは困難な場合があります。しかし、どちらの場合でも、確認応答を受け取れなかった `insert` はただちにリトライして構いません。リトライされた `insert` クエリが同一のデータを同一の順序で含んでいる限り、（確認応答が返されなかった）元の `insert` が成功していた場合には、ClickHouse はリトライされた `insert` を自動的に無視します。

上記を満たすために、先の設定例で示した [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) を使用することを推奨します。これにより、上記の要件を満たす、一貫した行バッチとして `insert` が送信されるようになります。コレクターが高スループット（1 秒あたりのイベント数）を想定しており、かつ各 `insert` で少なくとも 5,000 イベントを送信できる場合、通常はパイプラインで必要となるバッチ処理はこれだけで十分です。この場合、コレクターは batch processor の `timeout` に到達する前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシを低く保つとともに、バッチサイズの一貫性を維持します。

### 非同期インサートを使用する {#use-asynchronous-inserts}

一般的に、コレクターのスループットが低い場合、ユーザーはより小さなバッチを送信せざるを得ませんが、それでもエンドツーエンドのレイテンシーが許容範囲内のうちにデータが ClickHouse に到達することを期待します。このような場合、バッチプロセッサの `timeout` が期限切れになると小さなバッチが送信されます。これが問題を引き起こすことがあり、その際に非同期インサートが必要になります。このケースは、**エージェント役割のコレクターが ClickHouse に直接送信するように構成されている**場合によく発生します。ゲートウェイはアグリゲーターとして動作することでこの問題を軽減できます。詳細は [Scaling with Gateways](#scaling-with-gateways) を参照してください。

大きなバッチを保証できない場合、ユーザーは [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) を使用してバッチ処理を ClickHouse に委譲できます。非同期インサートでは、データはまずバッファに挿入され、その後にデータベースストレージへと後から（非同期に）書き込まれます。

<Image img={observability_6} alt="非同期インサート" size="md"/>

[非同期インサートが有効化されている](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)場合、ClickHouse が ① INSERT クエリを受信すると、そのクエリのデータは ② まずインメモリバッファに即座に書き込まれます。③ 次回のバッファフラッシュが行われるとき、バッファ内のデータは[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、1 つのパーツとしてデータベースストレージに書き込まれます。なお、データはデータベースストレージにフラッシュされるまでクエリから検索できません。バッファフラッシュの挙動は[設定可能](/optimize/asynchronous-inserts)です。

コレクターで非同期インサートを有効にするには、接続文字列に `async_insert=1` を追加します。配信の保証を得るために、`wait_for_async_insert=1`（デフォルト）の使用を推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期インサートによるデータは、ClickHouse のバッファがフラッシュされた時点で挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えた場合、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒経過した場合に発生します。`async_insert_stale_timeout_ms` がゼロ以外の値に設定されている場合は、最後のクエリから `async_insert_stale_timeout_ms ミリ秒` 経過後にデータが挿入されます。ユーザーはこれらの設定を調整することで、パイプラインのエンドツーエンドレイテンシーを制御できます。バッファフラッシュのチューニングに使用できるその他の設定は[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト値で問題ありません。

:::note 適応的非同期インサートの検討
使用しているエージェント数が少なく、スループットは低いがエンドツーエンドレイテンシー要件が厳しいケースでは、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般に、これらは ClickHouse を用いた高スループットの Observability ユースケースには適用されないことが多いです。
:::

最後に、ClickHouse への同期インサートに関連付けられていた従来の重複排除（デデュープ）動作は、非同期インサート使用時にはデフォルトでは有効化されません。必要に応じて、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の設定に関する詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、より踏み込んだ解説は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

## デプロイメントアーキテクチャ {#deployment-architectures}

OTel collector を ClickHouse と併用する場合、いくつかのデプロイメントアーキテクチャが想定されます。以下で、それぞれの方式と、その方式がどのようなケースで有効かについて説明します。

### エージェントのみ {#agents-only}

エージェントのみのアーキテクチャでは、ユーザーは OTel collector をエッジにエージェントとしてデプロイします。これらはローカルアプリケーション（例: サイドカーコンテナとして）からトレースを受信し、サーバーおよび Kubernetes ノードからログを収集します。このモードでは、エージェントはそれぞれのデータを直接 ClickHouse に送信します。

<Image img={observability_7} alt="エージェントのみ" size="md"/>

このアーキテクチャは、小規模から中規模のデプロイメントに適しています。主な利点は、追加のハードウェアを必要とせず、アプリケーションとコレクターの対応関係をシンプルに保ったまま、ClickHouse ベースのオブザーバビリティソリューション全体のリソース使用量を最小限に抑えられる点です。

エージェント数が数百を超えるようになったら、ユーザーはゲートウェイベースのアーキテクチャへの移行を検討すべきです。このアーキテクチャには、スケールさせる際に課題となるいくつかの欠点があります。

- **接続数のスケーリング** - 各エージェントが ClickHouse への接続を確立します。ClickHouse は数百（場合によっては数千）の同時インサート接続を維持できますが、最終的にはこれが制約となり、インサートの効率が低下します。つまり、接続の維持に ClickHouse のより多くのリソースが消費されます。ゲートウェイを使用することで接続数を最小限に抑え、インサートをより効率的にできます。
- **エッジでの処理** - このアーキテクチャでは、あらゆる変換やイベント処理をエッジ、または ClickHouse 内で実行する必要があります。これは制約が大きいだけでなく、複雑な ClickHouse のマテリアライズドビューが必要になったり、重要なサービスに影響が及びリソースも限られるエッジ側に多大な計算処理を押し付けたりすることにつながります。
- **小さなバッチとレイテンシー** - エージェント型コレクターは、個別にはごく少数のイベントしか収集しない場合があります。通常これは、配信のSLAを満たすために、一定の間隔でフラッシュするよう設定する必要があることを意味します。その結果として、コレクターが小さなバッチを ClickHouse に送信することになります。これは欠点ではありますが、非同期インサートを用いることで軽減できます。詳細は [インサートの最適化](#optimizing-inserts) を参照してください。

### ゲートウェイによるスケーリング {#scaling-with-gateways}

OTel collector は、上記の制約に対処するために Gateway インスタンスとしてデプロイできます。これらは通常、データセンターごと、あるいはリージョンごとに配置されるスタンドアロンのサービスです。アプリケーション（またはエージェントの役割を持つ他の collector）からのイベントを、単一の OTLP エンドポイント経由で受信します。一般的には複数のゲートウェイインスタンスがデプロイされ、既存のロードバランサーを用いて、それらの間で負荷分散を行います。

<Image img={observability_8} alt="ゲートウェイによるスケーリング" size="md" />

このアーキテクチャの目的は、計算負荷の高い処理をエージェントからオフロードし、それによりエージェントのリソース使用量を最小化することです。これらのゲートウェイは、本来であればエージェント側で行う必要がある変換処理を実行できます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは ClickHouse へ大きなバッチを送信でき、効率的な挿入が可能になります。エージェントが追加されイベントスループットが増加しても、これらのゲートウェイとして動作する OTel collector は容易にスケールできます。以下に、サンプルの構造化ログファイルを取り込むエージェント設定を伴う、ゲートウェイ構成の例を示します。エージェントとゲートウェイ間の通信に OTLP を使用している点に注意してください。

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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
      insecure: true # セキュアな接続を使用する場合はfalseに設定
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行するため変更
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

これらの設定は、以下のコマンドで実行できます。

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

このアーキテクチャの主な欠点は、コレクター群を管理することに伴うコストとオーバーヘッドです。

より大規模なゲートウェイベースのアーキテクチャの管理と、そこから得られた知見の例としては、この[ブログ記事](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)を参照してください。

### Kafka の追加 {#adding-kafka}

ここまでのアーキテクチャでは、メッセージキューとして Kafka を使用していないことに気づくかもしれません。

メッセージバッファとして Kafka キューを使用するのは、ログ収集アーキテクチャでよく見られる一般的な設計パターンであり、ELK スタックによって広まりました。これにはいくつかの利点があります。主なものは、より強力なメッセージ配信保証を提供し、バックプレッシャーへの対応に役立つ点です。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論上、クラスタ構成の Kafka インスタンスは、高スループットなメッセージバッファを提供できます。これは、メッセージをパースして処理するよりも、データをディスクに線形に書き込むほうが計算オーバーヘッドが小さいためです。たとえば Elastic では、トークナイズやインデックス作成に大きなオーバーヘッドが発生します。また、データをエージェントから切り離すことで、ソース側でのログローテーションに起因するメッセージ損失のリスクも低減できます。最後に、一部のユースケースで魅力的となりうるメッセージのリプレイやリージョン間レプリケーションの機能も提供します。

一方で、ClickHouse は非常に高速にデータを挿入できます — 中程度のハードウェアでも 1 秒あたり数百万行レベルです。ClickHouse からのバックプレッシャーは **まれ** です。多くの場合、Kafka キューを利用するとアーキテクチャの複雑さとコストが増大します。ログは銀行取引やその他のミッションクリティカルなデータと同レベルの配信保証を必要としない、という前提を受け入れられるのであれば、Kafka を導入することによる複雑さは避けることを推奨します。

一方で、高い配信保証や（複数の宛先に対して）データをリプレイする機能が必要な場合、Kafka は有用なアーキテクチャ上の追加コンポーネントとなり得ます。

<Image img={observability_9} alt="Kafka の追加" size="md"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を通じてデータを Kafka に送信するように構成できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については Confluent および OTel のドキュメントを参照することを推奨します。

### リソース見積もり {#estimating-resources}

OTel collector のリソース要件は、イベントスループット、メッセージサイズ、および実行される処理内容・量に依存します。OpenTelemetry プロジェクトは、ユーザーがリソース要件を見積もる際に利用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を提供しています。

[当社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアと 12GB の RAM を持つゲートウェイインスタンスで、毎秒約 6 万件のイベントを処理できます。これは、フィールド名の変更のみを行い、正規表現を使用しない最小限の処理パイプラインを前提としています。

イベントをゲートウェイに転送し、イベントにタイムスタンプを設定するのみを担当するエージェントインスタンスについては、想定される 1 秒あたりのログ数に基づいてサイジングすることを推奨します。以下は、ユーザーが出発点として利用できるおおよその値です。

| ログレート | collector エージェントのリソース |
|--------------|------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB              |
| 5k/second    | 0.5 CPU, 0.5GiB             |
| 10k/second   | 1 CPU, 1GiB                 |