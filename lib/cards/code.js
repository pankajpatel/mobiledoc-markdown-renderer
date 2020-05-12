import RENDER_TYPE from '../utils/render-type';

const CODE_BEGIN = '```';
const CODE_END = '```';

export default {
  name: 'code',
  type: RENDER_TYPE,
  render({
    env,
    options,
    payload
  }) {
    const parts = [
      CODE_BEGIN + (payload.language || ''),
      payload.code,
      CODE_END
    ]
    return parts.join('\n');
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