---
slug: /use-cases/observability/clickstack/config
title: '設定オプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack の設定オプション - ClickHouse オブザーバビリティ スタック'
keywords: ['ClickStack 設定', 'オブザーバビリティ設定', 'HyperDX 設定', 'コレクター設定', '環境変数']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';
import highlighted_attributes_config from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-config.png';
import highlighted_attributes from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes.png';
import highlighted_attributes_search from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-search.png';

ClickStack の各コンポーネントには、次の設定オプションがあります。


## オープンソースディストリビューション向けの設定 \{#modifying-settings\}

### Docker \{#docker\}

[All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)、または[Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)を使用する場合は、必要な設定を環境変数として渡してください。例:

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose \{#docker-compose\}

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) デプロイメントガイドを使用している場合、[`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) ファイルを使って設定を変更できます。

あるいは、[`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) ファイル内で設定を明示的に上書きすることもできます。例:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```


### Helm \{#helm\}

#### 値のカスタマイズ（任意） \{#customizing-values\}

`--set` フラグを使用して設定をカスタマイズできます。例：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set replicaCount=2 \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.requests.memory=256Mi \
  --set ingress.enabled=true \
  --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
  --set ingress.hosts[0].host=hyperdx.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=ImplementationSpecific \
  --set env[0].name=CLICKHOUSE_USER \
  --set env[0].value=abc
```

または `values.yaml` を編集します。デフォルト値を確認するには、次を実行します：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

設定例:

```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  env:
    - name: CLICKHOUSE_USER
      value: abc
```


## ClickStack UI（HyperDX）アプリケーション \{#hyperdx\}

### データソース設定 \{#datasource-settings\}

ClickStack UI では、各オブザーバビリティ・データタイプ／ピラーごとにソースをユーザーが定義する必要があります:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

この設定は、次に示すように `Team Settings -> Sources` からアプリケーション内でログ向けに行えます:

<Image img={hyperdx_25} alt="HyperDX ソース設定" size="lg"/>

これらの各ソースでは、作成時に少なくとも 1 つのテーブルと、HyperDX がデータをクエリできるようにする一連のカラムを指定する必要があります。

ClickStack に同梱されている [default OpenTelemetry (OTel) schema](/observability/integrating-opentelemetry#out-of-the-box-schema) を使用する場合、これらのカラムは各ソースに対して自動的に推論されます。[スキーマを変更する](#clickhouse) 場合やカスタムスキーマを使用する場合は、ユーザーがこれらのマッピングを指定および更新する必要があります。

:::note
ClickStack とともに配布される ClickHouse のデフォルトスキーマは、[ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) によって作成されるスキーマです。これらのカラム名は、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/) に記載されている OTel 公式仕様に対応しています。
:::

各ソースには、次の設定が利用可能です:

