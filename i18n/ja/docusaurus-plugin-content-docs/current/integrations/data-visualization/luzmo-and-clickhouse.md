---
sidebar_label: Luzmo
slug: /integrations/luzmo
keywords: [ clickhouse, Luzmo, 接続, 統合, UI, 埋め込み ]
description: Luzmoは、ソフトウェアおよびSaaSアプリケーション向けに特別に構築された、ネイティブなClickHouse統合を持つ埋め込み分析プラットフォームです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# LuzmoとClickHouseの統合

## 1. ClickHouse接続の設定 {#1-setup-a-clickhouse-connection}

ClickHouseに接続するには、**接続ページ**に移動し、**新しい接続**を選択してから、新しい接続モーダルからClickHouseを選択します。

<p>
  <img src={require('./images/luzmo_01.png').default} class="image" alt="ClickHouse接続の作成" />
</p>

**ホスト**、**ユーザー名**、**パスワード**を提供するよう求められます：

<p>
  <img src={require('./images/luzmo_02.png').default} class="image" alt="ClickHouse接続詳細の提供" />
</p>

*   **ホスト**: これは、ClickHouseデータベースが公開されているホストです。データを安全に転送するために、ここでは`https`のみが許可されています。ホストURLの構造は次のようになります: `https://url-to-clickhouse-db:port/database`
    プラグインはデフォルトで「default」データベースと443ポートに接続します。'/'の後にデータベースを指定することで、接続するデータベースを設定できます。
*   **ユーザー名**: ClickHouseクラスターに接続するために使用されるユーザー名です。
*   **パスワード**: ClickHouseクラスターに接続するためのパスワードです。

APIを介してClickHouseに接続する方法については、開発者ドキュメントの例を参照してください。[ClickHouseへの接続の作成](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. データセットの追加 {#2-add-datasets}

ClickHouseに接続したら、[こちら](https://academy.luzmo.com/article/ldx3iltg)で説明されているようにデータセットを追加できます。利用可能なデータセットから1つまたは複数を選択し、Luzmoでそれらを[リンク](https://academy.luzmo.com/article/gkrx48x5)することで、ダッシュボードで一緒に使用できるようにします。また、[分析のためのデータの準備](https://academy.luzmo.com/article/u492qov0)に関するこの記事もぜひチェックしてください。

APIを使用してデータセットを追加する方法については、[開発者ドキュメントのこの例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

これで、美しい（埋め込み）ダッシュボードを作成したり、クライアントの質問に応えるAIデータアナリスト（[Luzmo IQ](https://luzmo.com/iq)）を活用することができます。

<p>
  <img src={require('./images/luzmo_03.png').default} class="image" alt="Luzmoダッシュボードの例" />
</p>

## 使用上の注意 {#usage-notes}

1. Luzmo ClickHouseコネクタは、HTTP APIインターフェース（通常はポート8123で実行）を使用して接続します。
2. `Distributed`テーブルエンジンを使用するテーブルでは、一部のLuzmoチャートが`distributed_product_mode`が`deny`のときに失敗することがあります。ただし、これはテーブルを別のテーブルにリンクし、そのリンクをチャートで使用した場合にのみ発生するはずです。この場合、ClickHouseクラスター内で意味のある別のオプションに`distributed_product_mode`を設定することを確認してください。ClickHouse Cloudを使用している場合は、安全にこの設定を無視できます。
3. 例えば、LuzmoアプリケーションのみがClickHouseインスタンスにアクセスできるようにするために、[Luzmoの静的IPアドレス範囲](https://academy.luzmo.com/article/u9on8gbm)を**ホワイトリストに登録**することを強く推奨します。また、技術的な読み取り専用ユーザーを使用することをお勧めします。
4. ClickHouseコネクタは現在、以下のデータ型をサポートしています：

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
