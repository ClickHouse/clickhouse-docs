---
sidebar_label: Retool
slug: /integrations/retool
keywords: [clickhouse, retool, connect, integrate, ui, admin, panel, dashboard, nocode, no-code]
description: リッチなユーザーインターフェースを持つウェブおよびモバイルアプリを迅速に構築し、複雑なタスクを自動化し、AIを統合します。すべてはあなたのデータによって駆動されます。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';


# RetoolをClickHouseに接続する

## 1. 接続の詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseリソースを作成する {#2-create-a-clickhouse-resource}

Retoolアカウントにログインし、_Resources_ タブに移動します。「Create New」 -> 「Resource」を選択します:

<img src={retool_01} className="image" alt="新しいリソースの作成" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

利用可能なコネクタのリストから「JDBC」を選択します:

<img src={retool_02} className="image" alt="JDBCコネクタの選択" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

セットアップウィザードで、「Driver name」として `com.clickhouse.jdbc.ClickHouseDriver` を選択してください:

<img src={retool_03} className="image" alt="適切なドライバの選択" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

次の形式でClickHouseの資格情報を記入します: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスがSSLを必要としたり、ClickHouse Cloudを使用している場合は、接続文字列に `&ssl=true` を追加してください。形式は `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true` のようになります。

<img src={retool_04} className="image" alt="資格情報の指定" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

その後、接続をテストします:

<img src={retool_05} className="image" alt="接続のテスト" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

これで、ClickHouseリソースを使用してアプリに進むことができるはずです。
