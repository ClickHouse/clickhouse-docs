---
slug: /use-cases/observability/clickstack/rbac
title: 'ロールベースアクセス制御 (RBAC)'
sidebar_label: 'ロールベースアクセス制御'
toc_max_heading_level: 2
pagination_prev: null
pagination_next: null
description: 'ダッシュボード、保存済み検索、ソース、アラートなどに対するチームの権限を管理するため、ClickStack でロールベースアクセス制御を設定します。'
doc_type: 'guide'
keywords: ['clickstack', 'rbac', 'roles', 'permissions', 'access control', 'security']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import rbac_section from '@site/static/images/clickstack/rbac/rbac-section.png';
import add_role_modal from '@site/static/images/clickstack/rbac/add-role-modal.png';
import dashboard_fine_grained_example from '@site/static/images/clickstack/rbac/dashboard-fine-grained-example.png';
import security_policies from '@site/static/images/clickstack/rbac/security-policies.png';
import team_members from '@site/static/images/clickstack/rbac/team-members.png';
import edit_team_member from '@site/static/images/clickstack/rbac/edit-team-member.png';
import default_vs_fine_grained from '@site/static/images/clickstack/rbac/default-vs-fine-grained.png';
import condition_tip from '@site/static/images/clickstack/rbac/condition-tip.png';
import access_rules_tip from '@site/static/images/clickstack/rbac/access-rules-tip.png';
import dashboard_id_and_tag_example from '@site/static/images/clickstack/rbac/dashboard-id-and-tag-example.png';
import team_page_cloud from '@site/static/images/clickstack/rbac/team-page-cloud.png';
import team_page_clickstack from '@site/static/images/clickstack/rbac/team-page-clickstack.png';

ClickStack にはロールベースのアクセス制御 (RBAC) が含まれており、[ダッシュボード](/use-cases/observability/clickstack/dashboards)、[保存済み検索](/use-cases/observability/clickstack/search)、ソース、[アラート](/use-cases/observability/clickstack/alerts)、Webhook、ノートブックに対して、きめ細かな権限を持つカスタムロールを定義できます。権限は 2 つのレベルで機能します。1 つはリソースレベルのアクセス (リソース種別ごとのアクセスなし、読み取り、管理) で、もう 1 つは、名前、タグ、または ID に基づいて個々のリソースへのアクセスを制限する任意の詳細ルールです。ClickStack には 3 つの組み込みロールが用意されており、チームのニーズに合わせてカスタムロールを作成できます。

:::note Managed ClickStack のみ
RBAC は Managed ClickStack のデプロイメントでのみ利用できます。
:::

## ユーザーアクセスの前提条件 \{#user-access-prerequisites\}

ClickStack の認証は ClickHouse Cloud 経由で行われます。ClickStack のロールを割り当てるには、各ユーザーが事前に次の条件を満たしている必要があります。

1. **ClickHouse Cloud 組織に招待されていること。** ユーザーの招待は組織管理者が Cloud コンソールから行います。詳細は [クラウドユーザーの管理](/cloud/security/manage-cloud-users) を参照してください。
2. **サービスで SQL Console にアクセスできること。** サービスの **Settings** → **SQL Console Access** に移動し、適切な権限レベルを設定します。

| Cloud SQL Console access              | ClickStack access                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| **SQL Console Admin** (Full Access)   | ClickStack へのフルアクセス。[alerts](/use-cases/observability/clickstack/alerts) を有効にする場合に必要です。 |
| **SQL Console Read Only** (Read Only) | オブザーバビリティデータを表示し、ダッシュボードを作成できます。                                                        |
| **No access**                         | ClickStack にアクセスできません。                                                                  |

ユーザーに Cloud へのアクセス権が付与されると、ClickStack の **Team Settings** ページに表示され、そこで ClickStack のロールを割り当てられるようになります。

<Tabs>
  <TabItem value="cloud" label="Cloud ユーザーとロール" default>
    <Image img={team_page_cloud} alt="ClickHouse Cloud のユーザーとロールのページ" size="lg" />
  </TabItem>

  <TabItem value="clickstack" label="ClickStack Team Settings">
    <Image img={team_page_clickstack} alt="チームメンバーとそのロールが表示された ClickStack Team Settings ページ" size="lg" />
  </TabItem>
