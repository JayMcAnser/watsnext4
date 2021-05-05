"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ElementTypes = /** @class */ (function () {
    function ElementTypes() {
    }
    /**
     * list the possible type for an element
     */
    ElementTypes.prototype.list = function () {
        return [
            { id: 'text', caption: 'text', fields: [
                    { id: 'description', label: 'Description', type: 'text' }
                ] },
            { id: 'image', caption: 'image' }
        ];
    };
    return ElementTypes;
}());
exports.default = ElementTypes;
//# sourceMappingURL=element-types.js.map