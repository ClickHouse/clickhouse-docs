---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-only'
'title': 'HyperDX のみ'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'HyperDX のみをデプロイする'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

このオプションは、すでに稼働中の ClickHouse インスタンスに可観測性またはイベントデータが格納されているユーザーを対象としています。

HyperDX は、スタックの他の部分とは独立して使用でき、任意のデータスキーマと互換性があります - OpenTelemetry (OTel) のみではありません。これにより、既に ClickHouse 上に構築されたカスタム可観測性パイプラインに適しています。

完全な機能を利用するには、ダッシュボード、保存された検索、ユーザー設定、およびアラートを含むアプリケーションの状態を保存するための MongoDB インスタンスを提供する必要があります。

このモードでは、データの取り込みは完全にユーザーに委ねられます。ホスティングされた OpenTelemetry コレクター、自身のクライアントライブラリからの直接的な取り込み、ClickHouse ネイティブのテーブルエンジン（Kafka や S3 など）、ETL パイプライン、または ClickPipes のような管理された取り込みサービスを使用して、ClickHouse にデータを取り込むことができます。このアプローチは最大限の柔軟性を提供し、すでに ClickHouse を運用しているチームが、可視化、検索、アラートのために HyperDX を重ねて使用するのに適しています。

### 適用対象 {#suitable-for}

- 既存の ClickHouse ユーザー
- カスタムイベントパイプライン

## デプロイ手順 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Docker でデプロイ {#deploy-hyperdx-with-docker}

次のコマンドを実行し、`YOUR_MONGODB_URI` を必要に応じて修正してください。

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### HyperDX UI に移動 {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) を訪れて HyperDX UI にアクセスします。

ユーザーを作成し、要件を満たすユーザー名とパスワードを提供します。

`Create` をクリックすると、接続の詳細を求められます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 接続の詳細を完了する {#complete-connection-details}

自身の外部 ClickHouse クラスターに接続します（例: ClickHouse Cloud）。

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

ソースを作成するように求められた場合は、すべてのデフォルト値を保持し、`Table` フィールドを `otel_logs` の値で完了させます。その他の設定は自動検出されるので、`Save New Source` をクリックできます。

:::note ソース作成
ソースを作成するには、ClickHouse にテーブルが存在する必要があります。データがない場合は、ClickStack OpenTelemetry コレクターをデプロイしてテーブルを作成することをお勧めします。
:::

</VerticalStepper>

## Docker Compose の使用 {#using-docker-compose}

ユーザーは、[Docker Compose 設定](/use-cases/observability/clickstack/deployment/docker-compose) を修正して、このガイドと同じ効果を得ることができます。マニフェストから OTel コレクターと ClickHouse インスタンスを削除します。

## ClickStack OpenTelemetry コレクター {#otel-collector}

他のスタックコンポーネントとは独立して OpenTelemetry コレクターを管理している場合でも、ClickStack 配布版のコレクターを使用することをお勧めします。これにより、デフォルトのスキーマが使用され、取り込みのベストプラクティスが適用されます。

スタンドアロンコレクターのデプロイと設定に関する詳細は、["Ingesting with OpenTelemetry"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。

<JSONSupport/>

HyperDX 専用のイメージでは、ユーザーは `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメータを設定するだけで済みます。例えば、

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
