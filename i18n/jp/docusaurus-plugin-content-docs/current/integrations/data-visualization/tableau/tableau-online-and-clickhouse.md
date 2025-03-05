---
sidebar_label: Tableau Online
sidebar_position: 2
slug: /integrations/tableau-online
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: Tableau Online は、データの力を活用し、どこからでも迅速かつ自信を持った意思決定者を生み出します。
---

import MySQLCloudSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';


# Tableau Online

Tableau Online は、MySQL インターフェースを通じて ClickHouse Cloud またはオンプレミスの ClickHouse セットアップに接続できます。

## ClickHouse Cloud セットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミス ClickHouse サーバーセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau Online を ClickHouse に接続する (SSL なしのオンプレミス) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

あなたの Tableau Cloud サイトにログインし、新しい公開データソースを追加します。

<img src={tableau_online_01} class="image" alt="新しい公開データソースの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

利用可能なコネクタのリストから「MySQL」を選択します。

<img src={tableau_online_02} class="image" alt="MySQL コネクタの選択" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

ClickHouse セットアップ中に収集した接続情報を指定します。

<img src={tableau_online_03} class="image" alt="接続情報の指定" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Online はデータベースをインテロスペクトし、利用可能なテーブルのリストを提供します。使用したいテーブルを右側のキャンバスにドラッグします。さらに、「今すぐ更新」をクリックしてデータをプレビューし、インテロスペクトされたフィールドの型や名前を微調整できます。

<img src={tableau_online_04} class="image" alt="使用するテーブルの選択" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

その後は、右上隅で「公開として」をクリックするだけで、新しく作成されたデータセットを Tableau Online で通常通り使用できるようになります。

注意: Tableau Online を Tableau Desktop と組み合わせて使用し、ClickHouse データセットを共有したい場合は、デフォルトの MySQL コネクタを使用して Tableau Desktop を使用し、データソースのドロップダウンから MySQL を選択した際に表示されるセットアップガイドに従ってください。M1 Mac をお持ちの場合は、ドライバーインストールのワークアラウンドについては [このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認してください。

## Tableau Online を ClickHouse に接続する (SSL 使用の Cloud またはオンプレミスセットアップ) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau Online の MySQL 接続セットアップウィザードを通じて SSL 証明書を提供することはできないため、唯一の方法は Tableau Desktop を使用して接続をセットアップし、その後 Tableau Online にエクスポートすることです。このプロセスはそれほど複雑ではありません。

Windows または Mac マシンで Tableau Desktop を実行し、「接続」 -> 「サーバーに接続」 -> 「MySQL」を選択します。
まず、マシンに MySQL ドライバーをインストールする必要があります。これは、データソースのドロップダウンから MySQL を選択した際に表示されるセットアップガイドに従うことで行えます。M1 Mac をお持ちの場合は、ドライバーインストールのワークアラウンドについては [このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認してください。

<img src={tableau_desktop_01} class="image" alt="新しいデータソースの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

:::note
MySQL 接続セットアップ UI では、「SSL」オプションが有効になっていることを確認してください。
ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。
このルート証明書は [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。
:::

あなたの ClickHouse Cloud インスタンスの MySQL ユーザー認証情報とダウンロードしたルート証明書のパスを指定します。

<img src={tableau_desktop_02} class="image" alt="認証情報の指定" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

通常通り使用したいテーブルを選択し（Tableau Online と同様に）、
「サーバー」 -> 「データソースを公開」 -> Tableau Cloud を選択します。

<img src={tableau_desktop_03} class="image" alt="データソースを公開" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

重要: 「認証」オプションで「埋め込みパスワード」を選択する必要があります。

<img src={tableau_desktop_04} class="image" alt="データソースの公開設定 - 認証情報の埋め込み" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

さらに、「公開データソースを使用するようにワークブックを更新」を選択します。

<img src={tableau_desktop_05} class="image" alt="データソースの公開設定 - オンライン使用のためのワークブックの更新" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

最後に「公開」をクリックすると、埋め込まれた認証情報を持つデータソースが自動的に Tableau Online で開かれます。

## 既知の制限 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

既知の制限はすべて ClickHouse `23.11` で修正されました。他に互換性の問題が発生した場合は、どうぞお気軽に [お問い合わせ](https://clickhouse.com/company/contact) いただくか、[新しい問題を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。
