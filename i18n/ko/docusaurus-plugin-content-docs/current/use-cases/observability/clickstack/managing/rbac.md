---
slug: /use-cases/observability/clickstack/rbac
title: '역할 기반 접근 제어 (RBAC)'
sidebar_label: '역할 기반 접근 제어'
toc_max_heading_level: 2
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 역할 기반 접근 제어를 구성하여 대시보드, 저장된 검색, 소스, 알림 등과 관련된 팀 권한을 관리합니다.'
doc_type: 'guide'
keywords: ['clickstack', 'rbac', '역할', '권한', '접근 관리', '보안']
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

ClickStack에는 역할 기반 접근 제어(RBAC)가 포함되어 있어 [대시보드](/use-cases/observability/clickstack/dashboards), [저장된 검색](/use-cases/observability/clickstack/search), 소스, [알림](/use-cases/observability/clickstack/alerts), 웹훅, 노트북에 대해 세분화된 권한을 적용한 사용자 지정 역할을 정의할 수 있습니다. 권한은 두 수준으로 구성됩니다. 첫째는 리소스 수준 접근 제어로, 리소스 유형별로 접근 없음, 읽기, 관리 권한을 설정할 수 있습니다. 둘째는 이름, 태그 또는 ID를 기준으로 개별 리소스에 대한 접근을 제한하는 선택적 세분화 규칙입니다. ClickStack에는 기본 제공 역할 3개가 포함되어 있으며, 팀의 요구 사항에 맞게 사용자 지정 역할을 만들 수 있습니다.

:::note Managed ClickStack 전용
RBAC는 Managed ClickStack 배포에서만 사용할 수 있습니다.
:::

## 사용자 액세스 사전 요구 사항 \{#user-access-prerequisites\}

ClickStack는 ClickHouse Cloud를 통해 인증합니다. ClickStack 역할을 할당하려면 각 사용자가 먼저 다음 조건을 충족해야 합니다.

1. **ClickHouse Cloud 조직에 초대되어 있어야 합니다.** 조직 관리자는 Cloud 콘솔에서 사용자를 초대합니다. 자세한 내용은 [클라우드 사용자 관리](/cloud/security/manage-cloud-users)를 참조하십시오.
2. **서비스에서 SQL Console 액세스 권한이 있어야 합니다.** 서비스의 **Settings** → **SQL Console Access**로 이동하여 적절한 권한 수준을 설정하십시오.

| Cloud SQL Console access              | ClickStack access                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| **SQL Console Admin** (Full Access)   | ClickStack에 대한 전체 액세스 권한입니다. [알림](/use-cases/observability/clickstack/alerts)을 활성화하려면 필요합니다. |
| **SQL Console Read Only** (Read Only) | 관측성 데이터를 보고 대시보드를 생성할 수 있습니다.                                                                |
| **No access**                         | ClickStack에 액세스할 수 없습니다.                                                                     |

사용자에게 Cloud 액세스 권한이 부여되면 ClickStack **Team Settings** 페이지에 표시되며, 여기서 ClickStack 역할을 할당할 수 있습니다.

<Tabs>
  <TabItem value="cloud" label="Cloud 사용자 및 역할" default>
    <Image img={team_page_cloud} alt="ClickHouse Cloud 사용자 및 역할 페이지" size="lg" />
  </TabItem>

  <TabItem value="clickstack" label="ClickStack Team Settings">
    <Image img={team_page_clickstack} alt="팀 구성원과 해당 역할이 표시된 ClickStack Team Settings 페이지" size="lg" />
  </TabItem>
</Tabs>

## 기본 제공 역할 \{#built-in-roles\}

ClickStack에는 세 가지 시스템 역할이 있습니다. 이러한 역할은 수정하거나 삭제할 수 없습니다. Admin 역할은 기본적으로 팀 생성자에게 할당됩니다.

| 권한          | Admin | Member | ReadOnly |
| ----------- | :---: | :----: | :------: |
| 모든 리소스 읽기   |   ✓   |    ✓   |     ✓    |
| 대시보드 관리     |   ✓   |    ✓   |          |
| 저장된 검색 관리   |   ✓   |    ✓   |          |
| 소스 관리       |   ✓   |    ✓   |          |
| 알림 관리       |   ✓   |    ✓   |          |
| 웹훅 관리       |   ✓   |    ✓   |          |
| 노트북 관리      |   ✓   |    ✓   |          |
| 팀 설정 변경     |   ✓   |    ✓   |          |
| 팀 생성/삭제     |   ✓   |        |          |
| 사용자 및 초대 관리 |   ✓   |        |          |