</Tabs>

## 組み込みロール \{#built-in-roles\}

ClickStack には 3 つのシステムロールが用意されています。これらは編集または削除できません。Admin ロールは、デフォルトでチーム作成者に割り当てられます。

| 権限            | Admin | Member | ReadOnly |
| ------------- | :---: | :----: | :------: |
| すべてのリソースの読み取り |   ✓   |    ✓   |     ✓    |
| ダッシュボードの管理    |   ✓   |    ✓   |          |
| 保存済み検索の管理     |   ✓   |    ✓   |          |
| ソースの管理        |   ✓   |    ✓   |          |
| アラートの管理       |   ✓   |    ✓   |          |
| Webhookの管理    |   ✓   |    ✓   |          |
| ノートブックの管理     |   ✓   |    ✓   |          |
| チーム設定の更新      |   ✓   |    ✓   |          |
| チームの作成/削除     |   ✓   |        |          |
| ユーザーと招待の管理    |   ✓   |        |          |

## チームメンバーへのロールの割り当て \{#assigning-roles\}

**Team Settings**ページには、すべてのチームメンバーと現在のロールが一覧表示されます。ロールを変更するには、ユーザー名の横にある**Edit**をクリックして、新しいロールを選択します。各ユーザーに割り当てられるロールは必ず1つです。

### 新規ユーザーの既定のロール \{#default-new-user-role\}

