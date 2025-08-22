"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnglishOnly = void 0;
const isEnglishOnly = (text) => /^[a-zA-Z0-9._\-@]+$/.test(text);
exports.isEnglishOnly = isEnglishOnly;
//# sourceMappingURL=validator.js.map