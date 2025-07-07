---
'description': 'Overview page for settings.'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': 'Settings Overview'
---




# 設定の概要

## 概要 {#overview}

:::note
XMLベースの設定プロファイルおよび [構成ファイル](/operations/configuration-files) は現在 
ClickHouse Cloud ではサポートされていません。ClickHouse Cloud サービスの設定を指定するには、 
[SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。
:::

ClickHouse の設定には主に二つのグループがあります：

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定は ClickHouse サーバー全体に適用されるのに対し、 
セッション設定はユーザーセッションや個々のクエリに適用されることです。

## 非デフォルト設定の表示 {#see-non-default-settings}

デフォルト値から変更された設定を表示するには、 `system.settings` テーブルにクエリを実行します：

```sql
SELECT name, value FROM system.settings WHERE changed
```

変更された設定がデフォルト値から無い場合、ClickHouse は何も返しません。

特定の設定の値を確認するには、クエリにその設定の `name` を指定します：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

これにより、以下のような結果が返されます：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## 詳細情報 {#further-reading}

- [グローバルサーバー設定](/operations/server-configuration-parameters/settings.md) を参照して、 
  ClickHouse サーバーをグローバルサーバーレベルで構成する方法を学びます。
- [セッション設定](/operations/settings/settings-query-level.md) を参照して、 
  ClickHouse サーバーをセッションレベルで構成する方法を学びます。
