---
description: '設定の概要ページ。'
sidebar_position: 1
slug: /operations/settings/overview
title: '設定の概要'
---


# 設定の概要

## 概要 {#overview}

:::note
XMLベースの設定プロファイルおよび [設定ファイル](/operations/configuration-files) は、現在 ClickHouse Cloud ではサポートされていません。ClickHouse Cloud サービスの設定を指定するには、[SQL駆動設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。
:::

ClickHouse 設定には主に2つのグループがあります：

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定が ClickHouse サーバー全体に適用されるのに対し、セッション設定はユーザーセッションや個々のクエリに適用される点です。

## 非デフォルト設定の確認 {#see-non-default-settings}

デフォルト値から変更された設定を確認するには、`system.settings` テーブルをクエリします：

```sql
SELECT name, value FROM system.settings WHERE changed
```

デフォルト値から変更された設定がない場合、ClickHouse は何も返しません。

特定の設定の値を確認するには、クエリ内で設定の `name` を指定できます：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

これにより、以下のような結果が返されます：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 行がセットにあります。経過時間: 0.002 秒。
```

## さらなる情報 {#further-reading}

- [グローバルサーバー設定](/operations/server-configuration-parameters/settings.md) を参照して、ClickHouse サーバーのグローバル設定レベルでの構成方法について学びましょう。
- [セッション設定](/operations/settings/settings-query-level.md) を参照して、ClickHouse サーバーのセッションレベルでの構成方法について学びましょう。
