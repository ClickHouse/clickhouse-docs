---
slug: /cloud/marketplace/marketplace-billing
title: 'Выставление счетов на рынке'
description: 'Подпишитесь на ClickHouse Cloud через рынок AWS, GCP и Azure.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете подписаться на ClickHouse Cloud через рынки AWS, GCP и Azure. Это позволяет вам оплачивать ClickHouse Cloud через выставление счетов вашего существующего облачного провайдера.

Вы можете использовать модель оплаты по факту (PAYG) или заключить контракт с ClickHouse Cloud через рынок. Выставление счетов будет осуществляться облачным провайдером, и вы получите один счет-фактуру за все свои облачные услуги.

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## Часто задаваемые вопросы {#faqs}

### Как я могу проверить, что моя организация подключена к выставлению счетов на рынке?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Выставление счетов**. Вы должны увидеть название рынка и ссылку в разделе **Детали платежа**.

### Я существующий пользователь ClickHouse Cloud. Что произойдет, когда я подпишусь на ClickHouse Cloud через AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Подписка на ClickHouse Cloud через портал облачного провайдера - это двухступенчатый процесс:
1. Сначала вы "подписываетесь" на ClickHouse Cloud на портале рынка облачного провайдера. После завершения подписки вы нажимаете "Оплатить сейчас" или "Управлять на провайдере" (в зависимости от рынка). Это перенаправляет вас на ClickHouse Cloud.
2. На ClickHouse Cloud вы либо регистрируете новую учетную запись, либо входите с существующей учетной записью. В любом случае для вас будет создана новая организация ClickHouse Cloud, связанная с вашим выставлением счетов на рынке.

ПРИМЕЧАНИЕ: Ваши существующие услуги и организации из любых предыдущих подписок ClickHouse Cloud останутся и не будут подключены к выставлению счетов на рынке. ClickHouse Cloud позволяет использовать одну и ту же учетную запись для управления несколькими организациями, каждая из которых имеет разные выставления счетов.

Вы можете переключаться между организациями из меню в нижнем левом углу консоли ClickHouse Cloud.

### Я существующий пользователь ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие услуги выставлялись по счету на рынке?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам необходимо подписаться на ClickHouse Cloud через рынок облачного провайдера. После завершения подписки на рынке и перенаправления на ClickHouse Cloud у вас будет возможность связать существующую организацию ClickHouse Cloud с выставлением счетов на рынке. С этого момента ваши существующие ресурсы будут выставляться по счету через рынок. 

<Image img={marketplace_signup_and_org_linking} size='md' alt='Подписка на рынок и связывание организаций' border/>

Вы можете подтвердить это на странице выставления счетов вашей организации, что выставление счетов теперь связано с рынком. Пожалуйста, свяжитесь с [поддержкой ClickHouse Cloud](https://clickhouse.com/support/program), если у вас возникнут проблемы.

:::note
Ваши существующие услуги и организации из любых предыдущих подписок ClickHouse Cloud останутся и не будут подключены к выставлению счетов на рынке.
:::

### Я подписался на ClickHouse Cloud как пользователь рынка. Как мне отписаться?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто прекратить использование ClickHouse Cloud и удалить все существующие услуги ClickHouse Cloud. Хотя подписка все еще будет активна, вы не будете ничего платить, так как у ClickHouse Cloud нет периодических сборов.

Если вы хотите отписаться, пожалуйста, перейдите в консоль облачного провайдера и отмените там продление подписки. После окончания подписки все существующие услуги будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не была добавлена, через две недели все существующие услуги будут удалены.

### Я подписался на ClickHouse Cloud как пользователь рынка, а затем отписался. Теперь я хочу снова подписаться, какой процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае, пожалуйста, подпишитесь на ClickHouse Cloud как обычно (см. разделы о подписке на ClickHouse Cloud через рынок).

- Для AWS marketplace будет создана новая организация ClickHouse Cloud, которая будет подключена к рынку.
- Для рынка GCP ваша старая организация будет реактивирована.

Если у вас возникнут проблемы с реактивацией вашей организации на рынке, пожалуйста, свяжитесь с [поддержкой ClickHouse Cloud](https://clickhouse.com/support/program).

### Как я могу получить доступ к своему счету за подписку на ClickHouse Cloud через рынок?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль выставления счетов AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы на рынке GCP](https://console.cloud.google.com/marketplace/orders) (выберите счет на оплату, который вы использовали для подписки)

### Почему даты в отчетах о потреблении не совпадают с моим счетом на рынке?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Выставление счетов на рынке следует календарному месячному циклу. Например, для использования с 1 декабря по 1 января счет будет сгенерирован с 3 по 5 января.

Отчеты о потреблении ClickHouse Cloud следуют другому циклу выставления счетов, в котором потребление измеряется и сообщается в течение 30 дней, начиная с момента подписки.

Даты потребления и счета будут различаться, если эти даты не совпадают. Поскольку отчеты о потреблении отслеживают использование по дням для заданной услуги, пользователи могут полагаться на отчеты, чтобы видеть разбивку затрат.

### Где я могу найти общую информацию о выставлении счетов​? {#where-can-i-find-general-billing-information}

Пожалуйста, смотрите [Обзор выставления счетов](/cloud/manage/billing).

### Есть ли разница в цене ClickHouse Cloud при оплате через рынок облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Нет разницы в цене между выставлением счетов на рынке и подпиской напрямую с ClickHouse. В любом случае ваше использование ClickHouse Cloud отслеживается в терминах кредитов ClickHouse Cloud (CHCs), которые измеряются одинаково и выставляются соответственно.
