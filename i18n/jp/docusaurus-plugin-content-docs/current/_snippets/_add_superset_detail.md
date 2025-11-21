<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは[Docker Composeを使用したローカルへのSupersetインストール](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)の手順を提供しています。GitHubからApache Supersetリポジトリをクローンした後、最新の開発コードまたは特定のタグを実行できます。リリース2.0.0は`pre-release`とマークされていない最新リリースであるため推奨されます。

`docker compose`を実行する前に、以下のタスクを完了する必要があります:

1. 公式のClickHouse Connectドライバを追加する
2. Mapbox APIキーを取得し、環境変数として追加する(オプション)
3. 実行するSupersetのバージョンを指定する

:::tip
以下のコマンドは、GitHubリポジトリ`superset`のトップレベルディレクトリから実行してください。
:::


## 公式ClickHouse connectドライバー {#official-clickhouse-connect-driver}

SupersetデプロイメントでClickHouse Connectドライバーを利用可能にするには、ローカルのrequirementsファイルに追加してください:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox {#mapbox}

これはオプションです。Mapbox APIキーがなくてもSupersetで位置データをプロットできますが、キーを追加するよう促すメッセージが表示され、地図の背景画像が表示されません(データポイントのみが表示され、地図の背景は表示されません)。必要に応じて、Mapboxの無料プランをご利用いただけます。

ガイドで作成するサンプルビジュアライゼーションの一部では、経度や緯度などの位置データを使用します。SupersetはMapbox地図をサポートしています。Mapboxビジュアライゼーションを使用するには、Mapbox APIキーが必要です。[Mapbox無料プラン](https://account.mapbox.com/auth/signup/)に登録し、APIキーを生成してください。

APIキーをSupersetで利用可能にします:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-実際のキーを使用してください" >> docker/.env-non-dev
```


## Supersetバージョン2.0.0のデプロイ {#deploy-superset-version-200}

リリース2.0.0をデプロイするには、以下を実行します:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
