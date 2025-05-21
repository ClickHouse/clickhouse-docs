---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /integrations/grafana
description: 'ClickHouseとGrafanaの使用についての紹介'
title: 'Grafana用のClickHouseデータソースプラグイン'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Grafana用のClickHouseデータソースプラグイン

<ClickHouseSupportedBadge/>

Grafanaを使用すると、ダッシュボードを通じてすべてのデータを探索し、共有することができます。GrafanaはClickHouseに接続するためのプラグインを必要とし、それはUI内で簡単にインストールできます。

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

ClickHouseをGrafanaのようなデータ可視化ツールに接続する際は、データを不正な変更から保護するために読み取り専用ユーザーを作成することをお勧めします。

Grafanaはクエリが安全であることを検証しません。クエリには、`DELETE`や`INSERT`を含むあらゆるSQL文を含めることができます。

読み取り専用ユーザーを構成するには、以下の手順に従ってください：
1. [ClickHouseでのユーザーとロールの作成](/operations/access-rights)ガイドに従って、`readonly`ユーザープロファイルを作成します。
2. `readonly`ユーザーに、ベースとなる[clickhouse-go client](https://github.com/ClickHouse/clickhouse-go)で必要な`max_execution_time`設定を変更するための十分な権限があることを確認します。
3. 公開のClickHouseインスタンスを使用している場合、`readonly`プロファイルで`readonly=2`を設定することは推奨されません。代わりに、`readonly=1`のままにし、`max_execution_time`の制約タイプを[changeable_in_readonly](/operations/settings/constraints-on-settings)に設定して、この設定を変更できるようにします。

## 3. ClickHouseプラグインをGrafanaにインストールする {#3--install-the-clickhouse-plugin-for-grafana}

GrafanaがClickHouseに接続できるようにする前に、適切なGrafanaプラグインをインストールする必要があります。Grafanaにログインしていることを前提としています。以下の手順を実行してください：

1. サイドバーの**接続**ページから、**新しい接続を追加**タブを選択します。

2. **ClickHouse**を検索し、Grafana Labsによってサインインされたプラグインをクリックします：

    <Image size="md" img={search} alt="接続ページでClickHouseプラグインを選択" border />

3. 次の画面で、**インストール**ボタンをクリックします：

    <Image size="md" img={install} alt="ClickHouseプラグインをインストール" border />

## 4. ClickHouseデータソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**新しいデータソースを追加**ボタンをクリックします。（**接続**ページの**データソース**タブからもデータソースを追加できます。）

    <Image size="md" img={add_new_ds} alt="ClickHouseデータソースを作成" border />

2. 下にスクロールして**ClickHouse**データソースタイプを見つけるか、**データソースを追加**ページの検索バーで検索します。**ClickHouse**データソースを選択すると、次のページが表示されます：

  <Image size="md" img={quick_config} alt="接続構成ページ" border />

3. サーバー設定と資格情報を入力します。主な設定は以下の通りです：

- **サーバーホストアドレス**：ClickHouseサービスのホスト名。
- **サーバーポート**：ClickHouseサービスのポート。サーバー構成やプロトコルによって異なります。
- **プロトコル**：ClickHouseサービスに接続するために使用されるプロトコル。
- **安全な接続**：サーバーが安全な接続を必要とする場合に有効にします。
- **ユーザー名**および**パスワード**：ClickHouseのユーザー資格情報を入力します。ユーザーを構成していない場合は、ユーザー名に`default`を試してください。読み取り専用ユーザーを[構成する](#2-making-a-read-only-user)ことをお勧めします。

より詳細な設定については、[プラグイン構成](./config.md)ドキュメントを確認してください。

4. **保存してテスト**ボタンをクリックして、GrafanaがClickHouseサービスに接続できるか確認します。成功すれば、**データソースは動作しています**というメッセージが表示されます：

    <Image size="md" img={valid_ds} alt="保存してテストを選択" border />

## 5. 次のステップ {#5-next-steps}

データソースはこれで使用可能です！[クエリビルダー](./query-builder.md)を使用してクエリを構築する方法について詳しく学びましょう。

設定の詳細については、[プラグイン構成](./config.md)ドキュメントを確認してください。

このドキュメントに含まれていないさらなる情報を探している場合は、[GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を確認してください。

## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4から、新しいバージョンがリリースされると構成やクエリをアップグレードできるようになります。

v3からの構成やクエリは、開かれるときにv4に移行されます。古い構成やダッシュボードはv4で読み込まれますが、移行は新しいバージョンで再度保存されるまで持続されません。古い構成/クエリを開くときに問題が発生した場合は、変更を破棄し、[GitHubで問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

構成/クエリが新しいバージョンで作成された場合、プラグインは以前のバージョンにダウングレードできません。

## 関連コンテンツ {#related-content}

- [GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)
- ブログ: [ClickHouseでのデータの可視化 - パート1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- ブログ: [GrafanaでのClickHouseデータの可視化 - ビデオ](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- ブログ: [ClickHouse Grafanaプラグイン4.0 - SQLの可観測性の向上](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- ブログ: [ClickHouseにデータを取り込む - パート3 - S3の使用](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート1 - ログ](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- ブログとウェビナー: [ClickHouseとGrafanaを使ったオープンソースGitHub活動のストーリー](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
