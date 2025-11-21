---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai はオールインワンのコラボレーション型データ分析プラットフォームです。SQL、Python、AI、ノーコードを活用して、これまでになく高速にダッシュボードやデータワークフローを構築できます。'
title: 'ClickHouse を Fabi.ai に接続する'
doc_type: 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse と Fabi.ai の接続

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> は、オールインワンの共同作業型データ分析プラットフォームです。SQL、Python、AI、さらにノーコードを活用して、これまでになく速やかにダッシュボードやデータワークフローを構築できます。ClickHouse のスケーラビリティと高い処理性能を組み合わせることで、巨大なデータセットに対して、高性能な最初のダッシュボードを数分で構築・共有できます。

<Image size="md" img={fabi_01} alt="Fabi.ai のデータ探索およびワークフロー プラットフォーム" border />



## 接続情報を収集する {#gather-your-connection-details}

<ConnectionDetails />


## Create your Fabi.ai account and connect ClickHouse {#connect-to-clickhouse}

Fabi.aiアカウントにログインするか、新規作成してください: https://app.fabi.ai/

1. アカウントを初めて作成する際にデータベースへの接続を求められます。既にアカウントをお持ちの場合は、任意のSmartbookの左側にあるデータソースパネルをクリックし、「データソースを追加」を選択してください。

   <Image size='lg' img={fabi_02} alt='データソースを追加' border />

2. 次に、接続情報の入力を求められます。

   <Image size='md' img={fabi_03} alt='ClickHouse認証情報フォーム' border />

3. これでClickHouseをFabi.aiに統合できました。


## ClickHouseへのクエリ実行 {#querying-clickhouse}

Fabi.aiをClickHouseに接続したら、任意の[Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks)に移動し、SQLセルを作成します。Fabi.aiインスタンスに接続されているデータソースが1つのみの場合、SQLセルは自動的にClickHouseがデフォルトとして設定されます。複数のデータソースがある場合は、ソースドロップダウンからクエリ実行対象のソースを選択できます。

<Image size='lg' img={fabi_04} alt='ClickHouseへのクエリ実行' border />


## 追加リソース {#additional-resources}

[Fabi.ai](https://www.fabi.ai) ドキュメント: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 入門チュートリアル動画: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
