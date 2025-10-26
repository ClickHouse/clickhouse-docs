---
'slug': '/use-cases/observability/clickstack/deployment/docker-compose'
'title': 'Docker Compose'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Docker Composeを使用したClickStackのデプロイ - ClickHouse観測スタック'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

All ClickStack components are distributed separately as individual Docker images:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

これらのイメージは、Docker Composeを使用して組み合わせてローカルにデプロイできます。

Docker Composeは、デフォルトの `otel-collector` セットアップに基づいて、可観測性と取り込みのために追加のポートを公開します。

- `13133`: `health_check` 拡張のためのヘルスチェックエンドポイント
- `24225`: ログ取り込みのためのFluentd受信
- `4317`: OTLP gRPC受信（トレース、ログ、およびメトリクスの標準）
- `4318`: OTLP HTTP受信（gRPCの代替）
- `8888`: コレクタ自体をモニタリングするためのPrometheusメトリクスエンドポイント

これらのポートは、さまざまなテレメトリソースとの統合を可能にし、多様な取り込みニーズに応じたOpenTelemetryコレクタをプロダクションレディにします。

### Suitable for {#suitable-for}

* ローカルテスト
* 概念実証
* フォールトトレランスが必要でなく、単一のサーバーで全てのClickHouseデータをホストするのに十分な運用展開
* ClickStackをデプロイするが、ClickHouseを別にホストする場合（例：ClickHouse Cloudを使用）

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Clone the repo {#clone-the-repo}

Docker Composeでデプロイするには、HyperDXリポジトリをクローンし、ディレクトリに移動して `docker-compose up` を実行します：

```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx

# switch to the v2 branch
git checkout v2
docker compose up
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

ユーザーを作成し、要件を満たすユーザー名とパスワードを提供してください。

`Create`をクリックすると、HelmチャートでデプロイしたClickHouseインスタンス用のデータソースが作成されます。

:::note デフォルト接続の上書き
統合されたClickHouseインスタンスへのデフォルト接続を上書きできます。詳細については、["Using ClickHouse Cloud"](#using-clickhouse-cloud)を参照してください。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

別のClickHouseインスタンスを使用する例については、["Create a ClickHouse Cloud connection"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### Complete connection details {#complete-connection-details}

デプロイされたClickHouseインスタンスに接続するには、単に**Create**をクリックし、デフォルト設定を受け入れます。

独自の**外部ClickHouseクラスタ**（例：ClickHouse Cloud）に接続する場合は、接続資格情報を手動で入力できます。

ソースの作成を求められた場合は、すべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`の値を設定します。他のすべての設定は自動的に検出されるため、`Save New Source`をクリックできます。

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

</VerticalStepper>

## Modifying compose settings {#modifying-settings}

ユーザーは、スタックの使用バージョンなどの設定を環境変数ファイルを通じて変更できます：

```shell
user@example-host hyperdx % cat .env

# Used by docker-compose.yml

# Used by docker-compose.yml
HDX_IMAGE_REPO=docker.hyperdx.io
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CODE_VERSION=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly


# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320


# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```

### Configuring the OpenTelemetry collector {#configuring-collector}

必要に応じてOTelコレクタの設定を変更できます - 詳細は、["Modifying configuration"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。

## Using ClickHouse Cloud {#using-clickhouse-cloud}

このディストリビューションはClickHouse Cloudとともに使用できます。ユーザーは次のことを行うべきです：

- `docker-compose.yaml` ファイルからClickHouseサービスを削除します。テスト中であればこれは任意ですが、デプロイされたClickHouseインスタンスは単に無視されることになります - ローカルリソースが無駄になるだけです。サービスを削除する場合は、`depends_on` などのサービスへの参照も削除してください。
- OTelコレクタをClickHouse Cloudインスタンスを使用するように変更し、composeファイル内の環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` を設定します。具体的には、環境変数をOTelコレクタサービスに追加します：

```shell
otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
    environment:
      CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # https endpoint here
      CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
      CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
      HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
    ports:
      - '13133:13133' # health_check extension
      - '24225:24225' # fluentd receiver
      - '4317:4317' # OTLP gRPC receiver
      - '4318:4318' # OTLP http receiver
      - '8888:8888' # metrics extension
    restart: always
    networks:
      - internal
```

    `CLICKHOUSE_ENDPOINT` はClickHouse CloudのHTTPSエンドポイントであり、「8443」ポートを含めます。例：`https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- HyperDX UIに接続し、ClickHouseへの接続を作成する際には、Cloudの資格情報を使用してください。

<JSONSupport/>

これらを設定するには、`docker-compose.yaml`内の関連するサービスを変更します：

```yaml
app:
  image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  ports:
    - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
    - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
  environment:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # enable JSON
    FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
    HYPERDX_API_KEY: ${HYPERDX_API_KEY}
    HYPERDX_API_PORT: ${HYPERDX_API_PORT}
  # truncated for brevity

otel-collector:
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
    CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
    # truncated for brevity
```
