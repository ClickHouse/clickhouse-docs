---
sidebar_label: '設定の構成'
slug: /manage/settings
title: '設定の構成'
description: '特定のユーザーまたはロール向けに ClickHouse Cloud サービスの設定を行う方法'
keywords: ['ClickHouse Cloud', '設定の構成', 'クラウド設定', 'ユーザー設定', 'ロール設定']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';

# 設定の構成方法 \\{#configuring-settings\\}

特定の[ユーザー](/operations/access-rights#user-account-management)または[ロール](/operations/access-rights#role-management)向けに ClickHouse Cloud サービスの設定を指定するには、[SQL ベースの Settings Profile](/operations/access-rights#settings-profiles-management)を使用する必要があります。Settings Profile を適用することで、サービスが停止したりアイドル状態になったりアップグレードされた場合でも、構成した設定が保持されます。Settings Profile の詳細については[こちらのページ](/operations/settings/settings-profiles.md)を参照してください。

なお、XML ベースの Settings Profile や[設定ファイル](/operations/configuration-files.md)は、現時点では ClickHouse Cloud ではサポートされていません。

ClickHouse Cloud サービスに対して指定できる設定の詳細については、[ドキュメント](/operations/settings)内のカテゴリ別の全設定一覧を参照してください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud 設定サイドバー" border />