---
'slug': '/use-cases/observability/clickstack/deployment/all-in-one'
'title': '一体型'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'ClickHouseの可観測性スタックを使用したClickStackのデプロイ - All In One'
'doc_type': 'guide'
---

import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

この包括的なDockerイメージは、すべてのClickStackコンポーネントをバンドルしています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) コレクター**（ポート `4317` と `4318` でOTLPを公開）
* **MongoDB**（永続的なアプリケーションステート用）

このオプションには認証が含まれており、ダッシュボード、アラート、およびユーザーおよびセッション間で保存された検索の永続性を可能にします。

### 適用対象 {#suitable-for}

* デモ
* フルスタックのローカルテスト

## デプロイ手順 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Dockerでデプロイ {#deploy-with-docker}

以下のコマンドは、OpenTelemetryコレクター（ポート4317および4318）とHyperDX UI（ポート8080）を実行します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### HyperDX UIにアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIを使用します。

ユーザー名とパスワードを提供し、要件を満たすユーザーを作成します。 

`Create` をクリックすると、統合されたClickHouseインスタンス用のデータソースが作成されます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

別のClickHouseインスタンスを使用する例については、["ClickHouse Cloud接続を作成する"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### データを取り込む {#ingest-data}

データを取り込むには、["データの取り込み"](/use-cases/observability/clickstack/ingesting-data)を参照してください。

</VerticalStepper>

## データと設定の永続化 {#persisting-data-and-settings}

コンテナの再起動間でデータと設定を永続化するために、ユーザーは上記のdockerコマンドを修正して、`/data/db`、`/var/lib/clickhouse` および `/var/log/clickhouse-server`のパスをマウントすることができます。例えば：

```shell

# ensure directories exist
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs

# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## 本番環境へのデプロイ {#deploying-to-production}

このオプションは、以下の理由から本番にデプロイすべきではありません：

- **非永続ストレージ:** すべてのデータはDockerネイティブのオーバーレイファイルシステムを使用して保存されます。この設定はスケールでのパフォーマンスをサポートせず、コンテナが削除または再起動されるとデータは失われます - ユーザーが[必要なファイルパスをマウント](#persisting-data-and-settings)しない限り。
- **コンポーネントのアイソレーションが不足:** すべてのコンポーネントが単一のDockerコンテナ内で実行されます。これにより、独立したスケーリングやモニタリングが妨げられ、`cgroup`制限がすべてのプロセスに対してグローバルに適用されます。その結果、コンポーネントがCPUやメモリを競い合う可能性があります。

## ポートのカスタマイズ {#customizing-ports-deploy}

HyperDX Localが実行されるアプリケーション（8080）やAPI（8000）のポートをカスタマイズする必要がある場合、`docker run` コマンドを修正して適切なポートを転送し、いくつかの環境変数を設定する必要があります。

OpenTelemetryのポートは、ポートフォワーディングフラグを修正することで簡単に変更できます。例えば、`-p 4318:4318`を`-p 4999:4318`に置き換えることで、OpenTelemetryのHTTPポートを4999に変更できます。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## ClickHouse Cloudの使用 {#using-clickhouse-cloud}

このディストリビューションはClickHouse Cloudと一緒に使用できます。ローカルのClickHouseインスタンスはデプロイされ（無視されます）、OTelコレクターは環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`を設定することでClickHouse Cloudインスタンスを使用するように構成できます。

例えば：

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT`は、ポート `8443`を含むClickHouse CloudのHTTPSエンドポイントである必要があります。例：`https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

HyperDX UIに接続した後、[`チーム設定`](http://localhost:8080/team)に移動し、ClickHouse Cloudサービスに接続を作成します - その後、必要なソースを追加します。フローの例については、[こちらを参照してください](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

## OpenTelemetryコレクターの設定 {#configuring-collector}

OTelコレクターの設定は、必要に応じて修正できます - ["設定の修正"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。

<JSONSupport/>

例えば：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
