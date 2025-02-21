# Schedule for University

## Опис проєкту
**Schedule for University** - це веб-додаток для управління розкладом занять в університеті. Він надає адміністраторам можливість створювати, редагувати та керувати групами, викладачами та розкладом занять. Також він дозволяє студентам та викладачам переглядати свій розклад.

## Проблема та рішення
Університети часто стикаються з труднощами у складанні та управлінні розкладом занять, що призводить до конфліктів у графіку та незручностей для студентів і викладачів. Мій університет не став виключенням(<br/>Тому я захотів виправити цю ситуацію і створив **Schedule for University**, який автоматизує цей процес, зменшує кількість помилок та заощаджує час адміністрації.
За основну ідею було взято розклад мого факультету:
![image](https://github.com/user-attachments/assets/2a97c5b8-713b-4066-b81d-49f7207a47b4)
<br/>
Я вирішив залишити ключові аспекти оформлення розкладу, проте, додати зрозумілий користувачу інтерфейс та підвищити загальну швидкість і зручність створення розкладу.

## Основні можливості
- 📌 **Додавання, редагування та видалення** груп, викладачів та занять.
- 📅 **Перегляд розкладу** для різних курсів та типів тижнів (парний/непарний).
- 🔍 **Пошук груп і викладачів** для швидкого доступу до їхнього розкладу.
- ⚠ **Автоматичне визначення конфліктів** у розкладі.
- 👥 **Можливість додавання занять з кількома викладачами та групами.**
- ⏳ **Відображення вільних годин викладачів** для зручного планування.

## Технології
- **Мови програмування:** C#, JavaScript
- **Бекенд:** ASP.NET Core
- **База даних:** Microsoft SQL Server
- **ORM:** Entity Framework Core

## Документація та приклади
### База даних має наступну структуру
![image](https://github.com/user-attachments/assets/47eb4a42-6137-4f49-8a5d-962e2c026374)

---
## 📌 Моделі даних  

### 🎓 [Group](Schedule_for_Un/Models/Group.cs) — Група студентів  
Представляє групу студентів та містить такі поля:  
- 🆔 `Id` — Унікальний ідентифікатор групи.  
- 🏷️ `Name` — Назва групи.  
- 📚 `Course` — Курс, на якому навчається група.  
- 🎓 `Specialty` — Спеціальність групи.  
- 📅 `GroupLessons` — Колекція занять, які відвідує група.  

---

### 👨‍🏫 [Teacher](Schedule_for_Un/Models/Teacher.cs) — Викладач  
Представляє викладача та містить такі поля:  
- 🆔 `Id` — Унікальний ідентифікатор викладача.  
- ✍️ `FullName` — Повне ім'я викладача (Прізвище І. Б.).  
- 🎖️ `Position` — Посада викладача (асистент, доцент, професор).  
- 🕒 `FreeHours` — Колекція вільних годин викладача.  
- 📅 `TeacherLessons` — Колекція занять, які веде викладач.  

---

### 📖 [Lesson](Schedule_for_Un/Models/Lesson.cs) — Заняття  
Представляє окреме заняття та містить такі поля:  
- 🆔 `Id` — Унікальний ідентифікатор заняття.  
- 📆 `Day` — Номер дня тижня, коли проводиться заняття.  
- ⏰ `NumberOfPair` — Номер пари (час проведення заняття).  
- 📖 `Subject` — Назва предмету.  
- ⏳ `HoursOfSubject` — Кількість годин предмету.  
- 📌 `HoursOfConsultation` — Кількість годин консультацій (якщо є).  
- ❓ `HaveConsultation` — Чи є консультації.  
- 🏛️ `IsLecture` — Чи є заняття лекційним (`true` - лекція, `false` - практика).  
- 🔄 `IsEvenWeek` — Чи проводиться заняття на парному тижні (`true` - парний, `false` - непарний, `null` - проводиться завжди). 
- 🎓 `GroupLessons` — Колекція груп, які відвідують заняття.  
- 👨‍🏫 `TeacherLessons` — Колекція викладачів, які ведуть заняття.  
- ⏳ `FreeHours` — Колекція вільних годин, пов'язаних із заняттям.  

---

### 🔗 [TeacherLesson](Schedule_for_Un/Models/TeacherLesson.cs) та [GroupLesson](Schedule_for_Un/Models/GroupLesson.cs)  
Ці моделі є зв’язковими таблицями для зв’язку "багато до багатьох" між викладачами, групами та заняттями.  

---

### 🕒 [FreeHour](Schedule_for_Un/Models/FreeHour.cs) — Вільний час викладача  
Ця модель представляє часові слоти викладачів і містить такі поля:  
- 🆔 `Id` — Унікальний ідентифікатор вільного часу.  
- 📆 `Day` — Номер дня тижня.  
- ⏰ `NumberOfPair` — Номер пари (час).  
- ✅ `IsFree` — Чи є цей час вільним.  
- 👨‍🏫 `TeacherId` — Ідентифікатор викладача.  
- 📖 `LessonId` — Ідентифікатор заняття (якщо час зайнятий).
---

## Приклади інтерфейсу

### Початковий екран
![image](https://github.com/user-attachments/assets/28422c1d-c8a0-43e3-a2e0-f4831c1be823)

---
### Вікна додавання, редагування та видалення групи
![image](https://github.com/user-attachments/assets/a946236c-079c-4be2-b20e-033a1f569393)
![image](https://github.com/user-attachments/assets/7228a2bd-a649-4d12-9c76-d80e367a61a7)
![image](https://github.com/user-attachments/assets/dfeaeb0e-5905-4e26-8f3c-a4c620832a81)


---
### Вікна додавання, редагування та видалення викладачів
![image](https://github.com/user-attachments/assets/ec0fd1e7-823c-4f6a-9684-d168f9e372df)
![image](https://github.com/user-attachments/assets/85488c1e-f6b5-456b-a6de-2dbf27d4c6f9)
![image](https://github.com/user-attachments/assets/e76dde64-6d25-47e4-bdd1-88a43f48cd8d)

---
### Вікно додавання заняття, викликається при натисненні на вільну клітинку розклада і за наявності вільних викладачів на цей час, а також вікна редагування та видалення
![image](https://github.com/user-attachments/assets/57f6b192-287f-4031-8275-b4b485eec01f)
![image](https://github.com/user-attachments/assets/9b540dc8-a86b-4843-939e-89c7b13f4349)
![image](https://github.com/user-attachments/assets/3972db9a-c381-4a02-b80c-a10b82890497)

---
### Пошук груп та викладачів
<p align="center">
  <img src="https://github.com/user-attachments/assets/5894a18a-0b51-4117-98e2-de1f45537188" width="300" height="600"/>
</p>

---
### Взаємодія з сутностями відбувається при наведенні курсору на них

<p align="center">
    <img src="https://github.com/user-attachments/assets/c6728913-152e-4a57-bb90-cac3f15b3564" width="300" height="600" />
    <img src="https://github.com/user-attachments/assets/010dcfc0-d53b-4c67-9418-c4ff3928d2c6" width="300" height="600" />
</p>

![image](https://github.com/user-attachments/assets/ad727644-76a4-4736-a6bf-224a8f87580e)

---

## Статистика по проєкту

![GitHub repo size](https://img.shields.io/github/repo-size/VialtsevOleksandr/Schedule-for-university)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/VialtsevOleksandr/Schedule-for-university)
![GitHub last commit](https://img.shields.io/github/last-commit/VialtsevOleksandr/Schedule-for-university)

---

## 🚀 План розвитку (Roadmap)

### 1️⃣ Оптимізація продуктивності  
✔ **Кешування даних** (`Redis`, `Entity Framework Caching`) для зменшення запитів до бази  
✔ **Lazy Loading & Server-Side Rendering** для швидшого рендерингу інтерфейсу  
✔ **Фонові завдання (Hangfire)** — автоматичне оновлення розкладу без навантаження на основний потік  

---

### 2️⃣ Інтеграція AI та автоматизація  
✔ **LLM (GPT, LLama 3) для аналізу та генерації розкладу**  
✔ **Розумний пошук**: "Коли наступна лекція у Івана Петровича?"   
✔ **Prompt Engineering** для інтерактивної взаємодії  

---

### 3️⃣ API та зовнішні інтеграції  
✔ **Telegram Bot API** — сповіщення про зміни у розкладі  
✔ **Google Calendar API** — автоматична синхронізація занять  
✔ **OAuth 2.0 / Telegram Login** для швидкої авторизації  

---

### 4️⃣ UI/UX Покращення  
✔ **Drag & Drop редагування розкладу**  
✔ **PWA (Progressive Web App)** для мобільної версії  
✔ **Темна тема та персоналізація**  

---

### 5️⃣ DevOps та деплоймент  
✔ **Docker + Kubernetes** для розгортання  
✔ **CI/CD (GitHub Actions)** для автоматичного деплою 

---

## Контакти
👤 **Автор:** [Vialtsev Oleksandr](https://github.com/VialtsevOleksandr)

