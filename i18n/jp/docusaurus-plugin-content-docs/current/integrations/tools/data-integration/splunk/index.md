---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'ClickHouse Cloud の監査ログを Splunk に保存します。'
title: 'ClickHouse Cloud 監査ログを Splunk に保存する'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse Cloud 監査ログを Splunk に保存する

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) は、データ分析および監視プラットフォームです。

このアドオンにより、ユーザーは[ClickHouse Cloud の監査ログ](/cloud/security/audit-logging)を Splunk に保存できます。これは[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して監査ログをダウンロードします。

このアドオンにはモジュラー入力のみが含まれており、追加の UI は提供されていません。


# インストール

## Splunk Enterprise 用 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709) から ClickHouse Cloud 監査アドオンをダウンロードします。

<Image img={splunk_001} size="lg" alt="クリックハウスクラウド監査アドオンのダウンロードページを表示するSplunkbaseのウェブサイト" border />

Splunk Enterprise で、アプリ -> 管理に移動します。次に、「ファイルからアプリをインストール」をクリックします。

<Image img={splunk_002} size="lg" alt="ファイルからアプリをインストールオプションを持つApps管理ページを表示するSplunk Enterpriseインターフェース" border />

Splunkbaseからダウンロードしたアーカイブファイルを選択し、アップロードをクリックします。

<Image img={splunk_003} size="lg" alt="ClickHouseアドオンをアップロードするためのSplunkアプリインストールダイアログ" border />

すべてが正常に進めば、ClickHouse 監査ログアプリケーションがインストールされているはずです。そうでない場合は、Splunkd ログでエラーを確認してください。


# モジュラー入力の設定

モジュラー入力を設定するには、最初に ClickHouse Cloud のデプロイメントから情報を取得する必要があります：

- 組織 ID
- 管理者 [API キー](/cloud/manage/openapi)

## ClickHouse Cloud から情報を取得する {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloud コンソール](https://console.clickhouse.cloud/) にログインします。

組織 -> 組織の詳細に移動します。そこから組織 ID をコピーできます。

<Image img={splunk_004} size="lg" alt="組織IDを表示する組織の詳細ページを示すClickHouse Cloudコンソール" border />

次に、左側のメニューから API キーに移動します。

<Image img={splunk_005} size="lg" alt="左側のナビゲーションメニューにおけるAPIキーセクションを表示するClickHouse Cloudコンソール" border />

API キーを作成し、意味のある名前を付けて `Admin` 権限を選択します。「API キーを生成」をクリックします。

<Image img={splunk_006} size="lg" alt="管理者権限が選択されたAPIキー作成インターフェースを表示するClickHouse Cloudコンソール" border />

API キーとシークレットを安全な場所に保存します。

<Image img={splunk_007} size="lg" alt="生成されたAPIキーとシークレットを保存するためのClickHouse Cloudコンソール" border />

## Splunk でデータ入力を設定する {#configure-data-input-in-splunk}

Splunk に戻り、設定 -> データ入力に移動します。

<Image img={splunk_008} size="lg" alt="データ入力オプションを持つ設定メニューを表示するSplunkインターフェース" border />

ClickHouse Cloud 監査ログデータ入力を選択します。

<Image img={splunk_009} size="lg" alt="ClickHouse Cloud 監査ログオプションを表示するSplunkデータ入力ページ" border />

「新規」をクリックして、データ入力の新しいインスタンスを構成します。

<Image img={splunk_010} size="lg" alt="新しいClickHouse Cloud 監査ログデータ入力を設定するためのSplunkインターフェース" border />

すべての情報を入力したら、次へをクリックします。

<Image img={splunk_011} size="lg" alt="完了したClickHouseデータ入力設定を表示するSplunk設定ページ" border />

入力が設定されました。監査ログをブラウジングできるようになります。


# 使用法

モジュラー入力はデータを Splunk に保存します。データを表示するには、Splunk の一般的な検索ビューを使用できます。

<Image img={splunk_012} size="lg" alt="ClickHouse監査ログデータを表示するSplunk検索インターフェース" border />
