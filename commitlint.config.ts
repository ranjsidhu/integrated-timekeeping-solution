import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  formatter: "@commitlint/format",
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "feat",
        "fix",
        "ci",
        "build",
        "perf",
        "refactor",
        "style",
        "test",
        "chore",
        "docs",
      ],
    ],
    "subject-case": [RuleConfigSeverity.Error, "always", "lower-case"],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
  },
};

export default Configuration;
