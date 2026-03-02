---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /integrations/grafana
description: 'Grafana で ClickHouse を利用するための入門'
title: 'Grafana 向け ClickHouse データソースプラグイン'
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


# Grafana 用 ClickHouse データソースプラグイン \{#clickhouse-data-source-plugin-for-grafana\}

<ClickHouseSupportedBadge/>

Grafana を使用すると、ダッシュボードを通じてあらゆるデータを可視化し、共有できます。
Grafana から ClickHouse に接続するにはプラグインが必要で、Grafana の UI から簡単にインストールできます。

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

## 1. 接続情報を準備する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 読み取り専用ユーザーの作成 \{#2-making-a-read-only-user\}

Grafana のようなデータ可視化ツールから ClickHouse に接続する場合、意図しないデータ変更から保護するために、読み取り専用ユーザーを作成することを推奨します。

Grafana はクエリが安全かどうかを検証しません。クエリには `DELETE` や `INSERT` を含む任意の SQL 文を記述できます。

読み取り専用ユーザーを構成するには、次の手順に従います。

1. [Creating Users and Roles in ClickHouse](/operations/access-rights) ガイドに従って `readonly` ユーザープロファイルを作成します。
2. `readonly` ユーザーが、内部で使用している [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) によって要求される `max_execution_time` 設定を変更できるだけの権限を持っていることを確認します。
3. パブリックな ClickHouse インスタンスを使用している場合、`readonly` プロファイルで `readonly=2` を設定することは推奨されません。代わりに、`readonly=1` のままにし、この設定を変更可能にするために `max_execution_time` の constraint type を [changeable_in_readonly](/operations/settings/constraints-on-settings) に設定します。

## 3. Grafana 用 ClickHouse プラグインをインストールする \{#3--install-the-clickhouse-plugin-for-grafana\}

Grafana から ClickHouse に接続できるようにするには、適切な Grafana プラグインをインストールする必要があります。Grafana にログインしていることを想定し、次の手順に従います。

1. サイドバーの **Connections** ページで、**Add new connection** タブを選択します。

2. **ClickHouse** を検索し、Grafana Labs による署名済みプラグインをクリックします。

    <Image size="md" img={search} alt="Connections ページで ClickHouse プラグインを選択する" border />

3. 次の画面で **Install** ボタンをクリックします。

    <Image size="md" img={install} alt="ClickHouse プラグインをインストールする" border />

## 4. ClickHouse データソースを定義する \{#4-define-a-clickhouse-data-source\}

1. インストールが完了したら、**Add new data source** ボタンをクリックします（**Connections** ページの **Data sources** タブからデータソースを追加することもできます）。

    <Image size="md" img={add_new_ds} alt="ClickHouse データソースを作成する" border />

2. 下にスクロールして **ClickHouse** データソースタイプを探すか、**Add data source** ページの検索バーで検索します。**ClickHouse** データソースを選択すると、次のページが表示されます:

<Image size="md" img={quick_config} alt="接続設定ページ" border />

3. サーバーの設定値と認証情報を入力します。主な設定項目は次のとおりです:

- **Server host address:** ClickHouse サービスのホスト名。
- **Server port:** ClickHouse サービスのポート。サーバーの設定やプロトコルによって異なります。
- **Protocol** ClickHouse サービスへの接続に使用するプロトコルを指定します。
- **Secure connection** サーバーがセキュア接続を要求する場合に有効にします。
- **Username** および **Password**: ClickHouse ユーザーの認証情報を入力します。ユーザーをまだ作成していない場合は、ユーザー名として `default` を試してください。[読み取り専用ユーザーを設定する](#2-making-a-read-only-user)ことを推奨します。

その他の設定については、[プラグイン設定](./config.md)ドキュメントを参照してください。

4. **Save & test** ボタンをクリックして、Grafana が ClickHouse サービスに接続できることを確認します。成功すると、**Data source is working** というメッセージが表示されます:

    <Image size="md" img={valid_ds} alt="Save &amp; test を選択する" border />

## 5. 次のステップ \{#5-next-steps\}

これでデータソースを利用する準備が整いました。クエリの構築方法については、[query builder](./query-builder.md) の使い方を参照してください。

設定の詳細については、[プラグイン設定](./config.md) のドキュメントを参照してください。

これらのドキュメントに含まれていない情報をお探しの場合は、GitHub 上の [プラグイン リポジトリ](https://github.com/grafana/clickhouse-datasource) を参照してください。

## プラグインバージョンのアップグレード \{#upgrading-plugin-versions\}

v4 以降では、新しいバージョンがリリースされると、設定とクエリをアップグレードできるようになります。

v3 の設定とクエリは、開いたタイミングで v4 に自動的に移行されます。古い設定とダッシュボードは v4 で読み込まれますが、新しいバージョンで再度保存されるまで、その移行内容は永続的には反映されません。既存の設定やクエリを開いた際に問題が発生した場合は、変更を破棄し、[GitHub で問題を報告](https://github.com/grafana/clickhouse-datasource/issues)してください。

新しいバージョンで作成された設定やクエリがある場合、プラグインを以前のバージョンにダウングレードすることはできません。