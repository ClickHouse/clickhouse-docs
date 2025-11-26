---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /integrations/grafana
description: 'Grafana で ClickHouse を使用するための概要'
title: 'Grafana 用 ClickHouse データソースプラグイン'
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


# Grafana 向け ClickHouse データソースプラグイン

<ClickHouseSupportedBadge/>

Grafana を使用すると、ダッシュボードを通じてあらゆるデータを探索および共有できます。
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

Grafana のようなデータ可視化ツールに ClickHouse を接続する場合、意図しないデータの変更から保護するために、読み取り専用ユーザーを作成することを推奨します。

Grafana はクエリの安全性を検証しません。クエリには、`DELETE` や `INSERT` を含む任意の SQL ステートメントを含めることができます。

読み取り専用ユーザーを設定するには、次の手順に従います。
1. [ClickHouse でユーザーとロールを作成する](/operations/access-rights) ガイドに従って、`readonly` ユーザープロファイルを作成します。
2. 基盤となる [clickhouse-go クライアント](https://github.com/ClickHouse/clickhouse-go) によって要求される `max_execution_time` 設定を変更できるだけの権限を `readonly` ユーザーに付与します。
3. パブリックな ClickHouse インスタンスを使用している場合、`readonly` プロファイルで `readonly=2` を設定することは推奨されません。代わりに、`readonly=1` のままとし、この設定を変更可能にするために `max_execution_time` の制約タイプを [changeable_in_readonly](/operations/settings/constraints-on-settings) に設定します。



## 3.  Grafana 向け ClickHouse プラグインをインストールする {#3--install-the-clickhouse-plugin-for-grafana}

Grafana から ClickHouse に接続する前に、適切な Grafana プラグインをインストールする必要があります。Grafana にログインしていることを想定して、次の手順に従ってください。

1. サイドバーの **Connections** ページで、**Add new connection** タブを選択します。

2. **ClickHouse** を検索し、Grafana Labs が署名したプラグインをクリックします。

    <Image size="md" img={search} alt="Connections ページで ClickHouse プラグインを選択する" border />

3. 次の画面で、**Install** ボタンをクリックします。

    <Image size="md" img={install} alt="ClickHouse プラグインをインストールする" border />



## 4. ClickHouse データソースを定義する {#4-define-a-clickhouse-data-source}

1. インストールが完了したら、**Add new data source** ボタンをクリックします（**Connections** ページの **Data sources** タブからデータソースを追加することもできます）。

    <Image size="md" img={add_new_ds} alt="ClickHouse データソースの作成" border />

2. 下にスクロールして **ClickHouse** データソースタイプを探すか、**Add data source** ページの検索バーで検索します。**ClickHouse** データソースを選択すると、次のページが表示されます:

  <Image size="md" img={quick_config} alt="接続設定ページ" border />

3. サーバー設定と認証情報を入力します。主な設定項目は次のとおりです:

- **Server host address:** ClickHouse サービスのホスト名。
- **Server port:** ClickHouse サービスのポート。サーバー設定やプロトコルによって異なります。
- **Protocol:** ClickHouse サービスへの接続に使用するプロトコル。
- **Secure connection:** サーバーがセキュア接続を要求する場合に有効化します。
- **Username** と **Password**: ClickHouse ユーザーの認証情報を入力します。ユーザーをまだ設定していない場合は、ユーザー名に `default` を試してください。[読み取り専用ユーザーの設定](#2-making-a-read-only-user)を推奨します。

その他の設定については、[plugin configuration](./config.md) ドキュメントを参照してください。

4. **Save & test** ボタンをクリックして、Grafana が ClickHouse サービスに接続できることを確認します。接続に成功すると、**Data source is working** というメッセージが表示されます:

    <Image size="md" img={valid_ds} alt="Save &amp; test を選択" border />



## 5. 次のステップ {#5-next-steps}

データソースの準備が整いました！[query builder](./query-builder.md) を使ってクエリを構築する方法について、さらに学びましょう。

設定の詳細については、[plugin configuration](./config.md) のドキュメントを参照してください。

これらのドキュメントに掲載されていない情報をお探しの場合は、[plugin repository on GitHub](https://github.com/grafana/clickhouse-datasource) を参照してください。



## プラグインバージョンのアップグレード {#upgrading-plugin-versions}

v4 以降では、新しいバージョンがリリースされるたびに、設定とクエリをアップグレードできるようになりました。

v3 の設定とクエリは、開いたタイミングで v4 に移行されます。古い設定とダッシュボードは v4 でも読み込まれますが、新しいバージョンで再度保存しない限り、移行結果は保存されません。古い設定やクエリを開いた際に問題が発生した場合は、変更を破棄して、[GitHub で issue を報告してください](https://github.com/grafana/clickhouse-datasource/issues)。

新しいバージョンで作成された設定やクエリについては、プラグインを以前のバージョンにダウングレードすることはできません。
