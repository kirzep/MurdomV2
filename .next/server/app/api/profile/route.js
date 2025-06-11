"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/profile/route";
exports.ids = ["app/api/profile/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fprofile%2Froute&page=%2Fapi%2Fprofile%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprofile%2Froute.ts&appDir=%2Fhome%2Fkirzep%2FMurdom2%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkirzep%2FMurdom2&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fprofile%2Froute&page=%2Fapi%2Fprofile%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprofile%2Froute.ts&appDir=%2Fhome%2Fkirzep%2FMurdom2%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkirzep%2FMurdom2&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_kirzep_Murdom2_app_api_profile_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/profile/route.ts */ \"(rsc)/./app/api/profile/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/profile/route\",\n        pathname: \"/api/profile\",\n        filename: \"route\",\n        bundlePath: \"app/api/profile/route\"\n    },\n    resolvedPagePath: \"/home/kirzep/Murdom2/app/api/profile/route.ts\",\n    nextConfigOutput,\n    userland: _home_kirzep_Murdom2_app_api_profile_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/profile/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZwcm9maWxlJTJGcm91dGUmcGFnZT0lMkZhcGklMkZwcm9maWxlJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGcHJvZmlsZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGa2lyemVwJTJGTXVyZG9tMiUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRmtpcnplcCUyRk11cmRvbTImaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDSDtBQUMxRTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL2NhdC1hcmNoaXZlLz9lMTdhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9ob21lL2tpcnplcC9NdXJkb20yL2FwcC9hcGkvcHJvZmlsZS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcHJvZmlsZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3Byb2ZpbGVcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3Byb2ZpbGUvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9raXJ6ZXAvTXVyZG9tMi9hcHAvYXBpL3Byb2ZpbGUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvcHJvZmlsZS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fprofile%2Froute&page=%2Fapi%2Fprofile%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprofile%2Froute.ts&appDir=%2Fhome%2Fkirzep%2FMurdom2%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkirzep%2FMurdom2&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n// app/api/auth/[...nextauth]/route.ts\n\n\n\n\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_2__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"text\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                // Ищем пользователя в базе данных по email\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                // В реальном приложении здесь должна быть проверка хешированного пароля.\n                // Для простоты мы сравниваем пароли напрямую.\n                if (user && user.password === credentials.password) {\n                    // Возвращаем все необходимые данные\n                    return {\n                        id: user.id,\n                        name: user.name,\n                        email: user.email,\n                        role: user.role\n                    };\n                } else {\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    pages: {\n        signIn: \"/login\"\n    },\n    callbacks: {\n        // Вызывается при создании JWT\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n                token.name = user.name || \"\";\n                token.email = user.email || \"\";\n            }\n            return token;\n        },\n        // Вызывается при создании сессии\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n                session.user.name = token.name;\n                session.user.email = token.email;\n            }\n            return session;\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFzQztBQUNrQztBQUNOO0FBQ2I7QUFDbkI7QUEyQjNCLE1BQU1JLGNBQTJCO0lBQ3BDQyxTQUFTSCxtRUFBYUEsQ0FBQ0MsbURBQU1BO0lBQzdCRyxXQUFXO1FBQ1BMLDJFQUFtQkEsQ0FBQztZQUNoQk0sTUFBTTtZQUNOQyxhQUFhO2dCQUNUQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFPO2dCQUN0Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBWUMsTUFBTTtnQkFBVztZQUNwRDtZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3ZCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUMvQyxPQUFPO2dCQUNYO2dCQUVBLDJDQUEyQztnQkFDM0MsTUFBTUUsT0FBTyxNQUFNWCxtREFBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3RDQyxPQUFPO3dCQUFFUCxPQUFPRCxZQUFZQyxLQUFLO29CQUFDO2dCQUN0QztnQkFFQSx5RUFBeUU7Z0JBQ3pFLDhDQUE4QztnQkFDOUMsSUFBSUssUUFBUUEsS0FBS0YsUUFBUSxLQUFLSixZQUFZSSxRQUFRLEVBQUU7b0JBQ2hELG9DQUFvQztvQkFDcEMsT0FBTzt3QkFDSEssSUFBSUgsS0FBS0csRUFBRTt3QkFDWFYsTUFBTU8sS0FBS1AsSUFBSTt3QkFDZkUsT0FBT0ssS0FBS0wsS0FBSzt3QkFDakJTLE1BQU1KLEtBQUtJLElBQUk7b0JBQ25CO2dCQUNKLE9BQU87b0JBQ0gsT0FBTztnQkFDWDtZQUNKO1FBQ0o7S0FDSDtJQUNEQyxTQUFTO1FBQ0xDLFVBQVU7SUFDZDtJQUNBQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLE9BQU87UUFDSEMsUUFBUTtJQUNaO0lBQ0FDLFdBQVc7UUFDUCw4QkFBOEI7UUFDOUIsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVmLElBQUksRUFBRTtZQUNyQixJQUFJQSxNQUFNO2dCQUNOZSxNQUFNWixFQUFFLEdBQUdILEtBQUtHLEVBQUU7Z0JBQ2xCWSxNQUFNWCxJQUFJLEdBQUdKLEtBQUtJLElBQUk7Z0JBQ3RCVyxNQUFNdEIsSUFBSSxHQUFHTyxLQUFLUCxJQUFJLElBQUk7Z0JBQzFCc0IsTUFBTXBCLEtBQUssR0FBR0ssS0FBS0wsS0FBSyxJQUFJO1lBQ2hDO1lBQ0EsT0FBT29CO1FBQ1g7UUFDQSxpQ0FBaUM7UUFDakMsTUFBTVYsU0FBUSxFQUFFQSxPQUFPLEVBQUVVLEtBQUssRUFBRTtZQUM1QixJQUFJVixRQUFRTCxJQUFJLEVBQUU7Z0JBQ2RLLFFBQVFMLElBQUksQ0FBQ0csRUFBRSxHQUFHWSxNQUFNWixFQUFFO2dCQUMxQkUsUUFBUUwsSUFBSSxDQUFDSSxJQUFJLEdBQUdXLE1BQU1YLElBQUk7Z0JBQzlCQyxRQUFRTCxJQUFJLENBQUNQLElBQUksR0FBR3NCLE1BQU10QixJQUFJO2dCQUM5QlksUUFBUUwsSUFBSSxDQUFDTCxLQUFLLEdBQUdvQixNQUFNcEIsS0FBSztZQUNwQztZQUNBLE9BQU9VO1FBQ1g7SUFDSjtBQUNKLEVBQUU7QUFFRixNQUFNVyxVQUFVOUIsZ0RBQVFBLENBQUNJO0FBRWtCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2F0LWFyY2hpdmUvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz9jOGE0Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXG5pbXBvcnQgTmV4dEF1dGgsIHsgQXV0aE9wdGlvbnMsIFVzZXIgYXMgTmV4dEF1dGhVc2VyIH0gZnJvbSAnbmV4dC1hdXRoJztcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gJ0BhdXRoL3ByaXNtYS1hZGFwdGVyJztcbmltcG9ydCBwcmlzbWEgZnJvbSAnQC9saWIvcHJpc21hJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5cbi8vINCg0LDRgdGI0LjRgNGP0LXQvCDRgdGC0LDQvdC00LDRgNGC0L3Ri9C1INGC0LjQv9GLIE5leHRBdXRoLCDRh9GC0L7QsdGLINCy0LrQu9GO0YfQuNGC0Ywg0L3QsNGI0Lgg0LrQsNGB0YLQvtC80L3Ri9C1INC/0L7Qu9GPXG5kZWNsYXJlIG1vZHVsZSAnbmV4dC1hdXRoJyB7XG4gIGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICB1c2VyOiB7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgZW1haWw6IHN0cmluZztcbiAgICAgIHJvbGU6IFJvbGU7XG4gICAgfTtcbiAgfVxuICBpbnRlcmZhY2UgVXNlciBleHRlbmRzIE5leHRBdXRoVXNlciB7XG4gICAgICByb2xlOiBSb2xlO1xuICB9XG59XG5cbmRlY2xhcmUgbW9kdWxlICduZXh0LWF1dGgvand0JyB7XG4gIGludGVyZmFjZSBKV1Qge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgcm9sZTogUm9sZTtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IEF1dGhPcHRpb25zID0ge1xuICAgIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICAgICAgICBuYW1lOiAnQ3JlZGVudGlhbHMnLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcInRleHRcIiB9LFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g0JjRidC10Lwg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPINCyINCx0LDQt9C1INC00LDQvdC90YvRhSDQv9C+IGVtYWlsXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vINCSINGA0LXQsNC70YzQvdC+0Lwg0L/RgNC40LvQvtC20LXQvdC40Lgg0LfQtNC10YHRjCDQtNC+0LvQttC90LAg0LHRi9GC0Ywg0L/RgNC+0LLQtdGA0LrQsCDRhdC10YjQuNGA0L7QstCw0L3QvdC+0LPQviDQv9Cw0YDQvtC70Y8uXG4gICAgICAgICAgICAgICAgLy8g0JTQu9GPINC/0YDQvtGB0YLQvtGC0Ysg0LzRiyDRgdGA0LDQstC90LjQstCw0LXQvCDQv9Cw0YDQvtC70Lgg0L3QsNC/0YDRj9C80YPRji5cbiAgICAgICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyLnBhc3N3b3JkID09PSBjcmVkZW50aWFscy5wYXNzd29yZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDQktC+0LfQstGA0LDRidCw0LXQvCDQstGB0LUg0L3QtdC+0LHRhdC+0LTQuNC80YvQtSDQtNCw0L3QvdGL0LVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdXNlci5pZCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5yb2xlIFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICBdLFxuICAgIHNlc3Npb246IHtcbiAgICAgICAgc3RyYXRlZ3k6ICdqd3QnLFxuICAgIH0sXG4gICAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gICAgcGFnZXM6IHtcbiAgICAgICAgc2lnbkluOiAnL2xvZ2luJyxcbiAgICB9LFxuICAgIGNhbGxiYWNrczoge1xuICAgICAgICAvLyDQktGL0LfRi9Cy0LDQtdGC0YHRjyDQv9GA0Lgg0YHQvtC30LTQsNC90LjQuCBKV1RcbiAgICAgICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfSkge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgICAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZTtcbiAgICAgICAgICAgICAgICB0b2tlbi5uYW1lID0gdXNlci5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgICAgIHRva2VuLmVtYWlsID0gdXNlci5lbWFpbCB8fCAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g0JLRi9C30YvQstCw0LXRgtGB0Y8g0L/RgNC4INGB0L7Qt9C00LDQvdC40Lgg0YHQtdGB0YHQuNC4XG4gICAgICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uaWQ7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlO1xuICAgICAgICAgICAgICAgIHNlc3Npb24udXNlci5uYW1lID0gdG9rZW4ubmFtZTtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLnVzZXIuZW1haWwgPSB0b2tlbi5lbWFpbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuXG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiUHJpc21hQWRhcHRlciIsInByaXNtYSIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaWQiLCJyb2xlIiwic2Vzc2lvbiIsInN0cmF0ZWd5Iiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsInBhZ2VzIiwic2lnbkluIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/profile/route.ts":
/*!**********************************!*\
  !*** ./app/api/profile/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   PATCH: () => (/* binding */ PATCH)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! fs/promises */ \"fs/promises\");\n/* harmony import */ var fs_promises__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(fs_promises__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_5__);\n// app/api/profile/route.ts\n\n\n\n\n\n\n// PATCH для обновления профиля текущего пользователя\nasync function PATCH(request) {\n    const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n    if (!session) {\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n    }\n    try {\n        const data = await request.formData();\n        const name = data.get(\"name\");\n        const file = data.get(\"file\");\n        const updateData = {};\n        if (name && name.trim()) {\n            updateData.name = name.trim();\n        }\n        // Если приложен новый файл аватара, загружаем его\n        if (file) {\n            const bytes = await file.arrayBuffer();\n            const buffer = Buffer.from(bytes);\n            const fileExtension = path__WEBPACK_IMPORTED_MODULE_5___default().extname(file.name);\n            const fileName = `avatar-${session.user.id}-${Date.now()}${fileExtension}`;\n            const uploadDir = path__WEBPACK_IMPORTED_MODULE_5___default().join(process.cwd(), \"public\", \"uploads\", \"avatars\");\n            const filePath = path__WEBPACK_IMPORTED_MODULE_5___default().join(uploadDir, fileName);\n            const publicPath = `/uploads/avatars/${fileName}`;\n            await (0,fs_promises__WEBPACK_IMPORTED_MODULE_4__.mkdir)(uploadDir, {\n                recursive: true\n            });\n            await (0,fs_promises__WEBPACK_IMPORTED_MODULE_4__.writeFile)(filePath, buffer);\n            updateData.image = publicPath;\n        }\n        if (Object.keys(updateData).length === 0) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"No data to update\"\n            }, {\n                status: 400\n            });\n        }\n        const updatedUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].user.update({\n            where: {\n                id: session.user.id\n            },\n            data: updateData\n        });\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json(updatedUser);\n    } catch (error) {\n        console.error(\"Failed to update profile:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to update profile\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Byb2ZpbGUvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTJCO0FBQ2dCO0FBQ1Q7QUFDZ0I7QUFDUTtBQUNYO0FBQ3ZCO0FBRXhCLHFEQUFxRDtBQUM5QyxlQUFlTyxNQUFNQyxPQUFnQjtJQUN4QyxNQUFNQyxVQUFVLE1BQU1QLGdFQUFnQkEsQ0FBQ0MsNkRBQVdBO0lBQ2xELElBQUksQ0FBQ00sU0FBUztRQUNWLE9BQU9ULGtGQUFZQSxDQUFDVSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFlLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ3RFO0lBRUEsSUFBSTtRQUNBLE1BQU1DLE9BQU8sTUFBTUwsUUFBUU0sUUFBUTtRQUNuQyxNQUFNQyxPQUFPRixLQUFLRyxHQUFHLENBQUM7UUFDdEIsTUFBTUMsT0FBb0JKLEtBQUtHLEdBQUcsQ0FBQztRQUVuQyxNQUFNRSxhQUFnRCxDQUFDO1FBRXZELElBQUlILFFBQVFBLEtBQUtJLElBQUksSUFBSTtZQUNyQkQsV0FBV0gsSUFBSSxHQUFHQSxLQUFLSSxJQUFJO1FBQy9CO1FBRUEsa0RBQWtEO1FBQ2xELElBQUlGLE1BQU07WUFDTixNQUFNRyxRQUFRLE1BQU1ILEtBQUtJLFdBQVc7WUFDcEMsTUFBTUMsU0FBU0MsT0FBT0MsSUFBSSxDQUFDSjtZQUMzQixNQUFNSyxnQkFBZ0JuQixtREFBWSxDQUFDVyxLQUFLRixJQUFJO1lBQzVDLE1BQU1ZLFdBQVcsQ0FBQyxPQUFPLEVBQUVsQixRQUFRbUIsSUFBSSxDQUFDQyxFQUFFLENBQUMsQ0FBQyxFQUFFQyxLQUFLQyxHQUFHLEdBQUcsRUFBRU4sY0FBYyxDQUFDO1lBQzFFLE1BQU1PLFlBQVkxQixnREFBUyxDQUFDNEIsUUFBUUMsR0FBRyxJQUFJLFVBQVUsV0FBVztZQUNoRSxNQUFNQyxXQUFXOUIsZ0RBQVMsQ0FBQzBCLFdBQVdMO1lBQ3RDLE1BQU1VLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRVYsU0FBUyxDQUFDO1lBRWpELE1BQU10QixrREFBS0EsQ0FBQzJCLFdBQVc7Z0JBQUVNLFdBQVc7WUFBSztZQUN6QyxNQUFNbEMsc0RBQVNBLENBQUNnQyxVQUFVZDtZQUMxQkosV0FBV3FCLEtBQUssR0FBR0Y7UUFDdkI7UUFFQSxJQUFJRyxPQUFPQyxJQUFJLENBQUN2QixZQUFZd0IsTUFBTSxLQUFLLEdBQUc7WUFDdEMsT0FBTzFDLGtGQUFZQSxDQUFDVSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBb0IsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQzNFO1FBRUEsTUFBTStCLGNBQWMsTUFBTTFDLG1EQUFNQSxDQUFDMkIsSUFBSSxDQUFDZ0IsTUFBTSxDQUFDO1lBQ3pDQyxPQUFPO2dCQUFFaEIsSUFBSXBCLFFBQVFtQixJQUFJLENBQUNDLEVBQUU7WUFBQztZQUM3QmhCLE1BQU1LO1FBQ1Y7UUFFQSxPQUFPbEIsa0ZBQVlBLENBQUNVLElBQUksQ0FBQ2lDO0lBQzdCLEVBQUUsT0FBT2hDLE9BQU87UUFDWm1DLFFBQVFuQyxLQUFLLENBQUMsNkJBQTZCQTtRQUMzQyxPQUFPWCxrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBMkIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDbEY7QUFDSiIsInNvdXJjZXMiOlsid2VicGFjazovL2NhdC1hcmNoaXZlLy4vYXBwL2FwaS9wcm9maWxlL3JvdXRlLnRzPzUzYWIiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwL2FwaS9wcm9maWxlL3JvdXRlLnRzXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgcHJpc21hIGZyb20gJ0AvbGliL3ByaXNtYSc7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoL25leHQnO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICcuLi9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUnO1xuaW1wb3J0IHsgd3JpdGVGaWxlLCBta2RpciB9IGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBQQVRDSCDQtNC70Y8g0L7QsdC90L7QstC70LXQvdC40Y8g0L/RgNC+0YTQuNC70Y8g0YLQtdC60YPRidC10LPQviDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQQVRDSChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuICAgIGlmICghc2Vzc2lvbikge1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVxdWVzdC5mb3JtRGF0YSgpO1xuICAgICAgICBjb25zdCBuYW1lID0gZGF0YS5nZXQoJ25hbWUnKSBhcyBzdHJpbmc7XG4gICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgfCBudWxsID0gZGF0YS5nZXQoJ2ZpbGUnKSBhcyB1bmtub3duIGFzIEZpbGU7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cGRhdGVEYXRhOiB7IG5hbWU/OiBzdHJpbmc7IGltYWdlPzogc3RyaW5nIH0gPSB7fTtcblxuICAgICAgICBpZiAobmFtZSAmJiBuYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgdXBkYXRlRGF0YS5uYW1lID0gbmFtZS50cmltKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDQldGB0LvQuCDQv9GA0LjQu9C+0LbQtdC9INC90L7QstGL0Lkg0YTQsNC50Lsg0LDQstCw0YLQsNGA0LAsINC30LDQs9GA0YPQttCw0LXQvCDQtdCz0L5cbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oYnl0ZXMpO1xuICAgICAgICAgICAgY29uc3QgZmlsZUV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlLm5hbWUpO1xuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBgYXZhdGFyLSR7c2Vzc2lvbi51c2VyLmlkfS0ke0RhdGUubm93KCl9JHtmaWxlRXh0ZW5zaW9ufWA7XG4gICAgICAgICAgICBjb25zdCB1cGxvYWREaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3B1YmxpYycsICd1cGxvYWRzJywgJ2F2YXRhcnMnKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHVwbG9hZERpciwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcHVibGljUGF0aCA9IGAvdXBsb2Fkcy9hdmF0YXJzLyR7ZmlsZU5hbWV9YDtcblxuICAgICAgICAgICAgYXdhaXQgbWtkaXIodXBsb2FkRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShmaWxlUGF0aCwgYnVmZmVyKTtcbiAgICAgICAgICAgIHVwZGF0ZURhdGEuaW1hZ2UgPSBwdWJsaWNQYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHVwZGF0ZURhdGEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdObyBkYXRhIHRvIHVwZGF0ZScgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIudXBkYXRlKHtcbiAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBzZXNzaW9uLnVzZXIuaWQgfSxcbiAgICAgICAgICAgIGRhdGE6IHVwZGF0ZURhdGEsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih1cGRhdGVkVXNlcik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgcHJvZmlsZTpcIiwgZXJyb3IpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byB1cGRhdGUgcHJvZmlsZScgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwicHJpc21hIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwid3JpdGVGaWxlIiwibWtkaXIiLCJwYXRoIiwiUEFUQ0giLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImRhdGEiLCJmb3JtRGF0YSIsIm5hbWUiLCJnZXQiLCJmaWxlIiwidXBkYXRlRGF0YSIsInRyaW0iLCJieXRlcyIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsImZpbGVFeHRlbnNpb24iLCJleHRuYW1lIiwiZmlsZU5hbWUiLCJ1c2VyIiwiaWQiLCJEYXRlIiwibm93IiwidXBsb2FkRGlyIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJmaWxlUGF0aCIsInB1YmxpY1BhdGgiLCJyZWN1cnNpdmUiLCJpbWFnZSIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJ1cGRhdGVkVXNlciIsInVwZGF0ZSIsIndoZXJlIiwiY29uc29sZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/profile/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n// lib/prisma.ts\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdCQUFnQjtBQUM4QjtBQU85QyxNQUFNQyxTQUFTQyxPQUFPRCxNQUFNLElBQUksSUFBSUQsd0RBQVlBO0FBRWhELElBQUlHLElBQXlCLEVBQWVELE9BQU9ELE1BQU0sR0FBR0E7QUFFNUQsaUVBQWVBLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYXQtYXJjaGl2ZS8uL2xpYi9wcmlzbWEudHM/OTgyMiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBsaWIvcHJpc21hLnRzXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5cbi8vINCf0YDQtdC00L7RgtCy0YDQsNGJ0LDQtdC8INC80L3QvtCz0L7QutGA0LDRgtC90L7QtSDRgdC+0LfQtNCw0L3QuNC1INGN0LrQt9C10LzQv9C70Y/RgNC+0LIgUHJpc21hQ2xpZW50INCyINGB0YDQtdC00LUg0YDQsNC30YDQsNCx0L7RgtC60LhcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xufVxuXG5jb25zdCBwcmlzbWEgPSBnbG9iYWwucHJpc21hIHx8IG5ldyBQcmlzbWFDbGllbnQoKTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSBnbG9iYWwucHJpc21hID0gcHJpc21hO1xuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwicHJpc21hIiwiZ2xvYmFsIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/@auth","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/lru-cache","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fprofile%2Froute&page=%2Fapi%2Fprofile%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprofile%2Froute.ts&appDir=%2Fhome%2Fkirzep%2FMurdom2%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkirzep%2FMurdom2&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();