---
sidebar_label: 設定の構成
slug: /manage/settings
---

# 設定の構成

特定の [ユーザー](/operations/access-rights#user-account-management) または [ロール](/operations/access-rights#role-management) に対して、ClickHouse Cloud サービスの設定を指定するには、[SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management)を使用する必要があります。設定プロファイルを適用することで、サービスが停止、アイドル状態、またはアップグレードしても、構成した設定が持続します。設定プロファイルの詳細については、[こちらのページ](/operations/settings/settings-profiles.md)を参照してください。

現在、XMLベースの設定プロファイルや [構成ファイル](/operations/configuration-files.md) は ClickHouse Cloud でサポートされていないことに注意してください。

ClickHouse Cloud サービスに対して指定できる設定の詳細については、[私たちのドキュメント](/operations/settings)でカテゴリごとにすべての可能な設定を確認してください。

<img src={require('./images/cloud-settings-sidebar.png').default} class="image" style={{width: 300, float: "left"}} />