#### Logs \{#logs\}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | ソース名。                                                                                                              | Yes      | No                          | –                                                   |
| `Server Connection`           | サーバー接続名。                                                                                                        | Yes      | No                          | `Default`                                             |
| `Database`                    | ClickHouse データベース名。                                                                                             | Yes      | Yes                         | `default`                                             |
| `Table`                       | 対象テーブル名。デフォルトスキーマを使用する場合は `otel_logs` を指定します。                                           | Yes      | No                         |                                            |
| `Timestamp Column`            | プライマリキーの一部となる日時カラムまたは式。                                                                          | Yes       | Yes                         | `TimestampTime`                                       |
| `Default Select`              | デフォルトの検索結果で表示されるカラム。                                                                                | Yes       | Yes                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`     | サービス名用の式またはカラム。                                                                                          | Yes       | Yes                         | `ServiceName`                                         |
| `Log Level Expression`        | ログレベル用の式またはカラム。                                                                                          | Yes       | Yes                         | `SeverityText`                                        |
| `Body Expression`             | ログメッセージ用の式またはカラム。                                                                                      | Yes       | Yes                         | `Body`                                                |
| `Log Attributes Expression`   | カスタムログ属性用の式またはカラム。                                                                                    | Yes       | Yes                         | `LogAttributes`                                       |
| `Resource Attributes Expression` | リソースレベル属性用の式またはカラム。                                                                               | Yes       | Yes                         | `ResourceAttributes`                                  |
| `Displayed Timestamp Column`  | UI 表示に使用されるタイムスタンプカラム。                                                                               | Yes       | Yes                         | `ResourceAttributes`                                  |
| `Correlated Metric Source`    | 相関付けられたメトリクスソース（例: HyperDX メトリクス）。                                                              | No       | No                          | –                                                   |
| `Correlated Trace Source`     | 相関付けられたトレースソース（例: HyperDX トレース）。                                                                  | No       | No                          | –                                                   |
| `Trace Id Expression`         | Trace ID を抽出するための式またはカラム。                                                                               | Yes       | Yes                         | `TraceId`                                             |
| `Span Id Expression`          | Span ID を抽出するための式またはカラム。                                                                                | Yes       | Yes                         | `SpanId`                                              |
| `Implicit Column Expression`  | フィールドが指定されていない場合に全文検索（Lucene スタイル）に使用されるカラム。通常はログ本文。                      | Yes       | Yes                         | `Body`                                                |
| `Highlighted Attributes`      | ログ詳細を開いたときに表示される式またはカラム。URL を返す式はリンクとして表示されます。                               | No        | No                          |  –                                                  |
| `Highlighted Trace Attributes` | トレース内の各ログから抽出され、トレースウォーターフォールの上部に表示される式またはカラム。URL を返す式はリンクとして表示されます。 | No  | No   |  –                                                  |

#### トレース \{#traces\}

| Setting                          | 説明                                                                                                                    | 必須     | デフォルトスキーマで推論 | 推論値                    |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|---------------------------|--------------------------|
| `Name`                           | ソース名。                                                                                                              | Yes      | No                        | –                        |
| `Server Connection`              | サーバー接続名。                                                                                                        | Yes      | No                        | `Default`                |
| `Database`                       | ClickHouse データベース名。                                                                                             | Yes      | Yes                       | `default`                |
| `Table`                          | 対象テーブル名。デフォルトスキーマを使用する場合は `otel_traces` を指定します。                                        | Yes      | Yes                       | -                        |
| `Timestamp Column`               | プライマリキーの一部である日時カラムまたは式。                                                                          | Yes      | Yes                       | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` のエイリアス。                                                                                       | Yes      | Yes                       | `Timestamp`              |
| `Default Select`                 | デフォルトの検索結果で表示されるカラム。                                                                                | Yes      | Yes                       | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`            | Span の継続時間を計算するための式。                                                                                     | Yes      | Yes                       | `Duration`               |
| `Duration Precision`             | 継続時間式の精度（例: ナノ秒、マイクロ秒）。                                                                            | Yes      | Yes                       | ns                       |
| `Trace Id Expression`            | Trace ID 用の式またはカラム。                                                                                           | Yes      | Yes                       | `TraceId`                |
| `Span Id Expression`             | Span ID 用の式またはカラム。                                                                                            | Yes      | Yes                       | `SpanId`                 |
| `Parent Span Id Expression`      | 親 Span ID 用の式またはカラム。                                                                                         | Yes      | Yes                       | `ParentSpanId`           |
| `Span Name Expression`           | Span 名用の式またはカラム。                                                                                             | Yes      | Yes                       | `SpanName`               |
| `Span Kind Expression`           | Span の種別（例: client, server）用の式またはカラム。                                                                   | Yes      | Yes                       | `SpanKind`               |
| `Correlated Log Source`          | オプション。関連付けるログソース（例: HyperDX のログ）。                                                                | No       | No                        | –                        |
| `Correlated Session Source`      | オプション。関連付けるセッションソース。                                                                                | No       | No                        | –                        |
| `Correlated Metric Source`       | オプション。関連付けるメトリックソース（例: HyperDX のメトリクス）。                                                    | No       | No                        | –                        |
| `Status Code Expression`         | Span ステータスコード用の式。                                                                                           | Yes      | Yes                       | `StatusCode`             |
| `Status Message Expression`      | Span ステータスメッセージ用の式。                                                                                       | Yes      | Yes                       | `StatusMessage`          |
| `Service Name Expression`        | サービス名用の式またはカラム。                                                                                          | Yes      | Yes                       | `ServiceName`            |
| `Resource Attributes Expression` | リソースレベルの属性用の式またはカラム。                                                                                | Yes      | Yes                       | `ResourceAttributes`     |
| `Event Attributes Expression`    | イベント属性用の式またはカラム。                                                                                        | Yes      | Yes                       | `SpanAttributes`         |
| `Span Events Expression`         | Span イベントを抽出するための式。通常は `Nested` 型カラムです。対応言語の SDKS を使用している場合、例外スタックトレースをレンダリングできるようにします。 | Yes      | Yes                       | `Events`                 |
| `Implicit Column Expression`     | フィールドが指定されていない場合に全文検索（Lucene 形式）に使用されるカラム。通常はログ本文です。                       | Yes      | Yes                       | `SpanName`              |
| `Highlighted Attributes`         | Span の詳細を開いたときに表示される式またはカラム。URL を返す式はリンクとして表示されます。                            | No       | No                        | –                        |
| `Highlighted Trace Attributes`   | トレース内の各 Span から抽出され、トレースウォーターフォールの上部に表示される式またはカラム。URL を返す式はリンクとして表示されます。 | No       | No                        | –                        |

#### メトリクス \{#metrics\}

| 設定                   | 説明                                                                                          | 必須     | デフォルトスキーマで推論   | 推論される値                |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | データソース名。                                                                               | はい     | いいえ                      | –                           |
| `Server Connection`    | サーバー接続名。                                                                               | はい     | いいえ                      | `Default`                   |
| `Database`             | ClickHouse データベース名。                                                                    | はい     | はい                        | `default`                   |
| `Gauge Table`          | ゲージ型メトリクスを格納するテーブル。                                                         | はい     | いいえ                      | `otel_metrics_gauge`        |
| `Histogram Table`      | ヒストグラム型メトリクスを格納するテーブル。                                                   | はい     | いいえ                      | `otel_metrics_histogram`    |
| `Sum Table`            | 合計型（カウンター）メトリクスを格納するテーブル。                                             | はい     | いいえ                      | `otel_metrics_sum`          |
| `Correlated Log Source`| 任意。相関付けるログソース（例: HyperDX のログ）。                                             | いいえ   | いいえ                      | –                           |

#### セッション \{#settings\}

| 設定                            | 説明                                                                                                      | 必須     | デフォルトスキーマでの推論 | 推論値                  |
|---------------------------------|-----------------------------------------------------------------------------------------------------------|----------|-----------------------------|-------------------------|
| `Name`                          | ソース名。                                                                                                 | はい     | いいえ                      | –                       |
| `Server Connection`             | サーバー接続名。                                                                                           | はい     | いいえ                      | `Default`               |
| `Database`                      | ClickHouse データベース名。                                                                               | はい     | はい                        | `default`               |
| `Table`                         | セッションデータの格納先テーブル。デフォルトスキーマを使用する場合は `hyperdx_sessions` に設定します。   | はい     | はい                        | -                       |
| `Timestamp Column`              | プライマリキーの一部となる日時カラムまたは式。                                                            | はい     | はい                        | `TimestampTime`         |
| `Log Attributes Expression`     | セッションデータからログレベル属性を抽出するための式。                                                    | はい     | はい                        | `LogAttributes`         |
| `LogAttributes`                 | ログ属性を保存するために使用されるエイリアスまたはフィールド参照。                                       | はい     | はい                        | `LogAttributes`         |
| `Resource Attributes Expression` | リソースレベルのメタデータを抽出するための式。                                                            | はい     | はい                        | `ResourceAttributes`    |
| `Correlated Trace Source`       | 任意。セッションを相関付けるために関連付けるトレースソース。                                             | いいえ   | いいえ                      | –                       |
| `Implicit Column Expression`    | フィールドが指定されていない場合に全文検索に使用されるカラム（例: Lucene スタイルのクエリ解析）。        | はい     | はい                        | `Body`                  |

#### 強調属性 \{#highlighted-attributes\}

強調属性 (Highlighted Attributes) と 強調トレース属性 (Highlighted Trace Attributes) は、Log と Trace のデータソースで設定できます。

- 強調属性は、ログまたはスパンの詳細を表示する際に、各ログまたはスパンごとに表示されるカラムまたは式です。
- 強調トレース属性は、トレース内の各ログまたはスパンからクエリされ、トレースウォーターフォールの上部に表示されるカラムまたは式です。

これらの属性はソース設定内で定義され、任意の SQL 式を指定できます。SQL 式が URL 形式の値を返す場合、その属性はリンクとして表示されます。空の値は表示されません。

例えば、このトレースソースでは、強調属性と強調トレース属性が設定されています:

<Image img={highlighted_attributes_config} alt="強調属性の設定" size="md"/>

これらの属性は、ログまたはスパンをクリックした後、サイドパネルに表示されます:

<Image img={highlighted_attributes} alt="強調属性" size="md"/>

属性をクリックすると、その属性を検索値として利用するためのオプションが表示されます。属性設定でオプションの Lucene 式が指定されている場合、検索には SQL 式ではなく、その Lucene 式が使用されます。

<Image img={highlighted_attributes_search} alt="強調属性の検索" size="md"/>

### 相関ソース \{#correlated-sources\}

ClickStack で完全なソース間の相関付けを有効にするには、logs、traces、metrics、sessions の相関ソースを構成する必要があります。これにより、HyperDX は関連するデータを相関付け、イベントを表示するときに豊富なコンテキストを提供できます。

- `Logs`: traces および metrics と相関付けることができます。
- `Traces`: logs、sessions、および metrics と相関付けることができます。
- `Metrics`: logs と相関付けることができます。
- `Sessions`: traces と相関付けることができます。

これらの相関関係を設定すると、複数の機能を利用できるようになります。たとえば、HyperDX は trace の横に関連する logs を表示したり、session に紐づく metric の異常を検出して表示したりできます。

たとえば、以下は Logs ソースで相関ソースを構成した例です。

<Image img={hyperdx_26} alt="HyperDX Source の相関設定" size="md"/>

### アプリケーションの構成設定 \{#application-configuration-settings\}

:::note ClickHouse Cloud における HyperDX
ClickHouse Cloud で HyperDX が管理されている場合、これらの設定は変更できません。
:::

* `HYPERDX_API_KEY`
  * **デフォルト:** なし（必須）
  * **説明:** HyperDX API の認証キー。
  * **ガイダンス:**
  * テレメトリおよびログ収集に必須
  * ローカル開発では、空でない任意の値で可
  * 本番環境では、安全で一意なキーを使用すること
  * アカウント作成後、チーム設定ページから取得可能

* `HYPERDX_LOG_LEVEL`
  * **デフォルト:** `info`
  * **説明:** ログ出力レベル（詳細度）を設定します。
  * **オプション:** `debug`, `info`, `warn`, `error`
  * **ガイダンス:**
  * 詳細なトラブルシューティングには `debug` を使用します。
  * 通常運用には `info` を使用します。
  * 本番環境ではログ量を減らすために `warn` または `error` を使用します。

* `HYPERDX_API_PORT`
  * **デフォルト:** `8000`
  * **説明:** HyperDX API サーバー用のポート。
  * **ガイドライン:**
  * このポートがホスト上で利用可能であることを確認してください
  * ポート競合がある場合は変更してください
  * API クライアント設定で指定しているポートと一致させる必要があります

* `HYPERDX_APP_PORT`
  * **デフォルト:** `8000`
  * **説明:** HyperDX フロントエンドアプリケーション用のポート。
  * **ガイダンス:**
  * このポートがホスト上で利用可能であることを確認する
  * ポートが競合している場合は変更する
  * ブラウザからアクセス可能でなければならない

* `HYPERDX_APP_URL`
  * **デフォルト:** `http://localhost`
  * **説明:** フロントエンドアプリのベースURL。
  * **ガイダンス:**
  * 本番環境では運用ドメインを設定する
  * プロトコル (http/https) を含める
  * 末尾にスラッシュを付けない

