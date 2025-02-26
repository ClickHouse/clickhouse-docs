---
sidebar_label: Deepnote
sidebar_position: 11
slug: /integrations/deepnote
keywords: [clickhouse, Deepnote, connect, integrate, notebook]
description: 非常に大規模なデータセットを効率的にクエリし、既知のノートブック環境で分析およびモデリングを行います。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouseをDeepnoteに接続する

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームが洞察を発見し共有するために構築されたコラボレーティブデータノートブックです。Jupyter互換であるだけでなく、クラウドで動作し、データサイエンスプロジェクトを効率的にコラボレーションし作業するための中央の場所を提供します。

このガイドでは、すでにDeepnoteアカウントがあり、稼働中のClickHouseインスタンスがあることを前提としています。

## インタラクティブな例 {#interactive-example}
DeepnoteデータノートブックからClickHouseをクエリするインタラクティブな例を探索したい場合、下のボタンをクリックして[ClickHouseプレイグラウンド](../../getting-started/playground.md)に接続されたテンプレートプロジェクトを立ち上げてください。

[<img src="https://deepnote.com/buttons/launch-in-deepnote.svg"/>](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouseに接続する {#connect-to-clickhouse}

1. Deepnote内で「インテグレーション」オーバービューを選択し、ClickHouseタイルをクリックします。

<img src={require('./images/deepnote_01.png').default} class="image" alt="ClickHouseインテグレーションタイル" style={{width: '100%'}}/>

2. ClickHouseインスタンスの接続詳細を提供します：
<ConnectionDetails />

   <img src={require('./images/deepnote_02.png').default} class="image" alt="ClickHouse詳細ダイアログ" style={{width: '100%'}}/>

   **_注:_** ClickHouseへの接続がIPアクセスリストで保護されている場合、DeepnoteのIPアドレスを許可する必要があるかもしれません。詳細については、[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)を参照してください。
3. おめでとうございます！ これでClickHouseがDeepnoteに統合されました。

## ClickHouse統合の使用 {#using-clickhouse-integration}

1. ノートブックの右側にあるClickHouse統合に接続することから始めます。

   <img src={require('./images/deepnote_03.png').default} class="image" alt="ClickHouse詳細ダイアログ" style={{width: '100%'}}/>
2. 次に、新しいClickHouseクエリブロックを作成し、データベースをクエリします。クエリ結果はDataFrameとして保存され、SQLブロックで指定された変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
