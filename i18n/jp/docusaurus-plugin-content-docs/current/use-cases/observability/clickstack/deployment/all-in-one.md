---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'オールインワン'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack のオールインワンデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack', 'オブザーバビリティ', 'オールインワン', 'デプロイメント']
---

import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

この包括的な Docker イメージには、すべての ClickStack コンポーネントがバンドルされています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（ポート `4317` および `4318` で OTLP を公開）
* **MongoDB**（アプリケーション状態の永続化用）

このオプションには認証機能が含まれており、ダッシュボード、アラート、保存した検索結果を、セッションやユーザーをまたいで保持できます。

### 想定される用途

* デモ
* スタック全体のローカルテスト


## デプロイ手順 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Docker でデプロイする {#deploy-with-docker}

次のコマンドを実行すると、OpenTelemetry コレクター（ポート 4317 および 4318）と HyperDX UI（ポート 8080）が起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、要件を満たすユーザー名とパスワードを入力します。 

`Create` をクリックすると、組み込みの ClickHouse インスタンス向けのデータソースが作成されます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

別の ClickHouse インスタンスを使用する例については、「[ClickHouse Cloud への接続を作成する](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)」を参照してください。

### データを取り込む {#ingest-data}

データを取り込む方法については、「[データの取り込み](/use-cases/observability/clickstack/ingesting-data)」を参照してください。

</VerticalStepper>



## データと設定の永続化 {#persisting-data-and-settings}

コンテナの再起動後もデータと設定を保持するには、上記の docker コマンドを変更し、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` の各パスをマウントします。例えば次のようにします:



```shell
# ディレクトリの存在を確認
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# パスをマウントするようコマンドを変更
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

次の理由から、このオプションを本番環境にデプロイするべきではありません。

- **永続ストレージではない:** すべてのデータは、Docker ネイティブのオーバーレイファイルシステムに保存されます。この構成では大規模環境でのパフォーマンスに対応できず、コンテナが削除または再起動された場合、ユーザーが[必要なファイルパスをマウント](#persisting-data-and-settings)しない限り、データは失われます。
- **コンポーネント分離の欠如:** すべてのコンポーネントが単一の Docker コンテナ内で動作します。このため、個別のスケーリングや監視ができず、設定した `cgroup` 制限はすべてのプロセスに対してグローバルに適用されます。その結果、コンポーネント同士が CPU やメモリを奪い合う可能性があります。



## ポートのカスタマイズ

HyperDX Local が使用するアプリケーションポート (8080) および API ポート (8000) をカスタマイズする必要がある場合は、`docker run` コマンドを変更して適切なポートをフォワードし、いくつかの環境変数を設定する必要があります。

OpenTelemetry のポートは、ポートフォワーディングフラグを変更するだけでカスタマイズできます。たとえば、OpenTelemetry の HTTP ポートを 4999 に変更するには、`-p 4318:4318` を `-p 4999:4318` に置き換えます。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## ClickHouse Cloud の使用

このディストリビューションは ClickHouse Cloud と併用できます。ローカルの ClickHouse インスタンスも引き続きデプロイされますが（実際には使用されません）、環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` を設定することで、OTel collector が ClickHouse Cloud インスタンスを使用するように構成できます。

例:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` には、ポート `8443` を含む ClickHouse Cloud の HTTPS エンドポイントを指定してください。例: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

HyperDX の UI にアクセスしたら、[`Team Settings`](http://localhost:8080/team) に移動し、ClickHouse Cloud サービスへの接続を作成し、続けて必要なソースを作成します。具体的な手順例は[こちら](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。


## OpenTelemetry Collector の設定

必要に応じて OTel collector の設定を変更できます。詳細は「[設定の変更](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)」を参照してください。

<JSONSupport />

例えば、次のとおりです。

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
