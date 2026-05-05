---
title: 'Настройка частной сети BYOC в GCP'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'Настройка частной сети BYOC в GCP'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'VPC Peering', 'GCP', 'Private Service Connect']
description: 'Настройте VPC Peering или Private Service Connect для BYOC в GCP'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';

ClickHouse BYOC в GCP поддерживает два варианта частного подключения: VPC Peering и Private Service Connect. Трафик полностью остается в сети GCP и никогда не проходит через общедоступный интернет.

## Предварительные требования \{#common-prerequisites\}

Общие шаги, необходимые и для VPC-пиринга, и для Private Service Connect.

### Включение частного балансировщика нагрузки для ClickHouse BYOC \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

Обратитесь в службу поддержки ClickHouse, чтобы включить частный балансировщик нагрузки.

## Настроить VPC-пиринг \{#gcp-vpc-peering\}

Ознакомьтесь с [возможностью VPC-пиринга в GCP](https://docs.cloud.google.com/vpc/docs/vpc-peering) и обратите внимание на ограничения VPC-пиринга (например, диапазоны IP-адресов подсетей не должны пересекаться в VPC-сетях, связанных пирингом). ClickHouse BYOC использует частный балансировщик нагрузки, чтобы обеспечить сетевую связность с сервисами ClickHouse через пиринг.

Чтобы создать или удалить VPC-пиринг для ClickHouse BYOC, выполните следующие шаги:

:::note
Эти шаги приведены для простого сценария. Для более сложных сценариев, таких как пиринг с локальной инфраструктурой, могут потребоваться дополнительные изменения.
:::

<VerticalStepper headerLevel="h3">
  ### Создать пиринговое подключение \{#step-1-create-a-peering-connection\}

  В этом примере мы настраиваем пиринг между сетью BYOC VPC и другой существующей сетью VPC.

  1. Перейдите в раздел &quot;VPC Network&quot; в проекте Google Cloud для ClickHouse BYOC.
  2. Выберите &quot;VPC network peering&quot;.
  3. Нажмите &quot;Create connection&quot;.
  4. Заполните необходимые поля в соответствии с вашими требованиями. Ниже приведен снимок экрана создания пиринга в рамках одного проекта GCP.

  <Image img={byoc_vpcpeering} size="md" alt="BYOC Создание пирингового подключения" border />

  Для работы GCP VPC-пиринга требуются 2 подключения между этими двумя сетями (то есть подключение от сети BYOC к существующей сети VPC и подключение от существующей сети VPC к сети BYOC). Поэтому аналогичным образом нужно создать еще 1 подключение в обратном направлении; ниже приведен снимок экрана создания второго пирингового подключения:

  <Image img={byoc_vpcpeering2} size="md" alt="BYOC Подтверждение пирингового подключения" border />

  После создания обоих подключений их статус должен стать &quot;Active&quot; после обновления страницы Google Cloud Console:

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC Подтверждение пирингового подключения" border />

  Теперь сервис ClickHouse должен быть доступен из VPC, связанной пирингом.

  ### Доступ к сервису ClickHouse через пиринговое подключение \{#step-2-access-ch-service-via-peering\}

  Для частного доступа к ClickHouse подготавливаются частный балансировщик нагрузки и частная конечная точка для безопасного подключения из VPC пользователя, связанной пирингом. Формат частной конечной точки соответствует формату публичной конечной точки с суффиксом `-private`. Например:

  * **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
  * **Частная конечная точка**: `h5ju65kv87-private.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
</VerticalStepper>

## Настроить PSC (Private Service Connect) \{#gcp-psc\}

GCP PSC (Private Service Connect) обеспечивает безопасный частный доступ к вашим сервисам ClickHouse BYOC без необходимости использовать VPC-пиринг или интернет-шлюзы.

<VerticalStepper headerLevel="h3">
  ### Запросите настройку сервиса PSC \{#step-1-request-psc-setup\}

  Свяжитесь с [службой поддержки ClickHouse](https://clickhouse.com/cloud/bring-your-own-cloud), чтобы запросить настройку сервиса PSC для вашего развертывания BYOC. На этом этапе не требуется никакой дополнительной информации — просто укажите, что хотите настроить подключение через PSC.

  Служба поддержки ClickHouse включит необходимые компоненты инфраструктуры, включая **частный балансировщик нагрузки** и **сервис PSC**.

  ### Получите имя сервиса GCP PSC и DNS-имя \{#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

  Служба поддержки ClickHouse предоставит вам имя сервиса PSC. Его также можно посмотреть в консоли ClickHouse Cloud: в разделе &quot;Organization&quot; -&gt; &quot;Infrastructure&quot; нажмите на имя инфраструктуры, чтобы открыть сведения.

  <Image img={byoc_privatelink_1} size="lg" alt="Конечная точка BYOC PSC" border />

  <Image img={byoc_privatelink_2} size="lg" alt="Конечная точка BYOC PSC" border />

  Имя сервиса PSC также можно найти в консоли GCP Private Service Connect в разделе &quot;Published services&quot; (отфильтруйте по имени сервиса или найдите сервисы ClickHouse).

  <Image img={byoc_privatelink_3} size="lg" alt="Конечная точка BYOC PSC" border />

  <Image img={byoc_privatelink_4} size="lg" alt="Конечная точка BYOC PSC" border />

  ### Создайте конечную точку PSC в своей сети \{#step-3-create-endpoint\}

  После того как Служба поддержки ClickHouse включит сервис PSC со своей стороны, вам нужно создать конечную точку PSC в сети клиентского приложения, чтобы подключиться к сервису ClickHouse PSC.

  1. **Создайте конечную точку PSC**:

  * Перейдите в консоль GCP -&gt; Network Services → Private Service Connect → Connect Endpoint
  * Выберите &quot;Published service&quot; в поле &quot;Target&quot; и введите имя сервиса PSC, полученное на предыдущем шаге, в поле &quot;Target details&quot;
  * Введите допустимое имя конечной точки
  * Выберите сеть и подсети (это сеть, из которой будет подключаться клиентское приложение)
  * Выберите или создайте новый IP-адрес для конечной точки; он понадобится на шаге [Задайте частное DNS-имя для конечной точки](#step-4-set-private-dns-name-for-endpoint)
  * Нажмите &quot;Add Endpoint&quot; и подождите, пока конечная точка будет создана
  * Статус конечной точки должен измениться на &quot;Accepted&quot;; если этого не произошло автоматически, свяжитесь со службой поддержки ClickHouse

  <Image img={byoc_privatelink_5} size="lg" alt="Создание конечной точки BYOC PSC" border />

  2. **Получите PSC Connection ID**:

  * Откройте сведения о конечной точке и получите &quot;PSC Connection ID&quot;, который будет использоваться на шаге [Добавьте PSC Connection ID конечной точки в список разрешений сервиса](#step-5-add-endpoint-id-allowlist)

  <Image img={byoc_privatelink_6} size="lg" alt="Сведения о конечной точке BYOC PSC" border />

  ### Задайте частное DNS-имя для конечной точки \{#step-4-set-private-dns-name-for-endpoint\}

  :::note
  Существует несколько способов настройки DNS. Настройте DNS в соответствии с вашим конкретным сценарием использования.
  :::

  Вам нужно направить все поддомены (wildcard) из &quot;DNS name&quot;, полученного на шаге [Получите имя сервиса GCP PSC и DNS-имя](#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect), на IP-адрес конечной точки GCP PSC. Это гарантирует, что сервисы и компоненты в вашей VPC/сети смогут корректно разрешать это имя.

  ### Добавьте PSC Connection ID конечной точки в список разрешений сервиса \{#step-5-add-endpoint-id-allowlist\}

  После того как конечная точка PSC будет создана и ее статус станет &quot;Accepted&quot;, вам нужно добавить PSC Connection ID этой конечной точки в список разрешений для **каждого сервиса ClickHouse**, к которому вы хотите получить доступ через PSC.

  **Свяжитесь со службой поддержки ClickHouse**:

  * Передайте PSC Connection ID конечной точки в службу поддержки ClickHouse
  * Укажите, каким сервисам ClickHouse нужно разрешить доступ с этой конечной точки
  * Служба поддержки ClickHouse добавит PSC Connection ID конечной точки в список разрешений сервиса

  ### Подключитесь к ClickHouse через PSC \{#step-6-connect-via-psc-endpoint\}

  После того как Endpoint Connection IDs будут добавлены в список разрешений, вы сможете подключиться к сервису ClickHouse через конечную точку PSC.

  Формат конечной точки PSC аналогичен публичной конечной точке, но включает поддомен `p`. Например:

  * **Публичная конечная точка**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
  * **Конечная точка PSC**: `h5ju65kv87.p.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
</VerticalStepper>