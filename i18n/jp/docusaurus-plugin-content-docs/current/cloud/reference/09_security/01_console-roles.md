---
sidebar_label: 'コンソールのロールと権限'
slug: /cloud/security/console-roles
title: 'コンソールのロールと権限'
description: 'このページでは、ClickHouse Cloud コンソールで利用できる標準的なロールと、それぞれに対応する権限について説明します'
doc_type: 'reference'
keywords: ['コンソールのロール', '権限', 'アクセス制御', 'セキュリティ', 'RBAC']
---

## 組織ロール \{#organization-roles\}

組織ロールを割り当てる手順については、[Manage cloud users](/cloud/security/manage-cloud-users) を参照してください。

ClickHouse には、ユーザー管理用として 4 つの組織レベルのロールが用意されています。デフォルトでサービスへのアクセス権を持つのは admin ロールのみです。その他のロールは、サービスを操作するためにサービスレベルのロールと組み合わせる必要があります。

| Role      | Description                                                                                                                                                                                                                 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin          | 組織のすべての管理作業を実行し、すべての設定を制御します。このロールはデフォルトで組織内の最初のユーザーに割り当てられ、すべてのサービスで自動的に Service Admin 権限を持ちます。 |
| Billing        | 使用状況と請求書を表示し、支払い方法を管理します。                                         |
| Org API reader | 組織レベルの設定とユーザーを管理するための API 権限を持ち、サービスへのアクセス権はありません。 |
| Member         | サインインのみ可能で、個人のプロフィール設定を管理できます。SAML SSO ユーザーにはデフォルトで割り当てられます。 |

## サービスロール \{#service-roles\}

サービスロールを割り当てる手順については、[Manage cloud users](/cloud/security/manage-cloud-users) を参照してください。

サービス権限は、admin ロール以外のロールを持つユーザーには、管理者が明示的に付与する必要があります。Service admin ロールには SQL コンソールの管理アクセス権が事前に設定されていますが、権限を減らしたり削除したりするように変更できます。

| Role                     | Description                                                  |
|--------------------------|--------------------------------------------------------------|
| Service reader           | サービスと設定を表示できます。                                  |
| Service admin            | サービス設定を管理できます。                                     |
| Service API reader       | すべてのサービスのサービス設定を読み取るための API 権限。   |
| Service API admin        | すべてのサービスのサービス設定を管理するための API 権限。 |
| Basic service API reader | クエリ API エンドポイントを使用するための API 権限。                  |

## SQL コンソールのロール \{#sql-console-roles\}

SQL コンソールのロールを割り当てる手順については、[SQL コンソールロールの管理](/cloud/guides/sql-console/manage-sql-console-role-assignments)を参照してください。

| ロール                | 説明                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------|
| SQL console read only | サービス内のデータベースへの読み取り専用アクセス。                                              |
| SQL console admin     | Default データベース ロールと同等の、サービス内のデータベースに対する管理アクセス。            |

## コンソール権限 \{#console-permissions\}

以下の表は、ClickHouse コンソールおよび SQL コンソールの権限を示しています。詳細は、各カテゴリのヘッダーにあるリンクを参照してください。

