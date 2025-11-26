---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo はネイティブな ClickHouse 連携機能を備えた組み込み型アナリティクスプラットフォームで、ソフトウェアおよび SaaS アプリケーション向けに特化して設計されています。'
title: 'Luzmo と ClickHouse の連携'
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


# Luzmo と ClickHouse の連携

<CommunityMaintainedBadge/>



## 1. ClickHouse 接続をセットアップする {#1-setup-a-clickhouse-connection}

ClickHouse への接続を行うには、**Connections ページ**に移動し、**New Connection** を選択してから、New Connection モーダルで ClickHouse を選択します。

<Image img={luzmo_01} size="md" alt="ClickHouse が選択された「Create a New Connection」ダイアログを表示している Luzmo インターフェース" border />

**host**、**username**、**password** を入力するよう求められます：

<Image img={luzmo_02} size="md" alt="ClickHouse の host、username、password のフィールドを表示している Luzmo の接続設定フォーム" border />

*   **Host**：ClickHouse データベースが公開されているホストです。通信経路上のデータを安全に転送するため、ここでは `https` のみが許可されます。host URL は次の形式であることが期待されています：`https://url-to-clickhouse-db:port/database`  
    デフォルトでは、プラグインは 'default' データベースおよびポート 443 に接続します。'/' の後にデータベース名を指定することで、接続先のデータベースを変更できます。
*   **Username**：ClickHouse クラスターへの接続に使用されるユーザー名です。
*   **Password**：ClickHouse クラスターへの接続に使用されるパスワードです。

API 経由で[ClickHouse への接続を作成する](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)方法については、開発者ドキュメントのサンプルを参照してください。



## 2. データセットを追加する {#2-add-datasets}

ClickHouse への接続が完了したら、[こちら](https://academy.luzmo.com/article/ldx3iltg)で説明されている手順に従ってデータセットを追加できます。ClickHouse 上で利用可能な 1 つまたは複数のデータセットを選択し、それらを Luzmo 内で[リンク](https://academy.luzmo.com/article/gkrx48x5)して、ダッシュボード上で一緒に利用できるようにします。[分析向けのデータ準備](https://academy.luzmo.com/article/u492qov0)に関するこの記事も必ず参照してください。

API を使用してデータセットを追加する方法については、[開発者ドキュメント内のこのサンプル](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

これで、データセットを使用して魅力的な埋め込みダッシュボードを構築したり、クライアントからの質問に回答できる AI データアナリスト（[Luzmo IQ](https://luzmo.com/iq)）の基盤として活用したりできます。

<Image img={luzmo_03} size="md" alt="ClickHouse のデータから複数の可視化を表示している Luzmo のダッシュボード例" border />



## 使用上の注意事項 {#usage-notes}

1. Luzmo ClickHouse コネクタは、接続に HTTP API インターフェイス（通常はポート 8123 で稼働）を使用します。
2. `Distributed` テーブルエンジンを使用するテーブルを利用している場合、`distributed_product_mode` が `deny` に設定されていると、一部の Luzmo チャートが失敗する可能性があります。ただし、この問題が発生するのは、テーブルを別のテーブルにリンクし、そのリンクをチャート内で使用している場合に限られるはずです。その場合は、ClickHouse クラスター内で要件に合った別のオプションに `distributed_product_mode` を設定してください。ClickHouse Cloud を使用している場合は、この設定は無視して問題ありません。
3. 例えば Luzmo アプリケーションのみが ClickHouse インスタンスにアクセスできるようにするために、**ホワイトリスト**として [Luzmo の静的 IP アドレス範囲](https://academy.luzmo.com/article/u9on8gbm) を登録することを強く推奨します。また、アプリケーション用の読み取り専用のテクニカルユーザーを使用することも推奨します。
4. ClickHouse コネクタは現在、次のデータ型をサポートしています。

    | ClickHouse Type | Luzmo Type |
    | --- | --- |
    | UInt | 数値型 |
    | Int | 数値型 |
    | Float | 数値型 |
    | Decimal | 数値型 |
    | Date | 日時型 |
    | DateTime | 日時型 |
    | String | 階層型 |
    | Enum | 階層型 |
    | FixedString | 階層型 |
    | UUID | 階層型 |
    | Bool | 階層型 |
