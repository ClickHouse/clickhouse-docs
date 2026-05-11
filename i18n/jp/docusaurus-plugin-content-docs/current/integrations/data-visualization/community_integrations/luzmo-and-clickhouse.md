---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo は、ClickHouse とのネイティブ連携機能を備えた組み込み型アナリティクスプラットフォームであり、ソフトウェアおよび SaaS アプリケーション向けに特化して設計されています。'
title: 'Luzmo と ClickHouse の統合'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Luzmo と ClickHouse の連携 \{#integrating-luzmo-with-clickhouse\}

<CommunityMaintainedBadge/>

## 1. ClickHouse 接続をセットアップする \{#1-setup-a-clickhouse-connection\}

ClickHouse に接続するには、**Connections ページ**に移動し、**New Connection** を選択してから、「New Connection」モーダルで ClickHouse を選択します。

<Image img={luzmo_01} size="md" alt="ClickHouse が選択された「Create a New Connection」ダイアログを表示している Luzmo インターフェイス" border />

**host**、**username**、**password** を入力するよう求められます:

<Image img={luzmo_02} size="md" alt="ClickHouse の host、username、password のフィールドを表示している Luzmo 接続設定フォーム" border />

*   **Host**: ClickHouse データベースが公開されているホストです。通信を安全に行うため、ここでは `https` のみが許可されています。ホスト URL の構造は次の形式になります: `https://url-to-clickhouse-db:port/database`
    デフォルトでは、プラグインは `default` データベースおよびポート 443 に接続します。`/` の後ろにデータベース名を指定することで、接続先のデータベースを変更できます。
*   **Username**: ClickHouse クラスターへの接続に使用するユーザー名です。
*   **Password**: ClickHouse クラスターへの接続に使用するパスワードです。

API 経由で[ClickHouse への接続を作成する](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)方法については、開発者向けドキュメントのサンプルを参照してください。

## 2. データセットを追加する \{#2-add-datasets\}

ClickHouse への接続が完了したら、[こちらの記事](https://academy.luzmo.com/article/ldx3iltg)で説明されている手順に従ってデータセットを追加できます。ClickHouse で利用可能な 1 つまたは複数のデータセットを選択し、Luzmo 内で[リンク](https://academy.luzmo.com/article/gkrx48x5)することで、ダッシュボード内で組み合わせて利用できるようにします。また、[分析のためのデータ準備](https://academy.luzmo.com/article/u492qov0)に関するこの記事も必ず確認してください。

API を使用してデータセットを追加する方法については、[開発者ドキュメント内のこのサンプル](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

これで、データセットを使用して美しい（埋め込み型）ダッシュボードを構築したり、クライアントの質問に回答できる AI Data Analyst（[Luzmo IQ](https://luzmo.com/iq)）を活用したりできます。

<Image img={luzmo_03} size="md" alt="ClickHouse のデータから複数の可視化を表示している Luzmo ダッシュボードの例" border />

## 使用上の注意事項 \{#usage-notes\}

1. Luzmo ClickHouse コネクタは、接続のために HTTP API インターフェース（通常ポート 8123 で稼働）を使用します。
2. `Distributed` テーブルエンジンを使用している場合、`distributed_product_mode` が `deny` に設定されていると、一部の Luzmo チャートが失敗する可能性があります。ただし、これはテーブルを別のテーブルにリンクし、そのリンクをチャート内で使用している場合にのみ発生します。その場合は、ClickHouse クラスター内で要件に合致する別のオプションに `distributed_product_mode` を設定してください。ClickHouse Cloud を使用している場合は、この設定は無視しても問題ありません。
3. 例えば Luzmo アプリケーションのみが ClickHouse インスタンスにアクセスできるようにするために、**ホワイトリスト**として [Luzmo の静的 IP アドレス範囲](https://academy.luzmo.com/article/u9on8gbm) を登録することを強く推奨します。また、技術的な読み取り専用 USER を使用することも推奨します。
4. ClickHouse コネクタは現在、以下のデータ型をサポートしています:

    | ClickHouse Type | Luzmo Type |
    | --- | --- |
    | UInt | numeric |
    | Int | numeric |
    | Float | numeric |
    | Decimal | numeric |
    | Date | datetime |
    | DateTime | datetime |
    | String | hierarchy |
    | Enum | hierarchy |
    | FixedString | hierarchy |
    | UUID | hierarchy |
    | Bool | hierarchy |