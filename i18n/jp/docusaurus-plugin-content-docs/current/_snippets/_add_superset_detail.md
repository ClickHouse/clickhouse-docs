

<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは、[Docker Composeを使用してSupersetをローカルにインストールする](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)ための手順を提供しています。 GitHubからApache Supersetのリポジトリをチェックアウトした後、最新の開発コードまたは特定のタグを実行できます。 `pre-release`としてマークされていない最新のリリースであるリリース2.0.0を推奨します。

`docker compose`を実行する前に、いくつかのタスクを行う必要があります:

1. 公式のClickHouse Connectドライバーを追加
2. Mapbox APIキーを取得し、環境変数として追加（オプション）
3. 実行するSupersetのバージョンを指定

:::tip
以下のコマンドは、GitHubリポジトリのトップレベルである`superset`から実行する必要があります。
:::

## 公式ClickHouse Connectドライバー {#official-clickhouse-connect-driver}

ClickHouse ConnectドライバーをSupersetのデプロイメントで利用可能にするため、ローカルのrequirementsファイルに追加します：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

これはオプションですが、Mapbox APIキーなしでSupersetに位置データをプロットできますが、キーを追加する必要があるというメッセージが表示され、地図の背景画像が欠落します（データポイントのみが表示され、地図の背景は表示されません）。使用したい場合は、Mapboxは無料プランを提供しています。

ガイドで作成するいくつかのサンプルビジュアライゼーションでは、緯度や経度などの位置データを使用します。SupersetはMapboxマップをサポートしています。Mapboxのビジュアライゼーションを使用するには、Mapbox APIキーが必要です。 [Mapboxの無料プラン](https://account.mapbox.com/auth/signup/)にサインアップし、APIキーを生成します。

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
