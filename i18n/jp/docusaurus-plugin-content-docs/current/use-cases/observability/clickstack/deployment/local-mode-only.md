---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: "ローカルモードのみ"
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: "ローカルモードのみでClickStackをデプロイする - ClickHouse Observability Stack"
doc_type: "guide"
keywords:
  ["clickstack", "deployment", "setup", "configuration", "observability"]
---

import Image from "@theme/IdealImage"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import hyperdx_2 from "@site/static/images/use-cases/observability/hyperdx-2.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

[オールインワンイメージ](/use-cases/observability/clickstack/deployment/docker-compose)と同様に、この包括的なDockerイメージにはすべてのClickStackコンポーネントがバンドルされています:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) コレクター** (ポート`4317`および`4318`でOTLPを公開)
- **MongoDB** (永続的なアプリケーション状態の保存用)

**ただし、このHyperDXディストリビューションではユーザー認証が無効化されています**

### 適用対象 {#suitable-for}

- デモ
- デバッグ
- HyperDXを使用した開発


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Dockerでデプロイする {#deploy-with-docker}

ローカルモードでは、HyperDX UIをポート8080にデプロイします。

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### HyperDX UIにアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスして、HyperDX UIを開きます。

**このデプロイモードでは認証が有効になっていないため、ユーザー作成のプロンプトは表示されません。**

独自の外部ClickHouseクラスタ(例: ClickHouse Cloud)に接続します。

<Image img={hyperdx_2} alt='ログイン作成' size='md' />

ソースを作成し、すべてのデフォルト値を保持したまま、`Table`フィールドに`otel_logs`の値を入力します。その他の設定はすべて自動検出されるため、`Save New Source`をクリックできます。

<Image img={hyperdx_logs} alt='ログソースの作成' size='md' />

</VerticalStepper>

<JSONSupport />

ローカルモード専用イメージの場合、ユーザーは`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`パラメータを設定するだけで済みます。例:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
