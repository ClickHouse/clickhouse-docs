---
'slug': '/use-cases/observability/clickstack/deployment/local-mode-only'
'title': 'ローカルモードのみ'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'ローカルモードのみでの ClickStack のデプロイ - ClickHouse 観測スタック'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

以下の内容は、全てのClickStackコンポーネントをバンドルした包括的なDockerイメージです。これは、[オールインワン画像](/use-cases/observability/clickstack/deployment/docker-compose) に似ています。

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) コレクター**（ポート `4317` および `4318` でOTLPを公開）
* **MongoDB**（持続的アプリケーション状態用）

**ただし、このHyperDXの配布版ではユーザー認証は無効になっています。**

### 適しているもの {#suitable-for}

* デモ
* デバッグ
* HyperDXが使用される開発

## デプロイ手順 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Dockerでデプロイする {#deploy-with-docker}

ローカルモードでは、ポート8080でHyperDX UIをデプロイします。

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### HyperDX UIに移動する {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIに移動します。

**このデプロイメントモードでは認証が有効になっていないため、ユーザーの作成を促されることはありません。**

自分の外部ClickHouseクラスターに接続します。例：ClickHouse Cloud。

<Image img={hyperdx_2} alt="ログイン作成" size="md"/>

ソースを作成し、すべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`という値を入力します。他のすべての設定は自動的に検出されるため、`Save New Source`をクリックできます。

<Image img={hyperdx_logs} alt="ログソース作成" size="md"/>

</VerticalStepper>

<JSONSupport/>

ローカルモード専用イメージでは、ユーザーは `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメータを設定する必要があります。例：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
