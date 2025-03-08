---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: Обязательный контракт Azure Marketplace
description: Подпишитесь на ClickHouse Cloud через Azure Marketplace (обязательный контракт)
keywords: [Microsoft, Azure, marketplace, billing, committed, committed contract]
---

import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через обязательный контракт. Обязательный контракт, также известный как Частное предложение, позволяет клиентам обязаться потратить определенную сумму на ClickHouse Cloud в течение определенного периода времени.


## Предварительные требования {#prerequisites}

- Частное предложение от ClickHouse на основе специфических условий контракта.

## Шаги для подписки {#steps-to-sign-up}

1. Вы должны были получить электронное письмо с ссылкой для ознакомления и принятия вашего частного предложения.

<br />

<img src={azure_marketplace_committed_1}
    alt='Электронное письмо с частным предложением Azure Marketplace'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. Нажмите на ссылку **Посмотреть частное предложение** в письме. Это должно перенаправить вас на вашу страницу GCP Marketplace с деталями частного предложения.

<br />

<img src={azure_marketplace_committed_2}
    alt='Детали частного предложения Azure Marketplace'
    class='image'
    style={{width: '600px'}}
/>

<br />

3. После того как вы примете предложение, вы попадете на экран **Управление частным предложением**. Azure может занять некоторое время для подготовки предложения к покупке.

<br />

<img src={azure_marketplace_committed_3}
    alt='Страница управления частным предложением Azure Marketplace'
    class='image'
    style={{width: '600px'}}
/>

<br />

<img src={azure_marketplace_committed_4}
    alt='Загрузка страницы управления частным предложением Azure Marketplace'
    class='image'
    style={{width: '600px'}}
/>

<br />

4. Через несколько минут обновите страницу. Предложение должно быть готово к **Покупке**.

<br />

<img src={azure_marketplace_committed_5}
    alt='Страница управления частным предложением Azure Marketplace, покупка доступна'
    class='image'
    style={{width: '500px'}}
/>

<br />

5. Нажмите на **Купить** - вы увидите открывающееся окно. Заполните следующее:

<br />

- Подписка и группа ресурсов 
- Укажите имя для подписки SaaS
- Выберите план выставления счетов, на который у вас есть частное предложение. Только срок, на который было создано частное предложение (например, 1 год), будет иметь указанную сумму. Другие варианты сроков выставления счета будут указаны с суммами $0. 
- Выберите, требуется ли вам периодическая оплата. Если периодическая оплата не выбрана, контракт закончится в конце расчетного периода, и ресурсы будут помечены как выведенные из эксплуатации.
- Нажмите на **Просмотр + подписка**.

<br />

<img src={azure_marketplace_committed_6}
    alt='Форма подписки Azure Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. На следующем экране проверьте все детали и нажмите **Подписаться**.

<br />

<img src={azure_marketplace_committed_7}
    alt='Подтверждение подписки Azure Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. На следующем экране вы увидите **Ваша подписка SaaS в процессе**.

<br />

<img src={azure_marketplace_committed_8}
    alt='Страница отправки подписки Azure Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

8. Как только все будет готово, вы можете нажать на **Настроить аккаунт сейчас**. Обратите внимание, что это критически важный шаг, который связывает подписку Azure с организацией ClickHouse Cloud для вашей учетной записи. Без этого шага ваша подписка на Marketplace не завершена.

<br />

<img src={azure_marketplace_committed_9}
    alt='Кнопка "настроить аккаунт сейчас" Azure Marketplace'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрироваться, используя новую учетную запись, либо войти с помощью существующей учетной записи. После входа будет создана новая организация, готовая к использованию и выставлению счета через Azure Marketplace.

10. Вам необходимо будет ответить на несколько вопросов - адрес и данные компании - перед тем, как вы сможете продолжить.

<br />

<img src={aws_marketplace_payg_8}
    alt='Форма информации о регистрации в ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
/>

<br />

<img src={aws_marketplace_payg_9}
    alt='Форма информации о регистрации в ClickHouse Cloud 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

11. После того как вы нажмете **Завершить регистрацию**, вы попадете в вашу организацию в ClickHouse Cloud, где сможете просмотреть экран выставления счета, чтобы убедиться, что вам выставляют счет через Azure Marketplace, и сможете создать услуги.

<br />

<br />

<img src={azure_marketplace_payg_11}
    alt='Форма информации о регистрации в ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

<img src={azure_marketplace_payg_12}
    alt='Форма информации о регистрации в ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
/>

<br />

Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
