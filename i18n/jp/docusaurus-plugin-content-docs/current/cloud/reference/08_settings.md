---
sidebar_label: '設定の構成'
slug: /manage/settings
title: '設定の構成'
description: '特定のユーザーまたはロール向けに ClickHouse Cloud サービスの設定を行う方法'
keywords: ['ClickHouse Cloud', 'settings configuration', 'cloud settings', 'user settings', 'role settings']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 設定の構成

特定の[ユーザー](/operations/access-rights#user-account-management)または[ロール](/operations/access-rights#role-management)に対して ClickHouse Cloud サービスの設定を指定するには、[SQL ベースの Settings Profiles](/operations/access-rights#settings-profiles-management) を使用する必要があります。Settings Profiles を適用すると、サービスが停止、アイドル状態、アップグレードされた場合でも、設定した内容が保持されます。Settings Profiles の詳細については、[このページ](/operations/settings/settings-profiles.md)を参照してください。

XML ベースの Settings Profiles や[設定ファイル](/operations/configuration-files.md)は、現時点では ClickHouse Cloud ではサポートされていないことに注意してください。

ClickHouse Cloud サービスで指定可能な設定についてさらに知りたい場合は、[ドキュメント](/operations/settings)でカテゴリ別に一覧化されたすべての設定を参照してください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>