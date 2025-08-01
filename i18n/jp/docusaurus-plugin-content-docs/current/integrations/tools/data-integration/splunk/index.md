---
sidebar_label: 'Splunk'
slug: '/integrations/audit-splunk'
keywords:
- 'clickhouse'
- 'Splunk'
- 'audit'
- 'cloud'
description: 'ClickHouse Cloudの監査ログをSplunkに保存します。'
title: 'ClickHouse Cloudの監査ログをSplunkに保存する'
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


# ClickHouse Cloud の監査ログを Splunk に保存する

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) は、データ分析およびモニタリングプラットフォームです。

このアドオンを使用すると、ユーザーは [ClickHouse Cloud 監査ログ](/cloud/security/audit-logging) を Splunk に保存できます。これは、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して監査ログをダウンロードします。

このアドオンには、モジュラー入力のみが含まれ、追加の UI は提供されていません。


# インストール

## Splunk Enterprise 向け {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709) から ClickHouse Cloud 監査アドオンをダウンロードします。

<Image img={splunk_001} size="lg" alt="Splunkbase の ClickHouse Cloud 監査アドオンのダウンロードページを表示するウェブサイト" border />

Splunk Enterprise の場合、Apps -> Manage に移動します。次に、「ファイルからアプリをインストール」をクリックします。

<Image img={splunk_002} size="lg" alt="アプリ管理ページに「ファイルからアプリをインストール」オプションを表示する Splunk Enterprise インターフェース" border />

Splunkbase からダウンロードしたアーカイブファイルを選択し、「アップロード」をクリックします。

<Image img={splunk_003} size="lg" alt="ClickHouse アドオンをアップロードするための Splunk アプリインストールダイアログ" border />

すべてが問題なく進めば、ClickHouse 監査ログアプリケーションがインストールされているはずです。そうでない場合は、Splunkd ログを確認してエラーを探してください。


# モジュラー入力の構成

モジュラー入力を構成するには、まず ClickHouse Cloud デプロイメントから情報を取得する必要があります。

- 組織 ID
- 管理者 [API Key](/cloud/manage/openapi)

## ClickHouse Cloud からの情報取得 {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloud コンソール](https://console.clickhouse.cloud/) にログインします。

組織 -> 組織の詳細に移動します。そこで、組織 ID をコピーできます。

<Image img={splunk_004} size="lg" alt="組織 ID を表示する ClickHouse Cloud コンソールの組織詳細ページ" border />

次に、左側のメニューから API キーに移動します。

<Image img={splunk_005} size="lg" alt="左側のナビゲーションメニューに API キーセクションを表示する ClickHouse Cloud コンソール" border />

API キーを作成し、意味のある名前を付けて `Admin` 権限を選択します。「API キーを生成」をクリックします。

<Image img={splunk_006} size="lg" alt="Admin 権限を選択した API キー作成インターフェースを表示する ClickHouse Cloud コンソール" border />

API キーとシークレットを安全な場所に保存します。

<Image img={splunk_007} size="lg" alt="生成された API キーとシークレットを保存することを表示する ClickHouse Cloud コンソール" border />

## Splunk でのデータ入力の構成 {#configure-data-input-in-splunk}

再度 Splunk に戻り、設定 -> データ入力に移動します。

<Image img={splunk_008} size="lg" alt="データ入力オプションを持つ設定メニューを表示する Splunk インターフェース" border />

ClickHouse Cloud 監査ログデータ入力を選択します。

<Image img={splunk_009} size="lg" alt="ClickHouse Cloud 監査ログオプションを表示する Splunk データ入力ページ" border />

「新規」をクリックしてデータ入力の新しいインスタンスを構成します。

<Image img={splunk_010} size="lg" alt="新しい ClickHouse Cloud 監査ログデータ入力を構成するための Splunk インターフェース" border />

すべての情報を入力したら、「次へ」をクリックします。

<Image img={splunk_011} size="lg" alt="完成した ClickHouse データ入力設定を持つ Splunk 構成ページ" border />

入力が構成されましたので、監査ログの閲覧を開始できます。


# 使用法

モジュラー入力はデータを Splunk に保存します。データを表示するには、Splunk の一般的な検索ビューを使用できます。

<Image img={splunk_012} size="lg" alt="ClickHouse 監査ログデータを表示する Splunk 検索インターフェース" border />
