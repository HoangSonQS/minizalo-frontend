/**
 * Thay mọi import.meta bằng object an toàn để tránh lỗi
 * "Cannot use 'import.meta' outside a module" khi bundle web load không phải type=module.
 */
module.exports = function (api) {
    const t = api.types;
    return {
        name: "import-meta-fix",
        visitor: {
            MetaProperty(path) {
                const { node } = path;
                if (
                    node.meta &&
                    node.meta.name === "import" &&
                    node.property &&
                    node.property.name === "meta"
                ) {
                    path.replaceWith(
                        t.objectExpression([
                            t.objectProperty(t.identifier("url"), t.stringLiteral("")),
                            t.objectProperty(t.identifier("env"), t.objectExpression([])),
                        ])
                    );
                }
            },
        },
    };
};
