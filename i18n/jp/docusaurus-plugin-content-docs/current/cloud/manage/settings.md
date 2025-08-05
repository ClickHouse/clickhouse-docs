---
sidebar_label: '設定の構成'
slug: '/manage/settings'
title: '設定の構成'
description: '特定のユーザーまたはロールのためにClickHouse Cloudサービスの設定を構成する方法'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 設定の構成

特定の [ユーザー](/operations/access-rights#user-account-management) または [ロール](/operations/access-rights#role-management) のために ClickHouse Cloud サービスの設定を指定するには、[SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。 設定プロファイルを適用することで、サービスが停止したりアイドル状態になったり、アップグレードされたりしても、構成した設定が持続することが保証されます。 設定プロファイルについて詳しく知りたい方は、[こちらのページ](/operations/settings/settings-profiles.md)をご覧ください。

XMLベースの設定プロファイルと [構成ファイル](/operations/configuration-files.md) は、現在 ClickHouse Cloud ではサポートされていないことに注意してください。

ClickHouse Cloud サービスのために指定できる設定について詳しく知りたい方は、[当社のドキュメント](/operations/settings)でカテゴリごとに可能な設定をすべて確認してください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
