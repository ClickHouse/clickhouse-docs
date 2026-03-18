---
slug: /use-cases/observability/clickstack/rbac
title: 'Role-Based Access Control (RBAC)'
sidebar_label: 'Role-Based Access Control'
toc_max_heading_level: 2
pagination_prev: null
pagination_next: null
description: 'Configure role-based access control in ClickStack to manage team permissions for dashboards, saved searches, sources, alerts, and more.'
doc_type: 'guide'
keywords: ['clickstack', 'rbac', 'roles', 'permissions', 'access control', 'security']
---

import Image from '@theme/IdealImage';
import rbac_section from '@site/static/images/clickstack/rbac/rbac-section.png';
import add_role_modal from '@site/static/images/clickstack/rbac/add-role-modal.png';
import fine_grained from '@site/static/images/clickstack/rbac/fine-grained.png';
import security_policies from '@site/static/images/clickstack/rbac/security-policies.png';

ClickStack includes role-based access control (RBAC) so you can define custom roles with fine-grained permissions over dashboards, saved searches, sources, alerts, webhooks, and notebooks. You assign each team member a role that determines what they can view and manage in the ClickStack UI.

:::note Managed ClickStack only
RBAC is available in Managed ClickStack deployments. For ClickStack Open Source, access control is managed at the infrastructure level.
:::

## Overview {#overview}

ClickStack RBAC operates at two levels:

- **Resource-level permissions** — control whether a role can access specific resource types, and at what level (no access, read, or manage).
- **Fine-grained access rules** — optionally restrict access to individual resources within a category based on conditions like name or tag.

ClickStack ships with three built-in system roles, and you can create custom roles to match your team's access requirements.

## Built-in roles {#built-in-roles}

ClickStack includes three system roles. You can't edit or delete these.

| Role | Description |
|------|-------------|
| **Admin** | Full access to all resources. Assigned to the team creator by default. |
| **Member** | Read and write access to most resources. |
| **ReadOnly** | Read-only access to all resources. |

## Creating a custom role {#creating-a-role}

<VerticalStepper headerLevel="h3">

### Navigate to Team Settings {#step-navigate}

Open **Team Settings** and scroll to **RBAC Roles**.

<Image img={rbac_section} alt="RBAC Roles" size="lg"/>

### Add a new role {#step-add-role}

Click **+ Add Role**. Enter a **Role Name** (for example, `Developer` or `On-Call`) and optionally add a **Description**.

### Configure permissions and save {#step-configure}

Set resource permissions for the role (see [Resource permissions](#resource-permissions) below), then click **Create Role**.

<Image img={add_role_modal} alt="Add Role modal" size="md"/>

</VerticalStepper>

Custom roles appear alongside system roles in the RBAC Roles section, with **Edit** and **Delete** controls.

## Resource permissions {#resource-permissions}

Each role defines an access level for the following resource types:

| Resource | Access levels | Fine-grained controls |
|----------|--------------|----------------------|
| **Dashboards** | No Access · Read · Manage | Yes |
| **Saved Searches** | No Access · Read · Manage | Yes |
| **Sources** | No Access · Read · Manage | Yes |
| **Webhooks** | No Access · Read · Manage | No |
| **Alerts** | No Access · Read · Manage | No |
| **Notebooks** | No Access · Read · Manage | Yes |

The access levels are:

| Access level | Description |
|-------------|-------------|
| **No Access** | The role can't view or interact with resources of this type. |
| **Read** | The role can view resources but can't create, edit, or delete them. |
| **Manage** | The role has full control: view, create, edit, and delete. |

### Administrative permissions {#administrative-permissions}

In addition to resource permissions, each role includes two administrative settings:

| Setting | Access levels | Description |
|---------|--------------|-------------|
| **Users** | No Access · Read | Controls whether the role can view team member information. |
| **Team** | Read · Manage | Controls whether the role can view or manage team-level settings. |

## Fine-grained access rules {#fine-grained-access-rules}

Dashboards, Saved Searches, Sources, and Notebooks support fine-grained controls for restricting access to specific resources within that category.

To configure fine-grained rules, click the chevron to expand a resource, then switch the **Access Control Mode** from **Default Access** to **Fine-Grained Controls**.

Each access rule consists of a **condition** and an **access level**. Conditions filter resources by properties such as name or tag:

| Condition field | Operators | Example |
|----------------|-----------|---------|
| **Name** | `is`, `contains` | Name contains `production` |
| **Tag** | `is` | Tag is `critical` |

You can add multiple rules per resource. Rules combine with OR logic — a resource is accessible if it matches any rule. Resources that don't match any rule are denied access by default.

This simple example sets access rules such that this role can read dashboards with "test" in the name.

<Image img={fine_grained} alt="Fine-grained access rules" size="md"/>

## Assigning roles to team members {#assigning-roles}

The **Team Settings** page lists all team members with their current role. To change a user's role, click **Edit** next to their name and select a new role. Each user has exactly one role.

{/* <Image img={team_members} alt="Team members with role assignments" size="lg"/> */}

### Default new user role {#default-new-user-role}

You can configure a **Default New User Role** under **Security Policies**. New users who auto-join the team are automatically assigned this role.

:::warning
When a new member joins the team, their SQL console permissions in ClickHouse Cloud are reassigned to match the ClickStack role.
:::

## Security policies {#security-policies}

The **Security Policies** section in **Team Settings** provides additional controls:

- **Default New User Role** — Set the role automatically assigned to new users who join the team.
- **Generative AI** — Enable or disable LLM-powered features (such as natural language query generation using Anthropic or Amazon Bedrock). When disabled, no data is sent to AI providers.

<Image img={security_policies} alt="Security policies" size="lg"/>
