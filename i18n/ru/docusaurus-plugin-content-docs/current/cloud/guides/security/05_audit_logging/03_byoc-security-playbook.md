---
sidebar_label: 'Плейбук безопасности BYOC'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'Плейбук безопасности BYOC'
description: 'На этой странице описаны методы, которые клиенты могут использовать для выявления потенциальных инцидентов безопасности'
doc_type: 'guide'
keywords: ['byoc', 'security', 'playbook', 'best practices', 'compliance']
---



# Руководство по безопасности BYOC {#byoc-security-playbook}

ClickHouse предоставляет модель Bring Your Own Cloud (BYOC) в рамках модели распределённой ответственности за безопасность, которую можно скачать в нашем Центре доверия по адресу https://trust.clickhouse.com. Приведённая ниже информация предназначена для клиентов BYOC в качестве примеров выявления потенциальных инцидентов безопасности. Клиентам рекомендуется рассматривать эту информацию в контексте своей программы безопасности, чтобы определить целесообразность настройки дополнительных средств обнаружения и оповещения.


## Потенциально скомпрометированные учетные данные ClickHouse {#compromised-clickhouse-credentials}

Обратитесь к документации по [журналу аудита базы данных](/cloud/security/audit-logging/database-audit-log) для получения запросов, которые помогут обнаружить атаки с использованием учетных данных и расследовать вредоносную активность.


## Атака типа «отказ в обслуживании» на уровне приложения {#application-layer-dos-attack}

Существуют различные методы выполнения атаки типа «отказ в обслуживании» (DoS). Если атака направлена на аварийное завершение работы экземпляра ClickHouse с помощью специально подготовленной нагрузки, восстановите работоспособность системы или перезагрузите систему и ограничьте доступ для восстановления контроля. Используйте следующий запрос для просмотра таблицы [system.crash_log](/operations/system-tables/crash_log) и получения дополнительной информации об атаке.

```sql
SELECT *
FROM clusterAllReplicas('default',system.crash_log)
```


## Скомпрометированные роли AWS, созданные ClickHouse {#compromised-clickhouse-created-aws-roles}

ClickHouse использует предварительно созданные роли для обеспечения работы системных функций. В этом разделе предполагается, что клиент использует AWS с CloudTrail и имеет доступ к журналам CloudTrail.

Если инцидент может быть результатом компрометации роли, проверьте активность в CloudTrail и CloudWatch, связанную с ролями IAM и действиями ClickHouse. Список ролей IAM можно найти в стеке [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) или модуле Terraform, предоставленных в рамках настройки.


## Несанкционированный доступ к кластеру EKS {#unauthorized-access-eks-cluster}

ClickHouse BYOC работает внутри EKS. Данный раздел предполагает, что клиент использует CloudTrail и CloudWatch в AWS и имеет доступ к логам.

Если инцидент может быть результатом компрометации кластера EKS, используйте приведенные ниже запросы к логам EKS CloudWatch для выявления конкретных угроз.

Вывести количество вызовов API Kubernetes по имени пользователя

```sql
fields user.username
| stats count(*) as count by user.username
```

Определить, является ли пользователь инженером ClickHouse

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Проверить пользователей, обращающихся к секретам Kubernetes, исключив служебные роли

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
