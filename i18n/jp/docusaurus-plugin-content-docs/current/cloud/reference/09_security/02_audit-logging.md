---
sidebar_label: 'コンソールの監査ログイベント'
slug: /cloud/security/audit-logging
title: 'コンソールの監査ログイベント'
description: 'このページでは、コンソールの監査ログに記録されるイベントについて説明します。'
doc_type: 'reference'
keywords: ['監査ログ', 'セキュリティ', 'コンプライアンス', 'ログ', '監視']
---



## コンソール監査ログイベント {#console-audit-log-events}

組織で記録されるイベントは、**Organization**、**Service**、**User** の 3 つのカテゴリに分類されます。監査ログの概要やエクスポート方法、API 連携の追加方法については、上記の Guides セクションにある [console audit log](/cloud/security/audit-logging/console-audit-log) ドキュメントを参照してください。

以下のイベントが監査ログに記録されます。

### Organization {#organization}

- Organization の作成
- Organization の削除
- Organization 名の変更

### Service {#service}

- Service の作成
- Service の削除
- Service の停止
- Service の開始
- Service 名の変更
- Service の IP アクセスリストの変更
- Service パスワードのリセット

### User {#user}

- User のロール変更
- Organization からの User の削除
- Organization への User の招待
- Organization への User の参加
- User 招待の削除
- Organization からの User の離脱
