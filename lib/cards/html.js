import RENDER_TYPE from "../utils/render-type";

export default {
  name: "html-card",
  type: RENDER_TYPE,
  render({ payload }) {
    return payload.html;
  },
};
