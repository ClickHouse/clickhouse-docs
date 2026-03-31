---
slug: /use-cases/observability/clickstack/rbac
title: 'Role-based access control (RBAC)'
sidebar_label: 'Role-based access control'
toc_max_heading_level: 2
pagination_prev: null
pagination_next: null
description: 'Configure role-based access control in ClickStack to manage team permissions for dashboards, saved searches, sources, alerts, and more.'
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

ClickStack includes role-based access control (RBAC) so you can define custom roles with fine-grained permissions over [dashboards](/use-cases/observability/clickstack/dashboards), [saved searches](/use-cases/observability/clickstack/search), sources, [alerts](/use-cases/observability/clickstack/alerts), webhooks, and notebooks. Permissions work at two levels: resource-level access (no access, read, or manage per resource type) and optional fine-grained rules that restrict access to individual resources by name, tag, or ID. ClickStack ships with three built-in roles, and you can create custom roles to match your team's needs.

:::note Managed ClickStack only
RBAC is only available in Managed ClickStack deployments.
:::

## User access prerequisites {#user-access-prerequisites}

ClickStack authenticates through ClickHouse Cloud. Before you can assign ClickStack roles, each user must:

1. **Be invited to your ClickHouse Cloud organization.** An organization admin invites users from the Cloud console. See [Manage cloud users](/cloud/security/manage-cloud-users) for details.
2. **Have SQL Console access on the service.** Navigate to your service's **Settings** → **SQL Console Access** and set the appropriate permission level:

| Cloud SQL Console access | ClickStack access |
|---|---|
| **SQL Console Admin** (Full Access) | Full access to ClickStack. Required for enabling [alerts](/use-cases/observability/clickstack/alerts). |
| **SQL Console Read Only** (Read Only) | Can view observability data and create dashboards. |
| **No access** | Can't access ClickStack. |

Once a user has Cloud access, they appear in the ClickStack **Team Settings** page where you can assign a ClickStack role.

<Tabs>
<TabItem value="cloud" label="Cloud Users and roles" default>
<Image img={team_page_cloud} alt="ClickHouse Cloud Users and roles page" size="lg"/>
</TabItem>
<TabItem value="clickstack" label="ClickStack Team Settings">
<Image img={team_page_clickstack} alt="ClickStack Team Settings page showing team members and their roles" size="lg"/>
</TabItem>
</Tabs>

## Built-in roles {#built-in-roles}

ClickStack includes three system roles. You can't edit or delete these. The Admin role is assigned to the team creator by default.

| Permission | Admin | Member | ReadOnly |
|---|:---:|:---:|:---:|
| Read all resources | ✓ | ✓ | ✓ |
| Manage dashboards | ✓ | ✓ | |
| Manage saved searches | ✓ | ✓ | |
| Manage sources | ✓ | ✓ | |
| Manage alerts | ✓ | ✓ | |
| Manage webhooks | ✓ | ✓ | |
| Manage notebooks | ✓ | ✓ | |
| Update team settings | ✓ | ✓ | |
| Create/delete teams | ✓ | | |
| Manage users and invitations | ✓ | | |

## Assigning roles to team members {#assigning-roles}
The **Team Settings** page lists all team members with their current role. To change a role, click **Edit** next to the user's name and select a new role. Each user has exactly one role.

