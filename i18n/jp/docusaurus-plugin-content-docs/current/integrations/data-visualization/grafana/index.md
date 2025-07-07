---
'sidebar_label': 'Quick Start'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': 'ClickHouseとGrafanaの使用方法の紹介'
'title': 'ClickHouse data source plugin for Grafana'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse データソースプラグイン for Grafana

<ClickHouseSupportedBadge/>

Grafana を使うことで、ダッシュボードを通じてデータを探索し、共有できます。Grafana は ClickHouse に接続するためのプラグインを必要とし、このプラグインは UI 内で簡単にインストールできます。

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

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 読み取り専用ユーザーの作成 {#2-making-a-read-only-user}

ClickHouse を Grafana のようなデータ可視化ツールに接続する場合、データを不適切な変更から保護するために、読み取り専用のユーザーを作成することをお勧めします。

Grafana はクエリが安全であるかどうかを検証しません。クエリには `DELETE` や `INSERT` などの任意の SQL ステートメントを含めることができます。

読み取り専用ユーザーを構成するには、次の手順に従ってください：
1. [ClickHouse でのユーザーとロールの作成](/operations/access-rights)ガイドに従って、`readonly` ユーザープロファイルを作成します。
2. `readonly` ユーザーが基盤となる [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) に必要な `max_execution_time` 設定を変更するための十分な権限を持っていることを確認します。
3. 公開 ClickHouse インスタンスを使用している場合、`readonly` プロファイルで `readonly=2` を設定することは推奨されません。代わりに `readonly=1` のままにして、`max_execution_time` の制約タイプを [changeable_in_readonly](/operations/settings/constraints-on-settings) に設定して、この設定の変更を許可します。

## 3. Grafana 用の ClickHouse プラグインをインストールする {#3--install-the-clickhouse-plugin-for-grafana}

Grafana が ClickHouse に接続する前に、適切な Grafana プラグインをインストールする必要があります。Grafana にログインしている前提で、次の手順に従ってください：

1. サイドバーの **Connections** ページから、**Add new connection** タブを選択します。

2. **ClickHouse** を検索し、Grafana Labs の署名されたプラグインをクリックします：

    <Image size="md" img={search} alt="接続ページで ClickHouse プラグインを選択する" border />

3. 次の画面で **Install** ボタンをクリックします：

    <Image size="md" img={install} alt="ClickHouse プラグインをインストールする" border />

## 4. ClickHouse データソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source** ボタンをクリックします。（**Connections** ページの **Data sources** タブからもデータソースを追加できます。）

    <Image size="md" img={add_new_ds} alt="ClickHouse データソースを作成する" border />

2. 下にスクロールして **ClickHouse** データソースタイプを見つけるか、**Add data source** ページの検索バーで検索します。**ClickHouse** データソースを選択すると、次のページが表示されます：

  <Image size="md" img={quick_config} alt="接続設定ページ" border />

3. サーバーの設定と資格情報を入力します。主な設定は以下の通りです：

- **Server host address:** ClickHouse サービスのホスト名。
- **Server port:** ClickHouse サービスのポート。サーバー設定やプロトコルによって異なる場合があります。
- **Protocol**：ClickHouse サービスに接続するために使用されるプロトコル。
- **Secure connection**：サーバーが安全な接続を要求する場合は有効にします。
- **Username** および **Password**：ClickHouse のユーザー資格情報を入力します。ユーザーを設定していない場合は、ユーザー名に `default` を試してください。 [読み取り専用ユーザーを構成する](#2-making-a-read-only-user)ことをお勧めします。

他の設定については [plugin configuration](./config.md) ドキュメントを確認してください。

4. **Save & test** ボタンをクリックして、Grafana が ClickHouse サービスに接続できるか確認します。成功すると、**Data source is working** メッセージが表示されます：

    <Image size="md" img={valid_ds} alt="Save & test を選択する" border />

## 5. 次のステップ {#5-next-steps}

データソースの準備が整いました！[クエリビルダー](./query-builder.md) を使ってクエリを構築する方法についてもっと学びましょう。

設定の詳細については、[plugin configuration](./config.md) ドキュメントを確認してください。

これらのドキュメントには含まれていない情報を探している場合は、[GitHub のプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を確認してください。

## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4 から、設定やクエリは新しいバージョンがリリースされるたびにアップグレードできるようになります。

v3 の設定やクエリは、開かれると v4 に移行されます。古い設定やダッシュボードは v4 で読み込まれますが、移行は新しいバージョンで保存されるまで持続しません。古い設定やクエリを開く際に問題が発生した場合は、変更を破棄し、[GitHub に問題を報告してください](https://github.com/grafana/clickhouse-datasource/issues)。

設定やクエリが新しいバージョンで作成された場合、プラグインは以前のバージョンにダウングレードできません。

## 関連コンテンツ {#related-content}

- [GitHub のプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)
- ブログ: [ClickHouse でのデータの可視化 - パート 1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- ブログ: [Grafana を使用した ClickHouse データの可視化 - 動画](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- ブログ: [ClickHouse Grafana プラグイン 4.0 - SQL 可観測性のレベルアップ](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- ブログ: [データを ClickHouse に取り込む - パート 3 - S3 の使用](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- ブログ: [ClickHouse での可観測性ソリューションの構築 - パート 1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [ClickHouse での可観測性ソリューションの構築 - パート 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- ブログ & ウェビナー: [ClickHouse と Grafana を使用したオープンソース GitHub アクティビティの物語](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
