export default function servicesHandler() {
	return {
		message: `🛠️ Наши услуги

Создаём AI-решения, которые реально работают

Не просто технологии - инструменты с измеримым эффектом для Вашего бизнеса.

🎯 Наша специализация:

🤖 Чат и голосовые боты - автоматизация общения 24/7
🎭 3D-аватары - виртуальные сотрудники для вашей команды
🎬 AI-контент - генерация видео и креативов
⚙️ Автоматизация - оптимизация процессов на AI
🧠 Custom разработка - уникальные решения под задачу

💼 Работаем со всеми:
От малого бизнеса до enterprise-компаний

⚡️ Результаты наших клиентов:
- Экономия до 70% времени команды
- Снижение расходов до 40 млн ₽/год
- Рост конверсии до 40%
- Обработка тысяч обращений без потери качества

12+ лет опыта • 50+ проектов • Полный цикл разработки

👇 Выберите услугу, чтобы узнать больше:`,
		keyboard: {
			inline: true,
			buttons: [
				[{ action: { type: "callback", label: "🤖 Чат-боты", payload: JSON.stringify({ command: "service_chatbots" }) }, color: "primary" }],
				[{ action: { type: "callback", label: "📞 Голосовые боты", payload: JSON.stringify({ command: "service_voicebots" }) }, color: "primary" }],
				[{ action: { type: "callback", label: "🎭 3D аватары с ИИ", payload: JSON.stringify({ command: "service_avatars" }) }, color: "primary" }],
				// [{ action: { type: "callback", label: "🎨 AI генерация контента", payload: JSON.stringify({ command: "service_content" }) }, color: "primary" }],
				[{ action: { type: "callback", label: "⚙️ Автоматизация процессов", payload: JSON.stringify({ command: "service_automation" }) }, color: "primary" }],
				[{ action: { type: "callback", label: "🔗 Интеграция AI в процессы", payload: JSON.stringify({ command: "service_integration" }) }, color: "primary" }],
				// [{ action: { type: "callback", label: "🧠 Индивидуальная разработка", payload: JSON.stringify({ command: "service_custom" }) }, color: "primary" }],
				// [{ action: { type: "callback", label: "📋 Консультация и аудит", payload: JSON.stringify({ command: "service_audit" }) }, color: "primary" }],
				[{ action: { type: "callback", label: "↩️ Назад", payload: JSON.stringify({ command: "back" }) }, color: "secondary" }],
			],
		},
	};
}
