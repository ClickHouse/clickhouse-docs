---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Docker Compose を使用した ClickStack のデプロイ - ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker deployment', 'ClickStack deployment guide', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

すべての ClickStack コンポーネントは、個別の Docker イメージとして提供されています。

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

これらのイメージは、Docker Compose を使用してローカル環境に組み合わせてデプロイできます。

Docker Compose は、デフォルトの `otel-collector` セットアップに基づき、オブザーバビリティおよびインジェスト用途向けに追加のポートを公開します。

* `13133`: `health_check` 拡張機能用のヘルスチェックエンドポイント
* `24225`: ログインジェスト用の Fluentd レシーバー
* `4317`: OTLP gRPC レシーバー（トレース、ログ、メトリクス用の標準）
* `4318`: OTLP HTTP レシーバー（gRPC の代替）
* `8888`: コレクター自身を監視するための Prometheus メトリクスエンドポイント

これらのポートにより、多様なテレメトリソースとの連携が可能になり、OpenTelemetry collector はさまざまなインジェスト要件に対応できる本番運用向けの構成になります。


### 適しているケース {#suitable-for}

* ローカルでのテスト
* PoC（概念実証）
* フォールトトレランスが不要で、1 台のサーバーで全ての ClickHouse データをホストできるプロダクション環境向けのデプロイ
* ClickStack はデプロイするが ClickHouse は別でホストする場合（例: ClickHouse Cloud を利用する場合）

## デプロイ手順 {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### リポジトリをクローンする {#clone-the-repo}

Docker Compose を使用してデプロイするには、HyperDX リポジトリをクローンし、そのディレクトリに移動して `docker-compose up` を実行します:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
docker compose up
```

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を表示します。

ユーザー名と、要件を満たすパスワードを入力してユーザーを作成します。 

`Create` をクリックすると、Helm チャートでデプロイされた ClickHouse インスタンス用のデータソースが作成されます。

:::note 既定の接続の上書き
統合された ClickHouse インスタンスへの既定の接続は上書きできます。詳細については、「[Using ClickHouse Cloud](#using-clickhouse-cloud)」を参照してください。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

別の ClickHouse インスタンスを使用する例については、「[Create a ClickHouse Cloud connection](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)」を参照してください。

### 接続情報を入力する {#complete-connection-details}

デプロイ済みの ClickHouse インスタンスに接続するには、**Create** をクリックして既定の設定をそのまま使用します。  

**外部 ClickHouse クラスター**（例: ClickHouse Cloud）に接続したい場合は、接続用の認証情報を手動で入力します。

データソースの作成を求められた場合は、既定値をすべて維持し、`Table` フィールドに `otel_logs` を入力します。他の設定は自動検出されるため、そのまま `Save New Source` をクリックできます。

<Image img={hyperdx_logs} alt="ログソースの作成" size="md"/>

</VerticalStepper>

## compose 設定の変更

ユーザーは、使用するバージョンなどのスタック設定を、環境変数ファイルで変更できます。

```shell
user@example-host hyperdx % cat .env
# docker-compose.yml で使用
# docker-compose.yml で使用
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

# ドメイン URL の設定
HYPERDX_API_PORT=8000 # 任意（他のサービスで使用されていないポートを指定すること）
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# OTel/ClickHouse 設定
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### OpenTelemetry collector の設定 {#configuring-collector}

必要に応じて OTel collector の設定を変更できます。設定の変更方法の詳細は、["Modifying configuration"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration) を参照してください。

## ClickHouse Cloud を使用する

このディストリビューションは ClickHouse Cloud と併用できます。ユーザーは次の手順を実行してください:

* `docker-compose.yaml` ファイルから ClickHouse のサービスを削除します。テスト用途であれば任意で、削除しない場合はデプロイされた ClickHouse インスタンスは単に無視されますが、ローカルリソースを無駄に消費します。サービスを削除する場合は、`depends_on` など当該サービスへの参照も削除してください。

* compose ファイル内で環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` を設定し、OTel collector が ClickHouse Cloud インスタンスを使用するように変更します。具体的には、OTel collector サービスにこれらの環境変数を追加します:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # ここに https エンドポイントを指定
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

  `CLICKHOUSE_ENDPOINT` には、ポート `8443` を含む ClickHouse Cloud の HTTPS エンドポイントを指定します。例: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

* HyperDX UI に接続して ClickHouse への接続を作成する際には、ClickHouse Cloud の認証情報を使用します。

<JSONSupport />

これらを設定するには、`docker-compose.yaml` 内の該当するサービスを編集します:

```yaml
  app:
    image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # JSONを有効化
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # 簡潔さのため省略

  otel-collector:
    image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # JSONを有効化
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # 簡潔さのため省略
```
