---
slug: /cloud/guides/production-readiness
sidebar_label: 'Production readiness'
title: 'ClickHouse Cloud production readiness guide'
description: 'Guide for organizations transitioning from quick start to enterprise-ready ClickHouse Cloud deployments'
keywords: ['production readiness', 'enterprise', 'saml', 'sso', 'terraform', 'monitoring', 'backup', 'disaster recovery']
doc_type: 'guide'
---

# ClickHouse Cloud Production Readiness Guide {#production-readiness}

For organizations who have completed the quick start guide and have an active service with data flowing

:::note[TL;DR]
This guide helps you transition from quick start to enterprise-ready ClickHouse Cloud deployments. You'll learn how to:

- Establish separate dev/staging/production environments for safe testing
- Integrate SAML/SSO authentication with your identity provider
- Automate deployments with Terraform or the Cloud API
- Connect monitoring to your alerting infrastructure (Prometheus, PagerDuty)
- Validate backup procedures and document disaster recovery processes
:::

## Introduction {#introduction}

You have ClickHouse Cloud running successfully for your business workloads. Now you need to mature your deployment to meet enterprise production standards—whether triggered by a compliance audit, a production incident from an untested query, or IT requirements to integrate with corporate systems.

ClickHouse Cloud's managed platform handles infrastructure operations, automatic scaling, and system maintenance. Enterprise production readiness requires connecting ClickHouse Cloud to your broader IT environment through authentication systems, monitoring infrastructure, automation tools, and business continuity processes.

Your responsibilities for enterprise production readiness:
- Establish separate environments for safe testing before production deployment
- Integrate with existing identity providers and access management systems
- Connect monitoring and alerting to your operational infrastructure
- Implement infrastructure-as-code practices for consistent management
- Establish backup validation and disaster recovery procedures
- Configure cost management and billing integration

This guide walks through each area, helping you transition from a working ClickHouse Cloud deployment to an enterprise-ready system.

## Environment Strategy {#environment-strategy}

Establish separate environments to safely test changes before impacting production workloads. Most production incidents trace back to untested queries or configuration changes deployed directly to production systems.

**Environment Structure**: Maintain production (live workloads), staging (production-equivalent validation), and development (individual/team experimentation) environments.

**Testing**: Test queries in staging before production deployment. Queries that work on small datasets often cause memory exhaustion, excessive CPU usage, or slow execution at production scale. Validate configuration changes including user permissions, quotas, and service settings in staging—configuration errors discovered in production create immediate operational incidents.

**Sizing**: Size your staging service to approximate production load characteristics. Testing on significantly smaller infrastructure may not reveal resource contention or scaling issues. Use production-representative datasets through periodic data refreshes or synthetic data generation.

## Enterprise Authentication and User Management {#enterprise-authentication}

Moving from console-based user management to enterprise authentication integration is essential for production readiness.

### SSO/SAML Setup {#sso-saml-setup}

Enterprise tier ClickHouse Cloud supports SAML integration with identity providers including Okta, Azure Active Directory, and Google Workspace. SAML configuration requires coordination with ClickHouse support and involves providing your IdP metadata and configuring attribute mappings.

:::note Important limitation
Users authenticated through SAML are assigned the "Member" role by default and must be manually granted additional roles by an admin after their first login. Group-to-role mapping and automatic role assignment are not currently supported.
:::

### Access Control Design {#access-control-design}

ClickHouse Cloud uses organization-level roles (Admin, Developer, Billing, Member) and service/database-level roles (Service Admin, Read Only, SQL console roles). Design roles around job functions applying the principle of least privilege:

- **Application Users**: Service accounts with specific database and table access
- **Analyst Users**: Read-only access to curated datasets and reporting views
- **Admin Users**: Full administrative capabilities

Configure quotas, limits, and settings profiles to manage resource usage for different users and roles. Set memory and execution time limits to prevent individual queries from impacting system performance. Monitor resource usage through audit, session, and query logs to identify users or applications that frequently hit limits. Conduct regular access reviews using ClickHouse Cloud's audit capabilities.

### User Lifecycle Management Limitations {#user-lifecycle-management}

ClickHouse Cloud does not currently support SCIM or automated provisioning/deprovisioning via identity providers. Users must be manually removed from the ClickHouse Cloud console after being removed from your IdP. Plan for manual user management processes until these features become available.

Learn more about [Cloud Access Management](/cloud/security/cloud_access_management) and [SAML SSO setup](/cloud/security/saml-setup).

## Infrastructure as Code and Automation {#infrastructure-as-code}

Managing ClickHouse Cloud through infrastructure-as-code practices and API automation provides consistency, version control, and repeatability for your deployment configuration.

### Terraform Provider {#terraform-provider}

Configure the ClickHouse Terraform provider with API keys created in the ClickHouse Cloud console:

