---
sidebar_label: 'Миграция с устаревшей CMEK'
slug: /cloud/security/cmek-migration
title: 'Миграция с CMEK v1 на v2'
description: 'Инструкции по миграции с устаревшей CMEK на версию 2'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK']
---

Мы повышаем безопасность сервисов, использующих управляемые клиентом ключи шифрования (CMEK). Теперь для каждого сервиса настроена отдельная роль AWS, которая авторизует использование клиентских ключей для шифрования и расшифровки. Эта новая роль отображается только на экране конфигурации сервиса.

В рамках этого нового процесса поддерживаются как OpenAPI, так и Terraform. Дополнительную информацию см. в нашей документации ([Улучшенное шифрование](/docs/cloud/security/cmek), [Cloud API](/docs/cloud/manage/api/api-overview), [Официальный провайдер Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)).

## Ручная миграция \{#manual-migration\}

Выполните следующие шаги, чтобы перейти на новый процесс:

1. Войдите в консоль по адресу [https://console.clickhouse.cloud](https://console.clickhouse.cloud)
2. Нажмите на зашифрованный сервис
3. В левой панели нажмите Service Settings
4. Пролистайте страницу до конца и разверните View service details
5. Скопируйте Encryption Role ID (IAM)
6. Перейдите к своему ключу KMS в AWS и обновите Key Policy, добавив следующее:

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
   },
   "Action": [
       "kms:Encrypt",
       "kms:Decrypt",
       "kms:ReEncrypt*",
       "kms:DescribeKey"
   ],
   "Resource": "*"
}
```

7. В ClickHouse Cloud откройте запрос в службу поддержки и сообщите, что нам можно включить новый метод. Это изменение требует перезапуска сервиса, поэтому, пожалуйста, укажите, какой день и время будут наиболее удобны для перезапуска.
8. После того как мы перезапустим сервис, перейдите к своему ключу KMS в AWS и удалите следующее из политики ключа (Key Policy):

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

9. Обновление завершено!

## Миграция Terraform \{#terraform-migration\}

1. Обновитесь до [Terraform версии 3.5.0 или выше](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).
2. Примените Terraform без изменений. В состоянии Terraform появится новое поле для transparent&#95;data&#95;encryption. Зафиксируйте здесь значение role&#95;id.
3. Перейдите к своему ключу KMS в AWS и обновите Key Policy, добавив следующее:

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
   },
   "Action": [
       "kms:Encrypt",
       "kms:Decrypt",
       "kms:ReEncrypt*",
       "kms:DescribeKey"
   ],
   "Resource": "*"
}
```

4. В ClickHouse Cloud откройте обращение в службу поддержки с указанием имени сервиса, чтобы сообщить нам, что можно включить новый метод. Это изменение требует перезапуска сервиса, поэтому сообщите, пожалуйста, в какой день и в какое время предпочтительнее выполнить перезапуск.
5. После того как мы перезапустим сервис, вы можете установить параметр transparent&#95;data&#95;encryption.enabled в значение ‘True’, удалить настройку tier в Terraform и применить изменения. Это не приведёт к каким‑либо изменениям.
6. Перейдите к вашему ключу KMS в AWS и удалите следующее из Key Policy:

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

7. Обновление завершено!