* `MONGO_URI`
  * **デフォルト:** `mongodb://db:27017/hyperdx`
  * **説明:** MongoDB の接続文字列。
  * **ガイダンス:**
  * ローカル開発用の Docker ではデフォルトを使用する
  * 本番環境では安全な接続文字列を使用する
  * 必要に応じて認証情報を接続文字列に含める
  * 例: `mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **デフォルト:** `http://miner:5123`
  * **説明:** ログパターンマイニングサービスの URL です。
  * **ガイダンス:**
  * Docker を用いたローカル開発ではデフォルトを使用します
  * 本番環境では運用中の miner サービスの URL を指定します
  * API サービスからアクセス可能である必要があります

* `FRONTEND_URL`
  * **デフォルト:** `http://localhost:3000`
  * **説明:** フロントエンドアプリケーションのURL。
  * **ガイドライン:**
  * ローカル開発ではデフォルトを使用する
  * 本番環境では自分のドメインを設定する
  * APIサービスから到達可能である必要がある

* `OTEL_SERVICE_NAME`
  * **Default:** `hdx-oss-api`
  * **Description:** OpenTelemetry インストルメンテーション用のサービス名。
  * **Guidance:**
  * HyperDX サービスには、わかりやすい名前を使用してください。HyperDX 自体をインストルメントする場合に適用されます。
  * テレメトリデータ内で HyperDX サービスを識別しやすくします。

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **デフォルト:** `http://localhost:4318`
  * **説明:** OpenTelemetry collector のエンドポイント。
  * **ガイダンス:**
  * HyperDX をセルフインストルメントする場合に関連します。
  * ローカル開発ではデフォルトを使用します。
  * 本番環境では利用する collector の URL を設定します。
  * HyperDX サービスから到達可能である必要があります。

