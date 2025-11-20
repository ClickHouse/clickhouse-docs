---
sidebar_label: 'コンソール監査ログイベント'
slug: /cloud/security/audit-logging
title: 'コンソール監査ログイベント'
description: 'このページでは、コンソール監査ログに記録されるイベントについて説明します。'
doc_type: 'reference'
keywords: ['監査ログ', 'セキュリティ', 'コンプライアンス', 'ログ', 'モニタリング']
---



## コンソール監査ログイベント {#console-audit-log-events}

組織に対して記録されるイベントは、**Organization**、**Service**、**User** の3つのカテゴリに分類されています。監査ログの詳細、およびエクスポート方法やAPI統合の追加方法については、上記のガイドセクションにある[コンソール監査ログ](/cloud/security/audit-logging/console-audit-log)のドキュメントを参照してください。

以下のイベントが監査ログに記録されます。

### Organization {#organization}

- 組織の作成
- 組織の削除
- 組織名の変更

### Service {#service}

- サービスの作成
- サービスの削除
- サービスの停止
- サービスの開始
- サービス名の変更
- サービスIPアクセスリストの変更
- サービスパスワードのリセット

### User {#user}

- ユーザーロールの変更
- 組織からのユーザーの削除
- 組織へのユーザーの招待
- ユーザーの組織への参加
- ユーザー招待の削除
- ユーザーの組織からの退出
