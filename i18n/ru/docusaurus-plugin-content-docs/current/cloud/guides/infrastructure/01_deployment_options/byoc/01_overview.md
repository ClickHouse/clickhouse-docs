---
title: 'Обзор'
slug: /cloud/reference/byoc/overview
sidebar_label: 'Обзор'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Развертывание ClickHouse в вашей собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## Обзор \{#overview\}

Bring Your Own Cloud (BYOC) позволяет вам развертывать сервисы ClickHouse и хранить данные непосредственно в ваших собственных облачных аккаунтах, вместо того чтобы полагаться на стандартную инфраструктуру ClickHouse Cloud. Этот подход особенно хорошо подходит для организаций с жесткими требованиями к безопасности или регуляторному соответствию, которые требуют полного контроля и суверенитета над своими данными.

На концептуальном уровне BYOC разделяет плоскость управления ClickHouse, которая выполняется в ClickHouse VPC и управляется ClickHouse Cloud, и плоскость данных, которая полностью работает в вашем облачном аккаунте и содержит ваши кластеры ClickHouse, данные и резервные копии. Подробное описание задействованных компонентов и того, как между ними проходит трафик, приведено на странице [Architecture](/cloud/reference/byoc/architecture).

> **Если вы хотите получить доступ, пожалуйста, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud).** Дополнительную информацию см. в наших [Условиях использования](https://clickhouse.com/legal/agreements/terms-of-service).

:::note 
BYOC разработан специально для крупномасштабных развертываний и требует от клиентов заключения долгосрочного контракта.
:::

**Поддерживаемые облачные провайдеры:**

* AWS (GA)
* GCP (Private Preview). Если вы заинтересованы, присоединитесь к списку ожидания [здесь](https://clickhouse.com/cloud/bring-your-own-cloud).
* Azure (Roadmap). Если вы заинтересованы, присоединитесь к списку ожидания [здесь](https://clickhouse.com/cloud/bring-your-own-cloud).

**Поддерживаемые регионы Cloud:**
Все **публичные регионы**, перечисленные в нашей документации по [поддерживаемым регионам](https://clickhouse.com/docs/cloud/reference/supported-regions), доступны для развертываний BYOC. Частные регионы в настоящее время не поддерживаются.

## Возможности \{#features\}

### Поддерживаемые возможности \{#supported-features\}

- **SharedMergeTree**: ClickHouse Cloud и BYOC используют один и тот же исполняемый файл и конфигурацию. Поэтому в BYOC поддерживаются все возможности ядра ClickHouse, включая SharedMergeTree.
- **Shared Catalog**
- **Доступ к консоли для управления состоянием сервиса**:
  - Поддержка операций запуска, остановки и завершения работы сервиса.
  - Просмотр сервисов и их статуса.
- **Управляемое резервное копирование и восстановление**
- **Ручное вертикальное и горизонтальное масштабирование.**
- **Автоматический режим простоя (auto idling)**
- **Warehouses**: разделение вычислительных ресурсов (Compute-Compute Separation).
- **Сеть с нулевым доверием через Tailscale.**
- **Мониторинг**:
  - Облачная консоль включает встроенные дашборды состояния для мониторинга работоспособности сервиса.
  - Сбор метрик Prometheus для централизованного мониторинга с помощью Prometheus, Grafana и Datadog. Инструкции по настройке см. в [документации по Prometheus](/integrations/prometheus).
- **VPC Peering**
- **Интеграции**: полный список см. [на этой странице](/integrations).
- **Защищённый S3**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**
- **[GCP Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)**

### Планируемые возможности (в настоящее время не поддерживаются) \{#planned-features-currently-unsupported\}

- SQL-консоль
- ClickPipes (Kafka, S3)
- ClickPipes (CDC)
- Автомасштабирование
- Интерфейс MySQL
- [AWS KMS](https://aws.amazon.com/kms/), также известный как CMEK (customer-managed encryption keys)