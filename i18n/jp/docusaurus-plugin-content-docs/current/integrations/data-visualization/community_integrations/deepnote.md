---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: '使い慣れたノートブック環境の快適さはそのままに、非常に大きなデータセットに効率的にクエリを実行し、分析やモデリングを行えます。'
title: 'ClickHouse を Deepnote に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse を Deepnote に接続する

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームでインサイトを発見・共有するために設計された共同作業向けのデータノートブックです。Jupyter 互換であることに加えて、クラウド上で動作し、データサイエンスプロジェクトに効率的に取り組み、共同作業を行うための一元的なワークスペースを提供します。

このガイドでは、すでに Deepnote アカウントをお持ちであり、稼働中の ClickHouse インスタンスがあることを前提とします。



## インタラクティブな例 {#interactive-example}

Deepnote データノートブックから ClickHouse へクエリを実行するインタラクティブな例を試したい場合は、下のボタンをクリックして [ClickHouse playground](../../../getting-started/playground.md) に接続されたテンプレートプロジェクトを起動してください。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnote で起動" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)


## ClickHouseへの接続 {#connect-to-clickhouse}

1. Deepnote内で「Integrations」概要を選択し、ClickHouseタイルをクリックします。

<Image size='lg' img={deepnote_01} alt='ClickHouse統合タイル' border />

2. ClickHouseインスタンスの接続情報を入力します:

   <ConnectionDetails />

   <Image size='md' img={deepnote_02} alt='ClickHouse詳細ダイアログ' border />

   **_注意:_** ClickHouseへの接続がIPアクセスリストで保護されている場合は、DeepnoteのIPアドレスを許可する必要があります。詳細については、[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)を参照してください。

3. これでClickHouseとDeepnoteの統合が完了しました。


## ClickHouse統合の使用 {#using-clickhouse-integration}

1. ノートブックの右側にあるClickHouse統合に接続します。

   <Image size='lg' img={deepnote_03} alt='ClickHouse詳細ダイアログ' border />

2. 新しいClickHouseクエリブロックを作成し、データベースにクエリを実行します。クエリ結果はDataFrameとして保存され、SQLブロックで指定した変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
