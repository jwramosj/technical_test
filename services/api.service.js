"use strict";

const _ = require("lodash");
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api",

			authorization: true,

			aliases: {
				// API index
				"GET /": "api.info",

				// Login
				"POST /users/login": "users.login",

				// Users
				"REST /users": "users",

				// Current user
				"GET /user": "users.me",
				"PUT /user": "users.updateMyself",

				// Articles
				"GET /articles/feed": "articles.feed",
				"REST /articles": "articles",
				"GET /tags": "articles.tags",

				// Comments
				"GET /articles/:slug/comments": "articles.comments",
				"POST /articles/:slug/comments": "articles.addComment",
				"PUT /articles/:slug/comments/:commentID": "articles.updateComment",
				"DELETE /articles/:slug/comments/:commentID": "articles.removeComment",

				// Favorites
				"POST /articles/:slug/favorite": "articles.favorite",
				"DELETE /articles/:slug/favorite": "articles.unfavorite",

				// Profile
				"GET /profiles/:username": "users.profile",
				"POST /profiles/:username/follow": "users.follow",
				"DELETE /profiles/:username/follow": "users.unfollow",
			},

			// Disable to call not-mapped actions
			mappingPolicy: "restrict",

			// Set CORS headers
			cors: true,

			// Parse body content
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
		}],

		assets: {
			folder: "./public"
		},

		// logRequestParams: "info",
		// logResponseData: "info",

		onError(req, res, err) {
			// Return with the error as JSON object
			res.setHeader("Content-type", "application/json; charset=utf-8");
			res.writeHead(err.code || 500);

			if (err.code == 422) {
				let o = {};
				err.data.forEach(e => {
					let field = e.field.split(".").pop();
					o[field] = e.message;
				});

				res.end(JSON.stringify({ errors: o }, null, 2));				
			} else {
				const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
				res.end(JSON.stringify(errObj, null, 2));
			}
			this.logResponse(req, res, err? err.ctx : null);
		}

	},

	actions: {
		info: {
			authorization: false,
			handler() {
				return {
					name: "Conduit API",
					baseUrl: "/api",
					authentication: {
						header: "Authorization: Token <jwt>",
						alsoAccepted: "Authorization: Bearer <jwt>"
					},
					endpoints: [
						{
							name: "Register user",
							method: "POST",
							path: "/api/users",
							auth: false,
							body: {
								user: {
									username: "johndoe",
									email: "john@example.com",
									password: "password123"
								}
							}
						},
						{
							name: "Login",
							method: "POST",
							path: "/api/users/login",
							auth: false,
							body: {
								user: {
									email: "john@example.com",
									password: "password123"
								}
							}
						},
						{
							name: "Current user",
							method: "GET",
							path: "/api/user",
							auth: true
						},
						{
							name: "Update current user",
							method: "PUT",
							path: "/api/user",
							auth: true,
							body: {
								user: {
									bio: "Short bio",
									image: "https://example.com/avatar.png"
								}
							}
						},
						{
							name: "List articles",
							method: "GET",
							path: "/api/articles",
							auth: false,
							query: {
								tag: "node",
								author: "johndoe",
								favorited: "johndoe",
								limit: 20,
								offset: 0
							}
						},
						{
							name: "Feed articles",
							method: "GET",
							path: "/api/articles/feed",
							auth: true,
							query: {
								limit: 20,
								offset: 0
							}
						},
						{
							name: "Get article",
							method: "GET",
							path: "/api/articles/:slug",
							auth: false
						},
						{
							name: "Create article",
							method: "POST",
							path: "/api/articles",
							auth: true,
							body: {
								article: {
									title: "Hello World",
									description: "Short description",
									body: "Article content",
									tagList: ["node", "moleculer"]
								}
							}
						},
						{
							name: "Update article",
							method: "PUT",
							path: "/api/articles/:slug",
							auth: true,
							body: {
								article: {
									title: "Updated title",
									description: "Updated description",
									body: "Updated content",
									tagList: ["api"]
								}
							}
						},
						{
							name: "Delete article",
							method: "DELETE",
							path: "/api/articles/:slug",
							auth: true
						},
						{
							name: "Tags",
							method: "GET",
							path: "/api/tags",
							auth: false
						},
						{
							name: "List comments",
							method: "GET",
							path: "/api/articles/:slug/comments",
							auth: false
						},
						{
							name: "Add comment",
							method: "POST",
							path: "/api/articles/:slug/comments",
							auth: true,
							body: {
								comment: {
									body: "Nice article!"
								}
							}
						},
						{
							name: "Update comment",
							method: "PUT",
							path: "/api/articles/:slug/comments/:commentID",
							auth: true,
							body: {
								comment: {
									body: "Updated comment"
								}
							}
						},
						{
							name: "Delete comment",
							method: "DELETE",
							path: "/api/articles/:slug/comments/:commentID",
							auth: true
						},
						{
							name: "Favorite article",
							method: "POST",
							path: "/api/articles/:slug/favorite",
							auth: true
						},
						{
							name: "Unfavorite article",
							method: "DELETE",
							path: "/api/articles/:slug/favorite",
							auth: true
						},
						{
							name: "Get profile",
							method: "GET",
							path: "/api/profiles/:username",
							auth: false
						},
						{
							name: "Follow profile",
							method: "POST",
							path: "/api/profiles/:username/follow",
							auth: true
						},
						{
							name: "Unfollow profile",
							method: "DELETE",
							path: "/api/profiles/:username/follow",
							auth: true
						}
					]
				};
			}
		}
	},

	methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			return this.Promise.resolve(token)
				.then(token => {
					if (token) {
						// Verify JWT token
						return ctx.call("users.resolveToken", { token })
							.then(user => {
								if (user) {
									this.logger.info("Authenticated via JWT: ", user.username);
									// Reduce user fields (it will be transferred to other nodes)
									ctx.meta.user = _.pick(user, ["_id", "username", "email", "image"]);
									ctx.meta.token = token;
								}
								return user;
							})
							.catch(() => {
								// Ignored because we continue processing if user is not exist
								return null;
							});
					}
				})
				.then(user => {
					if (req.$endpoint.action.auth == "required" && !user)
						return this.Promise.reject(new UnAuthorizedError());
				});
		},

		/**
		 * Convert ValidationError to RealWorld.io result
		 * @param {*} req 
		 * @param {*} res 
		 * @param {*} err 
		 */
		/*sendError(req, res, err) {
			if (err.code == 422) {
				res.setHeader("Content-type", "application/json; charset=utf-8");
				res.writeHead(422);
				let o = {};
				err.data.forEach(e => {
					let field = e.field.split(".").pop();
					o[field] = e.message;
				});
				return res.end(JSON.stringify({
					errors: o
				}, null, 2));
				
			}			
			
			return this._sendError(req, res, err);
		}*/
	},

	created() {
		// Pointer to the original function
		//this._sendError = ApiGateway.methods.sendError.bind(this);
	}


};
