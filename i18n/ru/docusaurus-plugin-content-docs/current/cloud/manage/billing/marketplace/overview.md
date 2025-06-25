---
slug: /cloud/marketplace/marketplace-billing
title: 'Выставление счетов на услуги Marketplace'
description: 'Подпишитесь на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете подписаться на ClickHouse Cloud через маркетплейсы AWS, GCP и Azure. Это позволяет вам оплачивать ClickHouse Cloud через выставление счетов вашего существующего облачного провайдера.

Вы можете использовать модель оплаты по мере использования (PAYG) или заключить контракт с ClickHouse Cloud через маркетплейс. Выставление счетов будет производиться облачным провайдером, и вы получите один счет-фактуру за все ваши облачные услуги.

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## Часто задаваемые вопросы {#faqs}

### Как я могу убедиться, что моя организация подключена к выставлению счетов через маркетплейс?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Billing**. Вы должны увидеть название маркетплейса и ссылку в разделе **Payment details**.

### Я существующий пользователь ClickHouse Cloud. Что произойдет, если я подпишусь на ClickHouse Cloud через маркетплейс AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Подписка на ClickHouse Cloud через маркетплейс облачного провайдера - это процесс из двух шагов:
1. Сначала вы "подписываетесь" на ClickHouse Cloud на портале маркетплейса облачного провайдера. После завершения подписки нажмите "Pay Now" или "Manage on Provider" (в зависимости от маркетплейса). Это перенаправит вас на ClickHouse Cloud.
2. В Clickhouse Cloud вы можете зарегистрироваться для новой учетной записи или войти с существующей учетной записью. В любом случае для вас будет создана новая организация ClickHouse Cloud, которая связана с выставлением счетов через маркетплейс.

ПРИМЕЧАНИЕ: Ваши существующие услуги и организации от любых предыдущих подписок на ClickHouse Cloud останутся, и они не будут связаны с выставлением счетов через маркетплейс. ClickHouse Cloud позволяет вам использовать одну и ту же учетную запись для управления несколькими организациями, каждая из которых имеет различные счета.

Вы можете переключаться между организациями через меню в левом нижнем углу консоли ClickHouse Cloud.

### Я существующий пользователь ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие услуги выставлялись счетом через маркетплейс?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам нужно будет подписаться на ClickHouse Cloud через маркетплейс облачного провайдера. Как только вы закончите подписку на маркетплейсе и будете перенаправлены на ClickHouse Cloud, у вас будет возможность связать существующую организацию ClickHouse Cloud с выставлением счетов через маркетплейс. С этого момента ваши существующие ресурсы будут выставляться счетом через маркетплейс. 

<Image img={marketplace_signup_and_org_linking} size='md' alt='Подписка на маркетплейс и связывание организаций' border/>

Вы можете подтвердить на странице выставления счетов вашей организации, что выставление счетов теперь связано с маркетплейсом. Пожалуйста, обратитесь в [Поддержку ClickHouse Cloud](https://clickhouse.com/support/program), если у вас возникнут какие-либо проблемы.

:::note
Ваши существующие услуги и организации от любых предыдущих подписок на ClickHouse Cloud останутся и не будут связаны с выставлением счетов через маркетплейс.
:::

### Я подписался на ClickHouse Cloud как пользователь маркетплейса. Как мне отменить подписку?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто прекратить использование ClickHouse Cloud и удалить все существующие услуги ClickHouse Cloud. Несмотря на то, что подписка все еще будет активной, вам не нужно будет ничего платить, так как ClickHouse Cloud не имеет периодических сборов.

Если вы хотите отменить подписку, пожалуйста, перейдите в консоль облачного провайдера и отмените продление подписки там. После окончания подписки все существующие услуги будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не была добавлена, через две недели все существующие услуги будут удалены.

### Я подписался на ClickHouse Cloud как пользователь маркетплейса, а затем отменил подписку. Теперь я хочу снова подписаться, какой процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае, пожалуйста, подпишитесь на ClickHouse Cloud как обычно (см. разделы о подписке на ClickHouse Cloud через маркетплейс).

- Для маркетплейса AWS будет создана новая организация ClickHouse Cloud и связана с маркетплейсом.
- Для маркетплейса GCP ваша старая организация будет вновь активирована.

Если у вас возникнут трудности с реактивацией вашей организации в маркетплейсе, пожалуйста, свяжитесь с [Поддержкой ClickHouse Cloud](https://clickhouse.com/support/program).

### Как мне получить доступ к счету за подписку на услугу ClickHouse Cloud через маркетплейс?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль выставления счетов AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы GCP Marketplace](https://console.cloud.google.com/marketplace/orders) (выберите счет выставления, который вы использовали для подписки)

### Почему даты в отчетах по использованию не совпадают с моим счетом Marketplace?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Выставление счетов в маркетплейсе следует календарному месячному циклу. Например, за использование от 1 декабря до 1 января, счет будет выставлен в период с 3 по 5 января.

Отчеты по использованию ClickHouse Cloud следуют другому циклу выставления счетов, где использование учитывается и отчитается за 30 дней с момента подписки.

Даты использования и выставления счетов будут отличаться, если эти даты не совпадают. Поскольку отчеты по использованию отслеживают использование по дням для данной услуги, пользователи могут полагаться на отчеты для просмотра разбивки затрат.

### Где я могу найти общую информацию о выставлении счетов​? {#where-can-i-find-general-billing-information}

Пожалуйста, смотрите [Обзор выставления счетов](/cloud/manage/billing).

### Есть ли разница в ценах ClickHouse Cloud, оплачивая через маркетплейс облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Нет разницы в ценах между выставлением счетов через маркетплейс и подпиской напрямую с ClickHouse. В любом случае, ваше использование ClickHouse Cloud отслеживается в виде кредитов ClickHouse Cloud (CHCs), которые учитываются одинаково и выставляются в соответствии с этим.

### Могу ли я настроить несколько организаций ClickHouse для выставления счетов на одну учетную запись или подсчет в облачном маркетплейсе (AWS, GCP или Azure)? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

Одна организация ClickHouse может быть настроена только для выставления счетов на одну учетную запись или подсчет в облачном маркетплейсе.

### Если моя организация ClickHouse выставляется по договору о обязательных расходах в облачном маркетплейсе, автоматически ли я перейду на PAYG после исчерпания кредитов? {#automatically-move-to-PAYG-when-running-out-of-credit}

Если ваш контракт о обязательных расходах в маркетплейсе активен и у вас закончатся кредиты, мы автоматически переведем вашу организацию на выставление счетов PAYG. Однако, когда ваш существующий контракт истечет, вам нужно будет связать новый контракт маркетплейса с вашей организацией или перевести вашу организацию на прямое выставление счетов через кредитную карту.
