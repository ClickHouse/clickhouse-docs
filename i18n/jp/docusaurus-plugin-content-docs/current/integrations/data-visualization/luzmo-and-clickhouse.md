---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmoは、ソフトウェアおよびSaaSアプリケーション向けに特別に構築された、ネイティブのClickHouse統合を持つ組み込みアナリティクスプラットフォームです。'
title: 'ClickHouseとLuzmoの統合'
sidebar: 'integrations'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseとLuzmoの統合

<CommunityMaintainedBadge/>

## 1. ClickHouse接続の設定 {#1-setup-a-clickhouse-connection}

ClickHouseに接続するには、**Connectionsページ**に移動し、**New Connection**を選択し、新しい接続モーダルからClickHouseを選択します。

<Image img={luzmo_01} size="md" alt="ClickHouseが選択された新しい接続ダイアログを表示するLuzmoインターフェース" border />

**ホスト**、**ユーザー名**、**パスワード**を提供するよう求められます：

<Image img={luzmo_02} size="md" alt="ClickHouseのホスト、ユーザー名、パスワードのためのフィールドを示すLuzmo接続構成フォーム" border />

*   **ホスト**: これは、あなたのClickHouseデータベースが公開されているホストです。データを安全に転送するために、ここでは`https`のみが許可されています。ホストURLの構造は次のようになります: `https://url-to-clickhouse-db:port/database`
    デフォルトでは、プラグインは'default'データベースおよび443ポートに接続します。'/'の後にデータベースを提供することで、接続するデータベースを構成できます。
*   **ユーザー名**: あなたのClickHouseクラスタに接続するために使用されるユーザー名です。
*   **パスワード**: あなたのClickHouseクラスタに接続するためのパスワードです。

APIを通じてClickHouseへの接続を作成する方法については、開発者ドキュメント内の例を参照してください。[ClickHouseに接続を作成する](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody).

## 2. データセットを追加する {#2-add-datasets}

ClickHouseに接続したら、[こちら](https://academy.luzmo.com/article/ldx3iltg)で説明されているようにデータセットを追加できます。ClickHouseに存在する1つまたは複数のデータセットを選択し、Luzmoで[リンク](https://academy.luzmo.com/article/gkrx48x5)して、ダッシュボードで一緒に使用できるようにします。また、[アナリティクスのためのデータの準備](https://academy.luzmo.com/article/u492qov0)に関するこの記事もチェックしてください。

APIを使用してデータセットを追加する方法については、開発者ドキュメント内の[この例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

あなたは今、自分のデータセットを使用して美しい（組み込みの）ダッシュボードを作成したり、クライアントの質問に回答できるAIデータアナリスト（[Luzmo IQ](https://luzmo.com/iq)）を提供したりできます。

<Image img={luzmo_03} size="md" alt="ClickHouseからのデータの複数の視覚化を示すLuzmoダッシュボードの例" border />

## 使用上の注意 {#usage-notes}

1. Luzmo ClickHouseコネクタは、HTTP APIインターフェース（通常はポート8123で実行）を使用して接続します。
2. `Distributed`テーブルエンジンを使用しているテーブルがある場合、`distributed_product_mode`が`deny`のときに一部のLuzmoチャートが失敗する可能性があります。ただし、これはテーブルを別のテーブルにリンクし、そのリンクをチャートで使用する場合にのみ発生するはずです。その場合は、ClickHouseクラスタ内であなたに適した他のオプションに`distributed_product_mode`を設定してください。ClickHouse Cloudを使用している場合は、この設定を無視しても問題ありません。
3. e.g. LuzmoアプリケーションのみがあなたのClickHouseインスタンスにアクセスできるようにするため、おすすめは[Luzmoの静的IPアドレス範囲をホワイトリストに登録する](https://academy.luzmo.com/article/u9on8gbm)ことです。また、技術的な読み取り専用ユーザーを使用することをお勧めします。
4. 現在、ClickHouseコネクタは次のデータ型をサポートしています：

    | ClickHouseタイプ | Luzmoタイプ |
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
