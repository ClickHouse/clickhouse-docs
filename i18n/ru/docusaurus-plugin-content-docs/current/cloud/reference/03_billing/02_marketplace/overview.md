---
slug: /cloud/marketplace/marketplace-billing
title: 'Выставление счетов в Marketplace'
description: 'Оформляйте подписку на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете оформить подписку на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure. Это позволяет оплачивать ClickHouse Cloud через существующую систему биллинга вашего облачного провайдера.

Вы можете использовать модель оплаты по мере потребления (pay-as-you-go, PAYG) или заключить контракт на использование ClickHouse Cloud через маркетплейс. Биллинг будет осуществляться облачным провайдером, и вы будете получать единый счет за все ваши облачные сервисы.

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## Часто задаваемые вопросы {#faqs}

### Как проверить, что моя организация подключена к оплате через маркетплейс?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Billing**. В разделе **Payment details** вы увидите название маркетплейса и ссылку.

### Я уже использую ClickHouse Cloud. Что произойдет, если я подпишусь на ClickHouse Cloud через маркетплейс AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Регистрация в ClickHouse Cloud через маркетплейс облачного провайдера состоит из двух этапов:

1. Сначала вы оформляете подписку на ClickHouse Cloud на портале маркетплейса облачного провайдера. После завершения оформления подписки нажмите «Pay Now» или «Manage on Provider» (в зависимости от маркетплейса). Вы будете перенаправлены в ClickHouse Cloud.
2. В ClickHouse Cloud вы либо регистрируете новую учетную запись, либо входите с существующей. В любом случае для вас будет создана новая организация ClickHouse Cloud, привязанная к оплате через маркетплейс.

ПРИМЕЧАНИЕ: Ваши существующие сервисы и организации из предыдущих регистраций в ClickHouse Cloud сохранятся и не будут подключены к оплате через маркетплейс. ClickHouse Cloud позволяет использовать одну учетную запись для управления несколькими организациями, каждая из которых имеет собственную систему оплаты.

Переключаться между организациями можно через меню в левом нижнем углу консоли ClickHouse Cloud.

### Я уже использую ClickHouse Cloud. Что делать, если я хочу, чтобы мои существующие сервисы оплачивались через маркетплейс?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам необходимо оформить подписку на ClickHouse Cloud через маркетплейс облачного провайдера. После завершения оформления подписки на маркетплейсе и перенаправления в ClickHouse Cloud у вас будет возможность привязать существующую организацию ClickHouse Cloud к оплате через маркетплейс. С этого момента ваши существующие ресурсы будут оплачиваться через маркетплейс.

<Image
  img={marketplace_signup_and_org_linking}
  size='md'
  alt='Регистрация в маркетплейсе и привязка организации'
  border
/>

На странице биллинга организации вы можете убедиться, что оплата действительно привязана к маркетплейсу. Если у вас возникнут какие-либо проблемы, обратитесь в [службу поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

:::note
Ваши существующие сервисы и организации из предыдущих регистраций в ClickHouse Cloud сохранятся и не будут подключены к оплате через маркетплейс.
:::

### Я оформил подписку на ClickHouse Cloud как пользователь маркетплейса. Как отменить подписку?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто прекратить использование ClickHouse Cloud и удалить все существующие сервисы ClickHouse Cloud. Даже если подписка останется активной, вы ничего не будете платить, поскольку ClickHouse Cloud не взимает регулярных платежей.

Если вы хотите отменить подписку, перейдите в консоль облачного провайдера и отмените продление подписки. После окончания срока действия подписки все существующие сервисы будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не будет добавлена, через две недели все существующие сервисы будут удалены.

### Я оформил подписку на ClickHouse Cloud как пользователь маркетплейса, а затем отменил её. Теперь я хочу подписаться снова — каков процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае оформите подписку на ClickHouse Cloud как обычно (см. разделы об оформлении подписки на ClickHouse Cloud через маркетплейс).

- Для маркетплейса AWS будет создана новая организация ClickHouse Cloud и подключена к маркетплейсу.
- Для маркетплейса GCP ваша прежняя организация будет реактивирована.

Если у вас возникнут проблемы с реактивацией организации в маркетплейсе, обратитесь в [службу поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

### Как получить доступ к счету за подписку на сервис ClickHouse Cloud через маркетплейс?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль биллинга AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы GCP Marketplace](https://console.cloud.google.com/marketplace/orders) (выберите биллинговый аккаунт, который вы использовали для подписки)

### Почему даты в отчетах об использовании не совпадают с датами в счете из маркетплейса?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Оплата через маркетплейс следует календарному месячному циклу. Например, за использование с 1 декабря по 1 января счет будет сформирован в период с 3 по 5 января.


Отчеты об использовании ClickHouse Cloud следуют отдельному расчетному циклу, в котором потребление измеряется и отражается за 30 дней, начиная с даты регистрации.

Даты использования и выставления счетов будут различаться, если они не совпадают. Поскольку отчеты об использовании отслеживают потребление по дням для каждого сервиса, пользователи могут использовать их для просмотра детализации расходов.

### Где найти общую информацию о биллинге? {#where-can-i-find-general-billing-information}

См. [страницу обзора биллинга](/cloud/manage/billing).

### Есть ли разница в ценах на ClickHouse Cloud при оплате через маркетплейс облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Разницы в ценах между биллингом через маркетплейс и прямой регистрацией в ClickHouse нет. В любом случае использование ClickHouse Cloud отслеживается в единицах ClickHouse Cloud Credits (CHC), которые измеряются одинаково и тарифицируются соответствующим образом.

### Могу ли я настроить несколько организаций ClickHouse для выставления счетов на один биллинговый аккаунт или субаккаунт маркетплейса облачного провайдера (AWS, GCP или Azure)? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

Одна организация ClickHouse может быть настроена для выставления счетов только на один биллинговый аккаунт или субаккаунт маркетплейса облачного провайдера.

### Если моя организация ClickHouse оплачивается через соглашение о гарантированных расходах маркетплейса облачного провайдера, автоматически ли я перейду на биллинг PAYG при исчерпании кредитов? {#automatically-move-to-PAYG-when-running-out-of-credit}

Если ваш контракт с гарантированными расходами маркетплейса активен и у вас заканчиваются кредиты, мы автоматически переведем вашу организацию на биллинг PAYG. Однако при истечении срока действия текущего контракта вам потребуется привязать новый контракт маркетплейса к вашей организации или перевести организацию на прямой биллинг через кредитную карту.
