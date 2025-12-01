<details>
    <summary>DockerでApache Supersetを起動する</summary>

Supersetは[Docker Composeを使用したローカルへのSupersetインストール](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/)の手順を提供しています。GitHubからApache Supersetリポジトリをクローンした後、最新の開発コードまたは特定のタグを実行できます。リリース2.0.0は`pre-release`とマークされていない最新リリースであるため推奨します。

`docker compose`を実行する前に、以下のタスクを完了する必要があります:

1. 公式のClickHouse Connectドライバーを追加する
2. Mapbox APIキーを取得し、環境変数として追加する(オプション)
3. 実行するSupersetのバージョンを指定する

:::tip
以下のコマンドは、GitHubリポジトリ`superset`のトップレベルディレクトリから実行してください。
:::


## ClickHouse Connect の公式ドライバー {#official-clickhouse-connect-driver}

Superset のデプロイメントで ClickHouse Connect ドライバーを利用できるようにするには、ローカルの requirements ファイルに追加します。

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox {#mapbox}

これは任意です。Mapbox の API キーがなくても Superset で位置情報データをプロットできますが、キーを追加するよう促すメッセージが表示され、地図の背景画像は表示されません（データポイントのみが表示されます）。Mapbox には、必要に応じて利用できる無料プランがあります。

ガイドで作成するサンプルの可視化の中には、経度や緯度などの位置情報データを使うものがあります。Superset には Mapbox マップのサポートが含まれています。Mapbox の可視化を使用するには、Mapbox API キーが必要です。[Mapbox free tier](https://account.mapbox.com/auth/signup/) にサインアップし、API キーを生成してください。

API キーを Superset で利用できるようにします:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-実際のキーに置き換えてください" >> docker/.env-non-dev
```


## Superset バージョン 2.0.0 のデプロイ {#deploy-superset-version-200}

リリース 2.0.0 をデプロイするには、次のコマンドを実行します:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
