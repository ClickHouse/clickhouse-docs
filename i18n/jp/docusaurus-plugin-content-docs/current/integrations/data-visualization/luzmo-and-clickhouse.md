---
'sidebar_label': 'Luzmo'
'slug': '/integrations/luzmo'
'keywords':
- 'clickhouse'
- 'Luzmo'
- 'connect'
- 'integrate'
- 'ui'
- 'embedded'
'description': 'Luzmoは、ソフトウェアおよびSaaSアプリケーション向けに特別に設計されたネイティブなClickHouse統合を持つ埋め込まれた分析プラットフォームです。'
'title': 'LuzmoをClickHouseと統合する'
'sidebar': 'integrations'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# LuzmoをClickHouseに統合する

<CommunityMaintainedBadge/>

## 1. ClickHouse接続の設定 {#1-setup-a-clickhouse-connection}

ClickHouseに接続するには、**Connectionsページ**に移動し、**New Connection**を選択してから、New ConnectionモーダルからClickHouseを選択します。

<Image img={luzmo_01} size="md" alt="LuzmoインターフェースがClickHouseを選択した新しい接続ダイアログを表示している" border />

**ホスト**、**ユーザー名**、および**パスワード**の提供を求められます：

<Image img={luzmo_02} size="md" alt="ClickHouseホスト、ユーザー名、パスワードのフィールドを表示するLuzmo接続設定フォーム" border />

*   **ホスト**: これはあなたのClickHouseデータベースが公開されているホストです。データを安全に転送するために、ここでは`https`のみが許可されていることに注意してください。ホストのURLの構造は次のようになります：`https://url-to-clickhouse-db:port/database`
    プラグインはデフォルトで「default」データベースと443ポートに接続します。スラッシュの後にデータベースを指定することで、どのデータベースに接続するかを設定できます。
*   **ユーザー名**: あなたのClickHouseクラスターに接続するのに使用されるユーザー名です。
*   **パスワード**: あなたのClickHouseクラスターに接続するためのパスワードです。

当社のAPIを介してClickHouseに接続を[作成する方法](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)については、開発者ドキュメントの例を参照してください。

## 2. データセットの追加 {#2-add-datasets}

ClickHouseに接続したら、[ここ](https://academy.luzmo.com/article/ldx3iltg)に説明されているようにデータセットを追加できます。ClickHouseで利用可能な1つまたは複数のデータセットを選択し、Luzmoに[リンク](https://academy.luzmo.com/article/gkrx48x5)することで、ダッシュボードで一緒に使用できるようにします。また、[データの分析準備についての記事](https://academy.luzmo.com/article/u492qov0)もぜひご覧ください。

APIを使用してデータセットを追加する方法については、[開発者ドキュメントのこの例を参照してください](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

あなたのデータセットを使用して、美しい（埋め込み型）ダッシュボードを構築したり、クライアントの質問に答えるAIデータアナリスト（[Luzmo IQ](https://luzmo.com/iq)）を活用したりできます。

<Image img={luzmo_03} size="md" alt="ClickHouseからのデータの複数の視覚化を表示するLuzmoダッシュボードの例" border />

## 使用上の注意 {#usage-notes}

1. LuzmoのClickHouseコネクタは、HTTP APIインターフェース（通常はポート8123で実行）を使用して接続します。
2. `Distributed`テーブルエンジンを使用しているテーブルの場合、`distributed_product_mode`が`deny`のときに一部のLuzmoチャートが失敗することがあります。ただし、これはテーブルを別のテーブルにリンクさせ、そのリンクをチャートで使用する場合にのみ発生します。その場合、ClickHouseクラスター内であなたに合った別のオプションに`distributed_product_mode`を設定してください。ClickHouse Cloudを使用している場合、この設定は無視しても安全です。
3. 例えばLuzmoアプリケーションのみがあなたのClickHouseインスタンスにアクセスできるようにするために、[Luzmoの静的IPアドレスの範囲](https://academy.luzmo.com/article/u9on8gbm)を**ホワイトリストに追加**することを強く推奨します。また、技術的な読み取り専用ユーザーの使用も推奨します。
4. ClickHouseコネクタは現在、以下のデータ型をサポートしています：

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
