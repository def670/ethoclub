/**
 * @module ember-paper-tabs
 * @public
 */
import Component from 'ember-component';
import computed from 'ember-computed';
import layout from '../../templates/components/paper-tab/body';

/**
 * @class PaperTabBody
 * @extends Component
 * @public
 */
export default Component.extend({

  tagName: '',

  layout,

  wormhole: computed.readOnly('parentComponent.wormhole')

});
