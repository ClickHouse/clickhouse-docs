---
'sidebar_label': 'Deepnote'
'sidebar_position': 11
'slug': '/integrations/deepnote'
'keywords':
- 'clickhouse'
- 'Deepnote'
- 'connect'
- 'integrate'
- 'notebook'
'description': '非常に大きなデータセットを効率的にクエリし、知られたノートブック環境で分析とモデル化を行います。'
'title': 'ClickHouseをDeepnoteに接続する'
'doc_type': 'guide'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Connect ClickHouse to Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームがインサイトを発見し共有するために作られたコラボレーティブデータノートブックです。Jupyterとの互換性があるだけでなく、クラウド上で動作し、データサイエンスプロジェクトに効率的に共同作業を行うための中央の場所を提供します。

このガイドでは、すでにDeepnoteアカウントを持っており、稼働中のClickHouseインスタンスがあることを前提としています。

## Interactive example {#interactive-example}
DeepnoteデータノートブックからClickHouseをクエリするインタラクティブな例を探索したい場合は、以下のボタンをクリックして、[ClickHouse playground](../../getting-started/playground.md)に接続されたテンプレートプロジェクトを起動してください。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="深ノートで起動" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Connect to ClickHouse {#connect-to-clickhouse}

1. Deepnote内で「Integrations」オーバービューを選択し、ClickHouseのタイルをクリックします。

<Image size="lg" img={deepnote_01} alt="ClickHouse統合タイル" border />

2. ClickHouseインスタンスの接続詳細を提供します:
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse詳細ダイアログ" border />

   **_注意:_** ClickHouseへの接続がIPアクセスリストで保護されている場合は、DeepnoteのIPアドレスを許可する必要があるかもしれません。詳細については、[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)を読むことをお勧めします。

3. おめでとうございます！これでClickHouseがDeepnoteに統合されました。

## Using ClickHouse integration. {#using-clickhouse-integration}

1. 最初に、ノートブックの右側にあるClickHouse統合に接続します。

   <Image size="lg" img={deepnote_03} alt="ClickHouse詳細ダイアログ" border />

2. 新しいClickHouseクエリブロックを作成し、データベースにクエリを実行します。クエリ結果はDataFrameとして保存され、SQLブロックで指定された変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
