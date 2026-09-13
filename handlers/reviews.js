export default function reviewsHandler() {
	return {
		message: "По ссылкам ниже Вы можете ознакомиться с нашими работами и отзывами на них.",
		keyboard: {
			inline: true,
			buttons: [
				[
					{
						action: {
							type: "open_link",
							link: "https://www.fl.ru/users/levin-am2/portfolio/",
							label: "FL.ru",
						},
					},
				],
				[
					{
						action: {
							type: "open_link",
							link: "https://profi.ru/profile/LevinAM14",
							label: "Profi.ru",
						},
					},
				],
				[
					{
						action: {
							type: "open_link",
							link: "https://freelance.ru/levinaleksey",
							label: "Freelance.ru",
						},
					},
				],
				[
					{
						action: {
							type: "callback",
							label: "↩️ Назад",
							payload: JSON.stringify({ command: "about" }),
						},
						color: "secondary",
					},
				],
			],
		},
	};
}
