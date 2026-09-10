const VK_API_URL = "https://api.vk.com/method/messages.send";
const VK_API_VERSION = "5.199";

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
			ctx.waitUntil(sendEcho(update.object.message, env));
		}

		return new Response("ok");
	},
};

async function sendEcho(message, env) {
	const body = new URLSearchParams({
		access_token: env.VK_GROUP_TOKEN,
		v: VK_API_VERSION,
		peer_id: String(message.peer_id),
		random_id: String(Date.now()),
		message: message.text,
	});

	const response = await fetch(VK_API_URL, {
		method: "POST",
		body,
	});

	if (!response.ok) {
		console.error("VK messages.send failed", await response.text());
	}
}
