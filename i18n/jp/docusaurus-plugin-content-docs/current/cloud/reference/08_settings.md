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

特定の[ユーザー](/operations/access-rights#user-account-management)または[ロール](/operations/access-rights#role-management)ごとに ClickHouse Cloud サービスの設定を行うには、[SQL-driven Settings Profiles](/operations/access-rights#settings-profiles-management) を使用する必要があります。Settings Profiles を適用すると、サービスが停止・アイドル状態・アップグレードされた場合でも、構成した設定が保持されます。Settings Profiles の詳細については、[こちら](/operations/settings/settings-profiles.md)を参照してください。

なお、XML ベースの Settings Profiles および[設定ファイル](/operations/configuration-files.md)は、現在 ClickHouse Cloud ではサポートされていません。

ClickHouse Cloud サービスに対して指定可能な設定の詳細については、[ドキュメント](/operations/settings)でカテゴリ別に一覧をご確認ください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>