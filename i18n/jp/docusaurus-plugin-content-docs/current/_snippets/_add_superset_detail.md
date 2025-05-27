---
{}
---



<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは[Docker Composeを使用したSupersetのローカルインストール](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)の手順を提供しています。 GitHubからApache Supersetリポジトリをチェックアウトした後、最新の開発コードまたは特定のタグを実行できます。 `pre-release`とマークされていない最新リリースであるバージョン2.0.0を推奨します。

`docker compose`を実行する前に、いくつかの作業を行う必要があります：

1. 公式のClickHouse Connectドライバーを追加する
2. Mapbox APIキーを取得し、環境変数として追加する (オプション)
3. 実行するSupersetのバージョンを指定する

:::tip
以下のコマンドは、GitHubリポジトリのトップレベルである `superset` から実行する必要があります。
:::

## 公式のClickHouse Connectドライバー {#official-clickhouse-connect-driver}

SupersetのデプロイメントでClickHouse Connectドライバーを利用できるようにするために、ローカルのrequirementsファイルに追加します：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

これはオプションです。Mapbox APIキーなしでSupersetに地理データをプロットできますが、キーを追加するように指示するメッセージが表示され、マップの背景画像が欠落します（データポイントのみが表示され、マップの背景は表示されません）。使用したい場合は、Mapboxは無料のティアを提供しています。

ガイドで作成するサンプルビジュアリゼーションのいくつかは、経度や緯度などの位置データを使用します。SupersetはMapboxマップをサポートしています。Mapboxビジュアリゼーションを使用するには、Mapbox APIキーが必要です。 [Mapboxの無料ティア](https://account.mapbox.com/auth/signup/)にサインアップし、APIキーを生成してください。

APIキーをSupersetに利用可能にします：

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Supersetバージョン2.0.0をデプロイ {#deploy-superset-version-200}

リリース2.0.0をデプロイするには、次のコマンドを実行します：

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
