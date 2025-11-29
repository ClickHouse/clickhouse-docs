---
sidebar_label: 'Плейбук безопасности BYOC'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'Плейбук безопасности BYOC'
description: 'На этой странице описаны методы, позволяющие клиентам выявлять потенциальные инциденты безопасности'
doc_type: 'guide'
keywords: ['byoc', 'security', 'playbook', 'best practices', 'compliance']
---



# Руководство по безопасности BYOC {#byoc-security-playbook}

ClickHouse предоставляет услугу Bring Your Own Cloud (BYOC) в рамках модели совместной ответственности в области безопасности, описание которой можно загрузить из нашего Trust Center по адресу https://trust.clickhouse.com. Приведённая ниже информация предоставляется клиентам BYOC в качестве примеров того, как можно выявлять потенциальные события, связанные с безопасностью. Клиентам следует учитывать эту информацию в контексте собственной программы безопасности, чтобы определить, будут ли полезны дополнительные механизмы обнаружения и оповещения.



## Потенциально скомпрометированные учетные данные ClickHouse {#compromised-clickhouse-credentials}

См. документацию по [журналу аудита базы данных](/cloud/security/audit-logging/database-audit-log) для примеров запросов по обнаружению атак с использованием учетных данных и запросов для расследования вредоносной активности.



## Атака отказа в обслуживании на уровне приложения {#application-layer-dos-attack}

Существует множество методов проведения атаки отказа в обслуживании (DoS). Если атака нацелена на вывод из строя экземпляра ClickHouse с помощью специальной полезной нагрузки, восстановите систему в рабочее состояние или перезагрузите её и ограничьте доступ, чтобы вернуть контроль. Используйте следующий запрос для просмотра [system.crash&#95;log](/operations/system-tables/crash_log) и получения дополнительной информации об атаке.

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```


## Скомпрометированные роли AWS, созданные ClickHouse {#compromised-clickhouse-created-aws-roles}

ClickHouse использует предварительно созданные роли для обеспечения работы системных функций. В этом разделе предполагается, что заказчик использует AWS с CloudTrail и имеет доступ к журналам CloudTrail.

Если инцидент может быть результатом скомпрометированной роли, просмотрите действия в CloudTrail и CloudWatch, связанные с ролями и действиями ClickHouse IAM. Обратитесь к стеку [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) или модулю Terraform, предоставленным в рамках первоначальной настройки, чтобы получить список ролей IAM.



## Несанкционированный доступ к кластеру EKS {#unauthorized-access-eks-cluster}

ClickHouse BYOC работает внутри EKS. В этом разделе предполагается, что клиент использует в AWS сервисы CloudTrail и CloudWatch и имеет доступ к журналам.

Если инцидент может быть связан со скомпрометированным кластером EKS, используйте приведённые ниже запросы в журналах CloudWatch для EKS, чтобы выявить конкретные угрозы.

Получить количество вызовов Kubernetes API по имени пользователя

```sql
fields user.username
| stats count(*) as count by user.username
```

Определите, является ли пользователь инженером ClickHouse

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Проанализируйте пользователей, получающих доступ к секретам Kubernetes, исключая сервисные роли

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
