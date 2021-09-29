/**
 * @module ember-paper-tabs
 * @public
 */
import Component from 'ember-component';
import layout from '../templates/components/paper-next-button';

/**
 * @class PaperNextButton
 * @extends Component
 * @public
 */
export default Component.extend({

  tagName: 'md-next-button',

  layout,

  classNameBindings: [
    'disabled:md-disabled'
  ]

});
