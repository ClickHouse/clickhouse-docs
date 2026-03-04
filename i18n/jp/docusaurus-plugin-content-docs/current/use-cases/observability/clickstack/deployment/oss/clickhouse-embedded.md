---
slug: /use-cases/observability/clickstack/deployment/clickhouse-embedded
title: 'ClickHouse への組み込み'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickHouse Server に組み込まれた ClickStack の利用 - ClickHouse オブザーバビリティ スタック'
doc_type: 'guide'
keywords: ['ClickStack 組み込み', 'ClickHouse 組み込み', 'ClickStack ClickHouse Server', '組み込みオブザーバビリティ']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import authenticate from '@site/static/images/clickstack/deployment/embedded/authenticate.png';
import create_source from '@site/static/images/clickstack/deployment/embedded/create-source.png';

ClickStack は ClickHouse サーバーのバイナリに直接バンドルされています。つまり、追加のコンポーネントをデプロイすることなく、ClickHouse インスタンスから ClickStack UI (HyperDX) にアクセスできます。このデプロイメントは [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) で公開されているデモと似ていますが、実際には自身の ClickHouse インスタンスとデータに対して実行されます。


### 適している用途 \{#suitable-for\}

* 最小限のセットアップで ClickStack を試したい場合
* 自分の ClickHouse データをオブザーバビリティ UI で探索する場合
* デモや評価の場合

### 制限事項 \{#limitations\}

この埋め込み版は**本番環境での利用を目的として設計されていません**。[本番運用向けの OSS デプロイメント](/use-cases/observability/clickstack/deployment/oss)と比較して、以下の機能は利用できません。

- [アラート機能](/use-cases/observability/clickstack/alerts)
- [ダッシュボード](/use-cases/observability/clickstack/dashboards)および[検索](/use-cases/observability/clickstack/search)の永続化機能 — ダッシュボードと保存済み検索はセッションをまたいで保持されません
- クエリ設定のカスタマイズ
- [イベントパターン](/use-cases/observability/clickstack/event_patterns)

## デプロイ手順 \{#deployment-steps\}

<VerticalStepper headerLevel="h3">

### ClickHouse を起動する \{#start-clickhouse\}

<Tabs groupId="install-method">
<TabItem value="docker" label="Docker" default>

パスワードを設定して ClickHouse サーバーイメージを取得して起動します:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
```

:::tip パスワードなしで実行する場合
パスワードなしで実行する場合は、`default` のデフォルトアクセス管理機能を明示的に有効にする必要があります:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
```
:::

</TabItem>
<TabItem value="binary" label="バイナリ">

ClickHouse をダウンロードして起動します:

```shell
curl https://clickhouse.com/ | sh

./clickhouse server
```

バイナリから実行する場合、`default` ユーザーにはパスワードが設定されていません。

</TabItem>
</Tabs>

### ClickStack UI を開く \{#navigate-to-clickstack-ui\}

ブラウザで [http://localhost:8123](http://localhost:8123) を開き、**ClickStack** をクリックします。

認証情報を入力します。上記の Docker の例を使用している場合、ユーザー名は `default`、パスワードは `password` です。バイナリを使用している場合、ユーザー名は `default` でパスワードは不要です。

<Image img={authenticate} alt="認証" size="lg"/>

### ソースを作成する \{#create-a-source\}

ログイン後、データソースの作成画面が表示されます。既存の OpenTelemetry テーブルがある場合は、デフォルト値はそのままにし、`Table` フィールドに適切なテーブル名（例: `otel_logs`）を入力します。その他の設定は自動検出されるため、そのまま `Save New Source` をクリックします。

まだデータがない場合は、利用可能なオプションについて ["Ingesting data"](/use-cases/observability/clickstack/ingesting-data) を参照してください。

<Image img={create_source} alt="ソースの作成" size="lg"/>

</VerticalStepper>

## 次のステップ \{#next-steps\}

評価を終えて本番運用に進む準備ができたら、次の本番向けデプロイメントを検討してください：

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — 永続化と認証を含む、すべてのコンポーネントを 1 つのコンテナにまとめた構成
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — より細かい制御が可能な個別コンポーネント構成
- [Helm](/use-cases/observability/clickstack/deployment/helm) — 本番環境の Kubernetes デプロイメントに推奨
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — ClickHouse Cloud 上でのフルマネージド構成