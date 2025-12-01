---
title: 'Обзор'
slug: /cloud/reference/byoc/overview
sidebar_label: 'Обзор'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Развертывание ClickHouse в вашей собственной облачной инфраструктуре'
doc_type: 'reference'
---



## Обзор {#overview}

BYOC (Bring Your Own Cloud) позволяет развернуть ClickHouse Cloud в вашей собственной облачной инфраструктуре. Это полезно, если у вас есть специфические требования или ограничения, которые не позволяют использовать управляемый сервис ClickHouse Cloud.

> **Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Дополнительную информацию см. в наших [Условиях использования](https://clickhouse.com/legal/agreements/terms-of-service).

В настоящее время BYOC поддерживается только для AWS. Вы можете присоединиться к списку ожидания для GCP и Azure [здесь](https://clickhouse.com/cloud/bring-your-own-cloud).

:::note 
BYOC разработан специально для крупномасштабных развертываний и требует от клиентов заключения долгосрочного контракта.
:::



## Глоссарий {#glossary}

- **ClickHouse VPC:**  VPC, принадлежащая ClickHouse Cloud.
- **Customer BYOC VPC:** VPC, принадлежащая облачной учетной записи клиента, создаётся и управляется ClickHouse Cloud и выделена под развертывание ClickHouse Cloud BYOC.
- **Customer VPC:** Другие VPC, принадлежащие облачной учетной записи клиента и используемые для приложений, которым необходимо подключаться к Customer BYOC VPC.



## Возможности {#features}

### Поддерживаемые возможности {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют один и тот же исполняемый файл и конфигурацию. Поэтому в BYOC поддерживаются все возможности ядра ClickHouse, включая SharedMergeTree.
- **Доступ к консоли для управления состоянием сервиса**:
  - Поддержка операций запуска, остановки и завершения работы сервиса.
  - Просмотр сервисов и их статуса.
- **Резервное копирование и восстановление.**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Режим простоя (idling).**
- **Warehouses**: разделение вычислительных ресурсов (Compute-Compute Separation).
- **Сеть с нулевым доверием через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные дашборды состояния для мониторинга работоспособности сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с помощью Prometheus, Grafana и Datadog. Инструкции по настройке см. в [документации по Prometheus](/integrations/prometheus).
- **VPC Peering.**
- **Интеграции**: полный список см. [на этой странице](/integrations).
- **Защищённый S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Планируемые возможности (в настоящее время не поддерживаются) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/), также известный как CMEK (customer-managed encryption keys)
- ClickPipes для приёма данных
- Автомасштабирование
- Интерфейс MySQL
