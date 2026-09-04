"use strict";

const { ServiceBroker } = require("moleculer");

const ArticlesService = require("../../services/articles.service");
const CommentsService = require("../../services/comments.service");
const FavoritesService = require("../../services/favorites.service");
const FollowsService = require("../../services/follows.service");
const UsersService = require("../../services/users.service");

describe("RealWorld services", () => {
	let broker;

	beforeAll(() => {
		broker = new ServiceBroker({ logger: false });
		broker.createService(ArticlesService);
		broker.createService(CommentsService);
		broker.createService(FavoritesService);
		broker.createService(FollowsService);
		broker.createService(UsersService);
		return broker.start();
	});

	afterAll(() => broker.stop());

	it("loads the core services", () => {
		expect(broker.registry.getServiceList({ onlyAvailable: true }).map(service => service.name)).toEqual(
			expect.arrayContaining(["articles", "comments", "favorites", "follows", "users"])
		);
	});
});
