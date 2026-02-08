/**
 * Stub cho expo-modules-core trên web: export requireOptionalNativeModule (trả về null),
 * CodedError và Platform để expo-constants, expo-router không crash.
 */
function requireOptionalNativeModule() {
  return null;
}

class CodedError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CodedError";
  }
}

const Platform = {
  OS: "web",
  select: (obj) => obj.web ?? obj.default,
};

module.exports = {
  requireOptionalNativeModule,
  CodedError,
  Platform,
};
