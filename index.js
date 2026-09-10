const VK_API_URL = "https://api.vk.com/method/messages.send";
const VK_EVENT_ANSWER_URL = "https://api.vk.com/method/messages.sendMessageEventAnswer";
const VK_API_VERSION = "5.199";

import aboutHandler from "./handlers/about.js";
import servicesHandler from "./handlers/services.js";
import portfolioHandler from "./handlers/portfolio.js";
import managerHandler from "./handlers/manager.js";
import reviewsHandler from "./handlers/reviews.js";

const buttonHandlers = {
	about: aboutHandler,
	services: servicesHandler,
	portfolio: portfolioHandler,
	manager: managerHandler,
	reviews: reviewsHandler,
};
const MANAGER_PEER_ID = "-239062581";
const MANAGER_WAITING_TTL = 1800;

export default {
	async fetch(request, env, ctx) {
		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405 });
		}

		let update;
		try {
			update = await request.json();
		} catch {
			return new Response("Bad Request", { status: 400 });
		}

		if (update.type === "confirmation") {
			return new Response(env.VK_CONFIRMATION_CODE);
		}

		if (update.secret !== env.VK_SECRET) {
			return new Response("Forbidden", { status: 403 });
		}

		if (update.type === "message_new" && update.object?.message?.text) {
			const message = update.object.message;
			ctx.waitUntil(registerUser(message.from_id, env));

			if (await consumeManagerWaiter(message, env)) {
				ctx.waitUntil(forwardManagerMessage(message.text, env));
			} else {
				ctx.waitUntil(sendWelcome(message, env));
			}
		}

		if (update.type === "message_event") {
			ctx.waitUntil(registerUser(update.object.user_id, env));
			ctx.waitUntil(handleButtonEvent(update.object, env));
		}

		return new Response("ok");
	},
};

async function sendWelcome(message, env) {
	await sendMessage(message.peer_id, `⚡️ Neuron_AI | Ваш AI-партнер в цифровой трансформации

Мы превращаем Искусственный Интеллект в реальные бизнес-результаты

Что мы создаем:

🤖 Умные боты
- Чат-боты для мессенджеров и сайтов
- Голосовые ассистенты для автоматизации звонков
- Интеграция с Вашими системами

🎭 3D-аватары с AI
- Виртуальные консультанты
- AI-презентеры для видео
- Цифровые сотрудники

⚙️ Бизнес-автоматизация
- Оптимизация процессов с помощью ИИ
- Интеграция систем и сервисов
- Снижение операционных расходов

🎨 Генерация контента
- AI-видео для маркетинга
- Креативы и изображения
- Автоматизация контент-производства

🧠 Разработка уникальных решений под Ваши задачи
- Внедрение AI в CRM системы
- Обучение моделей AI и установка в закрытый контур
- Сопровождение AI проектов

12+ лет опыта в IT • 50+ AI проектов • Полный цикл разработки

👇 Начнем создавать AI решения?`, env, createMainKeyboard());
}

async function handleButtonEvent(event, env) {
	const payload = parsePayload(event.payload);
	const handler = buttonHandlers[payload?.command];

	if (!handler) {
		if (payload?.command === "back") {
			await answerButtonEvent(event, env);
			await sendWelcome({ peer_id: event.peer_id }, env);
		}

		return;
	}

	await answerButtonEvent(event, env);

	if (payload.command === "manager") {
		await setManagerWaiter(event, env);
	}

	const keyboard = payload.command === "about" ? createAboutKeyboard() : undefined;
	await sendMessage(event.peer_id, handler(), env, keyboard);
}

function getWaiterId(event) {
	const userId = event.user_id ?? event.from_id;
	return `manager_waiting:${event.peer_id}:${userId}`;
}

async function setManagerWaiter(event, env) {
	await env.KV.put(getWaiterId(event), "1", {
		expirationTtl: MANAGER_WAITING_TTL,
	});
}

async function consumeManagerWaiter(event, env) {
	const key = getWaiterId(event);
	const isWaiting = await env.KV.get(key);

	if (isWaiting !== null) {
		await env.KV.delete(key);
		return true;
	}

	return false;
}

function parsePayload(payload) {
	if (typeof payload === "object") {
		return payload;
	}

	try {
		return JSON.parse(payload);
	} catch {
		return null;
	}
}

async function answerButtonEvent(event, env) {
	const body = new URLSearchParams({
		access_token: env.VK_GROUP_TOKEN,
		v: VK_API_VERSION,
		event_id: String(event.event_id),
		user_id: String(event.user_id),
		peer_id: String(event.peer_id),
		event_data: JSON.stringify({ type: "show_snackbar", text: "Готово" }),
	});

	await fetch(VK_EVENT_ANSWER_URL, { method: "POST", body });
}

async function sendMessage(peerId, message, env, keyboard) {
	const body = new URLSearchParams({
		access_token: env.VK_GROUP_TOKEN,
		v: VK_API_VERSION,
		peer_id: String(peerId),
		random_id: String(Date.now()),
		message,
	});

	if (keyboard) {
		body.set("keyboard", JSON.stringify(keyboard));
	}

	const response = await fetch(VK_API_URL, { method: "POST", body });

	if (!response.ok) {
		console.error("VK messages.send failed", await response.text());
	}
}

async function forwardManagerMessage(message, env) {
	await sendMessage(MANAGER_PEER_ID, message, env);
}

async function registerUser(vkUserId, env) {
	if (!vkUserId) {
		return;
	}

	const now = new Date().toISOString();

	try {
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS bot_users (
				vk_user_id INTEGER PRIMARY KEY,
				first_launch_at TEXT NOT NULL,
				last_activity_at TEXT NOT NULL
			)
		`).run();

		await env.DB.prepare(`
			INSERT INTO bot_users (vk_user_id, first_launch_at, last_activity_at)
			VALUES (?, ?, ?)
			ON CONFLICT(vk_user_id) DO UPDATE SET last_activity_at = excluded.last_activity_at
		`).bind(vkUserId, now, now).run();
	} catch (error) {
		console.error("D1 user registration failed", error);
	}
}

function createMainKeyboard() {
	return {
		inline: true,
		buttons: [
			[{ action: { type: "callback", label: "🏢 О компании", payload: JSON.stringify({ command: "about" }) }, color: "primary" }],
			[{ action: { type: "callback", label: "🛠️ Наши услуги", payload: JSON.stringify({ command: "services" }) }, color: "primary" }],
			[{ action: { type: "callback", label: "📁 Портфолио", payload: JSON.stringify({ command: "portfolio" }) }, color: "primary" }],
			[{ action: { type: "callback", label: "💬 Связаться с менеджером", payload: JSON.stringify({ command: "manager" }) }, color: "positive" }],
		],
	};
}

function createAboutKeyboard() {
	return {
		inline: true,
		buttons: [
			[{ action: { type: "callback", label: "❤️ Отзывы о нас", payload: JSON.stringify({ command: "reviews" }) }, color: "primary" }],
			[{ action: { type: "callback", label: "📞 Связаться с нами", payload: JSON.stringify({ command: "manager" }) }, color: "positive" }],
			[{ action: { type: "callback", label: "↩️ Назад", payload: JSON.stringify({ command: "back" }) }, color: "secondary" }],
		],
	};
}
