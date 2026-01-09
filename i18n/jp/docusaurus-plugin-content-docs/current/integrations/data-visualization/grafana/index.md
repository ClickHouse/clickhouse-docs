---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /integrations/grafana
description: 'Grafana で ClickHouse を使用するための概要'
title: 'Grafana 用 ClickHouse データソースプラグイン'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', 'データ可視化', 'ダッシュボード', 'プラグイン', 'データソース']
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Grafana 向け ClickHouse データソースプラグイン {#clickhouse-data-source-plugin-for-grafana}

<ClickHouseSupportedBadge/>

Grafana を使うと、ダッシュボードを通じてあらゆるデータを探索および共有できます。
Grafana から ClickHouse に接続するにはプラグインが必要です。このプラグインは Grafana の UI から簡単にインストールできます。

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

## 1. 接続情報を確認する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 読み取り専用ユーザーの作成 {#2-making-a-read-only-user}

Grafana のようなデータ可視化ツールから ClickHouse に接続する場合、意図しない変更からデータを保護するために、読み取り専用ユーザーを作成することを推奨します。

Grafana はクエリが安全かどうかを検証しません。クエリでは、`DELETE` や `INSERT` を含む任意の SQL ステートメントを実行できます。

読み取り専用ユーザーを設定するには、次の手順に従います。

1. [Creating Users and Roles in ClickHouse](/operations/access-rights) ガイドに従って、`readonly` ユーザープロファイルを作成します。
2. `readonly` ユーザーに、バックエンドで使用される [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) によって必要とされる `max_execution_time` 設定を変更できるだけの権限が付与されていることを確認します。
3. パブリックな ClickHouse インスタンスを使用している場合、`readonly` プロファイルで `readonly=2` を設定することは推奨されません。代わりに、`readonly=1` のままにし、この設定を変更できるように `max_execution_time` の制約タイプを [changeable_in_readonly](/operations/settings/constraints-on-settings) に設定します。

## 3.  Grafana 用 ClickHouse プラグインをインストールする {#3--install-the-clickhouse-plugin-for-grafana}

Grafana を ClickHouse に接続できるようにするには、適切な Grafana プラグインをインストールする必要があります。Grafana にログインしていることを前提として、次の手順に従います。

1. サイドバーの **Connections** ページで、**Add new connection** タブを選択します。

2. **ClickHouse** を検索し、Grafana Labs の署名付きプラグインをクリックします。

    <Image size="md" img={search} alt="Connections ページで ClickHouse プラグインを選択する" border />

3. 次の画面で、**Install** ボタンをクリックします。

    <Image size="md" img={install} alt="ClickHouse プラグインをインストールする" border />

## 4. ClickHouse データソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source** ボタンをクリックします（**Connections** ページの **Data sources** タブからデータソースを追加することもできます）。

    <Image size="md" img={add_new_ds} alt="ClickHouse データソースを作成する" border />

2. 下にスクロールして **ClickHouse** データソースタイプを探すか、**Add data source** ページの検索バーで検索します。**ClickHouse** データソースを選択すると、次のページが表示されます。

<Image size="md" img={quick_config} alt="接続設定ページ" border />

3. サーバー設定と認証情報を入力します。主な設定項目は次のとおりです。

- **Server host address:** ClickHouse サービスのホスト名。
- **Server port:** ClickHouse サービスのポート。サーバー設定やプロトコルによって異なります。
- **Protocol** ClickHouse サービスに接続するために使用するプロトコル。
- **Secure connection** サーバーがセキュアな接続を要求する場合に有効にします。
- **Username** と **Password**: ClickHouse ユーザーの認証情報を入力します。ユーザーを設定していない場合は、ユーザー名として `default` を試してください。[読み取り専用ユーザーの設定](#2-making-a-read-only-user)を行うことを推奨します。

その他の設定については、[プラグイン設定](./config.md)ドキュメントを参照してください。

4. **Save & test** ボタンをクリックして、Grafana が ClickHouse サービスに接続できることを確認します。成功すると、**Data source is working** というメッセージが表示されます。

    <Image size="md" img={valid_ds} alt="Save & test を選択する" border />

## 5. 次のステップ {#5-next-steps}

データソースの使用準備が整いました。[クエリビルダー](./query-builder.md) を使ってクエリを作成する方法の詳細を確認してください。

設定の詳細については、[プラグイン設定](./config.md) のドキュメントを参照してください。

これらのドキュメントに含まれていない情報をお探しの場合は、[GitHub 上のプラグインリポジトリ](https://github.com/grafana/clickhouse-datasource) を確認してください。

## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4 以降は、新しいバージョンがリリースされるたびに、設定やクエリをアップグレードできるようになりました。

v3 の設定とクエリは、開いたときに v4 に移行されます。古い設定やダッシュボードは v4 で読み込まれますが、新しいバージョンで再度保存するまでは、移行内容は永続的には保存されません。古い設定やクエリを開いた際に問題が発生した場合は、変更を破棄し、[GitHub で問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

設定やクエリが新しいバージョンで作成されている場合、プラグインを以前のバージョンにダウングレードすることはできません。