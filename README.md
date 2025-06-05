# <img src="logo.svg" height="28"> BlueSky Likes Components

Components to display (and encourage) likes on [BlueSky](https://bsky.app) posts.
Can be used separately, or together.

- [`<bluesky-likes>`](#bluesky-likes): Displays the number of likes on a post.
- [`<bluesky-likers>`](#bluesky-likers): Displays avatars of users who liked a post.

For a demo, check out https://projects.verou.me/bluesky-likes/

## Installation

The easiest way is to use the [autoloader](#autoloader) and a CDN such as [unpkg](https://unpkg.com/).
All it takes is pasting this into your HTML and you’re ready to use the components:

```html
<script src="https://unpkg.com/bluesky-likes/autoload" type="module"></script>
```

You can also install the components via npm and use with your toolchain of choice:

```bash
npm install bluesky-likes
```

Then import the components in your JavaScript.
You can import everything:

```js
import { BlueskyLikes, BlueskyLikers, bsky } from "bluesky-likes";
```

Or you can use individual exports like `bluesky-likes/likes`.

## `<bluesky-likes>`

Displays the number of likes on a post and links to the full list.

### Attributes

| Attribute | Type     | Description                               |
| --------- | -------- | ----------------------------------------- |
| `src`     | `string` | The URL of the post to display likes for. |

### States

| Name      | Description                                             |
| --------- | ------------------------------------------------------- |
| `loading` | Indicates that the component is currently loading data. |

### Slots

| Name        | Description                    |
| ----------- | ------------------------------ |
| _(Default)_ | Content added after the count. |
| `icon`      | Custom icon                    |

### Custom properties

None!
Pretty much all styling is on the host element, so you can just override regular CSS properties such as `border`, `padding` or `color` to restyle the component.

### Parts

| Name    | Description                                |
| ------- | ------------------------------------------ |
| `link`  | The `<a>` element that links to all likes. |
| `count` | The `<span>` that contains the like count. |

## `<bluesky-likers>`

### Attributes

| Attribute | Type     | Description                                               |
| --------- | -------- | --------------------------------------------------------- |
| `src`     | `string` | The URL of the post to display likes for.                 |
| `max`     | `number` | The maximum number of avatars to display. Defaults to 50. |

### States

| Name      | Description                                                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loading` | Indicates that the component is currently loading data. Note that the state will be removed when data loads and the component is updated, not after all avatars load. |
| `empty`   | Indicates that there are no likers to display.                                                                                                                        |

### Slots

| Name    | Description                                 |
| ------- | ------------------------------------------- |
| `empty` | Content displayed when there are no likers. |

### Custom properties

| Name                            | Default Value                                                    | Description                                                                          |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `--avatar-size`                 | `calc(2em + 1vw)`                                                | The size of each avatar.                                                             |
| `--avatar-overlap-percentage`   | `0.3`                                                            | The percentage of horizontal overlap between avatars.                                |
| `--avatar-overlap-percentage-y` | `0.2`                                                            | The percentage of vertical overlap between avatars.                                  |
| `--avatar-border`               | `.15em solid canvas`                                             | The border style for each avatar.                                                    |
| `--avatar-shadow`               | `0 .1em .4em -.3em rgb(0 0 0 / 0.4)`                             | The box-shadow applied to each avatar.                                               |
| `--avatar-background`           | `url('data:image/svg+xml,…') center / cover canvas`              | The background for avatars without a user image (default SVG, centered and covered). |
| `--more-background`             | `#1185fe`                                                        | The background color for the "+N" (more) avatar.                                     |
| `--more-color-text`             | `white`                                                          | The text color for the "+N" (more) avatar.                                           |
| `--avatar-overlap`              | `calc(var(--avatar-size) \* var(--avatar-overlap-percentage))`   | The actual horizontal overlap between avatars (as a `<length>`).                     |
| `--avatar-overlap-y`            | `calc(var(--avatar-size) \* var(--avatar-overlap-percentage-y))` | The actual vertical overlap between avatars (as a `<length>`).                       |

### Parts

| Name         | Description                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `avatar`     | The circular element that displays a user, or the +N for users not shown. Corresponds to an `<img>` element for users with an avatar, and an `<a>` in other cases. |
| `avatar-img` | The `<img>` element for users with an avatar.                                                                                                                      |
| `user`       | The `<a>` element that links to the user's profile.                                                                                                                |
| `more`       | The `<a>` element that displays the hidden count.                                                                                                                  |

## Autoloader

Due to its side effects, the autoloader is a separate export:

```js
import "bluesky-likes/autoload";
```

By default, the autoloader will not observe future changes: if the components are not available when the script runs, they will not be fetched.
It will also not discover components that are in shadow roots of other components.
This is done for performance reasons, since these features are slow and these components are mostly used on blogs and other content-focused websites that don’t need this.

If, however, you do, you can use the `observe()` and `discover()` methods the autoloader exports:

- `observe(root)` will observe `root` for changes and load components as they are added. You can use `unobserve()` to stop observing.
- `discover(root)` will discover components in `root` and load them if they are not already loaded. `root` can be any DOM node, including documents and shadow roots.

## API wrapper

Since these components had to interface with the BlueSky API, they also implement a tiny wrapper for the relevant parts of it.
While this library is absolutely not intended as a BlueSky API SDK, if you do need these functions, they are in [`src/api.js`](src/api.js) and have their own export too: `bluesky-likes/api`.

The following functions are available:

- `getProfile(handle)`: Fetches a user profile by handle.
- `getPost(url)`: Fetches a post details by URL.
- `getPostLikes(url)`: Fetches the likers for a post by its URL.

Also these, though you probably won’t need them unless you’re making new API calls not covered by these endpoints:

- `parsePostUrl(url)`: Parses a BlueSky post URL and returns the post's handle and URI. **Synchronous**.
- `getDid(handle)`: Get the DID of a user by their handle.
- `getPostUri(url)`: Fetches a post AT URI by its URL.

Unless otherwise mentioned, all functions are async.

## License

These components are [MIT licensed](LICENSE).
However, if you are using them in a way that helps you profit, there is a **social** (not legal) expectation that you [give back by funding their development](https://github.com/sponsors/LeaVerou).
