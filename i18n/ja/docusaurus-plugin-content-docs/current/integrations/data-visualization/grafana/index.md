---
sidebar_label: クイックスタート
sidebar_position: 1
slug: /integrations/grafana
description: ClickHouseとGrafanaの使用に関する導入
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';

# ClickHouseデータソースプラグイン for Grafana

Grafanaを使うことで、すべてのデータをダッシュボードを通じて探索し、共有できます。
GrafanaはClickHouseに接続するためのプラグインを必要とし、このプラグインはUI内で簡単にインストールできます。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/bRce9xWiqQM"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 1. 接続詳細を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 読み取り専用ユーザーを作成する {#2-making-a-read-only-user}

ClickHouseをGrafanaのようなデータビジュアライゼーションツールに接続する際は、データの不正な変更から保護するために読み取り専用ユーザーを作成することが推奨されます。

Grafanaはクエリが安全であるかどうかを検証しません。クエリには `DELETE` や `INSERT` を含む任意のSQLステートメントを含むことができます。

読み取り専用ユーザーを設定するには、以下の手順に従ってください：
1. [ClickHouseでのユーザーと役割の作成](/operations/access-rights)ガイドに従って`readonly`ユーザープロファイルを作成します。
2. `readonly`ユーザーが、基盤となる[clickhouse-goクライアント](https://github.com/ClickHouse/clickhouse-go)に必要な`max_execution_time`設定を変更するのに十分な権限を持っていることを確認します。
3. 公共のClickHouseインスタンスを使用している場合、`readonly`プロファイルで`readonly=2`を設定することは推奨されません。代わりに、`readonly=1`のままにし、`max_execution_time`の制約タイプを[changeable_in_readonly](/operations/settings/constraints-on-settings)に設定して、この設定の変更を許可します。

## 3. Grafana用のClickHouseプラグインをインストールする {#3--install-the-clickhouse-plugin-for-grafana}

GrafanaがClickHouseに接続する前に、適切なGrafanaプラグインをインストールする必要があります。Grafanaにログインしていることを前提に、以下の手順に従ってください。

1. サイドバーの**Connections**ページから、**Add new connection**タブを選択します。

2. **ClickHouse**を検索し、Grafana Labsによって署名されたプラグインをクリックします：

    <img src={require('./images/search.png').default} class="image" alt="ConnectionsページでClickHouseプラグインを選択" />

3. 次の画面で、**Install**ボタンをクリックします：

    <img src={require('./images/install.png').default} class="image" alt="ClickHouseプラグインをインストール" />

## 4. ClickHouseデータソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source**ボタンをクリックします。（**Connections**ページの**Data sources**タブからもデータソースを追加できます。）

    <img src={require('./images/add_new_ds.png').default} class="image" alt="ClickHouseデータソースを作成" />

2. スクロールダウンして**ClickHouse**データソースタイプを見つけるか、**Add data source**ページの検索バーで検索します。**ClickHouse**データソースを選択すると、次のページが表示されます：

  <img src={require('./images/quick_config.png').default} class="image" alt="接続設定ページ" />

3. サーバー設定と認証情報を入力します。主な設定は以下の通りです：

- **サーバーホストアドレス:** ClickHouseサービスのホスト名。
- **サーバーポート:** ClickHouseサービスのポート。サーバー設定とプロトコルによって異なります。
- **プロトコル:** ClickHouseサービスに接続するために使用されるプロトコル。
- **セキュア接続:** サーバーがセキュア接続を要求する場合は有効にします。
- **ユーザー名**と**パスワード**: ClickHouseユーザーの認証情報を入力します。ユーザーが設定されていない場合は、ユーザー名に`default`を試してみてください。読み取り専用ユーザーを[設定することが推奨されています](#2-making-a-read-only-user)。

詳細な設定については、[プラグイン設定](./config.md)ドキュメントを確認してください。

4. **Save & test**ボタンをクリックして、GrafanaがClickHouseサービスに接続できるかを確認します。成功すれば、**Data source is working**メッセージが表示されます：

    <img src={require('./images/valid_ds.png').default} class="image" alt="Save & testを選択" />

## 5. 次のステップ {#5-next-steps}

あなたのデータソースは使用の準備が整いました！[クエリビルダー](./query-builder.md)を使ってクエリの作成方法について詳しく学んでください。

設定の詳細については、[プラグイン設定](./config.md)ドキュメントを確認してください。

このドキュメントに含まれていない情報を探している場合は、[GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を確認してください。

## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4以降、設定やクエリは新しいバージョンがリリースされるごとにアップグレード可能です。

v3からの設定およびクエリは、開くときにv4に移行されます。古い設定やダッシュボードはv4で読み込まれますが、移行は新しいバージョンで再度保存されるまで持続しません。古い設定/クエリを開くときに問題が発生した場合は、変更を破棄し、[GitHubで問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

新しいバージョンで作成された設定/クエリは、元のバージョンにダウングレードすることはできません。

## 関連コンテンツ {#related-content}

- [GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)
- ブログ: [ClickHouseでのデータ可視化 - パート1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- ブログ: [GrafanaでのClickHouseデータの可視化 - 動画](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- ブログ: [ClickHouse Grafanaプラグイン4.0 - SQL可観測性を高める](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- ブログ: [ClickHouseにデータを取り込む - パート3 - S3の使用](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- ブログとウェビナー: [ClickHouse + Grafanaを使用したオープンソースのGitHub活動のストーリー](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
