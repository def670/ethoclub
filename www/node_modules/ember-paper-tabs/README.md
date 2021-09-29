# ember-paper-tabs [![Build Status](https://travis-ci.org/cogniteev/ember-paper-tabs.svg?branch=master)]

This is an [ember-paper](https://github.com/miguelcobain/ember-paper) addon that provides an implementation of [material tabs](https://material.io/guidelines/components/tabs.html).

## Usage

An exemple usage:

```hbs
  {{#paper-tabs as |tabs|}}
    {{#tabs.tab label="Tab 1"}}
      Content 1
    {{/tabs.tab}}
    {{#tabs.tab as |tab|}}
      {{#tab.label}}
        Tab 1      
      {{/tab.label}}
      
      {{#tab.content}}
        Content 2
      {{/tab.content}}
    {{/tabs.tab}}
  {{/paper-tabs}}
```

## You can see how this addon looks like at https://cogniteev.github.io/ember-paper-tabs/

## Installation

```bash
ember install ember-paper-tabs
```

Don't forget to import your styles in your `app.scss` **after** importing ember paper styles:

```scss
@import "ember-paper";
@import "ember-paper-tabs";
```
## API

### `{{#paper-tabs as |tabs|}}`

- `dynamicHeight` - defaults to `false` - sets the paper-tabs height to the active tab's height.
- `alignTabs`  - defaults to `top` - sets tabs position, values are `top` | `bottom`.
- `borderBottom`  - defaults to `false` -  displays a border underneath the tabs.
- `noInk` - defaults to `false` -  disables ripple effects upon click.
- `noInkBar` - defaults to `false` - displays a bar underneath active tabs.
- `centerTabs` - defaults to `false` - tabs takes all the width.
- `stretchTabs` - defaults to `auto` - values are `always` | `never` | `auto`.
- `autoSelect` - defaults to `false` - automatically open newly added tab.

### `{{#paper-tab as |tab|}}`

- `disabled` - defaults to `false`.
- `onSelect` - a function called when tab is selected.
- `onDeselect` - a function called when tab is deselected.

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
