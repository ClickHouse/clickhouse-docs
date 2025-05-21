---
sidebar_label: '設定の構成'
slug: /manage/settings
title: '設定の構成'
description: '特定のユーザーまたはロールのためにClickHouse Cloudサービスの設定を構成する方法'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 設定の構成

特定の [ユーザー](/operations/access-rights#user-account-management) または [ロール](/operations/access-rights#role-management) のためにあなたの ClickHouse Cloud サービスの設定を指定するには、 [SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。設定プロファイルを適用することで、サービスが停止、アイドル、アップグレードしたときでも、構成した設定が保持されることが保証されます。設定プロファイルについての詳細は、[こちらのページ](/operations/settings/settings-profiles.md)をご覧ください。

現在、XMLベースの設定プロファイルおよび [設定ファイル](/operations/configuration-files.md) は ClickHouse Cloud でサポートされていないことに注意してください。

あなたの ClickHouse Cloud サービスのために指定できる設定についての詳細は、[我々のドキュメント](/operations/settings)でカテゴリー別にすべての可能な設定を確認してください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
