---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /integrations/grafana
description: 'Grafana での ClickHouse 利用入門'
title: 'Grafana 向け ClickHouse データソースプラグイン'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', 'データ可視化', 'ダッシュボード', 'プラグイン', 'データソース']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Grafana 用 ClickHouse データソースプラグイン

<ClickHouseSupportedBadge/>

Grafana を使うと、ダッシュボード経由であらゆるデータを探索・共有できます。
Grafana が ClickHouse に接続するにはプラグインが必要で、このプラグインは Grafana の UI から簡単にインストールできます。

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

GrafanaなどのデータビジュアライゼーションツールにClickHouseを接続する際は、意図しない変更からデータを保護するために読み取り専用ユーザーを作成することを推奨します。

Grafanaはクエリの安全性を検証しません。クエリには`DELETE`や`INSERT`を含む任意のSQLステートメントを含めることができます。

読み取り専用ユーザーを設定するには、以下の手順に従ってください:

1. [ClickHouseでのユーザーとロールの作成](/operations/access-rights)ガイドに従って、`readonly`ユーザープロファイルを作成します。
2. 基盤となる[clickhouse-goクライアント](https://github.com/ClickHouse/clickhouse-go)が必要とする`max_execution_time`設定を変更するための十分な権限が`readonly`ユーザーに付与されていることを確認します。
3. 公開されているClickHouseインスタンスを使用している場合、`readonly`プロファイルで`readonly=2`を設定することは推奨されません。代わりに、`readonly=1`のままにして、`max_execution_time`の制約タイプを[changeable_in_readonly](/operations/settings/constraints-on-settings)に設定し、この設定の変更を許可してください。


## 3. Grafana用ClickHouseプラグインのインストール {#3--install-the-clickhouse-plugin-for-grafana}

GrafanaからClickHouseに接続するには、適切なGrafanaプラグインをインストールする必要があります。Grafanaにログイン済みであることを前提として、以下の手順に従ってください:

1. サイドバーの**Connections**ページから、**Add new connection**タブを選択します。

2. **ClickHouse**を検索し、Grafana Labsによる署名済みプラグインをクリックします:

   <Image
     size='md'
     img={search}
     alt='接続ページでClickHouseプラグインを選択'
     border
   />

3. 次の画面で、**Install**ボタンをクリックします:

   <Image size='md' img={install} alt='ClickHouseプラグインのインストール' border />


## 4. ClickHouseデータソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source**ボタンをクリックします。(**Connections**ページの**Data sources**タブからデータソースを追加することもできます。)

   <Image
     size='md'
     img={add_new_ds}
     alt='ClickHouseデータソースを作成する'
     border
   />

2. 下にスクロールして**ClickHouse**データソースタイプを見つけるか、**Add data source**ページの検索バーで検索します。**ClickHouse**データソースを選択すると、次のページが表示されます:

<Image
  size='md'
  img={quick_config}
  alt='接続設定ページ'
  border
/>

3. サーバー設定と認証情報を入力します。主な設定項目は次のとおりです:

- **Server host address:** ClickHouseサービスのホスト名。
- **Server port:** ClickHouseサービスのポート。サーバー設定とプロトコルによって異なります。
- **Protocol:** ClickHouseサービスへの接続に使用するプロトコル。
- **Secure connection:** サーバーがセキュア接続を必要とする場合に有効化します。
- **Username**と**Password**: ClickHouseユーザーの認証情報を入力します。ユーザーを設定していない場合は、ユーザー名に`default`を試してください。[読み取り専用ユーザーを設定する](#2-making-a-read-only-user)ことを推奨します。

その他の設定については、[プラグイン設定](./config.md)のドキュメントを参照してください。

4. **Save & test**ボタンをクリックして、GrafanaがClickHouseサービスに接続できることを確認します。成功すると、**Data source is working**というメッセージが表示されます:

   <Image size='md' img={valid_ds} alt='Save & testを選択' border />


## 5. 次のステップ {#5-next-steps}

データソースの準備が完了しました。[クエリビルダー](./query-builder.md)を使用したクエリの構築方法については、こちらをご覧ください。

設定の詳細については、[プラグイン設定](./config.md)のドキュメントを参照してください。

このドキュメントに記載されていない情報については、[GitHubのプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource)を参照してください。


## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4以降、新しいバージョンがリリースされるたびに、設定とクエリをアップグレードできます。

v3の設定とクエリは、開いた時点でv4に移行されます。古い設定とダッシュボードはv4で読み込まれますが、新しいバージョンで再保存するまで移行内容は保存されません。古い設定やクエリを開く際に問題が発生した場合は、変更を破棄して[GitHubで問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

新しいバージョンで作成された設定やクエリがある場合、プラグインを以前のバージョンにダウングレードすることはできません。
