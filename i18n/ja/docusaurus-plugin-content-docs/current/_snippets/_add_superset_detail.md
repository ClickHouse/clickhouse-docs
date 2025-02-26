<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは、[Docker Composeを使用してSupersetをローカルにインストールする](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)手順を提供しています。GitHubからApache Supersetのリポジトリをチェックアウトした後、最新の開発コードまたは特定のタグを実行できます。最新の`pre-release`ではないリリースとして、2.0.0を推奨します。

`docker compose`を実行する前にやるべきタスクがいくつかあります：

1. 公式のClickHouse Connectドライバを追加する
2. Mapbox APIキーを取得し、環境変数として追加する（任意）
3. 実行するSupersetのバージョンを指定する

:::tip
以下のコマンドは、GitHubリポジトリのトップレベル `superset` から実行する必要があります。
:::

## 公式ClickHouse Connectドライバ {#official-clickhouse-connect-driver}

SupersetのデプロイメントでClickHouse Connectドライバを利用できるようにするためには、ローカルの要件ファイルに追加します：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

これは任意です。Mapbox APIキーがなくてもSupersetで位置データをプロットできますが、キーを追加する必要があるというメッセージが表示され、マップの背景画像が欠落します（データポイントのみが表示され、マップの背景は見えません）。Mapboxは、使用したい場合に無料プランを提供しています。

ガイドが作成するサンプルビジュアライゼーションのいくつかは、緯度と経度などの位置データを使用しています。Supersetには、Mapboxマップのサポートが含まれています。Mapboxのビジュアライゼーションを使用するには、Mapbox APIキーが必要です。[Mapboxの無料プラン](https://account.mapbox.com/auth/signup/)にサインアップし、APIキーを生成します。

APIキーをSupersetで利用できるようにします：

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Supersetバージョン2.0.0をデプロイする {#deploy-superset-version-200}

リリース2.0.0をデプロイするには、次のコマンドを実行します：

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
