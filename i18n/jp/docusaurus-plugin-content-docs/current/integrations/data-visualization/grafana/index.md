---
'sidebar_label': 'クイックスタート'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': 'Grafana とともに ClickHouse を使用するためのイントロダクション'
'title': 'ClickHouse データソースプラグイン for Grafana'
'show_related_blogs': true
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouseデータソースプラグイン for Grafana

<ClickHouseSupportedBadge/>

Grafanaを使用すると、ダッシュボードを通じてすべてのデータを探索し、共有することができます。  
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

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 読み取り専用ユーザーの作成 {#2-making-a-read-only-user}

ClickHouseをGrafanaなどのデータ可視化ツールに接続する際は、データを不正な変更から保護するために読み取り専用ユーザーを作成することをお勧めします。

Grafanaはクエリの安全性を検証しません。クエリには、`DELETE`や`INSERT`など、任意のSQLステートメントを含めることができます。

読み取り専用ユーザーを設定するには、以下の手順に従ってください：
1. [ClickHouseでのユーザーおよびロールの作成](/operations/access-rights) ガイドに従って、`readonly`ユーザープロファイルを作成します。
2. `readonly`ユーザーが、基盤となる[clickhouse-goクライアント](https://github.com/ClickHouse/clickhouse-go)に必要な`max_execution_time`設定を変更するための十分な権限を持っていることを確認します。
3. 公共のClickHouseインスタンスを使用している場合、`readonly`プロファイルで`readonly=2`を設定することは推奨されません。代わりに、`readonly=1`にして、`max_execution_time`の制約タイプを[changeable_in_readonly](/operations/settings/constraints-on-settings)に設定して、この設定の変更を可能にします。

## 3. Grafana用のClickHouseプラグインをインストールする {#3--install-the-clickhouse-plugin-for-grafana}

GrafanaがClickHouseに接続する前に、適切なGrafanaプラグインをインストールする必要があります。Grafanaにログインしていることを前提に、以下の手順に従ってください：

1. サイドバーの**Connections**ページで、**Add new connection**タブを選択します。

2. **ClickHouse**を検索し、Grafana Labsによって署名されたプラグインをクリックします：

    <Image size="md" img={search} alt="ConnectionsページでClickHouseプラグインを選択" border />

3. 次の画面で、**Install**ボタンをクリックします：

    <Image size="md" img={install} alt="ClickHouseプラグインをインストール" border />

## 4. ClickHouseデータソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source**ボタンをクリックします。（**Connections**ページの**Data sources**タブからもデータソースを追加できます。）

    <Image size="md" img={add_new_ds} alt="ClickHouseデータソースを作成" border />

2. 下にスクロールして**ClickHouse**データソースタイプを見つけるか、**Add data source**ページの検索バーで検索します。**ClickHouse**データソースを選択すると、次のページが表示されます：

  <Image size="md" img={quick_config} alt="接続設定ページ" border />

3. サーバー設定と認証情報を入力します。主な設定は以下の通りです：

- **Server host address:** ClickHouseサービスのホスト名。
- **Server port:** ClickHouseサービスのポート。サーバーの設定とプロトコルに応じて異なります。
- **Protocol:** ClickHouseサービスに接続するために使用するプロトコル。
- **Secure connection:** サーバーが安全な接続を必要とする場合に有効にします。
- **Username**と**Password:** ClickHouseのユーザー認証情報を入力します。ユーザーを設定していない場合は、ユーザー名に`default`を試してください。[読み取り専用ユーザーを設定することをお勧めします](#2-making-a-read-only-user)。

より多くの設定については、[プラグイン設定](./config.md) ドキュメントを確認してください。

4. **Save & test**ボタンをクリックして、GrafanaがClickHouseサービスに接続できることを確認します。成功すると、**Data source is working**のメッセージが表示されます：

    <Image size="md" img={valid_ds} alt="Save & testを選択" border />

## 5. 次のステップ {#5-next-steps}

データソースはすぐに使用できる状態になりました！[クエリビルダー](./query-builder.md)を使用してクエリを作成する方法について詳しく学んでください。

設定に関する詳細は、[プラグイン設定](./config.md) ドキュメントを確認してください。

これらのドキュメントに含まれていない情報を探している場合は、[GitHubでのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を確認してください。

## プラグインのバージョンアップグレード {#upgrading-plugin-versions}

v4からは、新しいバージョンがリリースされると設定とクエリをアップグレードできるようになります。

v3からの設定とクエリは、開かれた時にv4にマイグレーションされます。古い設定やダッシュボードはv4で読み込まれますが、マイグレーションは新しいバージョンで再保存されるまで持続されません。古い設定やクエリを開く際に何らかの問題が発生した場合は、変更を破棄し、[GitHubで問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

新しいバージョンで作成された設定やクエリは、プラグインを以前のバージョンにダウングレードできません。