### Default new user role {#default-new-user-role}
You can set a default role for new users under [Security policies](#security-policies). New users who auto-join the team are automatically assigned this role.

## Creating a custom role {#creating-a-role}

<VerticalStepper headerLevel="h3">

### Navigate to Team Settings {#step-navigate}

Open **Team Settings** and scroll to **RBAC Roles**.

<Image img={rbac_section} alt="RBAC Roles" size="lg"/>

### Add a new role {#step-add-role}

Click **+ Add Role**. Enter a **Role Name** and optionally add a **Description**.

### Configure permissions and save {#step-configure}

Set permissions for the role, then click **Create Role**.

<Image img={add_role_modal} alt="Add Role modal" size="md"/>

</VerticalStepper>

Custom roles appear alongside system roles in the RBAC Roles section, with **Edit** and **Delete** controls.

## Role permissions {#role-permissions}

### Resource permissions {#resource-permissions}

Each role grants an access level per resource type. The three levels are:

| Access level | What it allows |
|---|---|
| **No Access** | The resource type is hidden from the role entirely. |
| **Read** | View the resource and its configuration, but not create, edit, or delete it. |
| **Manage** | Full control — create, edit, and delete resources of that type. |

The resource types you can control are:

- **[Dashboards](/use-cases/observability/clickstack/dashboards)** — saved dashboard layouts and charts.
- **[Saved searches](/use-cases/observability/clickstack/search)** — persisted log/trace/event queries.
- **Sources** — ingestion source configurations.
- **[Alerts](/use-cases/observability/clickstack/alerts)** — alert rules and their notification settings.
- **Webhooks** — outbound notification destinations (such as Slack, PagerDuty, and generic HTTP endpoints) that [alerts](/use-cases/observability/clickstack/alerts) deliver to. This doesn't refer to the ClickStack API.
- **Notebooks** — collaborative investigation notebooks.

### Administrative permissions {#administrative-permissions}

In addition to resource permissions, each role includes two administrative settings:

- **Users** (No Access · Limited Access) — controls whether the role can view team members and their roles. Only Admins can invite, remove, or update users.
- **Team** (Read · Manage) — controls whether the role can view or modify team-level settings such as security policies and RBAC configuration.

### Fine-grained access rules {#fine-grained-access-rules}

Dashboards, Saved Searches, Sources, and Notebooks support fine-grained controls that restrict access to individual resources within a category. Use these when you need to limit a role to specific resources rather than granting blanket access to the entire resource type.

#### Default access vs. fine-grained controls {#access-control-modes}

Each resource type has an **Access Control Mode**:

- **Default Access** — applies a single access level (No Access, Read, or Manage) to all resources of that type.
- **Fine-Grained Controls** — lets you define access rules that match specific resources by condition. Resources that don't match any rule default to no access.

To switch modes, click the chevron to expand a resource type in the role editor, then toggle the **Access Control Mode**.

<Image img={default_vs_fine_grained} alt="Default Access vs Fine-Grained Controls modes in the role editor" size="md"/>

#### Configuring access rules {#configuring-access-rules}

Each access rule consists of a **condition** and an **access level**. Conditions match resources by their properties:

<Image img={condition_tip} alt="Condition tooltip: match resources by Name or Tag (shown by the title) or by ID (found in the URL)" size="md"/>

| Condition field | Operators | What it matches | Example |
|---|---|---|---|
| **Name** | `is`, `contains` | The display name of the resource — for example, the dashboard title. | Name contains `production` — matches any dashboard with "production" in its title. |
| **Tag** | `is`, `contains` | Tags assigned to the resource via the tag panel in the top-right corner of the resource view. Available for Dashboards, Saved Searches, and Notebooks only. | Tag is `critical` — matches resources tagged "critical." |
| **ID** | `is`, `contains` | The resource identifier, found in the URL bar when you open the resource. | ID is `abc123` — matches a single specific resource. |

The following screenshot shows both the dashboard ID highlighted in the URL bar and a "TESTING" tag visible in the tag panel (top-right).

<Image img={dashboard_id_and_tag_example} alt="Dashboard showing the resource ID in the URL bar and a tag in the top-right corner" size="lg"/>

You can add multiple rules per resource type. Each rule is checked independently using OR logic — a resource is accessible if it matches **any** rule. Resources that don't match any rule aren't accessible.

<Image img={access_rules_tip} alt="Access rules with OR logic tooltip" size="md"/>

**Example**: To give a role read-only access to testing dashboards, expand Dashboards, switch to Fine-Grained Controls, and add two rules:
- **Name** `contains` `testing` with access level **Read**                                                                                                                                   
- **Tag** `is` `testing` with access level **Read**

 A dashboard that matches either rule is accessible.

<Image img={dashboard_fine_grained_example} alt="Two fine-grained access rules joined by OR: Name contains testing with Read access, and Tag is testing with Read access" size="md"/>

## Security policies {#security-policies}

The **Security Policies** section in **Team Settings** provides additional controls.

**Default New User Role** sets the role automatically assigned to new users who join the team.

**Generative AI** lets you enable or disable LLM-powered features (such as natural language query generation) powered by Anthropic or Amazon Bedrock. When disabled, no data is sent to AI providers.

<Image img={security_policies} alt="Security policies" size="lg"/>
