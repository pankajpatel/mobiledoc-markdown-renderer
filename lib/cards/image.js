import RENDER_TYPE from "../utils/render-type";

export default {
  name: "image-card",
  type: RENDER_TYPE,
  render({ payload }) {
    if (payload.src) {
      return `![](${payload.src})`;
    }

    return "";
  },
};