* `USAGE_STATS_ENABLED`
  * **デフォルト:** `true`
  * **説明:** 利用状況の統計情報収集のオン/オフを切り替えます。
  * **ガイダンス:**
  * 利用状況トラッキングを無効化するには `false` に設定します。
  * プライバシー要件の厳しいデプロイメントで有用です。
  * 製品改善に役立てるため、デフォルトは `true` です。

* `IS_OSS`
  * **デフォルト:** `true`
  * **説明:** OSS モードで動作しているかどうかを示します。
  * **ガイダンス:**
  * オープンソース版のデプロイメントでは `true` のままにします
  * エンタープライズ版デプロイメントでは `false` に設定します
  * 利用可能な機能に影響します

* `IS_LOCAL_MODE`
  * **デフォルト:** `false`
  * **説明:** ローカルモードで実行しているかどうかを示します。
  * **ガイダンス:**
  * ローカル開発時には `true` に設定します
  * 一部の本番向け機能が無効になります
  * テストや開発用途に有用です

* `EXPRESS_SESSION_SECRET`
  * **デフォルト:** `hyperdx is cool 👋`
  * **説明:** Express セッション管理用のシークレット。
  * **ガイダンス:**
  * 本番環境では必ず変更すること
  * 強力でランダムな文字列を使用すること
  * 秘密情報として安全に保管すること

