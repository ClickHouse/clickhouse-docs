---
sidebar_label: '設定の管理'
slug: /manage/settings
title: '設定の管理'
description: '特定のユーザーまたはロール向けに ClickHouse Cloud サービスの設定を管理する方法'
keywords: ['ClickHouse Cloud', '設定の管理', 'クラウド設定', 'ユーザー設定', 'ロール設定']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 設定の管理

特定の[ユーザー](/operations/access-rights#user-account-management)または[ロール](/operations/access-rights#role-management)に対して ClickHouse Cloud サービスの設定を指定するには、[SQL による Settings Profile](/operations/access-rights#settings-profiles-management) を使用する必要があります。Settings Profile を適用すると、サービスが停止・アイドル状態・アップグレードされた場合でも、構成した設定が保持されます。Settings Profile の詳細については、[こちらのページ](/operations/settings/settings-profiles.md)を参照してください。

XML ベースの Settings Profile および[設定ファイル](/operations/configuration-files.md)は、現在のところ ClickHouse Cloud ではサポートされていない点に注意してください。

ClickHouse Cloud サービスに対して指定可能な設定の詳細については、カテゴリ別に整理されたすべての設定を[ドキュメント](/operations/settings)で参照してください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>