"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFoundMessage = exports.DbData = void 0;
var db_data_1 = require("./db-data");
Object.defineProperty(exports, "DbData", { enumerable: true, get: function () { return db_data_1.DbData; } });
var data_success_1 = require("./response-msg/data-success");
Object.defineProperty(exports, "DataFoundMessage", { enumerable: true, get: function () { return data_success_1.DataFoundMessage; } });
