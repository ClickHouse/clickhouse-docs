<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは、[Docker Composeを使用してSupersetをローカルにインストールする](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)手順を提供しています。 GitHubからApache Supersetのリポジトリをチェックアウトした後、最新の開発コードまたは特定のタグを実行することができます。リリース2.0.0は、`pre-release`としてマークされていない最新のリリースであるため、お勧めします。

`docker compose`を実行する前にいくつかの作業を行う必要があります：

1. 公式のClickHouse Connectドライバーを追加する
2. Mapbox APIキーを取得し、それを環境変数として追加する（オプション）
3. 実行するSupersetのバージョンを指定する

:::tip
以下のコマンドは、GitHubリポジトリのトップレベル`superset`から実行します。
:::

## 公式ClickHouse Connectドライバー {#official-clickhouse-connect-driver}

ClickHouse ConnectドライバーをSupersetデプロイメントで使用できるようにするには、ローカルのrequirementsファイルに追加します：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox{#mapbox}

これはオプションですが、Mapbox APIキーなしでSupersetに位置データをプロットすることができます。ただし、キーを追加する必要があるというメッセージが表示され、マップの背景画像が表示されなくなります（データポイントだけが表示され、マップの背景は表示されません）。 Mapboxは、使用したい場合に無料プランを提供しています。

ガイドで作成するいくつかのサンプル視覚化は、緯度や経度などの位置データを使用します。 SupersetはMapboxマップをサポートしています。Mapboxの視覚化を使用するには、Mapbox APIキーが必要です。[Mapboxの無料プラン](https://account.mapbox.com/auth/signup/)にサインアップし、APIキーを生成してください。

APIキーをSupersetで使用できるようにします：

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
