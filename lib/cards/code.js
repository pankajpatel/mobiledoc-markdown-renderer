import RENDER_TYPE from "../utils/render-type";

const CODE_BEGIN = "```";
const CODE_END = "```";

export default {
  name: "code-card",
  type: RENDER_TYPE,
  render({ payload }) {
    const parts = [
      CODE_BEGIN + (payload.language || ""),
      payload.code,
      CODE_END,
    ];

    return parts.join("\n");
  },
};
