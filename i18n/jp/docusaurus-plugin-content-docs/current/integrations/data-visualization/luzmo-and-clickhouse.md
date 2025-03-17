---
sidebar_label: Luzmo
slug: /integrations/luzmo
keywords: [ clickhouse, Luzmo, connect, integrate, ui, embedded ]
description: Luzmoは、ソフトウェアおよびSaaSアプリケーション向けに特別に構築された、ネイティブClickHouse統合を持つ埋め込み分析プラットフォームです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';


# ClickHouseとのLuzmo統合

## 1. ClickHouse接続の設定 {#1-setup-a-clickhouse-connection}

ClickHouseに接続するには、**Connections page**に移動し、**New Connection**を選択してから、New ConnectionモーダルからClickHouseを選択します。

<p>
  <img src={luzmo_01} class="image" alt="ClickHouse接続を作成" />
</p>

**ホスト**、**ユーザー名**、および**パスワード**を提供するよう求められます：

<p>
  <img src={luzmo_02} class="image" alt="ClickHouse接続の詳細を提供" />
</p>

*   **ホスト**: これはあなたのClickHouseデータベースが公開されているホストです。ここでは、データを安全に転送するために`https`のみが許可されています。ホストのURLの構造は次のようになります: `https://url-to-clickhouse-db:port/database`
    プラグインはデフォルトで'default'データベースと443ポートに接続します。'/'の後にデータベースを指定することで、どのデータベースに接続するかを設定できます。
*   **ユーザー名**: あなたのClickHouseクラスターに接続するために使用されるユーザー名。
*   **パスワード**: あなたのClickHouseクラスターに接続するためのパスワード。

私たちの開発者ドキュメントの例を参照して、私たちのAPIを介してClickHouseへの[接続を作成する方法](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)を見つけてください。

## 2. データセットの追加 {#2-add-datasets}

ClickHouseに接続したら、[こちら](https://academy.luzmo.com/article/ldx3iltg)で説明されているようにデータセットを追加できます。あなたのClickHouseで利用可能な1つまたは複数のデータセットを選択し、Luzmoでそれらを[リンク](https://academy.luzmo.com/article/gkrx48x5)して、ダッシュボードで一緒に使用できるようにします。また、[分析のためのデータ準備](https://academy.luzmo.com/article/u492qov0)に関するこのアーティクルもぜひご覧ください。

私たちのAPIを使用してデータセットを追加する方法については、[この開発者ドキュメントの例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

データセットを使用して、美しい（埋め込み）ダッシュボードを作成したり、クライアントの質問に答えることができるAIデータアナリスト（[Luzmo IQ](https://luzmo.com/iq)）を動かしたりすることができます。

<p>
  <img src={luzmo_03} class="image" alt="Luzmoダッシュボードの例" />
</p>

## 使用上の注意 {#usage-notes}

1. Luzmo ClickHouseコネクタは、ClickHouseに接続するためにHTTP APIインターフェース（通常ポート8123で実行）を使用します。
2. `Distributed`テーブルエンジンを使用する場合、`distributed_product_mode`が`deny`であると、一部のLuzmoチャートが失敗することがあります。これは、テーブルを別のテーブルにリンクして、そのリンクをチャートで使用する場合にのみ発生するべきです。その場合は、ClickHouseクラスター内で自分に適した他のオプションに`distributed_product_mode`を設定してください。ClickHouse Cloudを使用している場合、この設定は無視しても安全です。
3. 例えば、LuzmoアプリケーションのみがClickHouseインスタンスにアクセスできるようにするために、[Luzmoの静的IPアドレス範囲](https://academy.luzmo.com/article/u9on8gbm)を**ホワイトリスト**に追加することを強くお勧めします。また、技術的な読み取り専用ユーザーの使用をお勧めします。
4. ClickHouseコネクタは、現在次のデータ型をサポートしています：

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
