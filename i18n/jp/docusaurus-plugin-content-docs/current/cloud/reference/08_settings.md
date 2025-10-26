---
'sidebar_label': '設定を構成する'
'slug': '/manage/settings'
'title': '設定を構成する'
'description': '特定のユーザーまたは役割のために、ClickHouse Cloud サービスの設定を構成する方法'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 設定の構成

特定の [ユーザー](/operations/access-rights#user-account-management) または [ロール](/operations/access-rights#role-management) のために、ClickHouse Cloud サービスの設定を指定するには、[SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。設定プロファイルを適用することで、サービスが停止、アイドル状態、またはアップグレードされているときにも、構成した設定が持続されることが保証されます。設定プロファイルについて詳しく知りたい場合は、[こちらのページ](/operations/settings/settings-profiles.md)をご覧ください。

XMLベースの設定プロファイルおよび [構成ファイル](/operations/configuration-files.md) は、現在 ClickHouse Cloud ではサポートされていないことに注意してください。

ClickHouse Cloud サービスに指定できる設定について詳しく知りたい場合は、[当社のドキュメント](/operations/settings)でカテゴリ別に可能なすべての設定をご覧ください。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