```terraform
terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 2.0"
    }
  }
}

provider "clickhouse" {
  environment     = "production"
  organization_id = var.organization_id
  token_key       = var.token_key
  token_secret    = var.token_secret
}
```

The Terraform provider supports service provisioning, IP access lists, and user management. Note that the provider does not currently support importing existing services or explicit backup configuration. For features not covered by the provider, manage them through the console or contact ClickHouse support.

For comprehensive examples including service configuration and network access controls, see [Terraform example on how to use Cloud API](https://clickhouse.com/docs/knowledgebase/terraform_example).

### Cloud API Integration {#cloud-api-integration}

Organizations with existing automation frameworks can integrate ClickHouse Cloud management directly through the Cloud API. The API provides programmatic access to service lifecycle management, user administration, backup operations, and monitoring data retrieval.

Common API integration patterns:
- Custom provisioning workflows integrated with internal ticketing systems
- Automated scaling adjustments based on application deployment schedules
- Programmatic backup validation and reporting for compliance workflows
- Integration with existing infrastructure management platforms

API authentication uses the same token-based approach as Terraform. For complete API reference and integration examples, see [ClickHouse Cloud API](/cloud/manage/api/api-overview) documentation.

## Monitoring and Operational Integration {#monitoring-integration}

Connecting ClickHouse Cloud to your existing monitoring infrastructure ensures visibility and proactive issue detection.

### Built-in Monitoring {#built-in-monitoring}

ClickHouse Cloud provides an advanced dashboard with real-time metrics including queries per second, memory usage, CPU usage, and storage rates. Access via Cloud console under Monitoring → Advanced dashboard. Create custom dashboards tailored to specific workload patterns or team resource consumption.

:::note Common production gaps
Lack of proactive alerting integration with enterprise incident management systems and automated cost monitoring. Built-in dashboards provide visibility but automated alerting requires external integration.
:::

### Production Alerting Setup {#production-alerting}

**Built-in Capabilities**: ClickHouse Cloud provides notifications for billing events, scaling events, and service health via email, UI, and Slack. Configure delivery channels and notification severities through the console notification settings.

**Enterprise Integration**: For advanced alerting (PagerDuty, custom webhooks), use the Prometheus endpoint to export metrics to your existing monitoring infrastructure:

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

For comprehensive setup including detailed Prometheus/Grafana configuration and advanced alerting, see the [ClickHouse Cloud Observability Guide](/use-cases/observability/cloud-monitoring#prometheus).

## Business Continuity and Support Integration {#business-continuity}

Establishing backup validation procedures and support integration ensures your ClickHouse Cloud deployment can recover from incidents and access help when needed.

### Backup Strategy Assessment {#backup-strategy}

ClickHouse Cloud provides automatic backups with configurable retention periods. Assess your current backup configuration against compliance and recovery requirements. Enterprise customers with specific compliance requirements around backup location or encryption can configure ClickHouse Cloud to store backups in their own cloud storage buckets (BYOB). Contact ClickHouse support for BYOB configuration.

### Validate and Test Recovery Procedures {#validate-test-recovery}

Most organizations discover backup gaps during actual recovery scenarios. Establish regular validation cycles to verify backup integrity and test recovery procedures before incidents occur. Schedule periodic test restorations to non-production environments, document step-by-step recovery procedures including time estimates, verify restored data completeness and application functionality, and test recovery procedures with different failure scenarios (service deletion, data corruption, regional outages). Maintain updated recovery runbooks accessible to on-call teams.

Test backup restoration at least quarterly for critical production services. Organizations with strict compliance requirements may need monthly or even weekly validation cycles.

### Disaster Recovery Planning {#disaster-recovery-planning}

Document your recovery time objectives (RTO) and recovery point objectives (RPO) to validate that your current backup configuration meets business requirements. Establish regular testing schedules for backup restoration and maintain updated recovery documentation.

### Production Support Integration {#production-support}

Understand your current support tier's SLA expectations and escalation procedures. Create internal runbooks defining when to engage ClickHouse support and integrate these procedures with your existing incident management processes.

Learn more about [ClickHouse Cloud Backup and Recovery](/cloud/manage/backups/overview) and [Support Services](/about-us/support).

## Next Steps {#next-steps}

After implementing the integrations and procedures in this guide, focus on optimization and operational maturity. Review query patterns and optimize table structures for performance. Implement network isolation, audit logging, and compliance controls required for your industry. Establish runbooks for common scenarios, implement automated testing for schema changes, and build internal knowledge bases for your team.

- Visit the cloud [resource tour](/cloud/get-started/cloud/resource-tour) for guides on [monitoring](/cloud/get-started/cloud/resource-tour#monitoring), [security](/cloud/get-started/cloud/resource-tour#security), and [cost optimization](/cloud/get-started/cloud/resource-tour#cost-optimization)

When current service tier limitations impact your production operations, consider upgrade paths for enhanced capabilities such as private networking, customer-managed encryption keys, or multi-region disaster recovery options.