## 팀 구성원에게 역할 할당 \{#assigning-roles\}

**Team Settings** 페이지에는 모든 팀 구성원과 현재 역할이 표시됩니다. 역할을 변경하려면 사용자 이름 옆의 **Edit**를 클릭한 다음 새 역할을 선택하십시오. 각 사용자에게는 역할이 정확히 하나만 할당됩니다.

### 새 사용자의 기본 역할 \{#default-new-user-role\}

[보안 정책](#security-policies)에서 새 사용자에게 적용할 기본 역할을 설정할 수 있습니다. 팀에 자동으로 참여하는 새 사용자에게는 이 역할이 자동으로 할당됩니다.

## 사용자 지정 역할 생성 \{#creating-a-role\}

<VerticalStepper headerLevel="h3">
  ### Team Settings로 이동 \{#step-navigate\}

  **Team Settings**를 열고 **RBAC Roles** 섹션으로 스크롤합니다.

  <Image img={rbac_section} alt="RBAC Roles" size="lg" />

  ### 새 역할 추가 \{#step-add-role\}

  **+ Add Role**를 클릭합니다. **Role Name**을 입력하고, 필요하면 **Description**을 추가합니다.

  ### 권한을 구성하고 저장 \{#step-configure\}

  역할의 권한을 설정한 다음 **Create Role**를 클릭합니다.

  <Image img={add_role_modal} alt="Add Role 모달" size="md" />
</VerticalStepper>

사용자 지정 역할은 RBAC Roles 섹션에 시스템 역할과 함께 표시되며, **Edit** 및 **Delete** 버튼을 사용할 수 있습니다.

## 역할별 권한 \{#role-permissions\}

### 리소스 권한 \{#resource-permissions\}

각 역할에는 리소스 유형별 접근 수준이 부여됩니다. 접근 수준은 다음 3가지입니다:

| 접근 수준      | 허용되는 작업                                    |
| ---------- | ------------------------------------------ |
| **액세스 없음** | 해당 리소스 유형이 그 역할에는 완전히 숨겨집니다.               |
| **읽기**     | 리소스와 해당 구성을 볼 수 있지만, 생성, 편집, 삭제는 할 수 없습니다. |
| **관리**     | 전체 권한 — 해당 유형의 리소스를 생성, 편집, 삭제할 수 있습니다.    |

제어할 수 있는 리소스 유형은 다음과 같습니다:

* **[대시보드](/use-cases/observability/clickstack/dashboards)** — 저장된 대시보드 레이아웃과 차트입니다.
* **[저장된 검색](/use-cases/observability/clickstack/search)** — 저장된 로그/트레이스/이벤트 쿼리입니다.
* **소스** — 수집 소스 구성입니다.
* **[알림](/use-cases/observability/clickstack/alerts)** — 알림 규칙과 해당 알림 설정입니다.
* **웹훅** — [알림](/use-cases/observability/clickstack/alerts)이 전달하는 외부 알림 대상(예: Slack, PagerDuty, 일반 HTTP endpoint)입니다. 이는 ClickStack API를 의미하지 않습니다.
* **노트북** — 협업 조사용 노트북입니다.

### 관리 권한 \{#administrative-permissions\}

리소스 권한 외에도 각 역할에는 두 가지 관리 설정이 포함됩니다:

* **사용자** (No Access · Limited Access) — 역할이 팀 구성원과 각 구성원의 역할을 볼 수 있는지 제어합니다. 사용자 초대, 제거 또는 업데이트는 Admin만 수행할 수 있습니다.
* **팀** (Read · Manage) — 역할이 보안 정책 및 RBAC 구성과 같은 팀 수준의 설정을 보거나 수정할 수 있는지 제어합니다.

### 세분화된 접근 규칙 \{#fine-grained-access-rules\}

대시보드, 저장된 검색, 소스, 노트북에서는 카테고리 내 개별 리소스에 대한 접근을 제한할 수 있는 세분화된 제어를 지원합니다. 전체 리소스 유형에 일괄적으로 접근 권한을 부여하는 대신, 역할의 접근 범위를 특정 리소스로 제한해야 할 때 사용하십시오.

#### 기본 접근과 세분화된 제어 \{#access-control-modes\}

각 리소스 유형에는 **접근 관리 모드**가 있습니다.

* **기본 접근** — 해당 유형의 모든 리소스에 단일 접근 수준(No Access, Read 또는 Manage)을 적용합니다.
* **세분화된 제어** — 조건에 따라 특정 리소스에 적용되는 접근 규칙을 정의할 수 있습니다. 어떤 규칙에도 일치하지 않는 리소스는 기본적으로 접근 권한이 없습니다.

모드를 전환하려면 역할 편집기에서 리소스 유형을 펼치기 위해 셰브론을 클릭한 다음 **접근 관리 모드**를 전환하십시오.

<Image img={default_vs_fine_grained} alt="역할 편집기의 기본 접근 및 세분화된 제어 모드" size="md" />

#### 접근 규칙 구성 \{#configuring-access-rules\}

각 접근 규칙은 **조건**과 **접근 수준**으로 구성됩니다. 조건은 리소스의 속성을 기준으로 리소스를 매칭합니다.

<Image img={condition_tip} alt="조건 툴팁: 이름 또는 태그(제목에 표시됨), 또는 ID(URL에서 확인 가능)를 기준으로 리소스를 매칭합니다" size="md" />

| 조건 필드    | 연산자              | 매칭 대상                                                                                         | 예시                                                                           |
| -------- | ---------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Name** | `is`, `contains` | 리소스의 표시 이름입니다. 예를 들어 대시보드 제목이 이에 해당합니다.                                                       | Name contains `production` — 제목에 &quot;production&quot;이 포함된 모든 대시보드와 매칭됩니다. |
| **Tag**  | `is`, `contains` | 리소스 보기 오른쪽 상단의 태그 패널을 통해 리소스에 할당된 태그입니다. Dashboards, Saved Searches, Notebooks에서만 사용할 수 있습니다. | Tag is `critical` — &quot;critical&quot; 태그가 지정된 리소스와 매칭됩니다.                 |
| **ID**   | `is`, `contains` | 리소스를 열었을 때 URL 표시줄에서 확인할 수 있는 리소스 식별자입니다.                                                     | ID is `abc123` — 특정 리소스 하나와 매칭됩니다.                                           |

다음 스크린샷은 URL 표시줄에서 강조된 대시보드 ID와 태그 패널(오른쪽 상단)에 표시된 &quot;TESTING&quot; 태그를 함께 보여줍니다.

<Image img={dashboard_id_and_tag_example} alt="URL 표시줄에 리소스 ID가 표시되고 오른쪽 상단에 태그가 있는 대시보드" size="lg" />

리소스 유형마다 여러 규칙을 추가할 수 있습니다. 각 규칙은 OR 논리로 서로 독립적으로 검사되며, **하나라도** 규칙과 일치하면 해당 리소스에 액세스할 수 있습니다. 어떤 규칙과도 일치하지 않는 리소스에는 액세스할 수 없습니다.

<Image img={access_rules_tip} alt="OR 논리가 적용된 접근 규칙 툴팁" size="md" />

**예시**: 역할에 테스트용 대시보드에 대한 읽기 전용 액세스 권한을 부여하려면 Dashboards를 펼치고 Fine-Grained Controls로 전환한 다음, 다음 두 규칙을 추가하십시오.

* **Name** `contains` `testing` 및 접근 수준 **Read**
* **Tag** `is` `testing` 및 접근 수준 **Read**

두 규칙 중 하나라도 일치하는 대시보드에는 액세스할 수 있습니다.

<Image img={dashboard_fine_grained_example} alt="OR로 연결된 두 개의 세분화된 접근 규칙: Name contains testing에 Read 액세스, 그리고 Tag is testing에 Read 액세스" size="md" />

## 보안 정책 \{#security-policies\}

**Team Settings**의 **보안 정책** 섹션에서는 추가적인 제어 옵션을 제공합니다.

**기본 신규 사용자 역할**은 팀에 참여하는 신규 사용자에게 자동으로 할당할 역할을 설정합니다.

**생성형 AI**에서는 Anthropic 또는 Amazon Bedrock 기반의 LLM 기능(예: 자연어 쿼리 생성)을 활성화하거나 비활성화할 수 있습니다. 비활성화하면 AI 제공업체로는 어떤 데이터도 전송되지 않습니다.

<Image img={security_policies} alt="보안 정책" size="lg" />