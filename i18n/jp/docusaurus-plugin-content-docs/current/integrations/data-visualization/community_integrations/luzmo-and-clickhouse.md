---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo は、ClickHouse とネイティブに統合された、ソフトウェアおよび SaaS アプリケーション向けの埋め込み分析プラットフォームです。'
title: 'ClickHouse と Luzmo の統合'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse と Luzmo の統合

<CommunityMaintainedBadge/>



## 1. ClickHouse接続のセットアップ {#1-setup-a-clickhouse-connection}

ClickHouseへの接続を作成するには、**Connectionsページ**に移動し、**New Connection**を選択してから、New ConnectionモーダルダイアログでClickHouseを選択します。

<Image
  img={luzmo_01}
  size='md'
  alt='ClickHouseが選択されたCreate a New Connectionダイアログを表示するLuzmoインターフェース'
  border
/>

**host**、**username**、**password**の入力が求められます:

<Image
  img={luzmo_02}
  size='md'
  alt='ClickHouseのhost、username、passwordのフィールドを表示するLuzmo接続設定フォーム'
  border
/>

- **Host**: ClickHouseデータベースが公開されているホストです。データを安全に転送するため、ここでは`https`のみが許可されていることに注意してください。ホストURLの構造は次の形式を想定しています: `https://url-to-clickhouse-db:port/database`
  デフォルトでは、プラグインは'default'データベースと443ポートに接続します。'/'の後にデータベースを指定することで、接続先のデータベースを設定できます。
- **Username**: ClickHouseクラスタへの接続に使用されるユーザー名です。
- **Password**: ClickHouseクラスタへの接続に使用されるパスワードです。

APIを介して[ClickHouseへの接続を作成](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)する方法については、開発者ドキュメントの例を参照してください。


## 2. データセットの追加 {#2-add-datasets}

ClickHouseを接続した後、[こちら](https://academy.luzmo.com/article/ldx3iltg)の説明に従ってデータセットを追加できます。ClickHouseで利用可能な1つまたは複数のデータセットを選択し、Luzmoで[リンク](https://academy.luzmo.com/article/gkrx48x5)することで、ダッシュボード内で一緒に使用できるようになります。また、[分析用データの準備](https://academy.luzmo.com/article/u492qov0)に関する記事も必ずご確認ください。

APIを使用してデータセットを追加する方法については、[開発者ドキュメントのこちらの例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

これで、データセットを使用して美しい(埋め込み可能な)ダッシュボードを構築したり、クライアントの質問に回答できるAIデータアナリスト([Luzmo IQ](https://luzmo.com/iq))を活用したりできます。

<Image
  img={luzmo_03}
  size='md'
  alt='ClickHouseからのデータの複数の可視化を示すLuzmoダッシュボードの例'
  border
/>


## 使用上の注意 {#usage-notes}

1. Luzmo ClickHouseコネクタは、HTTP APIインターフェース(通常はポート8123で実行)を使用して接続します。
2. `Distributed`テーブルエンジンを使用するテーブルを利用する場合、`distributed_product_mode`が`deny`に設定されていると、一部のLuzmoチャートが失敗する可能性があります。ただし、これはテーブルを別のテーブルにリンクし、そのリンクをチャートで使用する場合にのみ発生します。その場合は、ClickHouseクラスタ内で適切な別のオプションに`distributed_product_mode`を設定してください。ClickHouse Cloudを使用している場合は、この設定を無視しても問題ありません。
3. 例えばLuzmoアプリケーションのみがClickHouseインスタンスにアクセスできるようにするには、[Luzmoの静的IPアドレス範囲](https://academy.luzmo.com/article/u9on8gbm)を**ホワイトリストに登録**することを強く推奨します。また、技術用の読み取り専用ユーザーを使用することも推奨します。
4. ClickHouseコネクタは現在、以下のデータ型をサポートしています:

   | ClickHouse型 | Luzmo型 |
   | --------------- | ---------- |
   | UInt            | numeric    |
   | Int             | numeric    |
   | Float           | numeric    |
   | Decimal         | numeric    |
   | Date            | datetime   |
   | DateTime        | datetime   |
   | String          | hierarchy  |
   | Enum            | hierarchy  |
   | FixedString     | hierarchy  |
   | UUID            | hierarchy  |
   | Bool            | hierarchy  |
