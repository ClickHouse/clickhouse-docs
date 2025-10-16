---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace Committed Contract'
'description': 'Подпишитесь на ClickHouse Cloud через Azure Marketplace (Committed
  Contract)'
'keywords':
- 'Microsoft'
- 'Azure'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
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

Начните работу с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через коммитированный контракт. Коммитированный контракт, также известный как Частное Предложение, позволяет клиентам обязаться потратить определенную сумму на ClickHouse Cloud в течение определенного времени.

## Предварительные требования {#prerequisites}

- Частное предложение от ClickHouse на основе конкретных условий контракта.

## Шаги для регистрации {#steps-to-sign-up}

1. Вы должны были получить электронное письмо со ссылкой для просмотра и принятия вашего частного предложения.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Электронное письмо частного предложения Azure Marketplace" border/>

<br />

2. Щелкните по ссылке **Просмотреть Частное Предложение** в электронном письме. Это должно перенести вас на вашу страницу GCP Marketplace с деталями частного предложения.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Детали частного предложения Azure Marketplace" border/>

<br />

3. После принятия предложения вы будете перенаправлены на экран **Управление Частным Предложением**. Azure может занять некоторое время для подготовки предложения к покупке.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Страница управления частным предложением Azure Marketplace" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Загрузка страницы управления частным предложением Azure Marketplace" border/>

<br />

4. Через несколько минут обновите страницу. Предложение должно быть готово к **Покупке**.

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Страница управления частным предложением Azure Marketplace доступна для покупки" border/>

<br />

5. Нажмите на **Купить** - вы увидите всплывающее окно. Заполните следующие поля:

<br />

- Подписка и группа ресурсов 
- Укажите имя для подписки SaaS
- Выберите тарифный план, для которого у вас есть частное предложение. Только срок, на который было создано частное предложение (например, 1 год), будет иметь сумму против него. Другие варианты тарифного плана будут для сумм $0. 
- Выберите, хотите ли вы повторяющуюся биллинговую систему или нет. Если повторяющийся биллинг не выбран, контракт закончится в конце расчетного периода, и ресурсы будут объявлены устаревшими.
- Нажмите на **Просмотреть + подписаться**.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Форма подписки Azure Marketplace" border/>

<br />

6. На следующем экране просмотрите все детали и нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Подтверждение подписки Azure Marketplace" border/>

<br />

7. На следующем экране вы увидите **Ваша подписка SaaS в процессе**.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Страница отправки подписки Azure Marketplace" border/>

<br />

8. Когда будет готово, вы можете нажать на **Настроить аккаунт сейчас**. Обратите внимание, что это критический шаг, который связывает подписку Azure с организацией ClickHouse Cloud для вашего аккаунта. Без этого шага ваша подписка на Marketplace не будет завершена.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Кнопка настроить аккаунт сейчас Azure Marketplace" border/>

<br />

9. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрироваться с помощью новой учетной записи, либо войти с помощью существующей учетной записи. После входа будет создана новая организация, готовая к использованию и биллингу через Azure Marketplace.

10. Вам потребуется ответить на несколько вопросов - адрес и данные о компании - прежде чем вы сможете продолжить.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

11. После нажатия на **Завершить регистрацию** вы будете перенаправлены в вашу организацию внутри ClickHouse Cloud, где вы сможете просмотреть экран биллинга, чтобы убедиться, что вас биллируют через Azure Marketplace и вы можете создавать услуги.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

Если у вас возникнут какие-либо проблемы, пожалуйста, не стесняйтесь обращаться к [нашей команде поддержки](https://clickhouse.com/support/program).