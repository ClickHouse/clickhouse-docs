---
sidebar_label: Retool
slug: /integrations/retool
keywords: [clickhouse, retool, connect, integrate, ui, admin, panel, dashboard, nocode, no-code]
description: ウェブおよびモバイルアプリを迅速に構築し、リッチなユーザーインターフェースを持たせ、複雑なタスクを自動化し、AIを統合します。すべてはあなたのデータによって駆動されます。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# RetoolをClickHouseに接続する

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseリソースを作成する {#2-create-a-clickhouse-resource}

Retoolアカウントにログインし、_リソース_ タブに移動します。「新規作成」->「リソース」を選択します：

<img src={require('./images/retool_01.png').default} className="image" alt="新しいリソースを作成" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

利用可能なコネクタのリストから「JDBC」を選択します：

<img src={require('./images/retool_02.png').default} className="image" alt="JDBCコネクタを選択" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

セットアップウィザードでは、「ドライバ名」として`com.clickhouse.jdbc.ClickHouseDriver`を選択してください：

<img src={require('./images/retool_03.png').default} className="image" alt="正しいドライバを選択" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

以下の形式でClickHouseの資格情報を入力します：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスがSSLを必要とする場合、またはClickHouse Cloudを使用している場合は、接続文字列に`&ssl=true`を追加します。このようになります：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<img src={require('./images/retool_04.png').default} className="image" alt="資格情報の指定" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

その後、接続をテストします：

<img src={require('./images/retool_05.png').default} className="image" alt="接続のテスト" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

これで、ClickHouseリソースを使用してアプリに進むことができるようになります。
