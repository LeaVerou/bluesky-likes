# <img src="logo.svg" height="28"> BlueSky Likes Components

Components to display (and encourage) likes on [BlueSky](https://bsky.app) posts.
Can be used separately, or together.

- [`<bluesky-likes>`](#bluesky-likes): Displays the number of likes on a post.
- [`<bluesky-likers>`](#bluesky-likers): Displays avatars of users who liked a post.

For a demo, check out https://projects.verou.me/bluesky-likes/

## `<bluesky-likes>`

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
| `--avatar-size`                 | `3em`                                                            | The size of each avatar.                                                             |
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