* `ENABLE_SWAGGER`
  * **デフォルト:** `false`
  * **説明:** Swagger API ドキュメントの有効化を切り替えます。
  * **ガイダンス:**
  * API ドキュメントを有効にするには `true` に設定します
  * 開発およびテスト環境で有用です
  * 本番環境では無効にしてください

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **デフォルト:** `false`
  * **説明:** HyperDX における JSON 型のベータ版サポートを有効にします。OTel collector で JSON サポートを有効にするには、[`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) も参照してください。
  * **ガイダンス:**
  * ClickStack で JSON サポートを有効にするには、`true` に設定します。

## OpenTelemetry collector \{#otel-collector\}

詳しくは ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。

- `CLICKHOUSE_ENDPOINT`
  - **デフォルト:** スタンドアロンイメージの場合は *なし（必須）*。All-in-one または Docker Compose ディストリビューションの場合は、統合された ClickHouse インスタンスに設定されます。
  - **説明:** テレメトリデータをエクスポートする ClickHouse インスタンスの HTTPS URL。
  - **ガイダンス:**
    - ポートを含む完全な HTTPS エンドポイントである必要があります（例: `https://clickhouse.example.com:8443`）
    - コレクターが ClickHouse にデータを送信するために必須です

- `CLICKHOUSE_USER`
  - **デフォルト:** `default`
  - **説明:** ClickHouse インスタンスに対して認証するために使用されるユーザー名。
  - **ガイダンス:**
    - ユーザーに `INSERT` と `CREATE TABLE` の権限が付与されていることを確認してください
    - インジェスト専用のユーザーを作成することを推奨します

- `CLICKHOUSE_PASSWORD`
  - **デフォルト:** *なし（認証が有効な場合は必須）*
  - **説明:** 指定された ClickHouse ユーザーのパスワード。
  - **ガイダンス:**
    - ユーザーアカウントにパスワードが設定されている場合は必須です
    - 本番デプロイメントでは Secret などを用いて安全に保存してください

- `HYPERDX_LOG_LEVEL`
  - **デフォルト:** `info`
  - **説明:** コレクターのログ詳細レベル。
  - **ガイダンス:**
    - `debug`、`info`、`warn`、`error` などの値を受け付けます
    - トラブルシューティング時には `debug` を使用してください

- `OPAMP_SERVER_URL`
  - **デフォルト:** スタンドアロンイメージの場合は *なし（必須）*。All-in-one または Docker Compose ディストリビューションの場合は、デプロイされた HyperDX インスタンスを指します。
  - **説明:** コレクターを管理するために使用される OpAMP サーバー（例: HyperDX インスタンス）の URL。デフォルトではポート `4320` を使用します。
  - **ガイダンス:**
    - 自身の HyperDX インスタンスを指す必要があります
    - 動的な設定と安全なインジェストを有効にします
    - 省略した場合、`OTLP_AUTH_TOKEN` が指定されていない限り、安全なインジェストは無効になります

- `OTLP_AUTH_TOKEN`
  - **デフォルト:** *なし*。スタンドアロンイメージでのみ使用されます。
  - **説明:** OTLP 認証トークンを指定できます。設定されている場合、すべての通信でこの Bearer トークンが必須になります。
  - **ガイダンス:**
    - 本番環境でスタンドアロンのコレクターイメージを使用する場合に推奨されます。
    
- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **デフォルト:** `default`
  - **説明:** コレクターがテレメトリデータを書き込む ClickHouse データベース。
  - **ガイダンス:**
    - カスタムのデータベース名を使用する場合に設定してください
    - 指定したユーザーがこのデータベースへアクセスできることを確認してください

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **デフォルト:** `<empty string>`
  - **説明:** コレクターで有効にするフィーチャーフラグを指定します。`--feature-gates=clickhouse.json` を設定すると、コレクターで JSON 型の Beta サポートが有効になり、スキーマがその型で作成されるようになります。HyperDX で JSON サポートを有効にするには、[`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) も参照してください。
  - **ガイダンス:**
  - ClickStack で JSON サポートを有効にするには `true` を設定します。

## ClickHouse \{#clickhouse\}

ClickStack Open Source には、マルチテラバイト規模向けに設計されたデフォルトの ClickHouse 構成が含まれていますが、ユーザーはワークロードに合わせて自由に変更・最適化できます。

ClickHouse を効果的にチューニングするには、[parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards) といった主要なストレージの概念や、インサート時にどのように [merges](/merges) が発生するかを理解しておく必要があります。[primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes)、およびデータスキッピング索引の基礎を確認し、さらに有効期限 (TTL) を利用したデータ有効期限管理など、[データライフサイクル管理](/observability/managing-data) のテクニックも合わせて確認することを推奨します。

ClickStack は [スキーマのカスタマイズ](/use-cases/observability/schema-design) をサポートしており、カラム型の変更、（ログなどからの）新しいフィールドの抽出、コーデックやディクショナリの適用、そして PROJECTION を用いたクエリの高速化が可能です。

さらに、materialized view を使用して、VIEW のソーステーブルにデータを書き込み、アプリケーションがターゲットテーブルから読み取るという前提で、[インジェスト時にデータを変換またはフィルタリング](/use-cases/observability/schema-design#materialized-columns) できます。materialized view は、ClickStack において [クエリをネイティブに高速化](/use-cases/observability/clickstack/materialized_views) する用途にも利用できます。

詳細については、スキーマ設計、索引戦略、およびデータ管理のベストプラクティスに関する ClickHouse ドキュメントを参照してください。これらの多くは ClickStack デプロイメントにもそのまま適用できます。