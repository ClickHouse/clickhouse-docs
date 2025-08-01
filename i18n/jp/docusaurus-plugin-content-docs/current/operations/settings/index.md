---
description: '設定の目次ページ'
sidebar_position: 1
slug: '/operations/settings/'
title: '設定'
---



<!-- このページの目次は、以下の YAML フロントマター フィールド: slug, description, title から 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
によって自動的に生成されます。

エラーを見つけた場合は、ページ自体の YML フロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Composable Protocols](/operations/settings/composable-protocols) | Composable protocolsは、ClickHouseサーバーへのTCPアクセスのより柔軟な構成を可能にします。 |
| [Settings Profiles](/operations/settings/settings-profiles) | 同じ名前でグループ化された設定のコレクションです。 |
| [Session Settings](/operations/settings/settings) | ``system.settings`` テーブルにある設定です。 |
| [Settings Overview](/operations/settings/overview) | 設定の概要ページです。 |
| [Users and Roles Settings](/operations/settings/settings-users) | ユーザーとロールを構成するための設定です。 |
| [Query-level Session Settings](/operations/settings/query-level) | クエリレベルでの設定です。 |
| [Server overload](/operations/settings/server-overload) | サーバーCPUの過負荷時の制御動作です。 |
| [Format Settings](/operations/settings/formats) | 入力および出力形式を制御する設定です。 |
| [Restrictions on Query Complexity](/operations/settings/query-complexity) | クエリの複雑さを制限する設定です。 |
| [MergeTree tables settings](/operations/settings/merge-tree-settings) | `system.merge_tree_settings` にあるMergeTreeの設定です。 |
| [Constraints on Settings](/operations/settings/constraints-on-settings) | 設定に対する制約は、`user.xml` 構成ファイルの `profiles` セクションで定義でき、一部の設定を `SET` クエリで変更することをユーザーに禁止します。 |
| [Memory overcommit](/operations/settings/memory-overcommit) | クエリに対してより柔軟なメモリ制限を設定できるようにすることを目的とした実験的な技術です。 |
| [Permissions for Queries](/operations/settings/permissions-for-queries) | クエリ許可のための設定です。 |
