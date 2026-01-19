---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'ClickHouse Cloud の監査ログを Splunk に保存する'
title: 'ClickHouse Cloud の監査ログを Splunk に保存する'
doc_type: 'guide'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# ClickHouse Cloud の監査ログを Splunk に保存する \{#storing-clickhouse-cloud-audit-logs-into-splunk\}

<PartnerBadge/>

[Splunk](https://www.splunk.com/) は、データ分析およびモニタリングのためのプラットフォームです。

このアドオンを使用すると、[ClickHouse Cloud の監査ログ](/cloud/security/audit-logging) を Splunk に保存できます。監査ログのダウンロードには [ClickHouse Cloud API](/cloud/manage/api/api-overview) を利用します。

このアドオンにはモジュラー入力のみが含まれており、追加の UI は提供されません。

# インストール \{#installation\}

## Splunk Enterprise 向け \{#for-splunk-enterprise\}

[Splunkbase](https://splunkbase.splunk.com/app/7709) から ClickHouse Cloud Audit Add-on for Splunk をダウンロードします。

<Image img={splunk_001} size="lg" alt="ClickHouse Cloud Audit Add-on for Splunk のダウンロードページを表示している Splunkbase サイト" border />

Splunk Enterprise で Apps -> Manage に移動し、Install app from file をクリックします。

<Image img={splunk_002} size="lg" alt="Install app from file オプションが表示された Apps 管理ページを示す Splunk Enterprise インターフェース" border />

Splunkbase からダウンロードしたアーカイブファイルを選択し、Upload をクリックします。

<Image img={splunk_003} size="lg" alt="ClickHouse アドオンをアップロードするための Splunk アプリインストールダイアログ" border />

インストールが正常に完了すると、ClickHouse Audit logs アプリケーションが表示されます。表示されない場合は、エラーがないか splunkd のログを確認してください。

# モジュラー入力の設定 \{#modular-input-configuration\}

モジュラー入力を設定するには、まず ClickHouse Cloud デプロイメントから次の情報を取得する必要があります。

- 組織 ID
- 管理者権限を持つ [API Key](/cloud/manage/openapi)

## ClickHouse Cloud から情報を取得する \{#getting-information-from-clickhouse-cloud\}

[ClickHouse Cloud console](https://console.clickhouse.cloud/) にログインします。

Organization -> Organization details に移動します。そこで Organization ID をコピーできます。

<Image img={splunk_004} size="lg" alt="Organization ID を含む Organization details ページを表示している ClickHouse Cloud console" border />

次に、左側メニューから API Keys に移動します。

<Image img={splunk_005} size="lg" alt="左側ナビゲーションメニュー内の API Keys セクションを表示している ClickHouse Cloud console" border />

API Key を作成し、識別しやすい名前を付けて `Admin` 権限を選択します。`Generate API Key` をクリックします。

<Image img={splunk_006} size="lg" alt="Admin 権限が選択された API Key 作成画面を表示している ClickHouse Cloud console" border />

API Key と secret を安全な場所に保存します。

<Image img={splunk_007} size="lg" alt="保存するために生成された API Key と secret を表示している ClickHouse Cloud console" border />

## Splunk でデータ入力を構成する \{#configure-data-input-in-splunk\}

Splunk に戻り、Settings -> Data inputs に移動します。

<Image img={splunk_008} size="lg" alt="Settings メニューで Data inputs オプションが表示されている Splunk インターフェイス" border />

ClickHouse Cloud Audit Logs のデータ入力を選択します。

<Image img={splunk_009} size="lg" alt="ClickHouse Cloud Audit Logs オプションが表示されている Splunk の Data inputs ページ" border />

「New」をクリックして、新しいデータ入力インスタンスを構成します。

<Image img={splunk_010} size="lg" alt="新しい ClickHouse Cloud Audit Logs データ入力を構成するための Splunk インターフェイス" border />

すべての情報を入力したら、「Next」をクリックします。

<Image img={splunk_011} size="lg" alt="ClickHouse データ入力設定が入力済みの Splunk 構成ページ" border />

データ入力の構成が完了したので、監査ログの参照を開始できます。

# 使用方法 \{#usage\}

モジュラー入力はデータを Splunk に保存します。データを確認するには、Splunk の通常の検索ビューを使用できます。

<Image img={splunk_012} size="lg" alt="ClickHouse の監査ログデータを表示している Splunk の検索インターフェース" border />