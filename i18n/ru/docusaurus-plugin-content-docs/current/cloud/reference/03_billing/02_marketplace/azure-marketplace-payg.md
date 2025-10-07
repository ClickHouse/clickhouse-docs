---
'slug': '/cloud/billing/marketplace/azure-marketplace-payg'
'title': 'Azure Marketplace PAYG'
'description': 'Подписывайтесь на ClickHouse Cloud через Azure Marketplace (PAYG).'
'keywords':
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начало работы с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через PAYG (оплата по мере использования) публичное предложение.

## Предварительные условия {#prerequisites}

- Проект Azure, который имеет право на покупку, предоставлен вашим.billing администратором.
- Для подписки на ClickHouse Cloud на Azure Marketplace вы должны войти в систему с учетной записью, которая имеет права на покупку, и выбрать соответствующий проект.

1. Перейдите на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) и найдите ClickHouse Cloud. Убедитесь, что вы вошли в систему, чтобы иметь возможность купить предложение на рынке.

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

2. На странице списка продуктов нажмите **Получить сейчас**.

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

3. На следующем экране вам нужно будет указать имя, адрес электронной почты и информацию о местоположении.

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

4. На следующем экране нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

5. На следующем экране выберите подписку, группу ресурсов и местоположение группы ресурсов. Местоположение группы ресурсов не обязательно должно совпадать с местоположением, где вы планируете развернуть свои услуги на ClickHouse Cloud.

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

6. Вам также нужно будет указать имя для подписки, а также выбрать срок оплаты из доступных вариантов. Вы можете выбрать установку **Периодической оплаты** включенной или выключенной. Если вы установите "выключенной", ваш контракт закончится по истечении срока оплаты, и ваши ресурсы будут демонтированы.

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

7. Нажмите **"Просмотреть + подписаться"**.

8. На следующем экране убедитесь, что всё выглядит правильно, и нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

9. Обратите внимание, что на этом этапе вы подписались на подписку Azure ClickHouse Cloud, но вы еще не настроили свою учетную запись на ClickHouse Cloud. Следующие шаги необходимы и критичны для того, чтобы ClickHouse Cloud мог связаться с вашей подпиской Azure, чтобы ваша оплата производилась корректно через рынок Azure.

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

10. Когда настройка Azure будет завершена, кнопка **Настроить учетную запись сейчас** должна стать активной.

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

11. Нажмите на **Настроить учетную запись сейчас**.

<br />

Вы получите электронное письмо, похожее на то, что указано ниже, с информацией о настройке вашей учетной записи:

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

12. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Как только вы перейдете на ClickHouse Cloud, вы можете войти с существующей учетной записью или зарегистрироваться с новой учетной записью. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов в Azure Marketplace.

13. Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую основную информацию о вашем бизнесе. Смотрите скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud 2" border/>

<br />

Как только вы нажмете **Завершить регистрацию**, вы будете перенаправлены в вашу организацию в ClickHouse Cloud, где вы можете просмотреть экран выставления счетов, чтобы убедиться, что вы оплачиваетесь через Azure Marketplace и можете создать услуги.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

14. Если у вас возникли проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
