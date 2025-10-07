---
'slug': '/cloud/marketplace/marketplace-billing'
'title': 'Маркетплейс Выписка'
'description': 'Подписывайтесь на ClickHouse Cloud через маркетплейс AWS, GCP и Azure.'
'keywords':
- 'aws'
- 'azure'
- 'gcp'
- 'google cloud'
- 'marketplace'
- 'billing'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

Вы можете подписаться на ClickHouse Cloud через рынки AWS, GCP и Azure. Это позволяет вам оплачивать ClickHouse Cloud через существующую биллинг-систему вашего облачного провайдера.

Вы можете использовать модель оплаты по мере использования (PAYG) или подписаться на контракт с ClickHouse Cloud через рынок. Биллинг будет обрабатываться облачным провайдером, и вы получите единственный счет за все ваши облачные услуги.

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## Часто задаваемые вопросы {#faqs}

### Как я могу проверить, что моя организация подключена к биллингу рынка?​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

В консоли ClickHouse Cloud перейдите в раздел **Биллинг**. Вы должны увидеть название рынка и ссылку в разделе **Детали платежа**.

### Я являюсь существующим пользователем ClickHouse Cloud. Что произойдет, если я подпишусь на ClickHouse Cloud через рынок AWS / GCP / Azure?​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

Подписка на ClickHouse Cloud через портал рынка облачного провайдера состоит из двух этапов:
1. Сначала вы "подписываетесь" на ClickHouse Cloud на портале рынка облачных провайдеров. После завершения подписки вы нажимаете "Оплатить сейчас" или "Управлять у Провайдера" (в зависимости от рынка). Это перенаправляет вас на ClickHouse Cloud.
2. В ClickHouse Cloud вы либо регистрируетесь для новой учетной записи, либо входите с существующей учетной записью. В любом случае для вас будет создана новая организация ClickHouse Cloud, которая связана с вашим биллингом рынка.

ПРИМЕЧАНИЕ: Ваши существующие услуги и организации от предыдущих подписок ClickHouse Cloud останутся и не будут связаны с биллингом рынка. ClickHouse Cloud позволяет вам использовать одну и ту же учетную запись для управления несколькими организациями, каждая из которых имеет разный биллинг.

Вы можете переключаться между организациями из меню в нижнем левом углу консоли ClickHouse Cloud.

### Я являюсь существующим пользователем ClickHouse Cloud. Что мне делать, если я хочу, чтобы мои существующие услуги были оплачены через рынок?​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

Вам нужно подписаться на ClickHouse Cloud через рынок облачного провайдера. После завершения подписки на рынке и перенаправления на ClickHouse Cloud у вас будет возможность связать существующую организацию ClickHouse Cloud с биллингом рынка. С этого момента ваши существующие ресурсы будут оплачены через рынок.

<Image img={marketplace_signup_and_org_linking} size='md' alt='Подписка на рынок и связывание организации' border/>

Вы можете подтвердить на странице биллинга организации, что биллинг действительно связан с рынком. Пожалуйста, свяжитесь с [службой поддержки ClickHouse Cloud](https://clickhouse.com/support/program), если у вас возникнут какие-либо проблемы.

:::note
Ваши существующие услуги и организации от предыдущих подписок ClickHouse Cloud останутся и не будут связаны с биллингом рынка.
:::

### Я подписался на ClickHouse Cloud как пользователь рынка. Как я могу отписаться?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

Обратите внимание, что вы можете просто перестать использовать ClickHouse Cloud и удалить все существующие услуги ClickHouse Cloud. Несмотря на то, что подписка останется активной, вы ничего не будете платить, так как ClickHouse Cloud не имеет регулярных платежей.

Если вы хотите отписаться, перейдите в консоль облачного провайдера и отмените продление подписки там. После окончания подписки все существующие услуги будут остановлены, и вам будет предложено добавить кредитную карту. Если карта не была добавлена, через две недели все существующие услуги будут удалены.

### Я подписался на ClickHouse Cloud как пользователь рынка, а затем отписался. Теперь я хочу снова подписаться, какой процесс?​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

В этом случае, пожалуйста, подпишитесь на ClickHouse Cloud, как обычно (см. разделы о подписке на ClickHouse Cloud через рынок).

- Для рынка AWS будет создана новая организация ClickHouse Cloud, и она будет связана с рынком.
- Для рынка GCP ваша старая организация будет восстановлена.

Если у вас возникли проблемы с восстановлением вашей организации на рынке, пожалуйста, свяжитесь с [сервисом поддержки ClickHouse Cloud](https://clickhouse.com/support/program).

### Как мне получить доступ к моему счету за подписку на сервис ClickHouse Cloud через рынок?​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [Консоль выставления счетов AWS](https://us-east-1.console.aws.amazon.com/billing/home)
- [Заказы на рынке GCP](https://console.cloud.google.com/marketplace/orders) (выберите счет выставления счетов, который вы использовали для подписки)

### Почему даты на отчетах по использованию не совпадают с моим счетом на рынке?​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Биллинг рынка следует календарному месячному циклу. Например, за использование с 1 декабря по 1 января счет будет сгенерирован с 3 по 5 января.

Отчеты по использованию ClickHouse Cloud следуют другому циклу биллинга, в котором использование измеряется и определяется за 30 дней, начиная с даты подписки.

Даты использования и счета будут отличаться, если эти даты не совпадают. Поскольку отчеты по использованию отслеживают использование по дням для данной услуги, пользователи могут полагаться на отчеты для получения детализированной информации о затратах.

### Где я могу найти общую информацию о биллинге?​ {#where-can-i-find-general-billing-information}

Пожалуйста, ознакомьтесь со [страницей обзора биллинга](/cloud/manage/billing).

### Есть ли разница в ценах на ClickHouse Cloud, если платить через рынок облачного провайдера или напрямую ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

Нет разницы в ценах между биллингом на рынке и подпиской напрямую с ClickHouse. В любом случае, ваше использование ClickHouse Cloud отслеживается в терминах кредитов ClickHouse Cloud (CHC), которые измеряются одинаковым образом и выставляются счетом соответственно.

### Могу ли я настроить несколько организаций ClickHouse для биллинга на одну учетную запись или подсчет облачного рынка (AWS, GCP или Azure)? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

Одна организация ClickHouse может быть настроена лишь для биллинга на одну учетную запись или подсчет облачного рынка.

### Если моя организация ClickHouse оплачивается через согласие на обязательные расходы на рынке, буду ли я автоматически переведен на биллинг PAYG, когда у меня закончатся кредиты? {#automatically-move-to-PAYG-when-running-out-of-credit}

Если ваш контракт на обязательные расходы на рынке активен и у вас закончатся кредиты, мы автоматически переведем вашу организацию на биллинг PAYG. Однако, когда ваш существующий контракт истечет, вам нужно будет связать новый контракт рынка с вашей организацией или перевести вашу организацию на прямую оплату через кредитную карту.