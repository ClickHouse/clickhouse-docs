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
'description': 'Luzmoは、ネイティブのClickHouse統合を備えた埋め込み型分析プラットフォームであり、ソフトウェアおよびSaaSアプリケーション向けに特別に設計されています。'
'title': 'Integrating Luzmo with ClickHouse'
'sidebar': 'integrations'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# LuzmoをClickHouseと統合する

<CommunityMaintainedBadge/>

## 1. ClickHouse接続の設定 {#1-setup-a-clickhouse-connection}

ClickHouseに接続するには、**Connectionsページ**に移動し、**New Connection**を選択して、New ConnectionモーダルからClickHouseを選択します。

<Image img={luzmo_01} size="md" alt="ClickHouseを選択した新しい接続ダイアログを表示しているLuzmoインターフェース" border />

**ホスト**、**ユーザー名**、**パスワード**を提供するように求められます：

<Image img={luzmo_02} size="md" alt="ClickHouseのホスト、ユーザー名、パスワードのためのフィールドを表示しているLuzmo接続設定フォーム" border />

*   **ホスト**: これはあなたのClickHouseデータベースが公開されているホストです。ここではデータを安全に転送するために `https` のみが許可されていることに注意してください。ホストURLの構造は次のようになります: `https://url-to-clickhouse-db:port/database`
    デフォルトでは、このプラグインは 'default' データベースおよび443ポートに接続します。 '/'の後にデータベースを指定することで、接続するデータベースを設定できます。
*   **ユーザー名**: あなたのClickHouseクラスタに接続するために使用されるユーザー名。
*   **パスワード**: あなたのClickHouseクラスタに接続するためのパスワード。

私たちのAPIを介してClickHouseに接続を作成する方法については、開発者ドキュメントの例を参照してください。[ClickHouseへの接続を作成する](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. データセットを追加する {#2-add-datasets}

ClickHouseに接続したら、[こちら](https://academy.luzmo.com/article/ldx3iltg)に説明されているようにデータセットを追加できます。ClickHouseで利用可能な1つまたは複数のデータセットを選択し、Luzmoにリンクしてダッシュボードで一緒に使用できるようにします。また、[分析のためのデータを準備する](https://academy.luzmo.com/article/u492qov0)に関するこの記事もチェックしてください。

私たちのAPIを使ってデータセットを追加する方法については、[開発者ドキュメントのこの例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)を参照してください。

データセットを使用して美しい（埋め込まれた）ダッシュボードを構築したり、クライアントの質問に答えることができるAIデータアナリスト（[Luzmo IQ](https://luzmo.com/iq)）に力を与えたりすることができます。

<Image img={luzmo_03} size="md" alt="ClickHouseからのデータの複数の視覚化を示すLuzmoダッシュボードの例" border />

## 使用上の注意 {#usage-notes}

1. Luzmo ClickHouseコネクタは、HTTP APIインターフェース（通常はポート8123で実行）を使用して接続します。
2. `Distributed` テーブルエンジンを使用しているテーブルを使用する場合、一部のLuzmoチャートは `distributed_product_mode`が `deny` のときに失敗する可能性があります。しかし、これは他のテーブルにリンクしてそのリンクをチャートで使用する場合にのみ発生する必要があります。その場合、ClickHouseクラスタ内であなたにとって理にかなう他のオプションに `distributed_product_mode`を設定してください。ClickHouse Cloudを使用している場合、この設定は無視しても安全です。
3. 例えば、LuzmoアプリケーションのみがあなたのClickHouseインスタンスにアクセスできるようにするためには、[Luzmoの静的IPアドレスの範囲をホワイトリストに追加する](https://academy.luzmo.com/article/u9on8gbm)ことを強くお勧めします。また、技術的な読み取り専用ユーザーを使用することも推奨します。
4. 現在、ClickHouseコネクタは以下のデータ型をサポートしています：

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
