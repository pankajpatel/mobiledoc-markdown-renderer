import Renderer from "../../../lib";
import ImageCard from "../../../lib/cards/image";
import CodeCard from "../../../lib/cards/code";
import HtmlCard from "../../../lib/cards/html";
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE,
  IMAGE_SECTION_TYPE,
} from "../../../lib/utils/section-types";

const MOBILEDOC_VERSION = "0.2.0";
const dataUri =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";

let renderer;
describe("Unit: Mobiledoc Markdown Renderer - 0.2", () => {
  beforeEach(() => {
    renderer = new Renderer();
  });

  it("renders an empty mobiledoc", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [], // sections
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);

    expect(rendered).toBe("");
  });

  it("renders a mobiledoc without markups", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [MARKUP_SECTION_TYPE, "P", [[[], 0, "hello world"]]],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("hello world\n");
  });

  it("renders a mobiledoc with simple (no attributes) markup", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [
          // markups
          ["B"],
        ],
        [
          // sections
          [MARKUP_SECTION_TYPE, "P", [[[0], 1, "hello world"]]],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("**hello world**\n");
  });

  it("renders a mobiledoc with complex (has attributes) markup", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [
          // markers
          ["A", ["href", "http://google.com"]],
        ],
        [
          // sections
          [MARKUP_SECTION_TYPE, "P", [[[0], 1, "hello world"]]],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("[hello world](http://google.com)\n");
  });

  it("renders a mobiledoc with multiple markups in a section", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [
          // markers
          ["B"],
          ["I"],
        ],
        [
          // sections
          [
            MARKUP_SECTION_TYPE,
            "P",
            [
              [[0], 0, "hello "], // b
              [[1], 0, "brave "], // b+i
              [[], 1, "new "], // close i
              [[], 1, "world"], // close b
            ],
          ],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("**hello *brave new *world**\n");
  });

  it("renders a mobiledoc with image section", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [IMAGE_SECTION_TYPE, dataUri],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe(`![](${dataUri})`);
  });

  it("renders a mobiledoc with built-in image card", () => {
    let cardName = ImageCard.name;
    let payload = { src: dataUri };
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [CARD_SECTION_TYPE, cardName, payload],
        ],
      ],
    };
    let { result: rendered } = renderer.render(mobiledoc);

    expect(rendered).toBe(`![](${dataUri})`);
  });

  it("render mobiledoc with list section and list items", () => {
    const mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [],
        [
          [
            LIST_SECTION_TYPE,
            "ul",
            [[[[], 0, "first item"]], [[[], 0, "second item"]]],
          ],
        ],
      ],
    };
    const { result: rendered } = renderer.render(mobiledoc);

    expect(rendered).toBe("* first item\n* second item\n");
  });

  it("renders a mobiledoc with card section", () => {
    let cardName = "title-card";
    let expectedPayload = {};
    let expectedOptions = {};
    let titleCard = {
      name: cardName,
      type: "markdown",
      render: ({ env, payload, options }) => {
        expect(JSON.stringify(payload)).toBe(JSON.stringify(expectedPayload));
        expect(JSON.stringify(options)).toBe(JSON.stringify(expectedOptions));
        expect(env.name).toBe(cardName);
        expect(!env.isInEditor).toBeTruthy();
        expect(!!env.onTeardown).toBeTruthy();

        return "Howdy friend";
      },
    };
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [CARD_SECTION_TYPE, cardName, expectedPayload],
        ],
      ],
    };
    renderer = new Renderer({
      cards: [titleCard],
      cardOptions: expectedOptions,
    });
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("Howdy friend");
  });

  it("throws when given invalid card type", () => {
    let card = {
      name: "bad",
      type: "other",
      render() {},
    };
    expect(() => {
      new Renderer({ cards: [card] });
    }).toThrow(/Card "bad" must be of type "markdown"/);
  });

  it("throws when given card without `render`", () => {
    let card = {
      name: "bad",
      type: "markdown",
      render: undefined,
    };
    expect(() => {
      new Renderer({ cards: [card] });
    }).toThrow(/Card "bad" must define.*render/);
  });

  it("throws if card render returns invalid result", () => {
    let card = {
      name: "bad",
      type: "markdown",
      render() {
        return Object.create(null);
      },
    };
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [[CARD_SECTION_TYPE, card.name]], // sections
      ],
    };
    renderer = new Renderer({ cards: [card] });
    expect(() => renderer.render(mobiledoc)).toThrow(
      /Card "bad" must render markdown/
    );
  });

  it("card may render nothing", () => {
    let card = {
      name: "ok",
      type: "markdown",
      render() {},
    };
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [[], [[CARD_SECTION_TYPE, card.name]]],
    };

    renderer = new Renderer({ cards: [card] });
    renderer.render(mobiledoc);

    expect(true).toBe(true);
  });

  it("rendering nested mobiledocs in cards", () => {
    let cards = [
      {
        name: "nested-card",
        type: "markdown",
        render({ payload }) {
          let { result: rendered } = renderer.render(payload.mobiledoc);
          return rendered;
        },
      },
    ];

    let innerMobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [MARKUP_SECTION_TYPE, "P", [[[], 0, "hello world"]]],
        ],
      ],
    };

    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [CARD_SECTION_TYPE, "nested-card", { mobiledoc: innerMobiledoc }],
        ],
      ],
    };

    renderer = new Renderer({ cards });
    let { result: rendered } = renderer.render(mobiledoc);
    expect(rendered).toBe("hello world\n");
  });

  it("rendering unknown card without unknownCardHandler throws", () => {
    let cardName = "missing-card";
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [CARD_SECTION_TYPE, cardName],
        ],
      ],
    };
    renderer = new Renderer({ cards: [], unknownCardHandler: undefined });

    expect(() => renderer.render(mobiledoc)).toThrow(
      /Card "missing-card" not found.*no unknownCardHandler/
    );
  });

  it("rendering unknown card uses unknownCardHandler", () => {
    let cardName = "missing-card";
    let expectedPayload = {};
    let cardOptions = {};
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [
          // sections
          [CARD_SECTION_TYPE, cardName, expectedPayload],
        ],
      ],
    };
    let unknownCardHandler = ({ env, payload, options }) => {
      expect(env.name).toBe(cardName);
      expect(!env.isInEditor).toBeTruthy();
      expect(!!env.onTeardown).toBeTruthy();

      expect(JSON.stringify(payload)).toBe(JSON.stringify(expectedPayload));
      expect(JSON.stringify(options)).toBe(JSON.stringify(cardOptions));
    };
    renderer = new Renderer({ cards: [], unknownCardHandler, cardOptions });
    renderer.render(mobiledoc);
  });

  it("throws if given an object of cards", () => {
    let cards = {};
    expect(() => {
      new Renderer({ cards });
    }).toThrow(new RegExp("`cards` must be passed as an array"));
  });

  it("teardown hook calls registered teardown methods", () => {
    let didTeardown;
    let card = {
      name: "hasteardown",
      type: "markdown",
      render({ env }) {
        env.onTeardown(() => (didTeardown = true));
      },
    };
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [], // markers
        [[CARD_SECTION_TYPE, card.name]], // sections
      ],
    };
    renderer = new Renderer({ cards: [card] });
    let { teardown } = renderer.render(mobiledoc);

    expect(!didTeardown).toBeTruthy();

    teardown();

    expect(didTeardown).toBeTruthy();
  });

  it("throws when given an unexpected mobiledoc version", () => {
    let mobiledoc = {
      version: "0.1.0",
      sections: [[], []],
    };
    expect(() => renderer.render(mobiledoc)).toThrow(
      /Unexpected Mobiledoc version.*0.1.0/
    );

    mobiledoc.version = "0.2.1";
    expect(() => renderer.render(mobiledoc)).toThrow(
      /Unexpected Mobiledoc version.*0.2.1/
    );
  });

  it("XSS: unexpected markup and list section tag names are not renderered", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [],
        [
          [
            MARKUP_SECTION_TYPE,
            "script",
            [[[], 0, 'alert("markup section XSS")']],
          ],
          [
            LIST_SECTION_TYPE,
            "script",
            [[[[], 0, 'alert("list section XSS")']]],
          ],
        ],
      ],
    };
    let { result } = renderer.render(mobiledoc);
    expect(result.indexOf("script") === -1).toBeTruthy();
  });

  it("XSS: unexpected markup types are not rendered", () => {
    let mobiledoc = {
      version: MOBILEDOC_VERSION,
      sections: [
        [
          ["b"], // valid
          ["em"], // valid
          ["script"], // invalid
        ],
        [
          [
            MARKUP_SECTION_TYPE,
            "p",
            [
              [[0], 0, "bold text"],
              [[1, 2], 3, 'alert("markup XSS")'],
              [[], 0, "plain text"],
            ],
          ],
        ],
      ],
    };
    let { result } = renderer.render(mobiledoc);
    expect(result.indexOf("script") === -1).toBeTruthy();
  });
});
