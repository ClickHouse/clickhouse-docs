---
sidebar_label: 'BYOC security playbook'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC security playbook'
description: 'This page illustrates methods customers can use to identify potential security events'
doc_type: 'guide'
---

# BYOC security playbook {#byoc-security-playbook}

ClickHouse operates Bring Your Own Cloud (BYOC) under a security shared responsibility model, which can be downloaded from our Trust Center at https://trust.clickhouse.com. The following information is provided for BYOC customers as examples of how to identify potential security events. Customers should consider this information in the context of their security program to determine if additional detections and alerts may be helpful.

## Potentially compromised ClickHouse credentials {#compromised-clickhouse-credentials}

Refer to the [database audit log](/cloud/security/audit-logging/database-audit-log) documentation for queries to detect credential based attacks and queries to investigate malicious activities.

## Application layer denial of service attack {#application-layer-dos-attack}

There are various methods to execute a Denial of Service (DoS) attack. If the attack is focused on crashing the ClickHouse instance through a specific payload, recover the system back to a running state, or reboot the system and restrict access to regain control. Use the following query to review the [system.crash_log](/operations/system-tables/crash_log) to get more information about the attack.

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```

## Compromised ClickHouse created AWS roles {#compromised-clickhouse-created-aws-roles}

ClickHouse utilizes pre-created roles to enable system functions. This section assumes the customer is using AWS with CloudTrail and has access to the CloudTrail logs.

If an incident may be the result of a compromised role, review activities in CloudTrail and CloudWatch related to the ClickHouse IAM roles and actions. Refer to the [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) stack or Terraform module provided as part of setup for a list of IAM roles.

## Unauthorized access to EKS cluster {#unauthorized-access-eks-cluster}

ClickHouse BYOC runs inside EKS. This section assumes the customer is using CloudTrail and CloudWatch in AWS and has access to the logs.

If an incident may be the result of a compromised EKS cluster, use the queries below within the EKS CloudWatch logs to identify specific threats.

List the number of Kubernetes API calls by username
```sql
fields user.username
| stats count(*) as count by user.username
```

Identify whether a user is a ClickHouse engineer
```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Review user accessing Kubernetes secrets, filter out service roles
```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
