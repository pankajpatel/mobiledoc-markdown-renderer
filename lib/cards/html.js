import RENDER_TYPE from '../utils/render-type';

export default {
  name: 'html',
  type: RENDER_TYPE,
  render({
    env,
    options,
    payload
  }) {
    return payload.html;
  }
};

/*
[
  "code",
  {
    "code": "npx create-react-app forex-app\n\ncd forex-app\n\nyarn start\n",
    "language": "sh"
  }
],
*/