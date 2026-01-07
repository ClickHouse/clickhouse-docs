---
slug: /cloud/marketplace/marketplace-billing
title: 'Выставление счетов в Marketplace'
description: 'Оформляйте подписку на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'маркетплейс', 'оплата']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете оформить подписку на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure. Это позволит оплачивать ClickHouse Cloud через существующую систему биллинга вашего облачного провайдера.

Вы можете использовать модель оплаты по мере использования (pay-as-you-go, PAYG) или заключить контракт с ClickHouse Cloud через маркетплейс. Биллинг будет осуществляться облачным провайдером, и вы будете получать единый счёт за все ваши облачные сервисы.

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [Контракт с фиксированными обязательствами в AWS Marketplace](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [Контракт с фиксированными обязательствами в GCP Marketplace](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Контракт с фиксированными обязательствами в Azure Marketplace](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## Часто задаваемые вопросы {#faqs}

### Как я могу проверить, что моя организация подключена к биллингу через маркетплейс?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Billing**. В блоке **Payment details** вы должны увидеть название маркетплейса и ссылку.

### Я уже использую ClickHouse Cloud. Что произойдет, если я оформлю подписку на ClickHouse Cloud через маркетплейс AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Регистрация в ClickHouse Cloud через маркетплейс облачного провайдера — это двухэтапный процесс:
1. Сначала вы «оформляете подписку» на ClickHouse Cloud на портале маркетплейса облачного провайдера. После завершения оформления подписки нажмите «Pay Now» или «Manage on Provider» (в зависимости от маркетплейса). Вас перенаправит в ClickHouse Cloud.
2. В ClickHouse Cloud вы либо регистрируете новый аккаунт, либо входите с существующим аккаунтом. В любом случае для вас будет создана новая организация ClickHouse Cloud, привязанная к вашему биллингу через маркетплейс.

ПРИМЕЧАНИЕ: Ваши существующие сервисы и организации из любых предыдущих регистраций в ClickHouse Cloud сохранятся и не будут подключены к биллингу через маркетплейс. ClickHouse Cloud позволяет использовать один и тот же аккаунт для управления несколькими организациями, каждая с отдельным биллингом.

Вы можете переключаться между организациями через меню в левом нижнем углу консоли ClickHouse Cloud.

### Я уже использую ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие сервисы оплачивались через маркетплейс?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам нужно оформить подписку на ClickHouse Cloud через маркетплейс облачного провайдера. После того как вы завершите оформление подписки на маркетплейсе и будете перенаправлены в ClickHouse Cloud, у вас будет возможность привязать существующую организацию ClickHouse Cloud к биллингу через маркетплейс. С этого момента ваши существующие ресурсы будут оплачиваться через маркетплейс. 

<Image img={marketplace_signup_and_org_linking} size='md' alt='Регистрация через маркетплейс и привязка организации' border/>

Вы можете убедиться на странице биллинга организации, что биллинг действительно привязан к маркетплейсу. Если у вас возникнут какие-либо проблемы, пожалуйста, обратитесь в [службу поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

:::note
Ваши существующие сервисы и организации из любых предыдущих регистраций в ClickHouse Cloud сохранятся и не будут подключены к биллингу через маркетплейс.
:::

### Я оформил подписку на ClickHouse Cloud как пользователь маркетплейса. Как я могу отписаться?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто прекратить использование ClickHouse Cloud и удалить все существующие сервисы ClickHouse Cloud. Даже если подписка формально останется активной, вы не будете ничего платить, так как в ClickHouse Cloud нет регулярных платежей.

Если вы хотите отписаться, перейдите в консоль облачного провайдера и отмените продление подписки там. После окончания подписки все существующие сервисы будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не будет добавлена, через две недели все существующие сервисы будут удалены.

### Я оформил подписку на ClickHouse Cloud как пользователь маркетплейса, затем отписался. Теперь хочу оформить подписку снова — каков процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае, пожалуйста, оформите подписку на ClickHouse Cloud обычным образом (см. разделы о подписке на ClickHouse Cloud через маркетплейс).

- Для маркетплейса AWS будет создана новая организация ClickHouse Cloud и привязана к маркетплейсу.
- Для маркетплейса GCP ваша старая организация будет повторно активирована.

Если у вас возникнут сложности с повторной активацией вашей организации в маркетплейсе, пожалуйста, обратитесь в [службу поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

### Как мне получить доступ к счету за мою подписку на сервис ClickHouse Cloud через маркетплейс?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль биллинга AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы в GCP Marketplace](https://console.cloud.google.com/marketplace/orders) (выберите платежный аккаунт, который вы использовали при оформлении подписки)

### Почему даты в отчетах об использовании не совпадают с датами в счете маркетплейса?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Биллинг маркетплейса привязан к календарному месяцу. Например, для использования в период с 1 декабря по 1 января счет будет сгенерирован в промежутке с 3 по 5 января.

Отчеты об использовании ClickHouse Cloud формируются по другому циклу биллинга: учет и отчетность по использованию ведутся за 30 дней, начиная с даты регистрации.

Даты в отчетах об использовании и в счетах будут различаться, если эти даты не совпадают. Поскольку отчеты об использовании показывают потребление по дням для конкретного сервиса, вы можете опираться на них для детального анализа затрат.

### Где я могу найти общую информацию о биллинге? {#where-can-i-find-general-billing-information}

См. [страницу обзора биллинга](/cloud/manage/billing).

### Есть ли разница в стоимости ClickHouse Cloud при оплате через маркетплейс облачного провайдера или напрямую в ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Разницы в стоимости между биллингом через маркетплейс и прямой регистрацией в ClickHouse нет. В любом случае ваше использование ClickHouse Cloud измеряется в ClickHouse Cloud Credits (CHC), которые учитываются одинаковым образом и, соответственно, выставляются в счете.

### Могу ли я настроить несколько ClickHouse Organizations для выставления счетов на одну учетную запись облачного маркетплейса (AWS, GCP или Azure)? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

Да. Несколько организаций ClickHouse можно настроить так, чтобы их потребление с постоплатой (по факту использования) выставлялось на одну и ту же учетную запись облачного маркетплейса (AWS, GCP или Azure). Однако предоплаченные кредиты по умолчанию не распределяются между организациями. Если вам нужно разделять кредиты между организациями, обратитесь в [службу поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

### Если моя ClickHouse Organization обслуживается по соглашению о фиксированном объёме расходов через маркетплейс облачного провайдера, буду ли я автоматически переведён на тарификацию PAYG при исчерпании кредитов? {#automatically-move-to-PAYG-when-running-out-of-credit}

Если ваш контракт на фиксированный объём расходов через маркетплейс активен и вы исчерпали кредиты, мы автоматически переведём вашу организацию на тарификацию PAYG (оплата по мере использования). Однако, когда ваш текущий контракт истечёт, вам потребуется привязать к организации новый контракт маркетплейса или перевести вашу организацию на прямой биллинг с оплатой по кредитной карте. 