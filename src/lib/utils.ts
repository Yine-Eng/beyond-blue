import { createCn } from "cn/config";

/**
 * Class-name merger that knows our custom type scale (src/app/globals.css).
 * Without this, `text-body-sm` would be treated as a text colour and silently
 * drop classes like `text-primary-foreground`. Always import `cn` from here.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "heading-xl",
            "heading-serif",
            "heading-lg",
            "heading-md",
            "body-lg",
            "body",
            "body-sm",
            "caption",
          ],
        },
      ],
    },
  },
});
