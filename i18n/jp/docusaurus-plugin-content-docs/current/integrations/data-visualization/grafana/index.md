---
sidebar_label: クイックスタート
sidebar_position: 1
slug: /integrations/grafana
description: ClickHouseとGrafanaを使用するための紹介
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';


# ClickHouseデータソースプラグイン for Grafana

Grafanaを使えば、ダッシュボードを通じてすべてのデータを探索し、共有できます。
GrafanaはClickHouseに接続するためのプラグインを必要とし、それは簡単にUI内でインストールできます。

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

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 読み取り専用ユーザーを作成する {#2-making-a-read-only-user}

ClickHouseをGrafanaのようなデータ可視化ツールに接続する際は、データの不正な変更から保護するために、読み取り専用のユーザーを作成することを推奨します。

Grafanaはクエリが安全であるかどうかを検証しません。クエリには`DELETE`や`INSERT`などの任意のSQL文を含めることができます。

読み取り専用ユーザーを設定するには、以下の手順に従ってください：
1. [ClickHouseでのユーザーとロールの作成](/operations/access-rights)ガイドに従って`readonly`ユーザープロファイルを作成します。
2. `readonly`ユーザーが基盤となる[clickhouse-goクライアント](https://github.com/ClickHouse/clickhouse-go)によって必要とされる`max_execution_time`設定を変更するための十分な権限を持っていることを確認します。
3. 公共のClickHouseインスタンスを使用している場合は、`readonly`プロファイルで`readonly=2`を設定することは推奨されません。代わりに`readonly=1`のままにして、`max_execution_time`の制約タイプを[changeable_in_readonly](/operations/settings/constraints-on-settings)に設定して、この設定の変更を許可します。

## 3. ClickHouseプラグインをGrafanaにインストールする {#3--install-the-clickhouse-plugin-for-grafana}

GrafanaがClickHouseに接続する前に、適切なGrafanaプラグインをインストールする必要があります。Grafanaにログインしていることを前提に、以下の手順に従ってください：

1. サイドバーの**Connections**ページから、**Add new connection**タブを選択します。

2. **ClickHouse**を検索し、Grafana Labsによって署名されたプラグインをクリックします：

    <img src={search} class="image" alt="接続ページでClickHouseプラグインを選択" />

3. 次の画面で、**Install**ボタンをクリックします：

    <img src={install} class="image" alt="ClickHouseプラグインをインストール" />

## 4. ClickHouseデータソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source**ボタンをクリックします。（**Connections**ページの**Data sources**タブからデータソースを追加することもできます。）

    <img src={add_new_ds} class="image" alt="ClickHouseデータソースを作成" />

2. 下にスクロールして**ClickHouse**データソースタイプを見つけるか、**Add data source**ページの検索バーで検索します。**ClickHouse**データソースを選択すると、次のページが表示されます：

  <img src={quick_config} class="image" alt="接続設定ページ" />

3. サーバー設定と認証情報を入力します。主要な設定は以下の通りです：

- **Server host address:** ClickHouseサービスのホスト名。
- **Server port:** ClickHouseサービスのポート。サーバーの構成やプロトコルによって異なります。
- **Protocol:** ClickHouseサービスに接続するために使用されるプロトコル。
- **Secure connection:** サーバーが安全な接続を必要とする場合は有効にします。
- **Username**および**Password**: ClickHouseのユーザー認証情報を入力します。ユーザーを構成していない場合は、ユーザー名に`default`をお試しください。読み取り専用ユーザーを[構成する](#2-making-a-read-only-user)ことを推奨します。

その他の設定については、[プラグイン設定](./config.md)のドキュメントを確認してください。

4. **Save & test**ボタンをクリックして、GrafanaがClickHouseサービスに接続できるか確認します。成功すると、**Data source is working**メッセージが表示されます：

    <img src={valid_ds} class="image" alt="Save & testを選択" />

## 5. 次のステップ {#5-next-steps}

データソースは使用する準備が整いました！[クエリビルダー](./query-builder.md)でクエリの構築方法をさらに学びましょう。

設定の詳細については、[プラグイン設定](./config.md)のドキュメントを確認してください。

この文書に含まれていない情報をお探しの場合は、[GitHub上のプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を確認してください。

## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4以降、構成とクエリは新しいバージョンがリリースされるとアップグレードできるようになります。

v3の構成とクエリは、v4としてオープンされたときにマイグレーションされます。古い構成やダッシュボードはv4で読み込まれますが、マイグレーションは新しいバージョンにもう一度保存されるまで持続しません。古い構成/クエリを開くときに問題が発生した場合は、変更を破棄し、[GitHubで問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

構成/クエリが新しいバージョンで作成された場合、プラグインは以前のバージョンにダウングレードすることはできません。

## 関連コンテンツ {#related-content}

- [GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)
- ブログ: [ClickHouseを使ったデータの可視化 - パート1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- ブログ: [Grafanaを使用してClickHouseデータを可視化 - 動画](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- ブログ: [ClickHouse Grafanaプラグイン4.0 - SQLの可観測性の向上](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- ブログ: [ClickHouseへのデータの取り込み - パート3 - S3の使用](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- ブログ: [ClickHouseを使った可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [ClickHouseを使った可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- ブログ & ウェビナー: [ClickHouseとGrafanaを使用したオープンソースGitHub活動の物語](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
