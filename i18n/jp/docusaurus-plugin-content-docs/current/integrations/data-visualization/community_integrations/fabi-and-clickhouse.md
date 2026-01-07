---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', '接続', '統合', 'notebook', 'UI', '分析']
description: 'Fabi.ai は、コラボレーション対応のオールインワン・データ分析プラットフォームです。SQL、Python、AI、ノーコードを活用して、これまでになく高速にダッシュボードやデータワークフローを構築できます。'
title: 'ClickHouse を Fabi.ai に接続する'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouse を Fabi.ai に接続する {#connecting-clickhouse-to-fabiai}

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> は、コラボレーション型のオールインワンのデータ分析プラットフォームです。SQL、Python、AI、ノーコードを活用して、これまでになく迅速にダッシュボードやデータワークフローを構築できます。ClickHouse のスケールと高い処理能力を組み合わせることで、大規模なデータセットに対する高性能なダッシュボードを、初回から数分で構築・共有できます。

<Image size="md" img={fabi_01} alt="Fabi.ai のデータ探索およびワークフロープラットフォーム" border />

## 接続情報を取得する {#gather-your-connection-details}

<ConnectionDetails />

## Fabi.ai アカウントを作成し、ClickHouse に接続する {#connect-to-clickhouse}

Fabi.ai にログインするか、アカウントを作成します: https://app.fabi.ai/

1. 初めてアカウントを作成する際は、データベースへの接続設定を求められます。すでにアカウントをお持ちの場合は、任意の Smartbook の左側にあるデータソースパネルをクリックし、Add Data Source を選択します。
   
   <Image size="lg" img={fabi_02} alt="データソースを追加" border />

2. 次に、接続情報の入力を求められます。

   <Image size="md" img={fabi_03} alt="ClickHouse 認証情報フォーム" border />

3. これで完了です。ClickHouse が Fabi.ai に接続されました。

## ClickHouse へのクエリ実行 {#querying-clickhouse}

Fabi.ai を ClickHouse に接続したら、任意の [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) を開き、SQL セルを作成します。Fabi.ai インスタンスに接続されているデータソースが 1 つだけの場合、SQL セルでは自動的に ClickHouse がデフォルトとして選択されます。複数のデータソースがある場合は、ソースのドロップダウンからクエリ対象のソースを選択できます。

   <Image size="lg" img={fabi_04} alt="ClickHouse へのクエリ実行" border />

## 参考資料 {#additional-resources}

[Fabi.ai](https://www.fabi.ai) ドキュメント: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 入門チュートリアル動画: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl