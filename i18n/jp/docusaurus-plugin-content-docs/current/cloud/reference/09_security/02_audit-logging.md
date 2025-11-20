---
sidebar_label: 'コンソール監査ログイベント'
slug: /cloud/security/audit-logging
title: 'コンソール監査ログイベント'
description: 'このページでは、コンソール監査ログに記録されるイベントについて説明します。'
doc_type: 'reference'
keywords: ['audit logging', 'security', 'compliance', 'logs', 'monitoring']
---



## コンソール監査ログイベント {#console-audit-log-events}

組織に対して記録されるイベントは、**Organization**、**Service**、**User** の3つのカテゴリに分類されています。監査ログの詳細、エクスポート方法、またはAPI統合の追加方法については、上記のガイドセクションにある[コンソール監査ログ](/cloud/security/audit-logging/console-audit-log)のドキュメントを参照してください。

以下のイベントが監査ログに記録されます。

### Organization {#organization}

- 組織が作成されました
- 組織が削除されました
- 組織名が変更されました

### Service {#service}

- サービスが作成されました
- サービスが削除されました
- サービスが停止されました
- サービスが開始されました
- サービス名が変更されました
- サービスIPアクセスリストが変更されました
- サービスパスワードがリセットされました

### User {#user}

- ユーザーロールが変更されました
- ユーザーが組織から削除されました
- ユーザーが組織に招待されました
- ユーザーが組織に参加しました
- ユーザー招待が削除されました
- ユーザーが組織から退出しました