[セキュリティポリシー](#security-policies) で、新規ユーザーの既定のロールを設定できます。チームに自動参加する新規ユーザーには、このロールが自動的に割り当てられます。

## カスタムロールの作成 \{#creating-a-role\}

<VerticalStepper headerLevel="h3">
  ### Team Settings に移動 \{#step-navigate\}

  **Team Settings** を開き、**RBAC Roles** までスクロールします。

  <Image img={rbac_section} alt="RBAC Roles" size="lg" />

  ### 新しいロールを追加 \{#step-add-role\}

  **+ Add Role** をクリックします。**Role Name** を入力し、必要に応じて **Description** を追加します。

  ### 権限を設定して保存 \{#step-configure\}

  ロールの権限を設定し、**Create Role** をクリックします。

  <Image img={add_role_modal} alt="Add Role モーダル" size="md" />
</VerticalStepper>

カスタムロールは **RBAC Roles** セクションにシステムロールと並んで表示され、**Edit** と **Delete** の操作が可能です。

## ロールの権限 \{#role-permissions\}

### リソース権限 \{#resource-permissions\}

各ロールには、リソースタイプごとにアクセスレベルが付与されます。アクセスレベルは次の 3 つです。

| アクセスレベル    | 許可される内容                              |
| ---------- | ------------------------------------ |
| **アクセスなし** | そのリソースタイプは、そのロールでは完全に非表示になります。       |
| **読み取り**   | リソースとその設定を表示できますが、作成、編集、削除はできません。    |
| **管理**     | 完全に操作できます — そのタイプのリソースを作成、編集、削除できます。 |

制御できるリソースタイプは次のとおりです。

* **[ダッシュボード](/use-cases/observability/clickstack/dashboards)** — 保存済みのダッシュボードレイアウトとチャート。
* **[保存済み検索](/use-cases/observability/clickstack/search)** — 保存されたログ / トレース / イベントのクエリ。
* **ソース** — インジェスト元の設定。
* **[アラート](/use-cases/observability/clickstack/alerts)** — アラートルールとその通知設定。
* **Webhook** — [アラート](/use-cases/observability/clickstack/alerts) の送信先となる外部通知先 (Slack、PagerDuty、汎用 HTTP エンドポイントなど) 。これは ClickStack API を指すものではありません。
* **ノートブック** — 共同で調査を行うためのノートブック。

### 管理権限 \{#administrative-permissions\}

リソース権限に加えて、各ロールには 2 つの管理設定があります。

* **Users** (アクセスなし · 制限付きアクセス) — ロールがチームメンバーとそのロールを閲覧できるかどうかを制御します。ユーザーの招待、削除、更新を行えるのは Admins のみです。
* **Team** (読み取り · 管理) — セキュリティポリシーや RBAC 設定など、チームレベルの設定をロールが閲覧または変更できるかどうかを制御します。

### きめ細かなアクセスルール \{#fine-grained-access-rules\}

ダッシュボード、保存済み検索、ソース、ノートブックでは、カテゴリ内の個々のリソースへのアクセスを制限できる、きめ細かなアクセス制御をサポートしています。リソース種別全体に一括でアクセス権を付与するのではなく、ロールがアクセスできる対象を特定のリソースのみに限定する必要がある場合に使用してください。

#### デフォルトアクセスときめ細かなアクセス制御 \{#access-control-modes\}

各リソースタイプには、**Access Control Mode** があります。

* **Default Access** — そのタイプのすべてのリソースに、単一のアクセスレベル (No Access、Read、または Manage) を適用します。
* **Fine-Grained Controls** — 条件に基づいて特定のリソースに一致するアクセスルールを定義できます。どのルールにも一致しないリソースは、デフォルトでアクセスなしになります。

モードを切り替えるには、ロールエディタでリソースタイプを展開するシェブロンをクリックし、**Access Control Mode** を切り替えます。

<Image img={default_vs_fine_grained} alt="ロールエディタでの Default Access と Fine-Grained Controls モード" size="md" />

#### アクセスルールの設定 \{#configuring-access-rules\}

各アクセスルールは、**条件** と **アクセスレベル** で構成されます。条件は、リソースのプロパティに基づいて対象リソースを判定します。

<Image img={condition_tip} alt="条件ツールチップ: Name または Tag（タイトルに表示）または ID（URL で確認）でリソースを判定" size="md" />

| 条件フィールド  | オペレーター           | 対象                                                                  | 例                                                                  |
| -------- | ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Name** | `is`, `contains` | リソースの表示名。たとえば、ダッシュボードのタイトルです。                                       | Name contains `production` — タイトルに「production」を含む任意のダッシュボードに一致します。 |
| **Tag**  | `is`, `contains` | リソース画面の右上にあるタグパネルからリソースに割り当てられたタグです。ダッシュボード、保存済み検索、ノートブックでのみ使用できます。 | Tag is `critical` — 「critical」タグが付いたリソースに一致します。                    |
| **ID**   | `is`, `contains` | リソースを開いたときに URL バーで確認できるリソース識別子です。                                  | ID is `abc123` — 特定の 1 つのリソースに一致します。                               |

次のスクリーンショットでは、URL バーで強調表示されたダッシュボード ID と、タグパネル (右上) に表示された &quot;TESTING&quot; タグの両方を示しています。

<Image img={dashboard_id_and_tag_example} alt="URL バーにリソース ID が表示され、右上隅にタグが表示されているダッシュボード" size="lg" />

リソースタイプごとに複数のルールを追加できます。各ルールは OR ロジックで個別に評価されるため、リソースはいずれか **1 つでも** のルールに一致すればアクセス可能です。どのルールにも一致しないリソースにはアクセスできません。

<Image img={access_rules_tip} alt="OR ロジックによるアクセスルールのツールチップ" size="md" />

**例**: ロールに testing ダッシュボードへの読み取り専用アクセスを付与するには、ダッシュボードを展開し、Fine-Grained Controls に切り替えて、次の 2 つのルールを追加します。

* **Name** `contains` `testing`、アクセスレベルは **Read**
* **Tag** `is` `testing`、アクセスレベルは **Read**

いずれかのルールに一致するダッシュボードにはアクセスできます。

<Image img={dashboard_fine_grained_example} alt="OR で結合された 2 つの詳細アクセスルール: Name contains testing に Read アクセス、Tag is testing に Read アクセス" size="md" />

## セキュリティポリシー \{#security-policies\}

**Team Settings**の**セキュリティポリシー**セクションでは、追加の制御項目を利用できます。

**デフォルトの新規ユーザーロール**では、チームに参加する新規ユーザーに自動で割り当てるロールを設定します。

**Generative AI**では、Anthropic または Amazon Bedrock を利用した LLM 機能 (自然言語によるクエリ生成など) を有効または無効にできます。無効にすると、AI プロバイダーにはデータは送信されません。

<Image img={security_policies} alt="セキュリティポリシー" size="lg" />