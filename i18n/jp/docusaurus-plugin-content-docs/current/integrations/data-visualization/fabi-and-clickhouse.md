---
'sidebar_label': 'Fabi.ai'
'slug': '/integrations/fabi.ai'
'keywords':
- 'clickhouse'
- 'Fabi.ai'
- 'connect'
- 'integrate'
- 'notebook'
- 'ui'
- 'analytics'
'description': 'Fabi.aiは、オールインワンのコラボレートデータ分析プラットフォームです。SQL、Python、AI、そしてノーコードを活用して、ダッシュボードやデータワークフローをこれまで以上に速く構築することができます。'
'title': 'Connect ClickHouse to Fabi.ai'
'doc_type': 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouseをFabi.aiに接続する

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a>は、オールインワンのコラボレーティブデータ分析プラットフォームです。SQL、Python、AI、ノーコードを活用して、ダッシュボードやデータワークフローをこれまで以上に迅速に構築できます。ClickHouseのスケールとパワーと組み合わせることで、膨大なデータセットに対して高性能なダッシュボードを数分で構築して共有できます。

<Image size="md" img={fabi_01} alt="Fabi.aiデータ探索およびワークフロープラットフォーム" border />

## 接続情報を収集する {#gather-your-connection-details}

<ConnectionDetails />

## Fabi.aiアカウントを作成しClickHouseに接続する {#connect-to-clickhouse}

Fabi.aiアカウントにログインするか、作成してください: https://app.fabi.ai/

1. アカウントを最初に作成するとき、またはすでにアカウントがある場合は、任意のSmartbookの左側にあるデータソースパネルをクリックし、「データソースを追加」を選択するように促されます。

   <Image size="lg" img={fabi_02} alt="データソースを追加" border />

2. 次に、接続情報を入力するように促されます。

   <Image size="md" img={fabi_03} alt="ClickHouseの認証情報フォーム" border />

3. おめでとうございます！ ClickHouseがFabi.aiに統合されました。

## ClickHouseにクエリを実行する {#querying-clickhouse}

Fabi.aiをClickHouseに接続すると、任意の[Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks)に移動し、SQLセルを作成します。一度に1つのデータソースしかFabi.aiインスタンスに接続されていない場合、SQLセルは自動的にClickHouseにデフォルト設定されます。それ以外の場合は、ソースドロップダウンからクエリを実行するソースを選択できます。

   <Image size="lg" img={fabi_04} alt="ClickHouseにクエリを実行" border />

## 追加リソース {#additional-resources}

[Fabi.ai](https://www.fabi.ai)のドキュメント: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai)の入門チュートリアル動画: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
