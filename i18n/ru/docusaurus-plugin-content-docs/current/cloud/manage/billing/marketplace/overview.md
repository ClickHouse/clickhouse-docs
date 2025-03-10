---
slug: /cloud/marketplace/marketplace-billing
title: Оплата на рынке
description: Подпишитесь на ClickHouse Cloud через рынок AWS, GCP и Azure.
keywords: [aws, azure, gcp, google cloud, marketplace, billing]
---

Вы можете подписаться на ClickHouse Cloud через рынки AWS, GCP и Azure. Это позволяет вам оплачивать ClickHouse Cloud через выставление счетов вашего текущего облачного провайдера.

Вы можете использовать оплату по мере использования (PAYG) или подписаться на контракт с ClickHouse Cloud через рынок. Выставление счетов будет обрабатываться облачным провайдером, и вы получите единый счет за все ваши облачные услуги.

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Коммандированный контракт](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Коммандированный контракт](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Коммандированный контракт](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## Часто задаваемые вопросы {#faqs}

### Как я могу проверить, что моя организация подключена к выставлению счетов на рынке?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Выставление счетов**. Вы должны увидеть название рынка и ссылку в разделе **Детали платежа**.

### Я существующий пользователь ClickHouse Cloud. Что произойдет, когда я подпишусь на ClickHouse Cloud через рынок AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Подписка на ClickHouse Cloud через портал рынка облачного провайдера — это двухэтапный процесс:
1. Сначала вы "подписываетесь" на ClickHouse Cloud на портале рынка облачного провайдера. После завершения подписки вы нажимаете "Оплатить сейчас" или "Управлять у провайдера" (в зависимости от рынка). Это перенаправит вас в ClickHouse Cloud.
2. В ClickHouse Cloud вы либо регистрируетесь для новой учетной записи, либо входите с существующей учетной записью. В любом случае, для вас будет создана новая организация ClickHouse Cloud, связанная с выставлением счетов на рынке.

ПРИМЕЧАНИЕ: Ваши существующие услуги и организации из любых предыдущих подписок ClickHouse Cloud останутся и не будут связаны с выставлением счетов на рынке. ClickHouse Cloud позволяет использовать одну и ту же учетную запись для управления несколькими организациями, каждая из которых имеет разное выставление счетов.

Вы можете переключаться между организациями в меню в левом нижнем углу консоли ClickHouse Cloud.

### Я существующий пользователь ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие услуги выставлялись на рынке?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам нужно будет подписаться на ClickHouse Cloud через рынок облачного провайдера. После завершения подписки на рынке и перенаправления в ClickHouse Cloud у вас будет возможность связать существующую организацию ClickHouse Cloud с выставлением счетов на рынке. С этого момента ваши существующие ресурсы будут выставляться на рынке.

![Подписка на рынок и связывание организаций](https://github.com/user-attachments/assets/a0939007-320b-4b12-9d6d-fd63bce31864)

Вы можете подтвердить на странице выставления счетов организации, что выставление счетов действительно связано с рынком. Пожалуйста, свяжитесь с [службой поддержки ClickHouse Cloud](https://clickhouse.com/support/program), если у вас возникли какие-либо проблемы.

:::note
Ваши существующие услуги и организации из любых предыдущих подписок ClickHouse Cloud останутся и не будут связаны с выставлением счетов на рынке.
:::

### Я подписался на ClickHouse Cloud как пользователь рынка. Как я могу отписаться?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто прекратить использование ClickHouse Cloud и удалить все существующие услуги ClickHouse Cloud. Хотя подписка останется активной, вы не будете ничего платить, так как ClickHouse Cloud не имеет периодических сборов.

Если вы хотите отписаться, пожалуйста, перейдите в консоль облачного провайдера и отмените обновление подписки там. Как только подписка закончится, все существующие услуги будут остановлены, и вас попросят добавить кредитную карту. Если карта не была добавлена, по истечении двух недель все существующие услуги будут удалены.

### Я подписался на ClickHouse Cloud как пользователь рынка, а затем отписался. Теперь я хочу снова подписаться, какой процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае, пожалуйста, подпишитесь на ClickHouse Cloud как обычно (см. разделы о подписке на ClickHouse Cloud через рынок).

- Для рынка AWS будет создана новая организация ClickHouse Cloud и связана с рынком.
- Для рынка GCP ваша старая организация будет реактивирована.

Если у вас возникли проблемы с реактивацией вашей организации на рынке, пожалуйста, свяжитесь с [службой поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

### Как мне получить свой счет за подписку на ClickHouse Cloud через рынок?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль выставления счетов AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы на рынке GCP](https://console.cloud.google.com/marketplace/orders) (выберите счет за выставление счетов, который вы использовали для подписки)

### Почему даты в отчетах о пользовании не совпадают с моим счетом на рынке?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Выставление счетов на рынке следует календарному месячному циклу. Например, для использования с 1 декабря по 1 января счет будет сгенерирован с 3 по 5 января.

Отчеты о пользовании ClickHouse Cloud следуют другому циклу выставления счетов, где использование измеряется и сообщается на протяжении 30 дней, начиная с даты подписки.

Даты использования и выставления счетов будут различаться, если эти даты не совпадают. Поскольку отчеты о пользовании отслеживают использование по дням для данной услуги, пользователи могут полагаться на отчеты, чтобы увидеть разбивку затрат.

### Где я могу найти общую информацию об оплате?​ {#where-can-i-find-general-billing-information}

Пожалуйста, смотрите [Обзор выставления счетов](/cloud/manage/billing).

### Существует ли разница в ценообразовании ClickHouse Cloud, в зависимости от того, оплачиваю ли я через рынок облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Нет разницы в цене между выставлением счетов на рынке и непосредственной подпиской с ClickHouse. В любом случае ваше использование ClickHouse Cloud отслеживается в терминах кредита ClickHouse Cloud (CHC), которые измеряются одинаково и выставляются соответствующим образом.