| Permission                                                                                           | Description                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Organization** ([詳細情報](/cloud/security/manage-cloud-users))                                        | 組織レベルの権限                                                                                       |
| control-plane:organization:view                                                                      | 組織の詳細と読み取り専用メタデータを表示します。                                                                       |
| control-plane:organization:manage                                                                    | 組織の設定とユーザーを管理します。                                                                              |
| **Billing** ([詳細情報](/cloud/manage/billing))                                                          | 請求と請求書の管理                                                                                      |
| control-plane:organization:manage-billing                                                            | 請求設定、支払い方法、請求書を管理します。                                                                          |
| control-plane:organization:view-billing                                                              | 請求の利用状況と請求書を表示します。                                                                             |
| **API keys** ([詳細情報](/cloud/manage/cloud-api))                                                       | 組織の API キー管理                                                                                   |
| control-plane:organization:view-api-keys                                                             | 組織の API キーを表示します。                                                                              |
| control-plane:organization:create-api-keys                                                           | 組織の新しい API キーを作成します。                                                                           |
| control-plane:organization:update-api-keys                                                           | 既存の API キーとその権限を更新します。                                                                         |
| control-plane:organization:delete-api-keys                                                           | API キーを失効または削除します。                                                                             |
| **Support** ([詳細情報](/cloud/support))                                                                 | サポートケースの管理                                                                                     |
| control-plane:support:manage                                                                         | サポートケースを作成・管理し、ClickHouse サポートとのやり取りを行います。                                                     |
| **Service (general)**                                                                                | 一般的なサービスレベルの権限                                                                                 |
| control-plane:service:view                                                                           | サービスレベルのメタデータ、設定、ステータスを表示します。                                                                  |
| control-plane:service:manage                                                                         | サービス構成とライフサイクル操作を管理します。                                                                        |
| **Backups** ([詳細情報](/cloud/features/backups))                                                        | サービスのバックアップと復元ポイント                                                                             |
| control-plane:service:view-backups                                                                   | サービスのバックアップと復元ポイントを表示します。                                                                      |
| control-plane:service:manage-backups                                                                 | サービスのバックアップを作成、管理、復元します。                                                                       |
| **IP access list** ([詳細情報](/cloud/security/setting-ip-filters))                                      | IP アクセスリストとネットワークフィルタリングの管理                                                                    |
| control-plane:service:manage-ip-access-list                                                          | サービスの IP アクセスリストとネットワークフィルタリングを管理します。                                                          |
| **Generative AI** ([詳細情報](/cloud/features/ai-ml/ask-ai))                                             | 生成 AI 機能の設定                                                                                    |
| control-plane:service:manage-generative-ai                                                           | サービスの生成 AI 機能と設定を構成・管理します。                                                                     |
| **Query API endpoints** ([詳細情報](/cloud/get-started/query-endpoints))                                 | Query API エンドポイント                                                                              |
| control-plane:service:view-query-api-endpoints                                                       | Query API エンドポイントとその構成を表示します。                                                                  |
| control-plane:service:manage-query-api-endpoints                                                     | Query API エンドポイントを作成・管理します。                                                                    |
| **Private endpoints** ([詳細情報](/cloud/security/connectivity/private-networking))                      | プライベートネットワークとエンドポイント                                                                           |
| control-plane:service:view-private-endpoints                                                         | サービスのプライベートエンドポイント構成を表示します。                                                                    |
| control-plane:service:manage-private-endpoints                                                       | プライベートエンドポイントとプライベートネットワークを作成・管理します。                                                           |
| **ClickPipes** ([詳細情報](/integrations/clickpipes))                                                    | ClickPipes 統合                                                                                  |
| control-plane:service:manage-clickpipes                                                              | ClickPipes 統合と関連設定を管理します。                                                                      |
| **Scaling** ([詳細情報](/manage/scaling))                                                                | スケーリングとオートスケーリングの構成                                                                            |
| control-plane:service:view-scaling-config                                                            | サービスのスケーリング構成とオートスケーリング設定を表示します。                                                               |
| control-plane:service:manage-scaling-config                                                          | スケーリング構成を変更し、スケーリング操作を実行します。                                                                   |
| **ClickStack** ([詳細情報](/use-cases/observability/clickstack/overview))                                | ClickStack オブザーバビリティ統合                                                                         |
| control-plane:service:manage-clickstack-api                                                          | ClickStack API へのアクセスと関連統合を管理します。                                                              |
| **SQL console role mapping** ([詳細情報](/cloud/guides/sql-console/manage-sql-console-role-assignments)) | SQL コンソールのロール割り当ての管理                                                                           |
| sql-console:database:access                                                                          | SQL コンソール経由でデータベースにパスワードレスでアクセスします (sql-console-admin または sql-console-readonly と組み合わせてのみ使用可能)  |